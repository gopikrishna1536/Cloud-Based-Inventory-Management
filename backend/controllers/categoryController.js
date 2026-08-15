const Category = require('../models/Category');
const { getIsConnected } = require('../config/db');
const store = require('../utils/memStore');

const getCategories = async (req, res, next) => {
  try {
    if (getIsConnected()) {
      const categories = await Category.find({ organizationId: req.tenantId }).sort({ name: 1 });
      return res.json({ success: true, data: categories });
    } else {
      const categories = store.categories.filter((c) => c.organizationId === req.tenantId);
      return res.json({ success: true, data: categories });
    }
  } catch (error) {
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Category name is required' });

    if (getIsConnected()) {
      const category = await Category.create({ name: name.trim(), description, organizationId: req.tenantId });
      return res.status(201).json({ success: true, message: 'Category created', data: category });
    } else {
      const newCat = { _id: `cat_${Date.now()}`, name: name.trim(), description: description || '', organizationId: req.tenantId };
      store.categories.push(newCat);
      return res.status(201).json({ success: true, message: 'Category created', data: newCat });
    }
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    if (getIsConnected()) {
      const category = await Category.findOneAndUpdate({ _id: req.params.id, organizationId: req.tenantId }, req.body, { new: true });
      return res.json({ success: true, message: 'Category updated', data: category });
    } else {
      const idx = store.categories.findIndex((c) => c._id === req.params.id && c.organizationId === req.tenantId);
      if (idx !== -1) store.categories[idx] = { ...store.categories[idx], ...req.body };
      return res.json({ success: true, message: 'Category updated', data: store.categories[idx] });
    }
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    if (getIsConnected()) {
      await Category.findOneAndDelete({ _id: req.params.id, organizationId: req.tenantId });
    } else {
      store.categories = store.categories.filter((c) => !(c._id === req.params.id && c.organizationId === req.tenantId));
    }
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
