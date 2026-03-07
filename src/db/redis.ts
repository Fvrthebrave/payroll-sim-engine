import dotenv from "dotenv";
dotenv.config();

import Redis from "ioredis";

if (!process.env.REDIS_URL) {
  throw new Error("REDIS_URL is not defined");
}

const redisUrl = process.env.REDIS_URL;

export const redis = new Redis(redisUrl, {
  ...(redisUrl.startsWith("rediss://") ? { tls: {} } : {}),

  enableReadyCheck: false,
  maxRetriesPerRequest: null,
  lazyConnect: true,
  keepAlive: 10000,

  retryStrategy(times) {
    return Math.min(times * 1000, 5000);
  }
});

redis.on("connect", () => {
  console.log("Redis connected");
});

redis.on("ready", () => {
  console.log("Redis ready");
});

redis.on("reconnecting", () => {
  console.log("Redis reconnecting...");
});

redis.on("close", () => {
  console.log("Redis connection closed");
});

redis.on("error", (err) => {
  console.error("Redis error:", err.message);
});

redis.connect().catch(console.error);