const express = require('express');
const router = express.Router();
const {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} = require('../controllers/supplierController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { enforceTenant } = require('../middleware/tenantMiddleware');

router.use(protect);
router.use(enforceTenant);

router.get('/', getSuppliers);
router.get('/:id', getSupplierById);
router.post('/', authorize('ADMIN', 'MANAGER'), createSupplier);
router.put('/:id', authorize('ADMIN', 'MANAGER'), updateSupplier);
router.delete('/:id', authorize('ADMIN', 'MANAGER'), deleteSupplier);

module.exports = router;
