const express = require('express');
const router = express.Router();
const {
  getSalesReport,
  getPurchaseReport,
  getInventoryReport,
} = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { enforceTenant } = require('../middleware/tenantMiddleware');

router.use(protect);
router.use(enforceTenant);

router.get('/sales', authorize('ADMIN', 'MANAGER'), getSalesReport);
router.get('/purchases', authorize('ADMIN', 'MANAGER'), getPurchaseReport);
router.get('/inventory', authorize('ADMIN', 'MANAGER'), getInventoryReport);

module.exports = router;
