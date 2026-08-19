import Post from '../models/Post.js';
import Stories from '../models/Stories.js';
import User from '../models/Users.js'

export const fetchAllPosts = async (req, res) =>{
    try {
      const posts = await Post.find().sort({ _id: -1 });
      return res.status(200).json(posts);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
};

export const fetchUserPosts = async (req, res) => {
  try {
    const { id } = req.params;
    const userPosts = await Post.find({ userId: id }).sort({ _id: -1 });
    return res.status(200).json(userPosts);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const fetchUserName = async (req, res) =>{
  try {
      const userId = req.body.userId;
      const user = await User.findById(userId);
      console.log(userId);
      res.status(200).json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    } 
} 

export const fetchUserImg = async (req, res) =>{
  try {
    const userId = req.body.userId;
    const user = await User.findOne({_id: userId});
    console.log(userId);
    res.status(200).json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
} 

export const fetchAllStories = async (req, res) =>{
  try {
    const stories =  await Stories.find();

    res.status(200).json(stories);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
} 