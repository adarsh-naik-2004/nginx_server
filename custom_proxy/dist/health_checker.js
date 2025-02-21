var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import http from 'node:http';
import https from 'node:https';
import { URL } from 'node:url';
export function checkHealth(url) {
    return __awaiter(this, void 0, void 0, function* () {
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
            }
            catch (error) {
                console.error("Invalid URL:", url, error);
                resolve(false);
            }
        });
    });
}
