const Product = require('../models/Product');
const InventoryTransaction = require('../models/InventoryTransaction');
const { getIsConnected } = require('../config/db');
const store = require('../utils/memStore');

const getInventory = async (req, res, next) => {
  try {
    if (getIsConnected()) {
      const products = await Product.find({ organizationId: req.tenantId })
        .populate('categoryId', 'name')
        .populate('supplierId', 'name company')
        .sort({ stock: 1 });

      let totalItems = 0, totalValue = 0, lowStockCount = 0, outOfStockCount = 0;
      products.forEach((p) => {
        totalItems += p.stock;
        totalValue += p.stock * p.purchasePrice;
        if (p.stock === 0) outOfStockCount++;
        else if (p.stock <= p.reorderLevel) lowStockCount++;
      });

      return res.json({
        success: true,
        stats: { totalProducts: products.length, totalItems, totalValue, lowStockCount, outOfStockCount },
        data: products,
        pagination: { total: products.length, page: 1, pages: 1 },
      });
    } else {
      const products = store.products.filter((p) => p.organizationId === req.tenantId);
      let totalItems = 0, totalValue = 0, lowStockCount = 0, outOfStockCount = 0;
      products.forEach((p) => {
        totalItems += p.stock;
        totalValue += p.stock * p.purchasePrice;
        if (p.stock === 0) outOfStockCount++;
        else if (p.stock <= p.reorderLevel) lowStockCount++;
      });

      return res.json({
        success: true,
        stats: { totalProducts: products.length, totalItems, totalValue, lowStockCount, outOfStockCount },
        data: products,
        pagination: { total: products.length, page: 1, pages: 1 },
      });
    }
  } catch (error) {
    next(error);
  }
};

const getTransactions = async (req, res, next) => {
  try {
    if (getIsConnected()) {
      const transactions = await InventoryTransaction.find({ organizationId: req.tenantId })
        .populate('productId', 'name sku')
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 });
      return res.json({ success: true, data: transactions, pagination: { total: transactions.length, page: 1, pages: 1 } });
    } else {
      const transactions = store.transactions.filter((t) => t.organizationId === req.tenantId);
      return res.json({ success: true, data: transactions, pagination: { total: transactions.length, page: 1, pages: 1 } });
    }
  } catch (error) {
    next(error);
  }
};

const adjustStock = async (req, res, next) => {
  try {
    const { productId, type, quantity } = req.body;
    if (!productId || !type || quantity === undefined) {
      return res.status(400).json({ success: false, message: 'Product ID, type, and quantity required' });
    }

    if (getIsConnected()) {
      const product = await Product.findOne({ _id: productId, organizationId: req.tenantId });
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

      const prev = product.stock;
      const newStock = prev + Number(quantity);
      if (newStock < 0) return res.status(400).json({ success: false, message: 'Stock cannot drop below 0' });

      product.stock = newStock;
      await product.save();

      const transaction = await InventoryTransaction.create({
        productId: product._id,
        organizationId: req.tenantId,
        type,
        quantity: Number(quantity),
        previousStock: prev,
        newStock,
        createdBy: req.user._id,
      });

      return res.json({ success: true, message: 'Stock adjusted', data: { product, transaction } });
    } else {
      const product = store.products.find((p) => p._id === productId && p.organizationId === req.tenantId);
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

      const prev = product.stock;
      const newStock = prev + Number(quantity);
      if (newStock < 0) return res.status(400).json({ success: false, message: 'Stock cannot drop below 0' });

      product.stock = newStock;
      const transaction = {
        _id: `tx_${Date.now()}`,
        productId: { _id: product._id, name: product.name, sku: product.sku },
        organizationId: req.tenantId,
        type,
        quantity: Number(quantity),
        previousStock: prev,
        newStock,
        createdBy: { _id: req.user._id, name: req.user.name },
        createdAt: new Date(),
      };
      store.transactions.unshift(transaction);
      return res.json({ success: true, message: 'Stock adjusted', data: { product, transaction } });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { getInventory, getTransactions, adjustStock };
