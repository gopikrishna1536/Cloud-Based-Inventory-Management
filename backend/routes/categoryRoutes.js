const express = require('express');
const router = express.Router();
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { enforceTenant } = require('../middleware/tenantMiddleware');

router.use(protect);
router.use(enforceTenant);

router.get('/', getCategories);
router.post('/', authorize('ADMIN', 'MANAGER'), createCategory);
router.put('/:id', authorize('ADMIN', 'MANAGER'), updateCategory);
router.delete('/:id', authorize('ADMIN', 'MANAGER'), deleteCategory);

module.exports = router;
