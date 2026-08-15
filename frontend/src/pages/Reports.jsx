import React, { useState, useEffect } from 'react';
import { Download, TrendingUp, ShoppingBag, Boxes } from 'lucide-react';
import api from '../services/api';
import Loading from '../components/Loading';

const safeId = (id, prefix = '') => {
  if (!id) return `${prefix}-001`;
  const idStr = String(id);
  const short = idStr.length > 18 ? idStr.substring(18) : idStr;
  return `${prefix}-${short.toUpperCase()}`;
};

const Reports = () => {
  const [reportType, setReportType] = useState('sales');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/reports/${reportType}`);
      if (res.data && res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load report', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportType]);

  const handleExportCSV = () => {
    if (!data || !data.data || data.data.length === 0) return alert('No data available to export');

    let headers = [];
    let rows = [];

    if (reportType === 'sales') {
      headers = ['Invoice ID', 'Date', 'Customer Name', 'Subtotal (INR)', 'Discount (INR)', 'Tax (INR)', 'Total Amount (INR)', 'Total Profit (INR)'];
      rows = data.data.map((s) => [
        safeId(s._id, 'INV'),
        new Date(s.createdAt).toLocaleDateString(),
        `"${s.customer?.name || 'Walk-in Customer'}"`,
        s.subtotal || 0,
        s.discount || 0,
        s.tax || 0,
        s.totalAmount || 0,
        s.totalProfit || 0,
      ]);
    } else if (reportType === 'purchases') {
      headers = ['PO ID', 'Date', 'Supplier Company', 'Total Amount (INR)'];
      rows = data.data.map((p) => [
        safeId(p._id, 'PO'),
        new Date(p.createdAt).toLocaleDateString(),
        `"${p.supplierId?.company || p.supplierId?.name || 'Supplier Vendor'}"`,
        p.totalAmount || 0,
      ]);
    } else if (reportType === 'inventory') {
      headers = ['Product Name', 'SKU', 'Category', 'Stock Units', 'Purchase Cost (INR)', 'Selling Price (INR)', 'Total Valuation Cost (INR)', 'Status'];
      rows = data.data.map((p) => [
        `"${p.name}"`,
        p.sku,
        `"${p.category}"`,
        p.stock,
        p.purchasePrice,
        p.sellingPrice,
        p.costValue,
        p.status,
      ]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `StockCloud_${reportType}_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Business Reports & Analytics</h1>
          <p className="text-xs text-slate-500 mt-0.5">Export financial sales, purchase costs, and inventory valuation data.</p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-xs shadow-md shadow-red-500/20 hover:scale-105 transition flex items-center space-x-2 shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV Report</span>
        </button>
      </div>

      {/* Report Tabs */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-3">
        <button
          onClick={() => setReportType('sales')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
            reportType === 'sales'
              ? 'bg-red-600 text-white shadow-md shadow-red-500/20'
              : 'text-slate-600 hover:text-red-600 hover:bg-red-50'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Sales & Profitability</span>
        </button>

        <button
          onClick={() => setReportType('purchases')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
            reportType === 'purchases'
              ? 'bg-red-600 text-white shadow-md shadow-red-500/20'
              : 'text-slate-600 hover:text-red-600 hover:bg-red-50'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Purchases & Vendor Costs</span>
        </button>

        <button
          onClick={() => setReportType('inventory')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
            reportType === 'inventory'
              ? 'bg-red-600 text-white shadow-md shadow-red-500/20'
              : 'text-slate-600 hover:text-red-600 hover:bg-red-50'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>Stock Valuation Report</span>
        </button>
      </div>

      {loading ? (
        <Loading />
      ) : (
        <div className="space-y-6">
          {/* Summary Cards */}
          {data?.summary && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {reportType === 'sales' && (
                <>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="text-xs text-slate-500 font-bold uppercase">Total Orders</div>
                    <div className="text-2xl font-black text-slate-900 mt-1">{data.summary.totalOrders || 0}</div>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="text-xs text-slate-500 font-bold uppercase">Total Revenue Generated</div>
                    <div className="text-2xl font-black text-red-600 mt-1">₹{(data.summary.totalRevenue || 0).toLocaleString()}</div>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="text-xs text-slate-500 font-bold uppercase">Net Gross Profit</div>
                    <div className="text-2xl font-black text-emerald-600 mt-1">₹{(data.summary.totalProfit || 0).toLocaleString()}</div>
                  </div>
                </>
              )}

              {reportType === 'purchases' && (
                <>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="text-xs text-slate-500 font-bold uppercase">Total Purchase Orders</div>
                    <div className="text-2xl font-black text-slate-900 mt-1">{data.summary.totalPurchases || 0}</div>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="text-xs text-slate-500 font-bold uppercase">Total Vendor Expenditure</div>
                    <div className="text-2xl font-black text-rose-600 mt-1">₹{(data.summary.totalSpent || 0).toLocaleString()}</div>
                  </div>
                </>
              )}

              {reportType === 'inventory' && (
                <>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="text-xs text-slate-500 font-bold uppercase">Total Catalog Items</div>
                    <div className="text-2xl font-black text-slate-900 mt-1">{data.summary.totalProducts || 0}</div>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="text-xs text-slate-500 font-bold uppercase">Inventory Cost Valuation</div>
                    <div className="text-2xl font-black text-red-600 mt-1">₹{(data.summary.totalValuationCost || 0).toLocaleString()}</div>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="text-xs text-slate-500 font-bold uppercase">Potential Retail Revenue</div>
                    <div className="text-2xl font-black text-emerald-600 mt-1">₹{(data.summary.totalValuationRetail || 0).toLocaleString()}</div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Detailed Preview Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-200 font-bold text-sm text-slate-900 flex items-center justify-between">
              <span>Report Details Preview</span>
              <span className="text-xs text-slate-500">{data?.data?.length || 0} Records</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 font-bold text-slate-500 uppercase">
                    {reportType === 'sales' && (
                      <>
                        <th className="p-3">Invoice</th>
                        <th className="p-3">Customer</th>
                        <th className="p-3">Subtotal</th>
                        <th className="p-3">Discount</th>
                        <th className="p-3">Total Amount</th>
                        <th className="p-3">Net Profit</th>
                      </>
                    )}

                    {reportType === 'purchases' && (
                      <>
                        <th className="p-3">PO Number</th>
                        <th className="p-3">Date</th>
                        <th className="p-3">Supplier</th>
                        <th className="p-3">Total Amount</th>
                      </>
                    )}

                    {reportType === 'inventory' && (
                      <>
                        <th className="p-3">Product Name</th>
                        <th className="p-3">SKU</th>
                        <th className="p-3">Stock Units</th>
                        <th className="p-3">Cost Price</th>
                        <th className="p-3">Total Cost Value</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {(!data?.data || data.data.length === 0) ? (
                    <tr>
                      <td colSpan="6" className="text-center py-8 text-slate-400">
                        No records found for this report.
                      </td>
                    </tr>
                  ) : (
                    data.data.map((row, idx) => (
                      <tr key={row._id || idx} className="hover:bg-red-50/20 text-slate-800">
                        {reportType === 'sales' && (
                          <>
                            <td className="p-3 font-mono font-bold text-slate-900">{safeId(row._id, 'INV')}</td>
                            <td className="p-3 font-bold">{row.customer?.name || 'Customer'}</td>
                            <td className="p-3">₹{(row.subtotal || 0).toLocaleString()}</td>
                            <td className="p-3 text-rose-600">-₹{(row.discount || 0).toLocaleString()}</td>
                            <td className="p-3 font-bold text-slate-900">₹{(row.totalAmount || 0).toLocaleString()}</td>
                            <td className="p-3 font-bold text-emerald-600">+₹{(row.totalProfit || 0).toLocaleString()}</td>
                          </>
                        )}

                        {reportType === 'purchases' && (
                          <>
                            <td className="p-3 font-mono font-bold text-slate-900">{safeId(row._id, 'PO')}</td>
                            <td className="p-3">{row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A'}</td>
                            <td className="p-3 font-bold">{row.supplierId?.company || row.supplierId?.name || 'Vendor'}</td>
                            <td className="p-3 font-bold text-red-600">₹{(row.totalAmount || 0).toLocaleString()}</td>
                          </>
                        )}

                        {reportType === 'inventory' && (
                          <>
                            <td className="p-3 font-bold text-slate-900">{row.name}</td>
                            <td className="p-3 font-mono text-slate-500">{row.sku}</td>
                            <td className="p-3 font-bold">{row.stock} units</td>
                            <td className="p-3">₹{(row.purchasePrice || 0).toLocaleString()}</td>
                            <td className="p-3 font-bold text-red-600">₹{(row.costValue || 0).toLocaleString()}</td>
                          </>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
