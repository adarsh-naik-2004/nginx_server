import {Redis} from "ioredis";

const redis = new Redis({ host: "127.0.0.1", port: 6379 });

export async function rateLimit(ip: string, limit: number, duration: number): Promise<boolean> {
    const key = `rate-limit:${ip}`;
    const current = await redis.incr(key);

    if (current === 1) {
        await redis.expire(key, duration);
    }

    return current <= limit;
}
