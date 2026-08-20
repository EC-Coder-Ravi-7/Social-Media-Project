import prisma from '../db.js';

export const fetchAllStories = async (req, res) => {
  try {
    // 24 hours ago timestamp
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const activeStories = await prisma.story.findMany({
      where: {
        createdAt: {
          gte: twentyFourHoursAgo, // only stories posted within the last 24 hours
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.status(200).json(activeStories);
  } catch (error) {
    console.error('Fetch active stories error:', error);
    return res.status(500).json({ error: 'Failed to fetch stories' });
  }
};