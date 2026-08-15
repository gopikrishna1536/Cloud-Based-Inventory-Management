const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { enforceTenant } = require('../middleware/tenantMiddleware');

router.use(protect);
router.use(enforceTenant);

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', authorize('ADMIN', 'MANAGER'), createProduct);
router.put('/:id', authorize('ADMIN', 'MANAGER'), updateProduct);
router.delete('/:id', authorize('ADMIN', 'MANAGER'), deleteProduct);

module.exports = router;
