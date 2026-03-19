import dotenv from "dotenv";
dotenv.config();

import Redis from "ioredis";

if (!process.env.REDIS_URL) {
  throw new Error("REDIS_URL is not defined");
}

const redisUrl = process.env.REDIS_URL;

const log = (...args: any[]) => {
  if(process.env.NODE_ENV !== "test") {
    console.log(...args);
  }
}

const errorLog = (...args: any[]) => {
  if(process.env.NODE_ENV) {
    console.log(...args);
  }
};

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
 log("Redis connected");
});

redis.on("ready", () => {
  log("Redis ready");
});

redis.on("reconnecting", () => {
  log("Redis reconnecting...");
});

redis.on("close", () => {
  log("Redis connection closed");
});

redis.on("error", (err) => {
  errorLog("Redis error:", err.message);
});

redis.connect().catch(console.error);