import { Queue } from 'bullmq';
import dotenv from 'dotenv';

dotenv.config();

const connection = {
  url: process.env.REDIS_URL,
};

export const notificationQueue = new Queue('notificationQueue', {
  connection,
  defaultJobOptions: {
    attempts: 4,
    backoff: {
      type: 'exponential',
      delay: 2000, // Retries at 2s, 4s, 8s
    },
    removeOnComplete: {
      count: 100, // Keeps record of last 100 successful jobs for debugging
    },
    removeOnFail: {
      count: 50,  // Keeps record of last 50 failed jobs
    },
  },
});

/**
 * Enqueue notification with an idempotent job key
 * @param {string} type 
 * @param {object} payload 
 * @param {string} deduplicationKey - Unique key (e.g., 'follow:userA:userB')
 */
export const addNotificationJob = async (type, payload, deduplicationKey = null) => {
  try {
    const jobOptions = deduplicationKey ? { jobId: deduplicationKey } : {};
    const job = await notificationQueue.add(type, payload, jobOptions);
    console.log(`📥 [Queue] Job enqueued: ${type} (ID: ${job.id})`);
    return job;
  } catch (err) {
    console.error(`❌ [Queue Error] Failed to enqueue ${type}:`, err.message);
  }
};