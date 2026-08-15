const Sale = require('../models/Sale');
const Product = require('../models/Product');
const InventoryTransaction = require('../models/InventoryTransaction');
const { getIsConnected } = require('../config/db');
const store = require('../utils/memStore');

const getSales = async (req, res, next) => {
  try {
    if (getIsConnected()) {
      const sales = await Sale.find({ organizationId: req.tenantId })
        .populate('items.productId', 'name sku')
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 });
      return res.json({ success: true, data: sales, pagination: { total: sales.length, page: 1, pages: 1 } });
    } else {
      const sales = store.sales.filter((s) => s.organizationId === req.tenantId);
      return res.json({ success: true, data: sales, pagination: { total: sales.length, page: 1, pages: 1 } });
    }
  } catch (error) {
    next(error);
  }
};

const getSaleById = async (req, res, next) => {
  try {
    if (getIsConnected()) {
      const sale = await Sale.findOne({ _id: req.params.id, organizationId: req.tenantId })
        .populate('items.productId', 'name sku')
        .populate('createdBy', 'name email');
      if (!sale) return res.status(404).json({ success: false, message: 'Sale not found' });
      return res.json({ success: true, data: sale });
    } else {
      const sale = store.sales.find((s) => s._id === req.params.id && s.organizationId === req.tenantId);
      if (!sale) return res.status(404).json({ success: false, message: 'Sale not found' });
      return res.json({ success: true, data: sale });
    }
  } catch (error) {
    next(error);
  }
};

const createSale = async (req, res, next) => {
  try {
    const { customer, items, discount = 0, tax = 0 } = req.body;
    if (!customer || !customer.name || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Customer name and items required' });
    }

    if (getIsConnected()) {
      let subtotal = 0;
      let totalProfit = 0;
      const processedItems = [];

      for (const item of items) {
        const product = await Product.findOne({ _id: item.productId, organizationId: req.tenantId });
        if (!product) return res.status(400).json({ success: false, message: `Product not found` });

        const qty = Number(item.quantity);
        const sellPrice = Number(item.sellingPrice !== undefined ? item.sellingPrice : product.sellingPrice);

        if (qty > product.stock) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for product '${product.name}'. Requested: ${qty}, Available: ${product.stock}`,
          });
        }

        const itemTotal = qty * sellPrice;
        const itemProfit = (sellPrice - product.purchasePrice) * qty;
        subtotal += itemTotal;
        totalProfit += itemProfit;

        processedItems.push({
          productId: product._id,
          quantity: qty,
          sellingPrice: sellPrice,
          purchasePrice: product.purchasePrice,
          total: itemTotal,
          profit: itemProfit,
        });
      }

      const netDiscount = Number(discount) || 0;
      const netTax = Number(tax) || 0;

      const sale = await Sale.create({
        customer,
        organizationId: req.tenantId,
        items: processedItems,
        subtotal,
        discount: netDiscount,
        tax: netTax,
        totalAmount: subtotal - netDiscount + netTax,
        totalProfit: totalProfit - netDiscount,
        createdBy: req.user._id,
      });

      for (const item of processedItems) {
        const product = await Product.findById(item.productId);
        const prev = product.stock;
        product.stock = prev - item.quantity;
        await product.save();

        await InventoryTransaction.create({
          productId: product._id,
          organizationId: req.tenantId,
          type: 'SALE',
          quantity: item.quantity,
          previousStock: prev,
          newStock: product.stock,
          referenceId: sale._id,
          createdBy: req.user._id,
        });
      }

      const populated = await Sale.findById(sale._id).populate('items.productId', 'name sku').populate('createdBy', 'name');
      return res.status(201).json({ success: true, message: 'Sale completed', data: populated });
    } else {
      let subtotal = 0;
      let totalProfit = 0;
      const processedItems = [];

      for (const item of items) {
        const product = store.products.find((p) => p._id === item.productId);
        if (product) {
          const qty = Number(item.quantity);
          if (qty > product.stock) {
            return res.status(400).json({
              success: false,
              message: `Insufficient stock for product '${product.name}'. Requested: ${qty}, Available: ${product.stock}`,
            });
          }

          const sellPrice = Number(item.sellingPrice !== undefined ? item.sellingPrice : product.sellingPrice);
          const itemTotal = qty * sellPrice;
          const itemProfit = (sellPrice - product.purchasePrice) * qty;

          subtotal += itemTotal;
          totalProfit += itemProfit;
          product.stock -= qty;

          processedItems.push({
            productId: { _id: product._id, name: product.name, sku: product.sku },
            quantity: qty,
            sellingPrice: sellPrice,
            purchasePrice: product.purchasePrice,
            total: itemTotal,
            profit: itemProfit,
          });
        }
      }

      const netDiscount = Number(discount) || 0;
      const netTax = Number(tax) || 0;

      const newSale = {
        _id: `sale_${Date.now()}`,
        customer,
        organizationId: req.tenantId,
        items: processedItems,
        subtotal,
        discount: netDiscount,
        tax: netTax,
        totalAmount: subtotal - netDiscount + netTax,
        totalProfit: totalProfit - netDiscount,
        createdBy: { _id: req.user._id, name: req.user.name },
        createdAt: new Date(),
      };

      store.sales.unshift(newSale);
      return res.status(201).json({ success: true, message: 'Sale completed successfully', data: newSale });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { getSales, getSaleById, createSale };
