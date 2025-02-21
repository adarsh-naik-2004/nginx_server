import { z } from 'zod';
export declare const workerMessageSchema: z.ZodObject<{
    requestType: z.ZodEnum<["HTTP"]>;
    headers: z.ZodAny;
    body: z.ZodAny;
    url: z.ZodString;
}, "strip", z.ZodTypeAny, {
    url: string;
    requestType: "HTTP";
    headers?: any;
    body?: any;
}, {
    url: string;
    requestType: "HTTP";
    headers?: any;
    body?: any;
}>;
export declare const workerMessageReplySchema: z.ZodObject<{
    data: z.ZodOptional<z.ZodString>;
    error: z.ZodOptional<z.ZodString>;
    errorCode: z.ZodOptional<z.ZodEnum<["500", "404"]>>;
}, "strip", z.ZodTypeAny, {
    error?: string | undefined;
    data?: string | undefined;
    errorCode?: "500" | "404" | undefined;
}, {
    error?: string | undefined;
    data?: string | undefined;
    errorCode?: "500" | "404" | undefined;
}>;
export type WorkerMessageType = z.infer<typeof workerMessageSchema>;
export type WorkerMessageReplyType = z.infer<typeof workerMessageReplySchema>;
//# sourceMappingURL=server_schema.d.ts.map