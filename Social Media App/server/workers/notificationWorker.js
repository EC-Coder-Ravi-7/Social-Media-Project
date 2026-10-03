import { Worker } from 'bullmq';
import redis from '../redis.js';
import dotenv from 'dotenv';

dotenv.config();

const connection = {
  url: process.env.REDIS_URL,
};

export const initNotificationWorker = (io) => {
  const worker = new Worker(
    'notificationQueue',
    async (job) => {
      console.log(`⚙️ [Worker] Processing job ${job.id} (Attempt #${job.attemptsMade + 1})`);

      // Idempotency check: key expires after 10 minutes to prevent re-processing identical jobs
      const idempotencyKey = `idempotency:${job.name}:${job.id}`;
      const alreadyProcessed = await redis.set(idempotencyKey, 'PROCESSED', 'EX', 600, 'NX');

      if (!alreadyProcessed) {
        console.warn(`🛑 [Worker] Idempotent skip: Job ${job.id} was already handled.`);
        return { skipped: true };
      }

      switch (job.name) {
        case 'FOLLOW_NOTIFICATION': {
          const {
            followerId,
            followerUsername,
            followerProfilePic,
            targetUserId,
          } = job.data;

          if (io) {
            io.to(String(targetUserId)).emit('new-notification', {
              type: 'FOLLOW',
              user: followerUsername,
              userPic: followerProfilePic,
              action: 'started following you',
              followerId,
              timestamp: new Date(),
            });
          }

          console.log(
            `🔔 [Worker] Dispatched follow alert to room ${String(targetUserId)}`
          );

          break;
        }

        case 'POST_NOTIFICATION': {
          const { authorName, postId } = job.data;
          console.log(`📰 [Worker] Processed new post alert for post ${postId} by ${authorName}`);
          break;
        }

        default:
          console.warn(`[Worker] Unhandled job type: ${job.name}`);
      }

      return { success: true };
    },
    { connection }
  );

  worker.on('completed', (job, result) => {
    if (result?.skipped) {
      console.log(`⏭️ [Worker] Job ${job.id} skipped due to idempotency.`);
    } else {
      console.log(`✅ [Worker] Job ${job.id} completed successfully.`);
    }
  });

  worker.on('failed', (job, err) => {
    console.error(`❌ [Worker] Job ${job?.id} failed (attempt ${job?.attemptsMade}):`, err.message);
  });

  return worker;
};