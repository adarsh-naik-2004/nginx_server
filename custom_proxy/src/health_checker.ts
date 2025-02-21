import http from 'node:http';
import https from 'node:https';
import { URL } from 'node:url';

export async function checkHealth(url: string): Promise<boolean> {
    return new Promise((resolve) => {
        try {
            const parsedUrl = new URL(url);  
            const client = parsedUrl.protocol === 'https:' ? https : http;

            const options = {
                hostname: parsedUrl.hostname, 
                path: parsedUrl.pathname + parsedUrl.search,
                port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
                method: 'GET',
                headers: {
                    'User-Agent': 'HealthCheckBot', 
                },
            };

            // console.log(`Checking health for: ${url}`);  

            const req = client.request(options, (res) => {
                // console.log(`Response from ${url}: ${res.statusCode}`); 
                resolve(res.statusCode === 200);
            });

            req.on('error', (err) => {
                // console.error(`Health check failed for ${url}:`, err.message);
                resolve(false);
            });

            req.end();
        } catch (error) {
            console.error("Invalid URL:", url, error);
            resolve(false);
        }
    });
}
