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


const router = express.Router();

router.post('/resetPassword', resetPassword);
router.post('/register', register);
router.post('/login', login);
router.post('/createPost', upload.single('postFile'), createPost);
router.post('/updateProfile', upload.single('profilePic'), updateProfile);
router.post('/createStory', upload.single('storyFile'), createStory);
router.post('/togtoggleFollowUsergle', toggleFollowUser);

router.get('/fetchAllPosts', fetchAllPosts);
router.get('/fetchUserName', fetchUserName);
router.get('/fetchUserImg', fetchUserImg);
router.get('/fetchAllStories', fetchAllStories);
router.get('/fetchUserPosts/:id', fetchUserPosts);

export default router;