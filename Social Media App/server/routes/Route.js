import express from 'express';
import { login, register, updateProfile } from '../controllers/Auth.js';
import { createPost } from '../controllers/createPost.js';
import { fetchAllStories } from '../controllers/fetchAllStories.js';
import { createStory } from '../controllers/createStory.js';
import { 
  fetchAllPosts,
  fetchUserImg, 
  fetchUserName, 
  fetchUserPosts 
} from '../controllers/Posts.js';
import { upload } from '../middleware/cloudinaryUpload.js';
import { resetPassword } from '../controllers/forgotPassword.js';
import { toggleFollowUser } from '../controllers/userActions.js';
import { checkCache } from '../middleware/cache.js';
import { rateLimiter } from '../middleware/rateLimiter.js';
import { validateBody } from '../middleware/validate.js';
import { registerSchema, loginSchema } from '../validation/schemas.js';
import { getLiveness, getReadiness } from '../controllers/health.js';
import { fetchMutualContacts } from '../controllers/fetchChatContacts.js';

const router = express.Router();

const authLimiter = rateLimiter({ windowInSeconds: 60, maxRequests: 5, keyPrefix: 'auth_rl' });
const writeLimiter = rateLimiter({ windowInSeconds: 60, maxRequests: 30, keyPrefix: 'write_rl' });

router.post('/register', authLimiter, validateBody(registerSchema), register);
router.post('/login', authLimiter, validateBody(loginSchema), login);
router.post('/resetPassword', authLimiter, resetPassword);
router.post('/createPost', writeLimiter, upload.single('postFile'), createPost);
router.post('/updateProfile', writeLimiter, upload.single('profilePic'), updateProfile);
router.post('/createStory', writeLimiter, upload.single('storyFile'), createStory);
router.post('/toggleFollowUser', writeLimiter, toggleFollowUser);

router.get('/fetchAllPosts', checkCache(60), fetchAllPosts);
router.get('/posts', checkCache(60), fetchAllPosts);
router.get('/fetchAllStories', checkCache(60), fetchAllStories);
router.get('/fetchUserPosts/:id', checkCache(120), fetchUserPosts);
router.get('/fetchUserName', fetchUserName);
router.get('/fetchUserImg', fetchUserImg);
router.get('/health/live', getLiveness);
router.get('/health/ready', getReadiness);
router.get('/chat/contacts/:userId', fetchMutualContacts);

export default router;