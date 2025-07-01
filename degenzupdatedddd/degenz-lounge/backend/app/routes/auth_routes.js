import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { User } from '../models/models';
import { authenticateToken } from '../utils/auth';

const router = express.Router();

// Register a new user
router.post(
  '/register',
  [
    body('username').notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
  ],
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    try {
      // Check if user already exists
      let user = await User.findOne({ where: { email } });
      if (user) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new user
      user = await User.create({
        username,
        email,
        hashed_password: hashedPassword,
        is_active: true,
        subscription_plan: 'free' // Default plan
      });

      // Create JWT token
      const token = jwt.sign(
        { user_id: user.id, email },
        process.env.SECRET_KEY || 'your_secret_key_here',
        { expiresIn: '24h' }
      );

      // Return user data and token
      res.status(201).json({
        id: user.id,
        username: user.username,
        email: user.email,
        subscription_plan: user.subscription_plan,
        token
      });
    } catch (error) {
      console.error('Error registering user:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Login user
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Check if user exists
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Verify password
      const isMatch = await bcrypt.compare(password, user.hashed_password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Create JWT token
      const token = jwt.sign(
        { user_id: user.id, email },
        process.env.SECRET_KEY || 'your_secret_key_here',
        { expiresIn: '24h' }
      );

      // Return user data and token
      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        subscription_plan: user.subscription_plan,
        token
      });
    } catch (error) {
      console.error('Error logging in user:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.user_id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      subscription_plan: user.subscription_plan
    });
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update subscription plan
router.put('/subscription', authenticateToken, async (req, res) => {
  const { plan } = req.body;

  // Validate plan
  const validPlans = ['free', 'pro', 'enterprise'];
  if (!validPlans.includes(plan)) {
    return res.status(400).json({ message: 'Invalid subscription plan' });
  }

  try {
    const user = await User.findByPk(req.user.user_id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user's subscription plan
    user.subscription_plan = plan;
    await user.save();

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      subscription_plan: user.subscription_plan
    });
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
