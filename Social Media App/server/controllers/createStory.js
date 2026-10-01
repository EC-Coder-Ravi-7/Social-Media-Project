import prisma from '../db.js';
import redis from '../redis.js';

export const createStory = async (req, res) => {
  try {
    const { userId, userName, userPic, fileType } = req.body;
    const file = req.file ? req.file.path : req.body.file;

    if (!file || !userId) {
      return res.status(400).json({ error: 'File and User ID are required' });
    }

    const newStory = await prisma.story.create({
      data: {
        userId,
        userName: userName || '',
        userPic: userPic || '',
        file,
        fileType: fileType || 'photo',
      },
    });

    // Invalidate Redis cache so new stories appear immediately
    await redis.del('cache:/fetchAllStories');

    res.status(201).json(newStory);
  } catch (error) {
    console.error('Error in createStory:', error);
    res.status(500).json({ error: error.message });
  }
};