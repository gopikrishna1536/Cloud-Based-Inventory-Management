const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { enforceTenant } = require('../middleware/tenantMiddleware');

router.use(protect);
router.use(enforceTenant);

router.get('/', getSettings);
router.put('/', authorize('ADMIN'), updateSettings);

module.exports = router;
