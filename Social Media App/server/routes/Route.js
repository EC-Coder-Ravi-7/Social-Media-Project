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

const router = express.Router();

// Write / Mutation Routes (No caching)
router.post('/resetPassword', resetPassword);
router.post('/register', register);
router.post('/login', login);
router.post('/createPost', upload.single('postFile'), createPost);
router.post('/updateProfile', upload.single('profilePic'), updateProfile);
router.post('/createStory', upload.single('storyFile'), createStory);
router.post('/toggleFollowUser', toggleFollowUser);

// Cached Read Routes (Cache-Aside pattern)
// 1. All Posts feed (Cached for 60 seconds)
router.get('/fetchAllPosts', checkCache(60), fetchAllPosts);
router.get('/posts', checkCache(60), fetchAllPosts);

// 2. Active Stories (Cached for 60 seconds)
router.get('/fetchAllStories', checkCache(60), fetchAllStories);

// 3. User specific posts (Cached for 120 seconds per user id)
router.get('/fetchUserPosts/:id', checkCache(120), fetchUserPosts);

// 4. User profile info
router.get('/fetchUserName', fetchUserName);
router.get('/fetchUserImg', fetchUserImg);

export default router;