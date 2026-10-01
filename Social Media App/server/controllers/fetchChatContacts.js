import prisma from '../db.js';

export const fetchMutualContacts = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // 1. Find everyone this user is following
    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });
    const followingIds = following.map((f) => f.followingId);

    if (followingIds.length === 0) {
      return res.status(200).json([]);
    }

    // 2. Find who among them is ALSO following this user back (Mutual)
    const mutualFollows = await prisma.follow.findMany({
      where: {
        followerId: { in: followingIds },
        followingId: userId,
      },
      include: {
        follower: {
          select: {
            id: true,
            username: true,
            fullName: true,
            profilePic: true,
            about: true,
          },
        },
      },
    });

    const mutualUsers = mutualFollows.map((m) => ({
      _id: m.follower.id,
      id: m.follower.id,
      username: m.follower.username,
      fullName: m.follower.fullName,
      profilePic: m.follower.profilePic,
      about: m.follower.about,
    }));

    return res.status(200).json(mutualUsers);
  } catch (error) {
    console.error('Error fetching mutual contacts:', error);
    res.status(500).json({ error: error.message });
  }
};