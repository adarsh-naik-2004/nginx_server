var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { program } from 'commander';
import { parseConfig, validateConfig } from './config.js';
import os from 'node:os';
import { createServer } from './server.js';
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        program
            .option('--config <path>', 'Path to the config file')
            .parse(process.argv); // <-- This is important!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        const options = program.opts();
        if (options.config) {
            const validatedConfig = yield validateConfig(yield parseConfig(options.config));
            yield createServer({ port: validatedConfig.server.listen, workerCount: (_a = validatedConfig.server.workers) !== null && _a !== void 0 ? _a : os.cpus().length, config: validatedConfig });
        }
        else {
            console.error("Error: --config argument is required.");
            process.exit(1);
        }
    });
}
main();
