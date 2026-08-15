import React, { useState, useEffect } from 'react';
import { Boxes, AlertTriangle, RefreshCw, Plus, Filter } from 'lucide-react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Inventory = () => {
  const { isManager } = useAuth();
  const [activeTab, setActiveTab] = useState('stock');
  const [inventoryStats, setInventoryStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  // Adjustment Modal
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [adjustType, setAdjustType] = useState('ADJUSTMENT');
  const [quantity, setQuantity] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchInventory = async (page = 1) => {
    setLoading(true);
    try {
      if (activeTab === 'stock') {
        const res = await api.get('/inventory', {
          params: { page, status: statusFilter, search },
        });
        if (res.data.success) {
          setProducts(res.data.data);
          setInventoryStats(res.data.stats);
          setPagination(res.data.pagination);
        }
      } else {
        const res = await api.get('/inventory/transactions', {
          params: { page },
        });
        if (res.data.success) {
          setTransactions(res.data.data);
          setPagination(res.data.pagination);
        }
      }
    } catch (err) {
      console.error('Failed to fetch inventory data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory(1);
  }, [activeTab, statusFilter, search]);

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await api.post('/inventory/adjust', {
        productId: selectedProduct,
        type: adjustType,
        quantity: Number(quantity),
      });
      setIsAdjustModalOpen(false);
      fetchInventory(pagination.page);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to adjust stock');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stockColumns = [
    {
      header: 'Product Details',
      cell: (row) => (
        <div>
          <div className="font-bold text-slate-900 text-sm">{row.name}</div>
          <div className="text-[10px] text-slate-500 font-mono">SKU: {row.sku}</div>
        </div>
      ),
    },
    {
      header: 'Category & Supplier',
      cell: (row) => (
        <div className="text-xs">
          <div className="text-slate-800 font-medium">{row.categoryId?.name || 'N/A'}</div>
          <div className="text-[10px] text-slate-500">{row.supplierId?.company || 'N/A'}</div>
        </div>
      ),
    },
    {
      header: 'Stock Level',
      cell: (row) => (
        <div>
          <div className="font-extrabold text-sm text-slate-900">{row.stock} units</div>
          <div className="text-[10px] text-slate-500">Reorder limit: {row.reorderLevel}</div>
        </div>
      ),
    },
    {
      header: 'Inventory Value',
      cell: (row) => (
        <div className="text-xs font-bold text-red-600">
          ₹{(row.stock * row.purchasePrice).toLocaleString()}
        </div>
      ),
    },
    {
      header: 'Status',
      cell: (row) => {
        let badge = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        let label = 'IN STOCK';

        if (row.stock === 0) {
          badge = 'bg-rose-50 text-rose-700 border-rose-200';
          label = 'OUT OF STOCK';
        } else if (row.stock <= row.reorderLevel) {
          badge = 'bg-amber-50 text-amber-700 border-amber-200';
          label = 'LOW STOCK';
        }

        return (
          <span className={`inline-block px-2.5 py-1 rounded border text-[10px] font-extrabold tracking-wider ${badge}`}>
            {label}
          </span>
        );
      },
    },
    {
      header: 'Action',
      cell: (row) => (
        isManager ? (
          <button
            onClick={() => {
              setSelectedProduct(row._id);
              setIsAdjustModalOpen(true);
            }}
            className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-xs font-semibold text-red-600 border border-red-200 transition"
          >
            Adjust Stock
          </button>
        ) : null
      ),
    },
  ];

  const transactionColumns = [
    {
      header: 'Date & Time',
      cell: (row) => (
        <div className="text-xs font-medium text-slate-600">
          {new Date(row.createdAt).toLocaleString()}
        </div>
      ),
    },
    {
      header: 'Product',
      cell: (row) => (
        <div>
          <div className="font-bold text-slate-900 text-xs">{row.productId?.name || 'Deleted Product'}</div>
          <div className="text-[10px] text-slate-500 font-mono">{row.productId?.sku}</div>
        </div>
      ),
    },
    {
      header: 'Transaction Type',
      cell: (row) => {
        const typeStyles = {
          PURCHASE: 'bg-blue-50 text-blue-700 border-blue-200',
          SALE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          ADJUSTMENT: 'bg-purple-50 text-purple-700 border-purple-200',
          RETURN: 'bg-amber-50 text-amber-700 border-amber-200',
        };
        return (
          <span className={`inline-block px-2.5 py-0.5 rounded border text-[10px] font-bold ${typeStyles[row.type]}`}>
            {row.type}
          </span>
        );
      },
    },
    {
      header: 'Quantity Change',
      cell: (row) => (
        <span className={`font-extrabold text-xs ${row.quantity > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
          {row.quantity > 0 ? `+${row.quantity}` : row.quantity} units
        </span>
      ),
    },
    {
      header: 'Stock Flow',
      cell: (row) => (
        <div className="text-xs text-slate-600">
          {row.previousStock} &rarr; <span className="font-bold text-slate-900">{row.newStock}</span>
        </div>
      ),
    },
    {
      header: 'User',
      cell: (row) => <span className="text-xs text-slate-500">{row.createdBy?.name || 'System'}</span>,
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Inventory & Audit Trail</h1>
          <p className="text-xs text-slate-500 mt-0.5">Track real-time stock levels and stock modification history.</p>
        </div>

        {isManager && (
          <button
            onClick={() => {
              setSelectedProduct(products[0]?._id || '');
              setIsAdjustModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-xs shadow-md shadow-red-500/20 hover:scale-105 transition flex items-center space-x-2 shrink-0"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Manual Stock Adjustment</span>
          </button>
        )}
      </div>

      {/* KPI Stats Header Cards */}
      {inventoryStats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-[11px] text-slate-500 font-bold uppercase">Total Units in Stock</div>
            <div className="text-xl font-black text-slate-900 mt-1">{inventoryStats.totalItems}</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-[11px] text-slate-500 font-bold uppercase">Total Inventory Value</div>
            <div className="text-xl font-black text-red-600 mt-1">
              ₹{inventoryStats.totalValue.toLocaleString()}
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-[11px] text-slate-500 font-bold uppercase">Low Stock Products</div>
            <div className="text-xl font-black text-amber-600 mt-1">{inventoryStats.lowStockCount}</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-[11px] text-slate-500 font-bold uppercase">Out of Stock Products</div>
            <div className="text-xl font-black text-rose-600 mt-1">{inventoryStats.outOfStockCount}</div>
          </div>
        </div>
      )}

      {/* Tabs & Filters Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('stock')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'stock'
                ? 'bg-red-600 text-white shadow-md shadow-red-500/20'
                : 'text-slate-600 hover:text-red-600 hover:bg-red-50'
            }`}
          >
            Current Stock Status
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'transactions'
                ? 'bg-red-600 text-white shadow-md shadow-red-500/20'
                : 'text-slate-600 hover:text-red-600 hover:bg-red-50'
            }`}
          >
            Transaction History Log
          </button>
        </div>

        {activeTab === 'stock' && (
          <div className="flex items-center space-x-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none"
            >
              <option value="">All Stock Statuses</option>
              <option value="IN_STOCK">In Stock</option>
              <option value="LOW_STOCK">Low Stock</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
            </select>
          </div>
        )}
      </div>

      {/* Table Data */}
      <DataTable
        columns={activeTab === 'stock' ? stockColumns : transactionColumns}
        data={activeTab === 'stock' ? products : transactions}
        isLoading={loading}
        pagination={pagination}
        onPageChange={(page) => fetchInventory(page)}
      />

      {/* Stock Adjustment Modal */}
      <Modal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        title="Manual Stock Adjustment"
        maxWidth="max-w-md"
      >
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleAdjustSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Select Product *</label>
            <select
              required
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-red-500"
            >
              <option value="">Select Product</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} (Current Stock: {p.stock})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Adjustment Type *</label>
            <select
              value={adjustType}
              onChange={(e) => setAdjustType(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-red-500"
            >
              <option value="ADJUSTMENT">Stock Adjustment (Audit / Correction)</option>
              <option value="RETURN">Customer / Supplier Return</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Quantity Change (+ to add, - to subtract) *
            </label>
            <input
              type="number"
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="e.g. 5 or -2"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsAdjustModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-md shadow-red-500/20 hover:scale-105 disabled:opacity-50 transition"
            >
              {isSubmitting ? 'Adjusting...' : 'Save Stock Adjustment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Inventory;
