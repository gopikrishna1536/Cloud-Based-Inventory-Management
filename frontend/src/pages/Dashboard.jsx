import React, { useState, useEffect } from 'react';
import {
  Package,
  Boxes,
  AlertTriangle,
  Users,
  TrendingUp,
  ShoppingCart,
  DollarSign,
  PieChart as PieIcon,
  ArrowUpRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import StatCard from '../components/StatCard';
import Loading from '../components/Loading';
import api from '../services/api';

const COLORS = ['#dc2626', '#10b981', '#f59e0b', '#8b5cf6', '#0284c7', '#ec4899'];

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (error) {
        console.error('Failed to load dashboard stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <Loading />;

  const { stats, charts, lowStockAlerts, recentSales } = data || {};

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Analytics Dashboard</h1>
        <p className="text-xs text-slate-500 mt-1">Real-time overview of your cloud inventory, sales, and purchases.</p>
      </div>

      {/* Low Stock Warning Banner */}
      {lowStockAlerts && lowStockAlerts.length > 0 && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-red-100 text-red-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold">Attention Needed: Low Stock Warning</div>
              <div className="text-xs text-red-700/80">
                {lowStockAlerts.length} product(s) have reached or fallen below their minimum reorder levels.
              </div>
            </div>
          </div>
          <a
            href="/app/inventory"
            className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 shadow-sm transition"
          >
            Review Stock
          </a>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Products"
          value={stats?.totalProducts || 0}
          icon={Package}
          color="red"
          subtitle="Unique items registered"
        />
        <StatCard
          title="Inventory Value"
          value={formatCurrency(stats?.totalInventoryValue)}
          icon={Boxes}
          color="emerald"
          subtitle="Current total cost valuation"
        />
        <StatCard
          title="Low Stock Alert"
          value={`${stats?.lowStockCount || 0} Items`}
          icon={AlertTriangle}
          color="amber"
          subtitle={`${stats?.outOfStockCount || 0} completely out of stock`}
        />
        <StatCard
          title="Suppliers"
          value={stats?.totalSuppliers || 0}
          icon={Users}
          color="purple"
          subtitle="Active vendors & partners"
        />
        <StatCard
          title="Today's Sales"
          value={formatCurrency(stats?.todaysSales)}
          icon={TrendingUp}
          color="emerald"
          subtitle="Revenue recorded today"
        />
        <StatCard
          title="Monthly Sales"
          value={formatCurrency(stats?.monthlySales)}
          icon={DollarSign}
          color="red"
          subtitle="Revenue for current month"
        />
        <StatCard
          title="Total Purchases"
          value={formatCurrency(stats?.totalPurchases)}
          icon={ShoppingCart}
          color="rose"
          subtitle="Spent on supplier inventory"
        />
        <StatCard
          title="Health Score"
          value="98.5%"
          icon={PieIcon}
          color="red"
          subtitle="Tenant operational efficiency"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales vs Purchase Trend */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Sales & Purchases Comparison</h3>
              <p className="text-xs text-slate-500">Monthly financial performance overview</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts?.monthlyComparison || []}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#dc2626" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorPurchases" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="sales" name="Sales (₹)" stroke="#dc2626" fillOpacity={1} fill="url(#colorSales)" />
                <Area type="monotone" dataKey="purchases" name="Purchases (₹)" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorPurchases)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Inventory Valuation by Category */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-1">Inventory by Category</h3>
          <p className="text-xs text-slate-500 mb-4">Stock valuation breakdown</p>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts?.categoryBreakdown || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(charts?.categoryBreakdown || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => formatCurrency(val)}
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#64748b' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Selling Products */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-1">Top Selling Products</h3>
          <p className="text-xs text-slate-500 mb-6">Highest quantity items sold</p>
          <div className="space-y-4">
            {(charts?.topSellingProducts || []).length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No sales recorded yet.</p>
            ) : (
              (charts?.topSellingProducts || []).map((prod, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-xl bg-red-100 text-red-600 font-bold flex items-center justify-center text-xs">
                      #{idx + 1}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">{prod.name}</div>
                      <div className="text-[10px] text-slate-500">SKU: {prod.sku}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-extrabold text-red-600">{prod.quantity} units</div>
                    <div className="text-[10px] text-slate-500">{formatCurrency(prod.revenue)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Transactions Table */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-1">Recent Sales Transactions</h3>
          <p className="text-xs text-slate-500 mb-6">Latest customer billing orders</p>
          <div className="space-y-3">
            {(recentSales || []).slice(0, 5).map((sale) => (
              <div key={sale._id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Sale: {sale.customer?.name}</div>
                    <div className="text-[10px] text-slate-500">{new Date(sale.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-emerald-600">+{formatCurrency(sale.totalAmount)}</div>
                  <div className="text-[10px] text-emerald-700 font-semibold">Profit: +{formatCurrency(sale.totalProfit)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
