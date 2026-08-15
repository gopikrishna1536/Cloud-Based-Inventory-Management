const express = require('express');
const router = express.Router();
const { scanProduct } = require('../controllers/scannerController');
const { protect } = require('../middleware/authMiddleware');
const { enforceTenant } = require('../middleware/tenantMiddleware');

router.use(protect);
router.use(enforceTenant);

router.post('/scan', scanProduct);

module.exports = router;
