const Sale = require('../models/Sale');
const Purchase = require('../models/Purchase');
const Product = require('../models/Product');
const { getIsConnected } = require('../config/db');
const store = require('../utils/memStore');

const getSalesReport = async (req, res, next) => {
  try {
    if (getIsConnected()) {
      const sales = await Sale.find({ organizationId: req.tenantId }).populate('items.productId', 'name sku').populate('createdBy', 'name').sort({ createdAt: -1 });
      let totalRevenue = 0, totalProfit = 0;
      sales.forEach((s) => { totalRevenue += s.totalAmount; totalProfit += s.totalProfit; });
      return res.json({ success: true, summary: { totalOrders: sales.length, totalRevenue, totalProfit }, data: sales });
    } else {
      const sales = store.sales.filter((s) => s.organizationId === req.tenantId);
      let totalRevenue = 0, totalProfit = 0;
      sales.forEach((s) => { totalRevenue += s.totalAmount; totalProfit += s.totalProfit; });
      return res.json({ success: true, summary: { totalOrders: sales.length, totalRevenue, totalProfit }, data: sales });
    }
  } catch (error) { next(error); }
};

const getPurchaseReport = async (req, res, next) => {
  try {
    if (getIsConnected()) {
      const purchases = await Purchase.find({ organizationId: req.tenantId }).populate('supplierId', 'name company').populate('items.productId', 'name sku').populate('createdBy', 'name').sort({ createdAt: -1 });
      let totalSpent = 0;
      purchases.forEach((p) => { totalSpent += p.totalAmount; });
      return res.json({ success: true, summary: { totalPurchases: purchases.length, totalSpent }, data: purchases });
    } else {
      const purchases = store.purchases.filter((p) => p.organizationId === req.tenantId);
      let totalSpent = 0;
      purchases.forEach((p) => { totalSpent += p.totalAmount; });
      return res.json({ success: true, summary: { totalPurchases: purchases.length, totalSpent }, data: purchases });
    }
  } catch (error) { next(error); }
};

const getInventoryReport = async (req, res, next) => {
  try {
    let products = [];
    if (getIsConnected()) {
      const dbProds = await Product.find({ organizationId: req.tenantId }).populate('categoryId', 'name').populate('supplierId', 'name company');
      products = dbProds.map((p) => ({
        _id: p._id, name: p.name, sku: p.sku, category: p.categoryId?.name || 'General', supplier: p.supplierId?.company || 'N/A',
        stock: p.stock, purchasePrice: p.purchasePrice, sellingPrice: p.sellingPrice,
        costValue: p.stock * p.purchasePrice, retailValue: p.stock * p.sellingPrice,
        status: p.stock === 0 ? 'OUT_OF_STOCK' : p.stock <= p.reorderLevel ? 'LOW_STOCK' : 'IN_STOCK',
      }));
    } else {
      products = store.products.filter((p) => p.organizationId === req.tenantId).map((p) => ({
        _id: p._id, name: p.name, sku: p.sku, category: p.categoryId?.name || 'General', supplier: p.supplierId?.company || 'N/A',
        stock: p.stock, purchasePrice: p.purchasePrice, sellingPrice: p.sellingPrice,
        costValue: p.stock * p.purchasePrice, retailValue: p.stock * p.sellingPrice,
        status: p.stock === 0 ? 'OUT_OF_STOCK' : p.stock <= p.reorderLevel ? 'LOW_STOCK' : 'IN_STOCK',
      }));
    }

    let totalValuationCost = 0, totalValuationRetail = 0;
    products.forEach((p) => { totalValuationCost += p.costValue; totalValuationRetail += p.retailValue; });

    res.json({
      success: true,
      summary: { totalProducts: products.length, totalValuationCost, totalValuationRetail, potentialProfit: totalValuationRetail - totalValuationCost },
      data: products,
    });
  } catch (error) { next(error); }
};

module.exports = { getSalesReport, getPurchaseReport, getInventoryReport };
