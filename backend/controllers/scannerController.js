const Product = require('../models/Product');
const { getIsConnected } = require('../config/db');
const store = require('../utils/memStore');

const scanProduct = async (req, res, next) => {
  try {
    const { barcode, mode = 'SALE' } = req.body;

    if (!barcode || !barcode.trim()) {
      return res.status(400).json({ success: false, message: 'Barcode string is required' });
    }

    const cleanBarcode = barcode.trim();

    let product = null;

    if (getIsConnected()) {
      product = await Product.findOne({ barcode: cleanBarcode, organizationId: req.tenantId })
        .populate('categoryId', 'name')
        .populate('supplierId', 'name company');
    } else {
      product = store.products.find(
        (p) => p.barcode === cleanBarcode && p.organizationId === req.tenantId
      );
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'No product is associated with this barcode.',
        barcode: cleanBarcode,
      });
    }

    let stockStatus = 'IN_STOCK';
    if (product.stock === 0) {
      stockStatus = 'OUT_OF_STOCK';
    } else if (product.stock <= product.reorderLevel) {
      stockStatus = 'LOW_STOCK';
    }

    return res.json({
      success: true,
      message: 'Product identified successfully',
      mode,
      product: {
        id: product._id,
        _id: product._id,
        name: product.name,
        sku: product.sku,
        barcode: product.barcode,
        description: product.description,
        sellingPrice: product.sellingPrice,
        purchasePrice: product.purchasePrice,
        stock: product.stock,
        reorderLevel: product.reorderLevel,
        maxStock: product.maxStock,
        stockStatus,
        category: product.categoryId?.name || 'General',
        supplier: product.supplierId?.company || product.supplierId?.name || 'Supplier',
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { scanProduct };
