"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServer = createServer;
const config_schema_1 = require("./config_schema");
const node_cluster_1 = __importDefault(require("node:cluster"));
const node_http_1 = __importDefault(require("node:http"));
function createServer(config) {
    return __awaiter(this, void 0, void 0, function* () {
        const { workerCount, port } = config;
        const worker_pool = [];
        if (node_cluster_1.default.isPrimary) {
            console.log('Master Process is Running');
            for (let i = 0; i < workerCount; i++) {
                const w = node_cluster_1.default.fork({ config: JSON.stringify(config.config) });
                worker_pool.push(w);
                console.log(`Woker Node: ${i}`);
            }
            const server = node_http_1.default.createServer(function (req, res) {
                const index = Math.floor(Math.random() * worker_pool.length);
                const worker = worker_pool.at(index); // workers
                if (!worker) {
                    throw new Error('worker not found');
                }
                const payload = {
                    requestType: 'HTTP',
                    headers: req.headers,
                    body: null,
                    url: `${req.url}`,
                };
                worker.send(JSON.stringify(payload));
            });
            server.listen(config.port, function () {
                console.log(`Reverse Proxy listening on PORT ${port}`);
            });
        }
        else {
            console.log('Worker Node is Running');
            const config = yield config_schema_1.rootConfigSchema.parseAsync(JSON.parse(`${process.env.config}`));
            process.on('message', (message) => {
                console.log(message);
            });
        }
    });
}
