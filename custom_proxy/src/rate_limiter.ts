import {Redis} from "ioredis";

const redis = new Redis(process.env.REDIS_URL || "redis://127.0.0.1:6379");

export async function rateLimit(ip: string, limit: number, duration: number): Promise<boolean> {
    const key = `rate-limit:${ip}`;
    const current = await redis.incr(key);

    if (current === 1) {
        await redis.expire(key, duration);
    }

    return current <= limit;
}
