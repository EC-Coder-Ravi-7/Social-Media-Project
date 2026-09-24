import prisma from '../db.js';

export const fetchAllPosts = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 50);

    const posts = await prisma.post.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        userId: true,
        userName: true,
        userPic: true,
        fileType: true,
        file: true,
        description: true,
        location: true,
        createdAt: true,
        likes: {
          select: {
            userId: true,
          },
        },
        comments: {
          orderBy: { createdAt: 'asc' },
          take: 10,
          select: {
            text: true,
            user: {
              select: { username: true },
            },
          },
        },
      },
    });

    const formattedPosts = posts.map((post) => ({
      _id: post.id,
      userId: post.userId,
      userName: post.userName,
      userPic: post.userPic,
      fileType: post.fileType,
      file: post.file,
      description: post.description,
      location: post.location,
      likes: post.likes.map((like) => like.userId),
      comments: post.comments.map((c) => [c.user?.username || 'User', c.text]),
      createdAt: post.createdAt,
    }));

    return res.status(200).json(formattedPosts);
  } catch (error) {
    console.error('Fetch Posts Error:', error);
    return res.status(500).json({ error: error.message });
  }
};

export const fetchUserPosts = async (req, res) => {
  try {
    const { id } = req.params;
    const limit = Math.min(Number(req.query.limit) || 20, 50);

    const posts = await prisma.post.findMany({
      where: { userId: id },
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        userId: true,
        userName: true,
        userPic: true,
        fileType: true,
        file: true,
        description: true,
        location: true,
        createdAt: true,
        likes: {
          select: {
            userId: true,
          },
        },
        comments: {
          orderBy: { createdAt: 'asc' },
          take: 10,
          select: {
            text: true,
            user: {
              select: { username: true },
            },
          },
        },
      },
    });

    const formattedPosts = posts.map((post) => ({
      _id: post.id,
      userId: post.userId,
      userName: post.userName,
      userPic: post.userPic,
      fileType: post.fileType,
      file: post.file,
      description: post.description,
      location: post.location,
      likes: post.likes.map((like) => like.userId),
      comments: post.comments.map((c) => [c.user?.username || 'User', c.text]),
      createdAt: post.createdAt,
    }));

    return res.status(200).json(formattedPosts);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const fetchUserName = async (req, res) => {
  try {
    const userId = req.body?.userId || req.query?.userId;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { username: true },
    });

    return res.status(200).json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const fetchUserImg = async (req, res) => {
  try {
    const userId = req.body?.userId || req.query?.userId;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { profilePic: true },
    });

    return res.status(200).json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const fetchAllStories = async (req, res) => {
  try {
    const stories = await prisma.story.findMany({
      orderBy: { createdAt: 'desc' },
      take: 30,
      select: {
        id: true,
        userId: true,
        userName: true,
        userPic: true,
        file: true,
        fileType: true,
        createdAt: true,
      },
    });

    return res.status(200).json(stories);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};