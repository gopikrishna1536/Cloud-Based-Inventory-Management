const Purchase = require('../models/Purchase');
const Product = require('../models/Product');
const InventoryTransaction = require('../models/InventoryTransaction');
const { getIsConnected } = require('../config/db');
const store = require('../utils/memStore');

const getPurchases = async (req, res, next) => {
  try {
    if (getIsConnected()) {
      const purchases = await Purchase.find({ organizationId: req.tenantId })
        .populate('supplierId', 'name company')
        .populate('items.productId', 'name sku')
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 });
      return res.json({ success: true, data: purchases, pagination: { total: purchases.length, page: 1, pages: 1 } });
    } else {
      const purchases = store.purchases.filter((p) => p.organizationId === req.tenantId);
      return res.json({ success: true, data: purchases, pagination: { total: purchases.length, page: 1, pages: 1 } });
    }
  } catch (error) {
    next(error);
  }
};

const getPurchaseById = async (req, res, next) => {
  try {
    if (getIsConnected()) {
      const purchase = await Purchase.findOne({ _id: req.params.id, organizationId: req.tenantId })
        .populate('supplierId', 'name company email phone address gstNumber')
        .populate('items.productId', 'name sku')
        .populate('createdBy', 'name email');
      if (!purchase) return res.status(404).json({ success: false, message: 'Purchase not found' });
      return res.json({ success: true, data: purchase });
    } else {
      const purchase = store.purchases.find((p) => p._id === req.params.id && p.organizationId === req.tenantId);
      if (!purchase) return res.status(404).json({ success: false, message: 'Purchase not found' });
      return res.json({ success: true, data: purchase });
    }
  } catch (error) {
    next(error);
  }
};

const createPurchase = async (req, res, next) => {
  try {
    const { supplierId, items } = req.body;
    if (!supplierId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Supplier and items required' });
    }

    if (getIsConnected()) {
      let calculatedTotal = 0;
      const processedItems = [];

      for (const item of items) {
        const product = await Product.findOne({ _id: item.productId, organizationId: req.tenantId });
        if (!product) return res.status(400).json({ success: false, message: `Product not found` });

        const qty = Number(item.quantity);
        const price = Number(item.purchasePrice);
        const itemTotal = qty * price;
        calculatedTotal += itemTotal;

        processedItems.push({ productId: product._id, quantity: qty, purchasePrice: price, total: itemTotal });
      }

      const purchase = await Purchase.create({
        supplierId,
        organizationId: req.tenantId,
        items: processedItems,
        totalAmount: calculatedTotal,
        createdBy: req.user._id,
      });

      for (const item of processedItems) {
        const product = await Product.findById(item.productId);
        const prev = product.stock;
        product.stock = prev + item.quantity;
        await product.save();

        await InventoryTransaction.create({
          productId: product._id,
          organizationId: req.tenantId,
          type: 'PURCHASE',
          quantity: item.quantity,
          previousStock: prev,
          newStock: product.stock,
          referenceId: purchase._id,
          createdBy: req.user._id,
        });
      }

      const populated = await Purchase.findById(purchase._id)
        .populate('supplierId', 'name company')
        .populate('items.productId', 'name sku')
        .populate('createdBy', 'name');

      return res.status(201).json({ success: true, message: 'Purchase order created and stock updated', data: populated });
    } else {
      const sup = store.suppliers.find((s) => s._id === supplierId) || { _id: supplierId, name: 'Supplier', company: 'Supplier Co' };
      let calculatedTotal = 0;
      const processedItems = [];

      for (const item of items) {
        const product = store.products.find((p) => p._id === item.productId);
        if (product) {
          const qty = Number(item.quantity);
          const price = Number(item.purchasePrice);
          const itemTotal = qty * price;
          calculatedTotal += itemTotal;

          product.stock += qty;
          processedItems.push({
            productId: { _id: product._id, name: product.name, sku: product.sku },
            quantity: qty,
            purchasePrice: price,
            total: itemTotal,
          });
        }
      }

      const newPurchase = {
        _id: `pur_${Date.now()}`,
        supplierId: { _id: sup._id, name: sup.name, company: sup.company },
        organizationId: req.tenantId,
        items: processedItems,
        totalAmount: calculatedTotal,
        createdBy: { _id: req.user._id, name: req.user.name },
        createdAt: new Date(),
      };

      store.purchases.unshift(newPurchase);
      return res.status(201).json({ success: true, message: 'Purchase created', data: newPurchase });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { getPurchases, getPurchaseById, createPurchase };
