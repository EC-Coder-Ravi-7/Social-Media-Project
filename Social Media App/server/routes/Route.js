import express from 'express';
import { login, register, updateProfile } from '../controllers/Auth.js';
import { createPost } from '../controllers/createPost.js';
import { 
  fetchAllPosts, 
  fetchAllStories, 
  fetchUserImg, 
  fetchUserName, 
  fetchUserPosts 
} from '../controllers/Posts.js';
import { upload } from '../middleware/cloudinaryUpload.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/createPost', upload.single('postFile'), createPost);
router.post('/updateProfile', upload.single('profilePic'), updateProfile);

router.get('/fetchAllPosts', fetchAllPosts);
router.get('/fetchUserName', fetchUserName);
router.get('/fetchUserImg', fetchUserImg);
router.get('/fetchAllStories', fetchAllStories);
router.get('/fetchUserPosts/:id', fetchUserPosts);

export default router;