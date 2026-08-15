const express = require('express');
const router = express.Router();
const {
  getInventory,
  getTransactions,
  adjustStock,
} = require('../controllers/inventoryController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { enforceTenant } = require('../middleware/tenantMiddleware');

router.use(protect);
router.use(enforceTenant);

router.get('/', getInventory);
router.get('/transactions', getTransactions);
router.post('/adjust', authorize('ADMIN', 'MANAGER'), adjustStock);

module.exports = router;
