import prisma from '../db.js';
import { addNotificationJob } from '../queues/notificationQueue.js';

export const toggleFollowUser = async (req, res) => {
  try {
    const { currentUserId, targetUserId } = req.body;

    if (!currentUserId || !targetUserId || currentUserId === targetUserId) {
      return res.status(400).json({ error: 'Invalid user IDs' });
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, followers: true },
    });

    const currentUser = await prisma.user.findUnique({
      where: { id: currentUserId },
      select: { id: true, following: true },
    });

    if (!targetUser || !currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const currentFollowers = targetUser.followers || [];
    const currentFollowing = currentUser.following || [];

    const isFollowing = currentFollowers.includes(currentUserId);

    let updatedFollowers;
    let updatedFollowing;

    if (isFollowing) {
      // Unfollow
      updatedFollowers = currentFollowers.filter((uid) => uid !== currentUserId);
      updatedFollowing = currentFollowing.filter((uid) => uid !== targetUserId);
    } else {
      // Follow
      updatedFollowers = [...currentFollowers, currentUserId];
      updatedFollowing = [...currentFollowing, targetUserId];
    }

    await prisma.user.update({
      where: { id: targetUserId },
      data: { followers: updatedFollowers },
    });

    await prisma.user.update({
      where: { id: currentUserId },
      data: { following: updatedFollowing },
    });

    await addNotificationJob('FOLLOW_NOTIFICATION', {
      followerId: userId,
      followerUsername: user.username,
      targetUserId: targetId,
    });

    return res.status(200).json({
      isFollowing: !isFollowing,
      followersCount: updatedFollowers.length,
      following: updatedFollowing,
    });
  } catch (error) {
    console.error('Follow toggle error:', error);
    return res.status(500).json({ error: 'Failed to update follow status' });
  }
};