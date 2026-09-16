import bcrypt from 'bcrypt';
import prisma from '../db.js';

export const resetPassword = async (req, res) => {
  try {
    const identifier = (req.body.identifier || req.body.email || '').trim();
    const newPassword = req.body.newPassword?.trim();

    if (!identifier || !newPassword) {
      return res.status(400).json({ msg: 'Please provide email/username and new password' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ msg: 'Password must be at least 6 characters long' });
    }

    // Find the user by username OR email
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: identifier, mode: 'insensitive' } },
          { username: { equals: identifier, mode: 'insensitive' } },
        ],
      },
    });

    if (!user) {
      return res.status(404).json({ msg: 'No account found with this username or email' });
    }

    // Hash and update password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return res.status(200).json({ msg: 'Password reset successful! You can now log in.' });
  } catch (err) {
    console.error('Password reset error:', err);
    return res.status(500).json({ msg: 'Server error while resetting password' });
  }
};