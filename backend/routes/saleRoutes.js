const express = require('express');
const router = express.Router();
const {
  getSales,
  getSaleById,
  createSale,
} = require('../controllers/saleController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { enforceTenant } = require('../middleware/tenantMiddleware');

router.use(protect);
router.use(enforceTenant);

router.get('/', getSales);
router.get('/:id', getSaleById);
router.post('/', authorize('ADMIN', 'MANAGER', 'STAFF'), createSale);

module.exports = router;
