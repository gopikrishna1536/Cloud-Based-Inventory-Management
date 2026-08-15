const Organization = require('../models/Organization');
const Subscription = require('../models/Subscription');
const Product = require('../models/Product');
const User = require('../models/User');
const { getIsConnected } = require('../config/db');
const store = require('../utils/memStore');

const getSubscription = async (req, res, next) => {
  try {
    if (getIsConnected()) {
      const org = await Organization.findById(req.tenantId);
      let sub = await Subscription.findOne({ organizationId: req.tenantId });
      if (!sub) sub = await Subscription.create({ organizationId: req.tenantId, plan: org?.plan || 'FREE', status: 'ACTIVE' });
      const currentProductCount = await Product.countDocuments({ organizationId: req.tenantId });
      const currentUserCount = await User.countDocuments({ organizationId: req.tenantId });

      return res.json({
        success: true,
        subscription: sub,
        usage: {
          products: { current: currentProductCount, limit: sub.plan === 'PRO' ? 500 : sub.plan === 'ENTERPRISE' ? 'Unlimited' : 50 },
          users: { current: currentUserCount, limit: sub.plan === 'PRO' ? 10 : sub.plan === 'ENTERPRISE' ? 'Unlimited' : 2 },
        },
      });
    } else {
      let sub = store.subscriptions.find((s) => s.organizationId === req.tenantId) || { plan: 'PRO', status: 'ACTIVE', startDate: new Date(), endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) };
      const currentProductCount = store.products.filter((p) => p.organizationId === req.tenantId).length;
      const currentUserCount = store.users.filter((u) => u.organizationId === req.tenantId).length;

      return res.json({
        success: true,
        subscription: sub,
        usage: {
          products: { current: currentProductCount, limit: sub.plan === 'PRO' ? 500 : sub.plan === 'ENTERPRISE' ? 'Unlimited' : 50 },
          users: { current: currentUserCount, limit: sub.plan === 'PRO' ? 10 : sub.plan === 'ENTERPRISE' ? 'Unlimited' : 2 },
        },
      });
    }
  } catch (error) { next(error); }
};

const updateSubscription = async (req, res, next) => {
  try {
    const { plan } = req.body;
    if (!['FREE', 'PRO', 'ENTERPRISE'].includes(plan)) {
      return res.status(400).json({ success: false, message: 'Invalid plan' });
    }

    if (getIsConnected()) {
      const org = await Organization.findById(req.tenantId);
      if (org) { org.plan = plan; await org.save(); }
      let sub = await Subscription.findOne({ organizationId: req.tenantId });
      if (sub) { sub.plan = plan; await sub.save(); }
      return res.json({ success: true, message: `Upgraded to ${plan} Plan!`, subscription: sub });
    } else {
      const org = store.organizations.find((o) => o._id === req.tenantId);
      if (org) org.plan = plan;
      let sub = store.subscriptions.find((s) => s.organizationId === req.tenantId);
      if (sub) sub.plan = plan;
      return res.json({ success: true, message: `Upgraded to ${plan} Plan!`, subscription: sub });
    }
  } catch (error) { next(error); }
};

module.exports = { getSubscription, updateSubscription };
