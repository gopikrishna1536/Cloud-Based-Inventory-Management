import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Printer, Trash2, AlertCircle, Barcode as BarcodeIcon } from 'lucide-react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import api from '../services/api';

const safeId = (id, prefix = 'INV') => {
  if (!id) return `${prefix}-001`;
  const idStr = String(id);
  const short = idStr.length > 18 ? idStr.substring(18) : idStr;
  return `${prefix}-${short.toUpperCase()}`;
};

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });

  // Sale Modal Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customer, setCustomer] = useState({ name: '', phone: '', email: '' });
  const [items, setItems] = useState([{ productId: '', quantity: 1, sellingPrice: 0 }]);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Printable Invoice Modal State
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedSaleInvoice, setSelectedSaleInvoice] = useState(null);

  const fetchSales = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get('/sales', { params: { page } });
      if (res.data.success) {
        setSales(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch sales', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products?limit=100');
      if (res.data.success) setProducts(res.data.data);
    } catch (err) {
      console.error('Failed to load products', err);
    }
  };

  useEffect(() => {
    fetchSales(1);
    fetchProducts();
  }, []);

  const handleOpenModal = () => {
    setError('');
    setCustomer({ name: '', phone: '', email: '' });
    setDiscount(0);
    setTax(0);
    const firstProd = products[0] || {};
    setItems([{ productId: firstProd._id || '', quantity: 1, sellingPrice: firstProd.sellingPrice || 0 }]);
    setIsModalOpen(true);
  };

  const handleProductChange = (index, prodId) => {
    const selectedProd = products.find((p) => p._id === prodId);
    const newItems = [...items];
    newItems[index].productId = prodId;
    if (selectedProd) {
      newItems[index].sellingPrice = selectedProd.sellingPrice;
    }
    setItems(newItems);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleAddItem = () => {
    const firstProd = products[0] || {};
    setItems([...items, { productId: firstProd._id || '', quantity: 1, sellingPrice: firstProd.sellingPrice || 0 }]);
  };

  const handleRemoveItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, idx) => idx !== index));
    }
  };

  const subtotal = items.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.sellingPrice) || 0), 0);
  const netTotal = subtotal - (Number(discount) || 0) + (Number(tax) || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const res = await api.post('/sales', {
        customer,
        items,
        discount: Number(discount),
        tax: Number(tax),
      });
      setIsModalOpen(false);
      fetchSales(pagination.page);
      if (res.data.success && res.data.data) {
        setSelectedSaleInvoice(res.data.data);
        setIsInvoiceModalOpen(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete sale order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const columns = [
    {
      header: 'Invoice # / Date',
      cell: (row) => (
        <div>
          <div className="font-bold text-slate-900 text-xs font-mono">{safeId(row._id, 'INV')}</div>
          <div className="text-[10px] text-slate-500">{new Date(row.createdAt).toLocaleString()}</div>
        </div>
      ),
    },
    {
      header: 'Customer',
      cell: (row) => (
        <div className="text-xs font-semibold text-slate-800">
          <div>{row.customer?.name}</div>
          <div className="text-[10px] text-slate-500">{row.customer?.phone || row.customer?.email}</div>
        </div>
      ),
    },
    {
      header: 'Line Items',
      cell: (row) => (
        <div className="text-xs space-y-0.5 max-w-xs">
          {row.items.map((item, idx) => (
            <div key={idx} className="text-slate-700 truncate">
              • {item.productId?.name || 'Product'} ({item.quantity} &times; ₹{item.sellingPrice.toLocaleString()})
            </div>
          ))}
        </div>
      ),
    },
    {
      header: 'Total Revenue & Profit',
      cell: (row) => (
        <div>
          <div className="text-sm font-extrabold text-emerald-600">₹{row.totalAmount.toLocaleString()}</div>
          <div className="text-[10px] text-emerald-700 font-bold">Profit: +₹{row.totalProfit.toLocaleString()}</div>
        </div>
      ),
    },
    {
      header: 'Action',
      cell: (row) => (
        <button
          onClick={() => {
            setSelectedSaleInvoice(row);
            setIsInvoiceModalOpen(true);
          }}
          className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-xs font-bold text-red-600 border border-red-200 transition flex items-center space-x-1"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Invoice</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Sales & Customer Billing</h1>
          <p className="text-xs text-slate-500 mt-0.5">Generate sales invoices with automated profit calculation and stock subtraction.</p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/app/scan"
            className="px-4 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs shadow-md hover:bg-slate-800 transition flex items-center space-x-2 shrink-0"
          >
            <BarcodeIcon className="w-4 h-4 text-red-500" />
            <span>Scan Barcode (POS)</span>
          </Link>

          <button
            onClick={handleOpenModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-xs shadow-md shadow-red-500/20 hover:scale-105 transition flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Sale Order</span>
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={sales}
        isLoading={loading}
        pagination={pagination}
        onPageChange={(page) => fetchSales(page)}
      />

      {/* New Sale Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record New Customer Sale"
        maxWidth="max-w-2xl"
      >
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Customer Name *</label>
              <input
                type="text"
                required
                value={customer.name}
                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                placeholder="Metro Retail Store"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={customer.phone}
                onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                placeholder="+91 99887 11223"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={customer.email}
                onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                placeholder="buyer@metro.com"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between font-bold text-slate-700">
              <span>Billing Line Items *</span>
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
                      <option key={p._id} value={p._id} disabled={p.stock === 0}>
                        {p.name} (Stock: {p.stock})
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
                    value={item.sellingPrice}
                    onChange={(e) => handleItemChange(idx, 'sellingPrice', e.target.value)}
                    placeholder="Price (₹)"
                    className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-900"
                  />
                </div>

                <div className="w-24 text-right font-extrabold text-emerald-600">
                  ₹{(item.quantity * item.sellingPrice || 0).toLocaleString()}
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Discount Amount (₹)</label>
              <input
                type="number"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tax / GST (₹)</label>
              <input
                type="number"
                min="0"
                value={tax}
                onChange={(e) => setTax(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-between font-extrabold text-sm text-slate-900">
            <span>Net Customer Total</span>
            <span className="text-emerald-600 text-lg">₹{netTotal.toLocaleString()}</span>
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
              {isSubmitting ? 'Processing...' : 'Complete Sale & Print Invoice'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Printable Invoice Modal */}
      <Modal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        title="Tax Invoice Receipt"
        maxWidth="max-w-2xl"
      >
        {selectedSaleInvoice && (
          <div className="space-y-6 text-slate-900 text-xs p-4 bg-white rounded-2xl border border-slate-200">
            {/* Invoice Header */}
            <div className="flex justify-between items-start border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-xl font-black text-slate-900">TAX INVOICE</h2>
                <div className="text-xs text-red-600 font-bold mt-1">StockCloud SaaS Platform</div>
                <div className="text-[10px] text-slate-500">Official Sales & Tax Record</div>
              </div>
              <div className="text-right">
                <div className="font-mono font-bold text-slate-900">
                  {safeId(selectedSaleInvoice._id, 'INV')}
                </div>
                <div className="text-[10px] text-slate-500">
                  Date: {selectedSaleInvoice.createdAt ? new Date(selectedSaleInvoice.createdAt).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            </div>

            {/* Billed To */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="text-[10px] text-slate-500 uppercase font-bold">Billed To Customer</div>
              <div className="font-bold text-sm text-slate-900">{selectedSaleInvoice.customer?.name}</div>
              <div className="text-slate-600">{selectedSaleInvoice.customer?.phone || selectedSaleInvoice.customer?.email}</div>
            </div>

            {/* Invoice Items Table */}
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100 text-[10px] font-bold text-slate-500 uppercase">
                  <th className="py-2 px-3">Item Description</th>
                  <th className="py-2 px-3 text-center">Qty</th>
                  <th className="py-2 px-3 text-right">Unit Price</th>
                  <th className="py-2 px-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {selectedSaleInvoice.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-2 px-3 font-bold text-slate-900">{item.productId?.name || 'Product'}</td>
                    <td className="py-2 px-3 text-center">{item.quantity}</td>
                    <td className="py-2 px-3 text-right">₹{item.sellingPrice.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right font-bold">₹{item.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Invoice Summary */}
            <div className="border-t border-slate-200 pt-3 space-y-1 text-right text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-bold">₹{selectedSaleInvoice.subtotal?.toLocaleString()}</span>
              </div>
              {selectedSaleInvoice.discount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Discount:</span>
                  <span>-₹{selectedSaleInvoice.discount.toLocaleString()}</span>
                </div>
              )}
              {selectedSaleInvoice.tax > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>GST / Tax:</span>
                  <span>+₹{selectedSaleInvoice.tax.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-extrabold text-slate-900 border-t border-slate-200 pt-2">
                <span>Total Amount Paid:</span>
                <span className="text-emerald-600">₹{selectedSaleInvoice.totalAmount?.toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
              <button
                onClick={handlePrint}
                className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold text-xs shadow-md shadow-red-500/20 hover:bg-red-700 transition flex items-center space-x-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print Invoice</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Sales;
