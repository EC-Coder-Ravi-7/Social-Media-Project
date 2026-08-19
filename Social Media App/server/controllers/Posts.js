import prisma from '../db.js';

// 1. Fetch all posts for the global feed
export const fetchAllPosts = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        likes: true,
        comments: {
          include: {
            user: {
              select: { username: true, profilePic: true },
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

// 2. Fetch specific user posts (for Profile & post counter)
export const fetchUserPosts = async (req, res) => {
  try {
    const { id } = req.params;
    const posts = await prisma.post.findMany({
      where: { userId: id },
      orderBy: { createdAt: 'desc' },
      include: {
        likes: true,
        comments: {
          include: {
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

// 3. Fetch user name by ID
export const fetchUserName = async (req, res) => {
  try {
    const { userId } = req.body;
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

// 4. Fetch user profile image by ID
export const fetchUserImg = async (req, res) => {
  try {
    const { userId } = req.body;
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

// 5. Fetch all stories (returns an empty array for now until Story model is migrated)
export const fetchAllStories = async (req, res) => {
  try {
    return res.status(200).json([]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};