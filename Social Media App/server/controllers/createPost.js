import Post from '../models/Post.js';

export const createPost = async (req, res) => {
  try {
    const { userId, userName, userPic, fileType, description, location } = req.body;
    
    const fileUrl = req.file ? req.file.path : '';

    const newPost = new Post({
      userId,
      userName: userName || 'User',
      userPic: userPic || '',
      fileType: fileType || 'photo',
      file: fileUrl,
      description: description || '',
      location: location || '',
      likes: [],
      comments: [],
    });

    const savedPost = await newPost.save();
    return res.status(201).json(savedPost);
  } catch (error) {
    console.error('Create Post Error:', error);
    return res.status(500).json({ error: 'Failed to create post' });
  }
};