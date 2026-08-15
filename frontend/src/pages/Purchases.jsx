import React, { useState, useEffect } from 'react';
import { Plus, ShoppingCart, Trash2, Building2, AlertCircle } from 'lucide-react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const safeId = (id, prefix = 'PO') => {
  if (!id) return `${prefix}-001`;
  const idStr = String(id);
  const short = idStr.length > 18 ? idStr.substring(18) : idStr;
  return `${prefix}-${short.toUpperCase()}`;
};

const Purchases = () => {
  const { isManager } = useAuth();
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });

  // Purchase Modal Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [supplierId, setSupplierId] = useState('');
  const [items, setItems] = useState([{ productId: '', quantity: 1, purchasePrice: 0 }]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPurchases = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get('/purchases', { params: { page } });
      if (res.data.success) {
        setPurchases(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Failed to load purchases', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDependencies = async () => {
    try {
      const [supRes, prodRes] = await Promise.all([
        api.get('/suppliers'),
        api.get('/products?limit=100'),
      ]);
      if (supRes.data.success) setSuppliers(supRes.data.data);
      if (prodRes.data.success) setProducts(prodRes.data.data);
    } catch (err) {
      console.error('Failed to load dependency dropdowns', err);
    }
  };

  useEffect(() => {
    fetchPurchases(1);
    fetchDependencies();
  }, []);

  const handleOpenModal = () => {
    setError('');
    setSupplierId(suppliers[0]?._id || '');
    setItems([{ productId: products[0]?._id || '', quantity: 1, purchasePrice: products[0]?.purchasePrice || 0 }]);
    setIsModalOpen(true);
  };

  const handleProductChange = (index, prodId) => {
    const selectedProd = products.find((p) => p._id === prodId);
    const newItems = [...items];
    newItems[index].productId = prodId;
    if (selectedProd) {
      newItems[index].purchasePrice = selectedProd.purchasePrice;
    }
    setItems(newItems);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleAddItem = () => {
    setItems([...items, { productId: products[0]?._id || '', quantity: 1, purchasePrice: products[0]?.purchasePrice || 0 }]);
  };

  const handleRemoveItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, idx) => idx !== index));
    }
  };

  const grandTotal = items.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.purchasePrice) || 0),
    0
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await api.post('/purchases', {
        supplierId,
        items,
      });
      setIsModalOpen(false);
      fetchPurchases(pagination.page);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record purchase order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Purchase ID / Date',
      cell: (row) => (
        <div>
          <div className="font-bold text-slate-900 text-xs font-mono">{safeId(row._id, 'PO')}</div>
          <div className="text-[10px] text-slate-500">{new Date(row.createdAt).toLocaleString()}</div>
        </div>
      ),
    },
    {
      header: 'Supplier Company',
      cell: (row) => (
        <div className="text-xs font-semibold text-slate-800 flex items-center space-x-1.5">
          <Building2 className="w-3.5 h-3.5 text-red-600" />
          <span>{row.supplierId?.company || row.supplierId?.name || 'Supplier'}</span>
        </div>
      ),
    },
    {
      header: 'Purchased Items',
      cell: (row) => (
        <div className="text-xs space-y-0.5 max-w-xs">
          {row.items.map((item, idx) => (
            <div key={idx} className="text-slate-700 truncate">
              • {item.productId?.name || 'Product'} ({item.quantity} &times; ₹{item.purchasePrice.toLocaleString()})
            </div>
          ))}
        </div>
      ),
    },
    {
      header: 'Total Order Cost',
      cell: (row) => (
        <div className="text-sm font-extrabold text-red-600">
          ₹{row.totalAmount.toLocaleString()}
        </div>
      ),
    },
    {
      header: 'Created By',
      cell: (row) => (
        <span className="text-xs text-slate-500 font-medium">
          {row.createdBy?.name || 'User'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Purchase Orders</h1>
          <p className="text-xs text-slate-500 mt-0.5">Record supplier inventory orders to automatically increase stock levels.</p>
        </div>

        {isManager && (
          <button
            onClick={handleOpenModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-xs shadow-md shadow-red-500/20 hover:scale-105 transition flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Purchase Order</span>
          </button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={purchases}
        isLoading={loading}
        pagination={pagination}
        onPageChange={(page) => fetchPurchases(page)}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Supplier Purchase Order"
        maxWidth="max-w-2xl"
      >
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Select Supplier *</label>
            <select
              required
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-red-500"
            >
              <option value="">Select Supplier</option>
              {suppliers.map((sup) => (
                <option key={sup._id} value={sup._id}>
                  {sup.company} ({sup.name})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between font-bold text-slate-700">
              <span>Order Line Items *</span>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-red-600 hover:underline text-[11px] font-bold flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item Line</span>
              </button>
            </div>

            {items.map((item, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                <div className="flex-1">
                  <select
                    required
                    value={item.productId}
                    onChange={(e) => handleProductChange(idx, e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none"
                  >
                    <option value="">Select Product</option>
                    {products.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} (SKU: {p.sku})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-24">
                  <input
                    type="number"
                    min="1"
                    required
                    value={item.quantity}
                    onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                    placeholder="Qty"
                    className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-900"
                  />
                </div>

                <div className="w-32">
                  <input
                    type="number"
                    min="0"
                    required
                    value={item.purchasePrice}
                    onChange={(e) => handleItemChange(idx, 'purchasePrice', e.target.value)}
                    placeholder="Price (₹)"
                    className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-900"
                  />
                </div>

                <div className="w-24 text-right font-extrabold text-red-600">
                  ₹{(item.quantity * item.purchasePrice || 0).toLocaleString()}
                </div>

                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-between font-extrabold text-sm text-slate-900">
            <span>Total Purchase Amount</span>
            <span className="text-red-600 text-lg">₹{grandTotal.toLocaleString()}</span>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-md shadow-red-500/20 hover:scale-105 disabled:opacity-50 transition"
            >
              {isSubmitting ? 'Confirming Purchase...' : 'Confirm & Update Stock'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Purchases;
