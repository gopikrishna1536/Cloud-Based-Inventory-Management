const Organization = require('../models/Organization');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const generateToken = require('../utils/generateToken');
const { getIsConnected } = require('../config/db');
const store = require('../utils/memStore');
const bcrypt = require('bcryptjs');

// @desc    Register a new Organization & Admin User
// @route   POST /api/auth/register
// @access  Public
const registerOrg = async (req, res, next) => {
  try {
    const { companyName, name, email, password, confirmPassword } = req.body;

    if (!companyName || !name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    const lowerEmail = email.toLowerCase();

    if (getIsConnected()) {
      const existingUser = await User.findOne({ email: lowerEmail });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email address already registered' });
      }

      const organization = await Organization.create({
        name: companyName,
        email: lowerEmail,
        plan: 'FREE',
        subscriptionStatus: 'ACTIVE',
      });

      const user = await User.create({
        name,
        email: lowerEmail,
        password,
        role: 'ADMIN',
        organizationId: organization._id,
        status: 'ACTIVE',
      });

      await Subscription.create({
        organizationId: organization._id,
        plan: 'FREE',
        status: 'ACTIVE',
      });

      const token = generateToken(user._id, user.role, organization._id);

      return res.status(201).json({
        success: true,
        message: 'Organization registered successfully',
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          organization: organization,
        },
      });
    } else {
      // In-Memory Fallback Mode
      const existing = store.users.find((u) => u.email === lowerEmail);
      if (existing) {
        return res.status(400).json({ success: false, message: 'Email address already registered' });
      }

      const newOrg = {
        _id: `org_${Date.now()}`,
        name: companyName,
        email: lowerEmail,
        plan: 'FREE',
        subscriptionStatus: 'ACTIVE',
        createdAt: new Date(),
      };
      store.organizations.push(newOrg);

      const newUser = {
        _id: `usr_${Date.now()}`,
        name,
        email: lowerEmail,
        passwordHash: bcrypt.hashSync(password, 10),
        role: 'ADMIN',
        organizationId: newOrg._id,
        status: 'ACTIVE',
        createdAt: new Date(),
      };
      store.users.push(newUser);

      store.subscriptions.push({
        _id: `sub_${Date.now()}`,
        organizationId: newOrg._id,
        plan: 'FREE',
        status: 'ACTIVE',
      });

      const token = generateToken(newUser._id, newUser.role, newOrg._id);

      return res.status(201).json({
        success: true,
        message: 'Organization registered successfully',
        token,
        user: {
          _id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          organization: newOrg,
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const lowerEmail = email.toLowerCase();

    if (getIsConnected()) {
      const user = await User.findOne({ email: lowerEmail }).populate('organizationId');
      if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

      const isMatch = await user.matchPassword(password);
      if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });
      if (user.status === 'INACTIVE') return res.status(403).json({ success: false, message: 'Account deactivated' });

      const token = generateToken(user._id, user.role, user.organizationId._id);
      return res.json({
        success: true,
        message: 'Logged in successfully',
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          organization: user.organizationId,
        },
      });
    } else {
      // In-Memory Fallback Mode
      const user = store.users.find((u) => u.email === lowerEmail);
      if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

      const isMatch = bcrypt.compareSync(password, user.passwordHash);
      if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });
      if (user.status === 'INACTIVE') return res.status(403).json({ success: false, message: 'Account deactivated' });

      const org = store.organizations.find((o) => o._id === user.organizationId) || { _id: user.organizationId, name: 'ABC Electronics', plan: 'PRO' };
      const token = generateToken(user._id, user.role, org._id);

      return res.json({
        success: true,
        message: 'Logged in successfully',
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          organization: org,
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    res.json({
      success: true,
      user: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        organization: req.user.organizationId,
      },
    });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  res.json({
    success: true,
    message: 'Password reset link sent (Demo code: 123456)',
  });
};

const resetPassword = async (req, res, next) => {
  res.json({
    success: true,
    message: 'Password reset successfully',
  });
};

module.exports = {
  registerOrg,
  loginUser,
  getMe,
  forgotPassword,
  resetPassword,
};
