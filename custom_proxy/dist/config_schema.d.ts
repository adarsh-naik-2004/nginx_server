import { z } from 'zod';
export declare const rootConfigSchema: z.ZodObject<{
    server: z.ZodObject<{
        listen: z.ZodNumber;
        workers: z.ZodOptional<z.ZodNumber>;
        forwards: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            url: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            url: string;
        }, {
            id: string;
            url: string;
        }>, "many">;
        headers: z.ZodOptional<z.ZodArray<z.ZodObject<{
            key: z.ZodString;
            value: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            value: string;
            key: string;
        }, {
            value: string;
            key: string;
        }>, "many">>;
        rules: z.ZodArray<z.ZodObject<{
            path: z.ZodString;
            forward: z.ZodArray<z.ZodString, "many">;
        }, "strip", z.ZodTypeAny, {
            path: string;
            forward: string[];
        }, {
            path: string;
            forward: string[];
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        listen: number;
        forwards: {
            id: string;
            url: string;
        }[];
        rules: {
            path: string;
            forward: string[];
        }[];
        workers?: number | undefined;
        headers?: {
            value: string;
            key: string;
        }[] | undefined;
    }, {
        listen: number;
        forwards: {
            id: string;
            url: string;
        }[];
        rules: {
            path: string;
            forward: string[];
        }[];
        workers?: number | undefined;
        headers?: {
            value: string;
            key: string;
        }[] | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    server: {
        listen: number;
        forwards: {
            id: string;
            url: string;
        }[];
        rules: {
            path: string;
            forward: string[];
        }[];
        workers?: number | undefined;
        headers?: {
            value: string;
            key: string;
        }[] | undefined;
    };
}, {
    server: {
        listen: number;
        forwards: {
            id: string;
            url: string;
        }[];
        rules: {
            path: string;
            forward: string[];
        }[];
        workers?: number | undefined;
        headers?: {
            value: string;
            key: string;
        }[] | undefined;
    };
}>;
export type ConfigSchemaType = z.infer<typeof rootConfigSchema>;
//# sourceMappingURL=config_schema.d.ts.map