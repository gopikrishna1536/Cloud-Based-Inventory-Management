import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Mail, Phone, ShoppingBag, AlertCircle } from 'lucide-react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Suppliers = () => {
  const { isManager } = useAuth();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    address: '',
    gstNumber: '',
  });

  // History Modal State
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedSupplierHistory, setSelectedSupplierHistory] = useState(null);
  const [supplierPurchases, setSupplierPurchases] = useState([]);

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/suppliers', { params: { search } });
      if (res.data.success) {
        setSuppliers(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load suppliers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, [search]);

  const handleOpenModal = (sup = null) => {
    setError('');
    if (sup) {
      setEditingSupplier(sup);
      setFormData({
        name: sup.name,
        company: sup.company,
        email: sup.email,
        phone: sup.phone,
        address: sup.address || '',
        gstNumber: sup.gstNumber || '',
      });
    } else {
      setEditingSupplier(null);
      setFormData({
        name: '',
        company: '',
        email: '',
        phone: '',
        address: '',
        gstNumber: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleViewHistory = async (sup) => {
    setSelectedSupplierHistory(sup);
    try {
      const res = await api.get(`/suppliers/${sup._id}`);
      if (res.data.success) {
        setSupplierPurchases(res.data.purchases || []);
        setIsHistoryModalOpen(true);
      }
    } catch (err) {
      alert('Failed to load supplier purchase history');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (editingSupplier) {
        await api.put(`/suppliers/${editingSupplier._id}`, formData);
      } else {
        await api.post('/suppliers', formData);
      }
      setIsModalOpen(false);
      fetchSuppliers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save supplier');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        await api.delete(`/suppliers/${id}`);
        fetchSuppliers();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete supplier');
      }
    }
  };

  const columns = [
    {
      header: 'Company & Supplier',
      cell: (row) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center font-extrabold text-sm shrink-0">
            {row.company.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-extrabold text-slate-900 text-sm">{row.company}</div>
            <div className="text-[11px] text-slate-500">Contact: {row.name}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Contact Details',
      cell: (row) => (
        <div className="text-xs space-y-0.5">
          <div className="text-slate-700 font-medium flex items-center space-x-1.5">
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            <span>{row.email}</span>
          </div>
          <div className="text-slate-500 flex items-center space-x-1.5">
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            <span>{row.phone}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'GST Number',
      cell: (row) => (
        <span className="text-xs font-mono px-2 py-1 rounded bg-slate-100 border border-slate-200 text-slate-700">
          {row.gstNumber || 'N/A'}
        </span>
      ),
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleViewHistory(row)}
            className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-xs font-bold text-red-600 border border-red-200 transition flex items-center space-x-1"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Orders</span>
          </button>

          {isManager && (
            <>
              <button
                onClick={() => handleOpenModal(row)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(row._id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Supplier Directory</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage vendors, procurement contacts, and GST records.</p>
        </div>

        {isManager && (
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-xs shadow-md shadow-red-500/20 hover:scale-105 transition flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Supplier</span>
          </button>
        )}
      </div>

      {/* Search Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm max-w-md">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by company name, contact, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-red-500 transition"
          />
        </div>
      </div>

      {/* Table */}
      <DataTable columns={columns} data={suppliers} isLoading={loading} />

      {/* Add / Edit Supplier Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
      >
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Company Name *</label>
              <input
                type="text"
                required
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="TechDistro India Ltd"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Contact Person Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Rajesh Kumar"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="sales@techdistro.in"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone Number *</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">GST Number</label>
            <input
              type="text"
              value={formData.gstNumber}
              onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })}
              placeholder="29ABCDE1234F1Z5"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 uppercase font-mono focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Office Address</label>
            <textarea
              rows="2"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Street address..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-red-500"
            ></textarea>
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
              {isSubmitting ? 'Saving...' : 'Save Supplier'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Supplier Purchase History Modal */}
      <Modal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        title={`Purchase History — ${selectedSupplierHistory?.company || ''}`}
        maxWidth="max-w-3xl"
      >
        <div className="space-y-4 text-xs">
          {supplierPurchases.length === 0 ? (
            <p className="text-center py-8 text-slate-400">No purchase orders found for this supplier.</p>
          ) : (
            supplierPurchases.map((purchase) => (
              <div key={purchase._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="font-bold text-slate-900">Order #{purchase._id.substring(18)}</div>
                  <div className="text-slate-500">{new Date(purchase.createdAt).toLocaleString()}</div>
                </div>

                <div className="space-y-1">
                  {purchase.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-slate-700">
                      <span>
                        {item.productId?.name || 'Product'} &times; {item.quantity} units
                      </span>
                      <span className="font-bold">₹{item.total.toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-slate-900 font-bold">
                  <span>Total Amount</span>
                  <span className="text-red-600">₹{purchase.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Suppliers;
