const User = require('../models/User');
const { getIsConnected } = require('../config/db');
const store = require('../utils/memStore');
const bcrypt = require('bcryptjs');

const getUsers = async (req, res, next) => {
  try {
    if (getIsConnected()) {
      const users = await User.find({ organizationId: req.tenantId }).select('-password').sort({ createdAt: -1 });
      return res.json({ success: true, data: users });
    } else {
      const users = store.users.filter((u) => u.organizationId === req.tenantId).map((u) => ({
        _id: u._id, name: u.name, email: u.email, role: u.role, status: u.status, createdAt: u.createdAt,
      }));
      return res.json({ success: true, data: users });
    }
  } catch (error) { next(error); }
};

const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) return res.status(400).json({ success: false, message: 'All fields required' });

    const lower = email.toLowerCase();
    if (getIsConnected()) {
      const user = await User.create({ name, email: lower, password, role, organizationId: req.tenantId, status: 'ACTIVE' });
      const userObj = user.toObject(); delete userObj.password;
      return res.status(201).json({ success: true, message: 'User created', data: userObj });
    } else {
      const newUser = { _id: `usr_${Date.now()}`, name, email: lower, passwordHash: bcrypt.hashSync(password, 10), role, organizationId: req.tenantId, status: 'ACTIVE', createdAt: new Date() };
      store.users.push(newUser);
      return res.status(201).json({ success: true, message: 'User created', data: { _id: newUser._id, name, email: lower, role, status: 'ACTIVE' } });
    }
  } catch (error) { next(error); }
};

const updateUser = async (req, res, next) => {
  try {
    if (getIsConnected()) {
      const user = await User.findOneAndUpdate({ _id: req.params.id, organizationId: req.tenantId }, req.body, { new: true }).select('-password');
      return res.json({ success: true, message: 'User updated', data: user });
    } else {
      const idx = store.users.findIndex((u) => u._id === req.params.id && u.organizationId === req.tenantId);
      if (idx !== -1) store.users[idx] = { ...store.users[idx], ...req.body };
      return res.json({ success: true, message: 'User updated', data: store.users[idx] });
    }
  } catch (error) { next(error); }
};

const deleteUser = async (req, res, next) => {
  try {
    if (getIsConnected()) {
      await User.findOneAndDelete({ _id: req.params.id, organizationId: req.tenantId });
    } else {
      store.users = store.users.filter((u) => !(u._id === req.params.id && u.organizationId === req.tenantId));
    }
    res.json({ success: true, message: 'User deleted' });
  } catch (error) { next(error); }
};

module.exports = { getUsers, createUser, updateUser, deleteUser };
