import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dashboard-dev-secret';
const JWT_EXPIRES_IN = '7d';

const buildToken = (user) =>
  jwt.sign(
    {
      sub: String(user._id),
      username: user.username
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

export const register = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'username and password are required' });
    }

    const normalizedUsername = String(username).trim().toLowerCase();
    const existingUser = await User.findOne({ username: normalizedUsername });

    if (existingUser) {
      return res.status(409).json({ message: 'User already exists with this username' });
    }

    const hashedPassword = await bcrypt.hash(String(password), 10);

    const user = await User.create({
      username: normalizedUsername,
      password: hashedPassword
    });

    const token = buildToken(user);

    return res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username
      }
    });
  } catch (error) {
    return next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'username and password are required' });
    }

    const normalizedUsername = String(username).trim().toLowerCase();
    const user = await User.findOne({ username: normalizedUsername });

    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const isPasswordValid = await bcrypt.compare(String(password), user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const token = buildToken(user);

    return res.json({
      token,
      user: {
        id: user._id,
        username: user.username
      }
    });
  } catch (error) {
    return next(error);
  }
};

export const updateAccount = async (req, res, next) => {
  try {
    const userId = req.user?.sub;
    const { currentPassword, newUsername, newPassword } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!currentPassword) {
      return res.status(400).json({ message: 'currentPassword is required' });
    }

    if (!newUsername && !newPassword) {
      return res.status(400).json({ message: 'Provide newUsername or newPassword' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isCurrentPasswordValid = await bcrypt.compare(String(currentPassword), user.password);

    if (!isCurrentPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    if (newUsername) {
      const normalizedUsername = String(newUsername).trim().toLowerCase();

      if (!normalizedUsername) {
        return res.status(400).json({ message: 'newUsername cannot be empty' });
      }

      const existingUser = await User.findOne({ username: normalizedUsername, _id: { $ne: user._id } });
      if (existingUser) {
        return res.status(409).json({ message: 'Username is already taken' });
      }

      user.username = normalizedUsername;
    }

    if (newPassword) {
      const normalizedPassword = String(newPassword);
      if (normalizedPassword.trim().length < 6) {
        return res.status(400).json({ message: 'newPassword must be at least 6 characters' });
      }

      user.password = await bcrypt.hash(normalizedPassword, 10);
    }

    await user.save();

    const token = buildToken(user);

    return res.json({
      message: 'Account updated successfully',
      token,
      user: {
        id: user._id,
        username: user.username
      }
    });
  } catch (error) {
    return next(error);
  }
};
