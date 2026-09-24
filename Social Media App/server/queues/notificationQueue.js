import { Queue } from 'bullmq';
import dotenv from 'dotenv';

dotenv.config();

const redisUrl = process.env.REDIS_URL;

const connection = {
  url: redisUrl,
};

export const notificationQueue = new Queue('notificationQueue', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

export const addNotificationJob = async (type, payload) => {
  try {
    const job = await notificationQueue.add(type, payload);
    console.log(`📥 [Queue] Job enqueued: ${type} (ID: ${job.id})`);
    return job;
  } catch (err) {
    console.error(`❌ [Queue Error] Failed to enqueue ${type}:`, err.message);
  }
};