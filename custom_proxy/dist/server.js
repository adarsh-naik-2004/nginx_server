var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { rootConfigSchema } from './config_schema.js';
import cluster from 'node:cluster';
import http from 'node:http';
import https from 'node:https';
import { URL } from 'node:url';
import { workerMessageSchema, workerMessageReplySchema } from './server_schema.js';
import { checkHealth } from './health_checker.js';
import { rateLimit } from './rate_limiter.js';
let currentIndex = 0;
const workerConnections = new Map();
function getWorkerIndex(strategy, workers) {
    if (strategy === "random") {
        return Math.floor(Math.random() * workers.length);
    }
    else if (strategy === "round-robin") {
        currentIndex = (currentIndex + 1) % workers.length;
        return currentIndex;
    }
    else if (strategy === "least-connections") {
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
function getHealthyWorker(workers, config) {
    return __awaiter(this, void 0, void 0, function* () {
        for (const worker of workers) {
            for (const forward of config.server.forwards) {
                if (yield checkHealth(forward.url)) {
                    return worker;
                }
            }
        }
        return null;
    });
}
export function createServer(config) {
    return __awaiter(this, void 0, void 0, function* () {
        const { workerCount, port } = config;
        const worker_pool = [];
        if (cluster.isPrimary) {
            console.log('Master Process is Running');
            for (let i = 0; i < workerCount; i++) {
                const w = cluster.fork({ config: JSON.stringify(config.config) });
                worker_pool.push(w);
                console.log(`Worker Node: ${i}`);
            }
            const server = http.createServer(function (req, res) {
                return __awaiter(this, void 0, void 0, function* () {
                    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
                    const allowed = yield rateLimit(ip, 10, 60);
                    if (!allowed) {
                        res.writeHead(429, { 'Content-Type': 'text/plain' });
                        res.end("Too Many Requests");
                        return;
                    }
                    const healthyWorker = yield getHealthyWorker(worker_pool, config.config);
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
                    const payload = {
                        requestType: 'HTTP',
                        headers: req.headers,
                        body: null,
                        url: `${req.url}`,
                    };
                    worker.send(JSON.stringify(payload));
                    worker.once('message', (workerReply) => __awaiter(this, void 0, void 0, function* () {
                        const reply = yield workerMessageReplySchema.parseAsync(JSON.parse(workerReply));
                        if (reply.errorCode) {
                            res.writeHead(parseInt(reply.errorCode), { 'Content-Type': 'text/plain' });
                            res.end(reply.error);
                        }
                        else {
                            res.writeHead(200, { 'Content-Type': 'text/plain' });
                            res.end(reply.data);
                        }
                    }));
                });
            });
            server.listen(config.port, function () {
                console.log(`Reverse Proxy listening on PORT ${port}`);
            });
        }
        else {
            console.log('Worker Node is Running');
            const config = yield rootConfigSchema.parseAsync(JSON.parse(`${process.env.config}`));
            process.on('message', (message) => __awaiter(this, void 0, void 0, function* () {
                const messageValidated = yield workerMessageSchema.parseAsync(JSON.parse(message));
                const requestURL = messageValidated.url;
                const rule = config.server.rules.find(e => e.path === requestURL);
                if (!rule || rule.forward.length === 0) {
                    const reply = { errorCode: '404', error: 'No forward rules found' };
                    if (process.send)
                        process.send(JSON.stringify(reply));
                    return;
                }
                const forwardIndex = Math.floor(Math.random() * rule.forward.length); // random forward-id
                const forwardID = rule.forward[forwardIndex];
                const forward = config.server.forwards.find(e => e.id === forwardID);
                if (!forward) {
                    const reply = { errorCode: '500', error: 'Forward not found' };
                    if (process.send)
                        process.send(JSON.stringify(reply));
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
                        const reply = { data: body };
                        if (process.send)
                            process.send(JSON.stringify(reply));
                    });
                });
                proxyReq.on('error', (err) => {
                    console.error(`Proxy request failed for ${targetUrl.href}:`, err.message);
                    const reply = { errorCode: '500', error: 'Upstream request failed' };
                    if (process.send)
                        process.send(JSON.stringify(reply));
                });
                proxyReq.end();
            }));
        }
    });
}
