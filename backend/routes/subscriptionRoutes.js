const express = require('express');
const router = express.Router();
const {
  getSubscription,
  updateSubscription,
} = require('../controllers/subscriptionController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { enforceTenant } = require('../middleware/tenantMiddleware');

router.use(protect);
router.use(enforceTenant);

router.get('/', getSubscription);
router.put('/', authorize('ADMIN'), updateSubscription);

module.exports = router;
