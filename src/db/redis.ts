import dotenv from 'dotenv';
dotenv.config();

import Redis from 'ioredis';

if (!process.env.REDIS_URL) {
  throw new Error('REDIS_URL is not defined');
}

export const redis = new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,

  tls: {
    rejectUnauthorized: false
  },

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

redis.on("error", (err) => {
  console.error("Redis error:", err);
});

redis.on("reconnecting", () => {
  console.log("Redis reconnecting...");
});