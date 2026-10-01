import redis from '../redis.js';

export const rateLimiter = ({ windowInSeconds = 60, maxRequests = 10, keyPrefix = 'rl' }) => {
  return async (req, res, next) => {
    let ip =
      req.headers['x-forwarded-for']?.split(',')[0].trim() ||
      req.socket.remoteAddress ||
      '127.0.0.1';

    if (ip === '::1' || ip === '::ffff:127.0.0.1') {
      ip = '127.0.0.1';
    }

    const key = `${keyPrefix}:${ip}`;

    try {
      const current = await redis.incr(key);

      if (current === 1) {
        await redis.expire(key, windowInSeconds);
      }

      const ttl = await redis.ttl(key);

      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - current));
      res.setHeader('X-RateLimit-Reset', ttl);

      if (current > maxRequests) {
        return res.status(429).json({
          error: 'Too many requests. Please try again later.',
          retryAfterSeconds: ttl,
        });
      }

      next();
    } catch (err) {
      console.error('[RateLimiter Error]:', err.message);
      next();
    }
  };
};