import { ConfigSchemaType, rootConfigSchema } from './config_schema';
import cluster , {Worker} from 'node:cluster';
import http from 'node:http'
import { workerMessageSchema, WorkerMessageType, WorkerMessageReplyType } from './server_schema';


interface CreateServerConfig {
    port: number;
    workerCount: number;
    config: ConfigSchemaType
}

export async function createServer(config: CreateServerConfig) {
    const { workerCount , port} = config;

    const worker_pool: Worker[] = [];

    if(cluster.isPrimary){
        console.log('Master Process is Running')

        for(let i=0; i < workerCount; i++){

            const w = cluster.fork({ config: JSON.stringify(config.config)});

            worker_pool.push(w);

            console.log(`Woker Node: ${i}`)
        }

        const server = http.createServer(function(req,res) {
            const index = Math.floor(Math.random() * worker_pool.length);
            const worker = worker_pool.at(index) // workers

            if(!worker){
                throw new Error('worker not found')
            }

            const payload: WorkerMessageType = {
                requestType: 'HTTP',
                headers: req.headers,
                body: null,
                url: `${req.url}`,
            }

            worker.send(JSON.stringify(payload))
        });

        server.listen(config.port, function(){
            console.log(`Reverse Proxy listening on PORT ${port}`)
        })

    }
    else{
        console.log('Worker Node is Running')
        const config = await rootConfigSchema.parseAsync(JSON.parse(`${process.env.config}`))

        process.on('message', async (message: string) => {
            const messageValidated = await workerMessageSchema.parseAsync(JSON.parse(message));

            const requestURL= messageValidated.url

            const rule = config.server.rules.find(e => e.path === requestURL)

            const forwardID = rule?.forward[0]; // forwards



            if(!forwardID){
                const reply: WorkerMessageReplyType = {errorCode: '500', error: 'Forward not found'};

                if(process.send){
                    return process.send(JSON.stringify(reply));
                }
            }

            
    
        });
    }
}