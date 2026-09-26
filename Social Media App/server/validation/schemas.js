import { z } from 'zod';

export const registerSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, 'Alphanumeric and underscores only'),
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

export const postSchema = z.object({
  userId: z.string().uuid('Invalid User UUID'),
  userName: z.string().min(1),
  userPic: z.string().optional(),
  fileType: z.enum(['photo', 'video']).default('photo'),
  description: z.string().max(2000).optional(),
  location: z.string().max(100).optional(),
});