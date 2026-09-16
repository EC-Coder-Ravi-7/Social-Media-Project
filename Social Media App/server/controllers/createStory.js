import prisma from '../db.js';

export const createStory = async (req, res) => {
  try {
    const { userId, userName, userPic, fileType } = req.body;
    const file = req.file ? req.file.path : null;

    if (!file) {
      return res.status(400).json({ error: 'No media file received' });
    }

    // Safely resolve model name
    const storyModel = prisma.story || prisma.stories || prisma.Story;

    if (!storyModel) {
      console.error('Prisma models loaded:', Object.keys(prisma));
      return res.status(500).json({
        error: 'Prisma Story model missing. Run npx prisma generate in the server directory and restart.',
      });
    }

    const newStory = await storyModel.create({
      data: {
        userId: userId || '',
        userName: userName || 'User',
        userPic: userPic || '',
        file: file,
        fileType: fileType || 'photo',
      },
    });

    return res.status(201).json(newStory);
  } catch (error) {
    console.error('Story upload server error:', error);
    return res.status(500).json({ error: error.message || 'Server error uploading story' });
  }
};