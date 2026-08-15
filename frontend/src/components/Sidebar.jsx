import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Tags,
  Boxes,
  Users,
  ShoppingCart,
  TrendingUp,
  FileBarChart,
  UserCheck,
  CreditCard,
  Settings,
  LogOut,
  X,
  Cloud,
  Barcode,
  History,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'MANAGER', 'STAFF'] },
    { label: 'Barcode Scanner', path: '/app/scan', icon: Barcode, roles: ['ADMIN', 'MANAGER', 'STAFF'] },
    { label: 'Products', path: '/app/products', icon: Package, roles: ['ADMIN', 'MANAGER', 'STAFF'] },
    { label: 'Categories', path: '/app/categories', icon: Tags, roles: ['ADMIN', 'MANAGER'] },
    { label: 'Inventory', path: '/app/inventory', icon: Boxes, roles: ['ADMIN', 'MANAGER', 'STAFF'] },
    { label: 'Stock Audit Trail', path: '/app/inventory/transactions', icon: History, roles: ['ADMIN', 'MANAGER', 'STAFF'] },
    { label: 'Suppliers', path: '/app/suppliers', icon: Users, roles: ['ADMIN', 'MANAGER'] },
    { label: 'Purchases', path: '/app/purchases', icon: ShoppingCart, roles: ['ADMIN', 'MANAGER'] },
    { label: 'Sales', path: '/app/sales', icon: TrendingUp, roles: ['ADMIN', 'MANAGER', 'STAFF'] },
    { label: 'Reports', path: '/app/reports', icon: FileBarChart, roles: ['ADMIN', 'MANAGER'] },
    { label: 'Users & Team', path: '/app/users', icon: UserCheck, roles: ['ADMIN'] },
    { label: 'Subscription', path: '/app/subscription', icon: CreditCard, roles: ['ADMIN'] },
    { label: 'Settings', path: '/app/settings', icon: Settings, roles: ['ADMIN'] },
  ];

  const userRole = user?.role || 'STAFF';
  const filteredNavItems = navItems.filter((item) => item.roles.includes(userRole));

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-64 bg-white border-r border-slate-200 shadow-sm transition-transform duration-300 flex flex-col justify-between ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Logo Header */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-rose-600 flex items-center justify-center shadow-md shadow-red-500/20">
                <Cloud className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-lg text-slate-900 tracking-wide">
                  Stock<span className="text-red-600">Cloud</span>
                </span>
                <span className="block text-[10px] text-red-600 font-semibold tracking-wider uppercase">
                  SaaS Inventory
                </span>
              </div>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Org Badge */}
          <div className="px-4 py-3 border-b border-slate-100 bg-red-50/50">
            <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Organization</div>
            <div className="text-sm font-bold text-slate-900 truncate mt-0.5">
              {user?.organization?.name || 'StockCloud Org'}
            </div>
            <div className="inline-block px-2 py-0.5 mt-1 text-[10px] font-bold tracking-wide rounded-full bg-red-100 text-red-700 border border-red-200 uppercase">
              {user?.organization?.plan || 'FREE'} PLAN
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-250px)]">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                      isActive
                        ? 'bg-red-600 text-white font-bold shadow-md shadow-red-500/20'
                        : 'text-slate-600 hover:text-red-600 hover:bg-red-50'
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer User Info & Logout */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-red-600 text-white font-bold flex items-center justify-center shrink-0 shadow-sm">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="truncate">
                <div className="text-sm font-bold text-slate-900 truncate">{user?.name}</div>
                <div className="text-xs text-slate-500 flex items-center space-x-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="uppercase text-[10px] font-bold text-slate-500">{user?.role}</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
