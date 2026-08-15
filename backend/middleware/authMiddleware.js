const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Organization = require('../models/Organization');
const { getIsConnected } = require('../config/db');
const store = require('../utils/memStore');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'stockcloud_secure_super_secret_jwt_key_2026'
      );

      if (getIsConnected()) {
        const user = await User.findById(decoded.id).select('-password').populate('organizationId');
        if (!user) return res.status(401).json({ success: false, message: 'User account not found' });
        if (user.status === 'INACTIVE') return res.status(403).json({ success: false, message: 'Account is deactivated' });
        req.user = user;
      } else {
        // Fallback to memStore
        const memUser = store.users.find((u) => u._id === decoded.id);
        if (!memUser) return res.status(401).json({ success: false, message: 'User account not found' });
        if (memUser.status === 'INACTIVE') return res.status(403).json({ success: false, message: 'Account deactivated' });

        const memOrg = store.organizations.find((o) => o._id === memUser.organizationId);
        req.user = {
          _id: memUser._id,
          name: memUser.name,
          email: memUser.email,
          role: memUser.role,
          status: memUser.status,
          organizationId: memOrg || { _id: memUser.organizationId, name: 'StockCloud Org', plan: 'PRO' },
        };
      }

      next();
    } catch (error) {
      console.error('Auth Middleware Error:', error.message);
      return res.status(401).json({ success: false, message: 'Not authorized, invalid token' });
    }
  } else {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

module.exports = { protect };
