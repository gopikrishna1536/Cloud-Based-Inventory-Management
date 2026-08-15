const Supplier = require('../models/Supplier');
const Purchase = require('../models/Purchase');
const { getIsConnected } = require('../config/db');
const store = require('../utils/memStore');

const getSuppliers = async (req, res, next) => {
  try {
    if (getIsConnected()) {
      const suppliers = await Supplier.find({ organizationId: req.tenantId }).sort({ company: 1 });
      return res.json({ success: true, data: suppliers });
    } else {
      const suppliers = store.suppliers.filter((s) => s.organizationId === req.tenantId);
      return res.json({ success: true, data: suppliers });
    }
  } catch (error) {
    next(error);
  }
};

const getSupplierById = async (req, res, next) => {
  try {
    if (getIsConnected()) {
      const supplier = await Supplier.findOne({ _id: req.params.id, organizationId: req.tenantId });
      const purchases = await Purchase.find({ supplierId: req.params.id, organizationId: req.tenantId })
        .populate('items.productId', 'name sku')
        .sort({ createdAt: -1 });
      return res.json({ success: true, data: supplier, purchases });
    } else {
      const supplier = store.suppliers.find((s) => s._id === req.params.id && s.organizationId === req.tenantId);
      const purchases = store.purchases.filter((p) => (p.supplierId?._id || p.supplierId) === req.params.id && p.organizationId === req.tenantId);
      return res.json({ success: true, data: supplier, purchases });
    }
  } catch (error) {
    next(error);
  }
};

const createSupplier = async (req, res, next) => {
  try {
    const { name, company, email, phone, address, gstNumber } = req.body;
    if (getIsConnected()) {
      const supplier = await Supplier.create({ name, company, email, phone, address, gstNumber, organizationId: req.tenantId });
      return res.status(201).json({ success: true, message: 'Supplier created', data: supplier });
    } else {
      const newSup = { _id: `sup_${Date.now()}`, name, company, email, phone, address: address || '', gstNumber: gstNumber || '', organizationId: req.tenantId };
      store.suppliers.push(newSup);
      return res.status(201).json({ success: true, message: 'Supplier created', data: newSup });
    }
  } catch (error) {
    next(error);
  }
};

const updateSupplier = async (req, res, next) => {
  try {
    if (getIsConnected()) {
      const supplier = await Supplier.findOneAndUpdate({ _id: req.params.id, organizationId: req.tenantId }, req.body, { new: true });
      return res.json({ success: true, message: 'Supplier updated', data: supplier });
    } else {
      const idx = store.suppliers.findIndex((s) => s._id === req.params.id && s.organizationId === req.tenantId);
      if (idx !== -1) store.suppliers[idx] = { ...store.suppliers[idx], ...req.body };
      return res.json({ success: true, message: 'Supplier updated', data: store.suppliers[idx] });
    }
  } catch (error) {
    next(error);
  }
};

const deleteSupplier = async (req, res, next) => {
  try {
    if (getIsConnected()) {
      await Supplier.findOneAndDelete({ _id: req.params.id, organizationId: req.tenantId });
    } else {
      store.suppliers = store.suppliers.filter((s) => !(s._id === req.params.id && s.organizationId === req.tenantId));
    }
    res.json({ success: true, message: 'Supplier deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSuppliers, getSupplierById, createSupplier, updateSupplier, deleteSupplier };
