import { ConfigSchemaType } from './config_schema.js';
interface CreateServerConfig {
    port: number;
    workerCount: number;
    config: ConfigSchemaType;
}
export declare function createServer(config: CreateServerConfig): Promise<void>;
export {};
//# sourceMappingURL=server.d.ts.map