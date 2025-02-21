var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Redis } from "ioredis";
const redis = new Redis({ host: "127.0.0.1", port: 6379 });
export function rateLimit(ip, limit, duration) {
    return __awaiter(this, void 0, void 0, function* () {
        const key = `rate-limit:${ip}`;
        const current = yield redis.incr(key);
        if (current === 1) {
            yield redis.expire(key, duration);
        }
        return current <= limit;
    });
}
