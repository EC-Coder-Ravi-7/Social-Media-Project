import redis from '../redis.js';

export const checkCache = (ttlInSeconds = 300) => {
  return async (req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }

    const cacheKey = `cache:${req.originalUrl || req.url}`;

    try {
      const cachedData = await redis.get(cacheKey);

      if (cachedData) {
        return res.status(200).json(JSON.parse(cachedData));
      }

      const originalJson = res.json.bind(res);

      res.json = (data) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          redis.setex(cacheKey, ttlInSeconds, JSON.stringify(data)).catch((err) => {
            console.error(`[Redis] Failed to cache key "${cacheKey}":`, err.message);
          });
        }
        return originalJson(data);
      };

      next();
    } catch (err) {
      console.error('[Redis Cache Middleware Error]:', err.message);
      next();
    }
  };
};

export const invalidateCache = async (patterns) => {
  try {
    const patternList = Array.isArray(patterns) ? patterns : [patterns];

    for (const pattern of patternList) {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
        console.log(`🧹 [Redis] Invalidated cache keys:`, keys);
      }
    }
  } catch (err) {
    console.error('❌ [Redis Invalidate Error]:', err.message);
  }
};