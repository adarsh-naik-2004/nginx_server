import fs from 'node:fs/promises';
import {parse} from 'yaml';
import {rootConfigSchema} from './config_schema.js'

export async function parseConfig(filepath:string){
    const configContent = await fs.readFile(filepath,'utf-8');
    const confiParsed = parse(configContent);
    return JSON.stringify(confiParsed);
}

export async function validateConfig(config:string) {
    const validateConfig = await rootConfigSchema.parseAsync(JSON.parse(config))
    return validateConfig;
}

