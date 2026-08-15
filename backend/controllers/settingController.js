const Organization = require('../models/Organization');
const { getIsConnected } = require('../config/db');
const store = require('../utils/memStore');

const getSettings = async (req, res, next) => {
  try {
    if (getIsConnected()) {
      const organization = await Organization.findById(req.tenantId);
      return res.json({ success: true, data: organization });
    } else {
      const org = store.organizations.find((o) => o._id === req.tenantId) || store.organizations[0];
      return res.json({ success: true, data: org });
    }
  } catch (error) { next(error); }
};

const updateSettings = async (req, res, next) => {
  try {
    if (getIsConnected()) {
      const organization = await Organization.findByIdAndUpdate(req.tenantId, req.body, { new: true });
      return res.json({ success: true, message: 'Settings updated', data: organization });
    } else {
      const idx = store.organizations.findIndex((o) => o._id === req.tenantId);
      if (idx !== -1) store.organizations[idx] = { ...store.organizations[idx], ...req.body };
      return res.json({ success: true, message: 'Settings updated', data: store.organizations[idx] });
    }
  } catch (error) { next(error); }
};

module.exports = { getSettings, updateSettings };
