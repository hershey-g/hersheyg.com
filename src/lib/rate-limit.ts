import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type RateLimiterOptions = {
  limit: number;
  window: `${number} ${"s" | "m" | "h" | "d"}`;
  prefix: string;
};

const rateLimiters = new Map<string, Ratelimit>();

export function getRateLimiter(options?: RateLimiterOptions): Ratelimit | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return null;

  const config: RateLimiterOptions = options ?? {
    limit: 20,
    window: "10 m",
    prefix: "intake-chat",
  };

  const cacheKey = `${config.prefix}:${config.limit}:${config.window}`;
  const existing = rateLimiters.get(cacheKey);
  if (existing) return existing;

  const ratelimit = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(config.limit, config.window),
    analytics: true,
    prefix: config.prefix,
  });

  rateLimiters.set(cacheKey, ratelimit);
  return ratelimit;
}
