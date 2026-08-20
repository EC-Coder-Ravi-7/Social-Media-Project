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
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password?.trim();

    if (!email || !password) {
      return res.status(400).json({ msg: 'Please provide both email and password' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials. User does not exist.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials. Password incorrect.' });
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
    console.error('Login error in controller:', err);
    return res.status(500).json({ msg: 'Server error during login' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { userId, username, about } = req.body;
    const profilePicUrl = req.file ? req.file.path : undefined;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(username && { username }),
        ...(about && { about }),
        ...(profilePicUrl && { profilePic: profilePicUrl }),
      },
    });

    return res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        profilePic: updatedUser.profilePic,
        about: updatedUser.about,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
};