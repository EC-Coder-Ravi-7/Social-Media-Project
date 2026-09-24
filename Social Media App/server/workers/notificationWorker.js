import { Worker } from 'bullmq';
import dotenv from 'dotenv';

dotenv.config();

const connection = {
  url: process.env.REDIS_URL,
};

export const initNotificationWorker = (io) => {
  const worker = new Worker(
    'notificationQueue',
    async (job) => {
      console.log(`⚙️ [Worker] Processing job ${job.id} of type: ${job.name}`);

      switch (job.name) {
        case 'FOLLOW_NOTIFICATION': {
          const { followerId, followerUsername, targetUserId } = job.data;
          if (io) {
            io.to(targetUserId).emit('notification', {
              type: 'FOLLOW',
              message: `@${followerUsername} started following you.`,
              followerId,
              timestamp: new Date(),
            });
          }
          console.log(`🔔 [Worker] Dispatched follow alert to ${targetUserId}`);
          break;
        }

        case 'POST_NOTIFICATION': {
          const { authorName, postId } = job.data;
          console.log(`📰 [Worker] Processed new post task for post ${postId} by ${authorName}`);
          break;
        }

        default:
          console.warn(`[Worker] Unrecognized job type: ${job.name}`);
      }
    },
    { connection }
  );

  worker.on('completed', (job) => {
    console.log(`✅ [Worker] Job ${job.id} completed successfully.`);
  });

  worker.on('failed', (job, err) => {
    console.error(`❌ [Worker] Job ${job?.id} failed:`, err.message);
  });

  return worker;
};