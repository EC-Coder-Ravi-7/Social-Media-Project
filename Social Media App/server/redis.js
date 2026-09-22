// server/redis.js
import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  console.error('❌ REDIS_URL is not defined in server/.env');
}

const redis = new Redis(redisUrl, {
  retryStrategy(times) {
    const delay = Math.min(times * 150, 3000);
    console.warn(`[Redis] Retrying connection in ${delay}ms... (Attempt #${times})`);
    return delay;
  },
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
});

redis.on('connect', () => {
  console.log('⚡ [Redis] Connecting to Upstash instance...');
});

redis.on('ready', () => {
  console.log('✅ [Redis] Connected and ready to process commands.');
});

redis.on('error', (err) => {
  console.error('❌ [Redis] Connection Error:', err.message);
});

export default redis;