import prisma from '../db.js';

export const fetchAllStories = async (req, res) => {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const stories = await prisma.story.findMany({
      where: {
        createdAt: {
          gte: twentyFourHoursAgo,
        },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, username: true, profilePic: true },
        },
      },
    });

    // Format for React frontend
    const formattedStories = stories.map((s) => ({
      _id: s.id,
      id: s.id,
      userId: s.userId,
      userName: s.user?.username || s.userName,
      userPic: s.user?.profilePic || s.userPic,
      file: s.file,
      fileType: s.fileType,
      createdAt: s.createdAt,
    }));

    res.status(200).json(formattedStories);
  } catch (error) {
    console.error('Error in fetchAllStories:', error);
    res.status(500).json({ error: error.message });
  }
};