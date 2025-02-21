export declare function parseConfig(filepath: string): Promise<string>;
export declare function validateConfig(config: string): Promise<{
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
//# sourceMappingURL=config.d.ts.map