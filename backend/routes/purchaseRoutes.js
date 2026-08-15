const express = require('express');
const router = express.Router();
const {
  getPurchases,
  getPurchaseById,
  createPurchase,
} = require('../controllers/purchaseController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { enforceTenant } = require('../middleware/tenantMiddleware');

router.use(protect);
router.use(enforceTenant);

router.get('/', getPurchases);
router.get('/:id', getPurchaseById);
router.post('/', authorize('ADMIN', 'MANAGER'), createPurchase);

module.exports = router;
