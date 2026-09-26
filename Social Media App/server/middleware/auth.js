import jwt from 'jsonwebtoken';
import prisma from '../db.js';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied: No token provided' });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    req.user = verified;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

export const authorizePostOwner = async (req, res, next) => {
  const postId = req.params.id || req.body.postId;
  const currentUserId = req.user?.id;

  if (!postId) {
    return res.status(400).json({ error: 'Post ID is required for authorization' });
  }

  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { userId: true },
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.userId !== currentUserId) {
      return res.status(403).json({ error: 'Forbidden: You do not have permission to modify this resource' });
    }

    next();
  } catch (err) {
    return res.status(500).json({ error: 'Authorization check failed' });
  }
};