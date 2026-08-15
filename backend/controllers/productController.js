const Product = require('../models/Product');
const Organization = require('../models/Organization');
const { getIsConnected } = require('../config/db');
const store = require('../utils/memStore');
const { generateBarcode } = require('../utils/barcodeUtils');

const getProducts = async (req, res, next) => {
  try {
    const { search, category, supplier, stockStatus, page = 1, limit = 10 } = req.query;

    if (getIsConnected()) {
      const query = { organizationId: req.tenantId };
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { sku: { $regex: search, $options: 'i' } },
          { barcode: { $regex: search, $options: 'i' } },
        ];
      }
      if (category) query.categoryId = category;
      if (supplier) query.supplierId = supplier;

      const skip = (Number(page) - 1) * Number(limit);
      const products = await Product.find(query)
        .populate('categoryId', 'name')
        .populate('supplierId', 'name company')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));

      const total = await Product.countDocuments(query);
      return res.json({
        success: true,
        data: products,
        pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) || 1 },
      });
    } else {
      let filtered = store.products.filter((p) => p.organizationId === req.tenantId);
      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(s) ||
            p.sku.toLowerCase().includes(s) ||
            (p.barcode && p.barcode.toLowerCase().includes(s))
        );
      }
      if (category) {
        filtered = filtered.filter((p) => (p.categoryId?._id || p.categoryId) === category);
      }
      return res.json({
        success: true,
        data: filtered,
        pagination: { total: filtered.length, page: 1, pages: 1 },
      });
    }
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    if (getIsConnected()) {
      const product = await Product.findOne({ _id: req.params.id, organizationId: req.tenantId })
        .populate('categoryId', 'name')
        .populate('supplierId', 'name company');
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
      return res.json({ success: true, data: product });
    } else {
      const product = store.products.find((p) => p._id === req.params.id && p.organizationId === req.tenantId);
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
      return res.json({ success: true, data: product });
    }
  } catch (error) {
    next(error);
  }
};

const getProductByBarcode = async (req, res, next) => {
  try {
    const { barcode } = req.params;
    if (getIsConnected()) {
      const product = await Product.findOne({ barcode: barcode.trim(), organizationId: req.tenantId })
        .populate('categoryId', 'name')
        .populate('supplierId', 'name company');
      if (!product) return res.status(404).json({ success: false, message: 'No product associated with this barcode' });
      return res.json({ success: true, data: product });
    } else {
      const product = store.products.find(
        (p) => p.barcode === barcode.trim() && p.organizationId === req.tenantId
      );
      if (!product) return res.status(404).json({ success: false, message: 'No product associated with this barcode' });
      return res.json({ success: true, data: product });
    }
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      sku,
      barcode: customBarcode,
      description,
      categoryId,
      supplierId,
      purchasePrice,
      sellingPrice,
      stock,
      reorderLevel,
      maxStock,
      image,
    } = req.body;

    const barcode = customBarcode?.trim() || generateBarcode();

    if (getIsConnected()) {
      const product = await Product.create({
        name,
        sku: sku.trim().toUpperCase(),
        barcode,
        description,
        categoryId,
        supplierId,
        organizationId: req.tenantId,
        purchasePrice,
        sellingPrice,
        stock: stock || 0,
        reorderLevel: reorderLevel || 10,
        maxStock: maxStock || 100,
        image: image || '',
      });
      const populated = await Product.findById(product._id)
        .populate('categoryId', 'name')
        .populate('supplierId', 'name company');
      return res.status(201).json({ success: true, message: 'Product created', data: populated });
    } else {
      const cat = store.categories.find((c) => c._id === categoryId) || { _id: categoryId, name: 'General' };
      const sup = store.suppliers.find((s) => s._id === supplierId) || { _id: supplierId, name: 'Supplier', company: 'Supplier Co' };

      const newProduct = {
        _id: `prod_${Date.now()}`,
        name,
        sku: sku.trim().toUpperCase(),
        barcode,
        description,
        categoryId: { _id: cat._id, name: cat.name },
        supplierId: { _id: sup._id, name: sup.name, company: sup.company },
        organizationId: req.tenantId,
        purchasePrice: Number(purchasePrice),
        sellingPrice: Number(sellingPrice),
        stock: Number(stock) || 0,
        reorderLevel: Number(reorderLevel) || 10,
        maxStock: Number(maxStock) || 100,
        image: image || '',
        createdAt: new Date(),
      };
      store.products.unshift(newProduct);
      return res.status(201).json({ success: true, message: 'Product created', data: newProduct });
    }
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    if (getIsConnected()) {
      const product = await Product.findOneAndUpdate(
        { _id: req.params.id, organizationId: req.tenantId },
        req.body,
        { new: true }
      )
        .populate('categoryId', 'name')
        .populate('supplierId', 'name company');
      return res.json({ success: true, message: 'Product updated', data: product });
    } else {
      const productIdx = store.products.findIndex((p) => p._id === req.params.id && p.organizationId === req.tenantId);
      if (productIdx === -1) return res.status(404).json({ success: false, message: 'Product not found' });

      store.products[productIdx] = { ...store.products[productIdx], ...req.body };
      return res.json({ success: true, message: 'Product updated', data: store.products[productIdx] });
    }
  } catch (error) {
    next(error);
  }
};

const generateProductBarcode = async (req, res, next) => {
  try {
    const newBarcode = generateBarcode();
    if (getIsConnected()) {
      const product = await Product.findOneAndUpdate(
        { _id: req.params.id, organizationId: req.tenantId },
        { barcode: newBarcode },
        { new: true }
      );
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
      return res.json({ success: true, message: 'Barcode generated successfully', barcode: newBarcode, data: product });
    } else {
      const product = store.products.find((p) => p._id === req.params.id && p.organizationId === req.tenantId);
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
      product.barcode = newBarcode;
      return res.json({ success: true, message: 'Barcode generated successfully', barcode: newBarcode, data: product });
    }
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    if (getIsConnected()) {
      await Product.findOneAndDelete({ _id: req.params.id, organizationId: req.tenantId });
    } else {
      store.products = store.products.filter((p) => !(p._id === req.params.id && p.organizationId === req.tenantId));
    }
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  getProductByBarcode,
  createProduct,
  updateProduct,
  generateProductBarcode,
  deleteProduct,
};
