const buckets = new Map<string, number[]>();

export type RateLimitResult = { allowed: boolean; remaining: number; reset: number };

export function rateLimit({ key, limit, windowMs }: { key: string; limit: number; windowMs: number }): RateLimitResult {
  const now = Date.now();
  const windowStart = now - windowMs;
  const entries = buckets.get(key)?.filter(ts => ts > windowStart) ?? [];
  entries.push(now);
  buckets.set(key, entries);
  return {
    allowed: entries.length <= limit,
    remaining: Math.max(0, limit - entries.length),
    reset: windowStart + windowMs,
  };
}

export function getIp(req: Request): string {
  const header = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "";
  return header.split(",")[0].trim() || "unknown";
}
