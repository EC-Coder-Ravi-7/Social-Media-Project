import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../db.js';

export const register = async (req, res) => {
  try {
    const { username, email, password, profilePic, about } = req.body;

    // Check existing email
    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });
    if (existingEmail) {
      return res.status(400).json({ msg: 'Email already registered' });
    }

    // Check existing username
    const existingUsername = await prisma.user.findUnique({
      where: { username },
    });
    if (existingUsername) {
      return res.status(400).json({ msg: 'Username already taken' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user in PostgreSQL
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        profilePic: profilePic || '',
        about: about || 'Hey there! I am using SocialX.',
      },
    });

    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        fullName: user.fullName || user.username,
        username: user.username,
        email: user.email,
        profilePic: user.profilePic,
        about: user.about,
      },
    });
  } catch (error) {
    console.error('Register Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const login = async (req, res) => {
  try {
    const identifier = (req.body.email || req.body.username || req.body.identifier || '').trim();
    const password = req.body.password?.trim();

    if (!identifier || !password) {
      return res.status(400).json({ msg: 'Please provide email/username and password' });
    }

    // Find by either email OR username (case-insensitive)
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: identifier, mode: 'insensitive' } },
          { username: { equals: identifier, mode: 'insensitive' } },
        ],
      },
    });

    if (!user) {
      return res.status(400).json({ msg: 'User does not exist with this username or email' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Incorrect password' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        profilePic: user.profilePic,
        about: user.about,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ msg: 'Server error during login' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { userId, username, fullName, about, profilePic } = req.body;
    const finalUserId = userId || req.body._id;

    if (!finalUserId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const uploadedPic = req.file ? req.file.path : profilePic;

    const updatedUser = await prisma.user.update({
      where: { id: finalUserId },
      data: {
        ...(username && { username }),
        ...(fullName && { fullName }),
        ...(about && { about }),
        ...(uploadedPic && { profilePic: uploadedPic }),
      },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        about: true,
        profilePic: true,
      },
    });

    return res.status(200).json({
      ...updatedUser,
      _id: updatedUser.id,
    });
  } catch (error) {
    console.error('Error in updateProfile:', error);
    return res.status(500).json({ error: 'Error updating profile' });
  }
};