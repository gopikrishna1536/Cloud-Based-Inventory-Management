const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');
const { enforceTenant } = require('../middleware/tenantMiddleware');

router.use(protect);
router.use(enforceTenant);

router.get('/stats', getDashboardStats);

module.exports = router;
