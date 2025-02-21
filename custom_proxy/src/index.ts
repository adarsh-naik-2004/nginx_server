import { program } from 'commander';
import { parseConfig, validateConfig } from './config.js';
import os from 'node:os'
import { ConfigSchemaType, rootConfigSchema } from './config_schema.js';
import { createServer } from './server.js';


async function main() {
    program
        .option('--config <path>', 'Path to the config file') 
        .parse(process.argv); // <-- This is important!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

    const options = program.opts();

    if (options.config) { 
        const validatedConfig = await validateConfig(await parseConfig(options.config));
        await createServer({port: validatedConfig.server.listen, workerCount: validatedConfig.server.workers ?? os.cpus().length, config: validatedConfig})
    } 
    else {
        console.error("Error: --config argument is required.");
        process.exit(1);
    }
}

main();
