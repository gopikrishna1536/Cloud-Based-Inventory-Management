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
    const { productId, type, search } = req.query;

    if (getIsConnected()) {
      const query = { organizationId: req.tenantId };
      if (type) query.type = type;
      if (productId) query.productId = productId;

      const transactions = await InventoryTransaction.find(query)
        .populate('productId', 'name sku barcode')
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 });

      let filtered = transactions;
      if (search) {
        const s = search.toLowerCase();
        filtered = transactions.filter((t) => {
          const pName = t.productId?.name || '';
          const pSku = t.productId?.sku || '';
          const pBarcode = t.productId?.barcode || '';
          return pName.toLowerCase().includes(s) || pSku.toLowerCase().includes(s) || pBarcode.toLowerCase().includes(s);
        });
      }

      return res.json({ success: true, data: filtered, pagination: { total: filtered.length, page: 1, pages: 1 } });
    } else {
      let transactions = store.transactions.filter((t) => t.organizationId === req.tenantId);
      if (type) transactions = transactions.filter((t) => t.type === type);
      if (productId) {
        transactions = transactions.filter((t) => (t.productId?._id || t.productId) === productId);
      }
      if (search) {
        const s = search.toLowerCase();
        transactions = transactions.filter((t) => {
          const pName = t.productId?.name || '';
          const pSku = t.productId?.sku || '';
          const pBarcode = t.productId?.barcode || '';
          return pName.toLowerCase().includes(s) || pSku.toLowerCase().includes(s) || pBarcode.toLowerCase().includes(s);
        });
      }

      return res.json({ success: true, data: transactions, pagination: { total: transactions.length, page: 1, pages: 1 } });
    }
  } catch (error) {
    next(error);
  }
};

const getProductTransactions = async (req, res, next) => {
  try {
    const { productId } = req.params;
    if (getIsConnected()) {
      const transactions = await InventoryTransaction.find({
        productId,
        organizationId: req.tenantId,
      })
        .populate('productId', 'name sku barcode')
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 });
      return res.json({ success: true, data: transactions });
    } else {
      const transactions = store.transactions.filter(
        (t) => (t.productId?._id || t.productId) === productId && t.organizationId === req.tenantId
      );
      return res.json({ success: true, data: transactions });
    }
  } catch (error) {
    next(error);
  }
};

const stockIn = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const qty = Number(quantity);
    if (!productId || isNaN(qty) || qty <= 0) {
      return res.status(400).json({ success: false, message: 'Valid productId and positive quantity required' });
    }

    if (getIsConnected()) {
      const product = await Product.findOne({ _id: productId, organizationId: req.tenantId });
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

      const prev = product.stock;
      product.stock = prev + qty;
      await product.save();

      const transaction = await InventoryTransaction.create({
        productId: product._id,
        organizationId: req.tenantId,
        type: 'PURCHASE',
        quantity: qty,
        previousStock: prev,
        newStock: product.stock,
        createdBy: req.user._id,
        reason: 'Barcode Stock-In',
      });

      return res.json({
        success: true,
        message: `Stock In completed! New stock for '${product.name}': ${product.stock}`,
        data: { product, transaction },
      });
    } else {
      const product = store.products.find((p) => p._id === productId && p.organizationId === req.tenantId);
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

      const prev = product.stock;
      product.stock = prev + qty;

      const transaction = {
        _id: `tx_${Date.now()}`,
        productId: { _id: product._id, name: product.name, sku: product.sku, barcode: product.barcode },
        organizationId: req.tenantId,
        type: 'PURCHASE',
        quantity: qty,
        previousStock: prev,
        newStock: product.stock,
        createdBy: { _id: req.user._id, name: req.user.name },
        reason: 'Barcode Stock-In',
        createdAt: new Date(),
      };
      store.transactions.unshift(transaction);

      return res.json({
        success: true,
        message: `Stock In completed! New stock for '${product.name}': ${product.stock}`,
        data: { product, transaction },
      });
    }
  } catch (error) {
    next(error);
  }
};

const adjustStock = async (req, res, next) => {
  try {
    const { productId, type = 'ADJUSTMENT', quantity, reason } = req.body;
    const qty = Number(quantity);

    if (!productId || qty === undefined || isNaN(qty)) {
      return res.status(400).json({ success: false, message: 'Product ID and numeric quantity are required' });
    }

    if (getIsConnected()) {
      const product = await Product.findOne({ _id: productId, organizationId: req.tenantId });
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

      const prev = product.stock;
      let delta = qty;

      if (type === 'RETURN') {
        delta = Math.abs(qty); // Returns increase stock
      } else if (type === 'PURCHASE') {
        delta = Math.abs(qty); // Purchase increases stock
      } else if (type === 'SALE') {
        delta = -Math.abs(qty); // Sale decreases stock
      }

      const newStock = prev + delta;
      if (newStock < 0) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for '${product.name}'. Current: ${prev}, Requested Change: ${delta}`,
        });
      }

      product.stock = newStock;
      await product.save();

      const transaction = await InventoryTransaction.create({
        productId: product._id,
        organizationId: req.tenantId,
        type,
        quantity: delta,
        previousStock: prev,
        newStock,
        createdBy: req.user._id,
        reason: reason || `${type} transaction`,
      });

      return res.json({
        success: true,
        message: `Stock updated for '${product.name}' (${prev} → ${newStock})`,
        data: { product, transaction },
      });
    } else {
      const product = store.products.find((p) => p._id === productId && p.organizationId === req.tenantId);
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

      const prev = product.stock;
      let delta = qty;
      if (type === 'RETURN' || type === 'PURCHASE') {
        delta = Math.abs(qty);
      } else if (type === 'SALE') {
        delta = -Math.abs(qty);
      }

      const newStock = prev + delta;
      if (newStock < 0) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for '${product.name}'. Current: ${prev}, Requested Change: ${delta}`,
        });
      }

      product.stock = newStock;
      const transaction = {
        _id: `tx_${Date.now()}`,
        productId: { _id: product._id, name: product.name, sku: product.sku, barcode: product.barcode },
        organizationId: req.tenantId,
        type,
        quantity: delta,
        previousStock: prev,
        newStock,
        createdBy: { _id: req.user._id, name: req.user.name },
        reason: reason || `${type} transaction`,
        createdAt: new Date(),
      };
      store.transactions.unshift(transaction);

      return res.json({
        success: true,
        message: `Stock updated for '${product.name}' (${prev} → ${newStock})`,
        data: { product, transaction },
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInventory,
  getTransactions,
  getProductTransactions,
  stockIn,
  adjustStock,
};
