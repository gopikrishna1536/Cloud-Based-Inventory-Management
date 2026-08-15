import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  RotateCcw,
  SlidersHorizontal,
  RefreshCw,
} from 'lucide-react';
import api from '../services/api';
import Loading from '../components/Loading';

const InventoryTransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  useEffect(() => {
    fetchTransactions();
  }, [typeFilter]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const typeParam = typeFilter !== 'ALL' ? `?type=${typeFilter}` : '';
      const res = await api.get(`/inventory/transactions${typeParam}`);
      if (res.data.success) {
        setTransactions(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = transactions.filter((t) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    const pName = t.productId?.name || t.name || '';
    const pSku = t.productId?.sku || t.sku || '';
    const pBarcode = t.productId?.barcode || t.barcode || '';
    const uName = t.createdBy?.name || '';
    return (
      pName.toLowerCase().includes(s) ||
      pSku.toLowerCase().includes(s) ||
      pBarcode.toLowerCase().includes(s) ||
      uName.toLowerCase().includes(s)
    );
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-red-600 text-white shadow-md shadow-red-500/20">
            <History className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Stock Movement Audit Trail
            </h1>
            <p className="text-sm text-slate-500">
              Complete transaction log of all Purchases, Sales, Returns, and Adjustments
            </p>
          </div>
        </div>

        <button
          onClick={fetchTransactions}
          className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Audit Logs</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Filter by Product Name, SKU, Barcode, or User..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>

        {/* Type Filter Buttons */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0">
          {['ALL', 'PURCHASE', 'SALE', 'RETURN', 'ADJUSTMENT'].map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all ${
                typeFilter === type
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-12">
            <Loading message="Loading inventory audit logs..." />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <History className="w-10 h-10 mx-auto text-slate-300" />
            <div className="font-bold text-slate-600">No Inventory Transactions Found</div>
            <p className="text-xs text-slate-400">
              No movement logs matching your search criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Product</th>
                  <th className="py-3.5 px-4">Barcode</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4 text-center">Quantity</th>
                  <th className="py-3.5 px-4 text-center">Stock Change</th>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Notes / Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filtered.map((tx) => {
                  const pName = tx.productId?.name || 'Product';
                  const pSku = tx.productId?.sku || '';
                  const pBarcode = tx.productId?.barcode || '-';
                  const uName = tx.createdBy?.name || 'System User';

                  const dateFormatted = new Date(tx.createdAt || Date.now()).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr key={tx._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                        {dateFormatted}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{pName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">SKU: {pSku}</div>
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-slate-700">{pBarcode}</td>

                      <td className="py-3 px-4">
                        {tx.type === 'PURCHASE' && (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                            <ArrowDownLeft className="w-3 h-3" />
                            <span>PURCHASE</span>
                          </span>
                        )}
                        {tx.type === 'SALE' && (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 text-red-800">
                            <ArrowUpRight className="w-3 h-3" />
                            <span>SALE</span>
                          </span>
                        )}
                        {tx.type === 'RETURN' && (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800">
                            <RotateCcw className="w-3 h-3" />
                            <span>RETURN</span>
                          </span>
                        )}
                        {tx.type === 'ADJUSTMENT' && (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-800">
                            <SlidersHorizontal className="w-3 h-3" />
                            <span>ADJUSTMENT</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center font-extrabold text-slate-900 text-sm">
                        {tx.quantity > 0 ? `+${tx.quantity}` : tx.quantity}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className="font-mono text-slate-600 font-medium">
                          {tx.previousStock} → <strong className="text-slate-900 font-extrabold">{tx.newStock}</strong>
                        </span>
                      </td>

                      <td className="py-3 px-4 font-semibold text-slate-700">{uName}</td>

                      <td className="py-3 px-4 text-slate-500 italic max-w-xs truncate">
                        {tx.reason || (tx.referenceId ? `Ref: ${tx.referenceId}` : 'Standard transaction')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryTransactionsPage;
