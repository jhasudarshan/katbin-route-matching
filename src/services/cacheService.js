import { Redis } from '@upstash/redis';

const url = process.env.REDIS_URL;
const token = process.env.REDIS_TOKEN;
let redis = null;

if (url) {
  redis = new Redis({ url, token });

  // Test connection
  await redis.set("foo", "bar");
  console.log("Test value:", await redis.get("foo")); // should print "bar"
  console.log("redis connected successfully");
} else {
  console.warn("REDIS_URL not set; cache disabled.");
}

const TTL = Number(process.env.CACHE_TTL_SECONDS || 3600);

export async function getCache(key) {
  if (!redis) return null;
  try {
    const raw = await redis.get(key);
    if (!raw) return null;

    // Auto-parse if JSON
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  } catch (err) {
    console.error("Failed to get cache:", err.message);
    return null;
  }
}

export async function setCache(key, value, ttl = TTL) {
  if (!redis) return;
  try {
    const serialized =
      typeof value === "string" ? value : JSON.stringify(value);
    await redis.set(key, serialized, { ex: ttl });
  } catch (err) {
    console.error("Failed to cache route:", err.message);
  }
}