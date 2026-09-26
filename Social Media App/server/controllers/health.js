import prisma, { pool } from '../db.js';
import redis from '../redis.js';

export const getLiveness = (req, res) => {
  return res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
};

export const getReadiness = async (req, res) => {
  const checks = {
    database: 'DOWN',
    redis: 'DOWN',
  };

  let hasError = false;

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = 'UP';
  } catch (err) {
    checks.database = `DOWN: ${err.message}`;
    hasError = true;
  }

  try {
    const ping = await redis.ping();
    checks.redis = ping === 'PONG' ? 'UP' : 'DEGRADED';
  } catch (err) {
    checks.redis = `DOWN: ${err.message}`;
    hasError = true;
  }

  const statusCode = hasError ? 503 : 200;
  return res.status(statusCode).json({
    status: hasError ? 'UNHEALTHY' : 'READY',
    checks,
    timestamp: new Date().toISOString(),
  });
};