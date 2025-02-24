import { ConfigSchemaType, rootConfigSchema } from './config_schema.js';
import cluster, { Worker } from 'node:cluster';
import http from 'node:http';
import https from 'node:https';
import { URL } from 'node:url';
import { workerMessageSchema, WorkerMessageType, WorkerMessageReplyType, workerMessageReplySchema } from './server_schema.js';
import { checkHealth } from './health_checker.js';
import { rateLimit } from './rate_limiter.js';

let currentIndex = 0;
const workerConnections: Map<number, number> = new Map();

function getWorkerIndex(strategy: "random" | "round-robin" | "least-connections", workers: Worker[]): number {
    if (strategy === "random") {
        return Math.floor(Math.random() * workers.length);
    } else if (strategy === "round-robin") {
        currentIndex = (currentIndex + 1) % workers.length;
        return currentIndex;
    } else if (strategy === "least-connections") {
        let minConnections = Infinity;
        let minIndex = 0;
        workers.forEach((worker, index) => {
            const connections = workerConnections.get(index) || 0;
            if (connections < minConnections) {
                minConnections = connections;
                minIndex = index;
            }
        });
        workerConnections.set(minIndex, (workerConnections.get(minIndex) || 0) + 1);
        return minIndex;
    }
    return 0;
}

async function getHealthyWorker(workers: Worker[], config: ConfigSchemaType): Promise<Worker | null> {
    for (const worker of workers) {
        for (const forward of config.server.forwards) {
            if (await checkHealth(forward.url)) {
                return worker;
            }
        }
    }
    return null;
}

interface CreateServerConfig {
    port: number;
    workerCount: number;
    config: ConfigSchemaType;
}

export async function createServer(config: CreateServerConfig) {
    const { workerCount } = config;
    const PORT = process.env.PORT || config.port; 
    const worker_pool: Worker[] = [];

    if (cluster.isPrimary) {
        console.log('Master Process is Running');

        for (let i = 0; i < workerCount; i++) {
            const w = cluster.fork({ config: JSON.stringify(config.config) });
            worker_pool.push(w);
            console.log(`Worker Node: ${i}`);
        }

        const server = http.createServer(async function (req, res) {
            const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            const allowed = await rateLimit(ip as string, 10, 60);

            if (!allowed) {
                res.writeHead(429, { 'Content-Type': 'text/plain' });
                res.end("Too Many Requests");
                return;
            }

            const healthyWorker = await getHealthyWorker(worker_pool, config.config);
            if (!healthyWorker) {
                res.writeHead(503, { 'Content-Type': 'text/plain' });
                res.end("Service Unavailable");
                return;
            }

            const index = getWorkerIndex("round-robin", worker_pool);
            const worker = worker_pool.at(index);

            if (!worker) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end("Worker not found");
                return;
            }

            const payload: WorkerMessageType = {
                requestType: 'HTTP',
                headers: req.headers,
                body: null,
                url: `${req.url}`,
            };

            worker.send(JSON.stringify(payload));

            worker.once('message', async (workerReply: string) => {
                const reply = await workerMessageReplySchema.parseAsync(JSON.parse(workerReply));

                if (reply.errorCode) {
                    res.writeHead(parseInt(reply.errorCode), { 'Content-Type': 'text/plain' });
                    res.end(reply.error);
                } else {
                    res.writeHead(200, { 'Content-Type': 'text/plain' });
                    res.end(reply.data);
                }
            });
        });

        server.listen(PORT, function () {
            console.log(`Reverse Proxy listening on PORT ${PORT}`);
        });
    } else {
        console.log('Worker Node is Running');
        const config = await rootConfigSchema.parseAsync(JSON.parse(`${process.env.config}`));

        process.on('message', async (message: string) => {
            const messageValidated = await workerMessageSchema.parseAsync(JSON.parse(message));
            const requestURL = messageValidated.url;
            const rule = config.server.rules.find(e => e.path === requestURL);

            if (!rule || rule.forward.length === 0) {
                const reply: WorkerMessageReplyType = { errorCode: '404', error: 'No forward rules found' };
                if (process.send) process.send(JSON.stringify(reply));
                return;
            }

            const forwardIndex = Math.floor(Math.random() * rule.forward.length); // random forward-id
            const forwardID = rule.forward[forwardIndex];
            const forward = config.server.forwards.find(e => e.id === forwardID);

            if (!forward) {
                const reply: WorkerMessageReplyType = { errorCode: '500', error: 'Forward not found' };
                if (process.send) process.send(JSON.stringify(reply));
                return;
            }

            const targetUrl = new URL(forward.url);
            const client = targetUrl.protocol === 'https:' ? https : http;

            const options = {
                hostname: targetUrl.hostname,
                path: targetUrl.pathname + targetUrl.search,
                port: targetUrl.port || (targetUrl.protocol === 'https:' ? 443 : 80),
                method: 'GET',
            };

            const proxyReq = client.request(options, (proxyRes) => {
                let body = '';

                proxyRes.on('data', (chunk) => {
                    body += chunk;
                });

                proxyRes.on('end', () => {
                    const reply: WorkerMessageReplyType = { data: body };
                    if (process.send) process.send(JSON.stringify(reply));
                });
            });

            proxyReq.on('error', (err) => {
                console.error(`Proxy request failed for ${targetUrl.href}:`, err.message);
                const reply: WorkerMessageReplyType = { errorCode: '500', error: 'Upstream request failed' };
                if (process.send) process.send(JSON.stringify(reply));
            });

            proxyReq.end();
        });
    }
}
