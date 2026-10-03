import prisma from '../db.js';
import { addNotificationJob } from '../queues/notificationQueue.js';

export const toggleFollowUser = async (req, res) => {
  try {
    const { userId, targetId } = req.body;

    if (!userId || !targetId) {
      return res.status(400).json({ error: 'Both userId and targetId are required' });
    }

    if (userId === targetId) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    // Check if follow record already exists
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: targetId,
        },
      },
    });

    if (existingFollow) {
      // Unfollow
      await prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId: userId,
            followingId: targetId,
          },
        },
      });

      return res.status(200).json({
        success: true,
        isFollowing: false,
        message: 'Unfollowed successfully',
      });
    } else {
      // Follow
      await prisma.follow.create({
        data: {
          followerId: userId,
          followingId: targetId,
        },
      });

      // Fetch follower info for notification
      const follower = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          username: true,
          profilePic: true,
        },
      });

      // Background idempotency key
      const deduplicationKey = `follow-${userId}-${targetId}-${Math.floor(Date.now() / 60000)}`;

      await addNotificationJob(
        'FOLLOW_NOTIFICATION',
        {
          followerId: userId,
          followerUsername: follower?.username || 'Someone',
          followerProfilePic: follower?.profilePic || '',
          targetUserId: targetId,
        },
        deduplicationKey
      );

      return res.status(200).json({
        success: true,
        isFollowing: true,
        message: 'Followed successfully',
      });
    }
  } catch (error) {
    console.error('Error toggling follow:', error);
    res.status(500).json({ error: error.message });
  }
};