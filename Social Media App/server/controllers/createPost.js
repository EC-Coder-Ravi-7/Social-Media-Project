import prisma from '../db.js';
import { invalidateCache } from '../middleware/cache.js';

export const createPost = async (req, res) => {
  try {
    const { userId, userName, userPic, fileType, description, location } = req.body;
    const fileUrl = req.file ? req.file.path : '';

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const post = await prisma.post.create({
      data: {
        userId,
        userName: userName || 'User',
        userPic: userPic || '',
        fileType: fileType || 'photo',
        file: fileUrl,
        description: description || '',
        location: location || '',
      },
    });

    await invalidateCache([
      'cache:/fetchAllPosts*',
      'cache:/posts*',
      `cache:/fetchUserPosts/${userId}*`,
    ]);

    return res.status(201).json(post);
  } catch (error) {
    console.error('Create Post Error:', error);
    return res.status(500).json({ error: 'Failed to create post' });
  }
};