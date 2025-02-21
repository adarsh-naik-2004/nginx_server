import { z } from 'zod';
const forwardSchema = z.object({
    id: z.string(),
    url: z.string()
});
const headerSchema = z.object({
    key: z.string(),
    value: z.string()
});
const ruleSchema = z.object({
    path: z.string(),
    forward: z.array(z.string())
});
const serverSchema = z.object({
    listen: z.number(),
    workers: z.number().optional(),
    forwards: z.array(forwardSchema),
    headers: z.array(headerSchema).optional(),
    rules: z.array(ruleSchema)
});
export const rootConfigSchema = z.object({
    server: serverSchema
});
