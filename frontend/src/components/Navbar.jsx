import React, { useState, useEffect } from 'react';
import { Menu, Bell, Search, AlertTriangle, User, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Navbar = ({ setMobileOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const fetchLowStockAlerts = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        if (res.data.success && res.data.lowStockAlerts) {
          setAlerts(res.data.lowStockAlerts);
        }
      } catch (error) {
        // silent fail
      }
    };
    fetchLowStockAlerts();
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-4 lg:px-8 flex items-center justify-between shadow-sm">
      {/* Left section: Hamburger & Search */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="relative hidden md:block w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search products, SKUs, sales..."
            onClick={() => navigate('/app/products')}
            className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Right Section: Notifications & User Profile */}
      <div className="flex items-center space-x-4">
        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {alerts.length > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 bg-red-600 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                {alerts.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-slate-200 shadow-xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2 text-red-600 font-bold text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Low Stock Warnings ({alerts.length})</span>
                </div>
                <button
                  onClick={() => navigate('/app/inventory')}
                  className="text-xs text-red-600 font-semibold hover:underline"
                >
                  View Inventory
                </button>
              </div>

              <div className="mt-3 max-h-60 overflow-y-auto space-y-2">
                {alerts.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">
                    🎉 All products are in good stock levels!
                  </p>
                ) : (
                  alerts.map((item) => (
                    <div
                      key={item._id}
                      onClick={() => {
                        setShowNotifications(false);
                        navigate('/app/inventory');
                      }}
                      className="p-2.5 rounded-xl bg-red-50/50 hover:bg-red-100/60 border border-red-100 cursor-pointer transition flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-900">{item.name}</div>
                        <div className="text-[10px] text-slate-500">SKU: {item.sku}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-red-600">
                          {item.stock} left
                        </span>
                        <div className="text-[9px] text-slate-400">Limit: {item.reorderLevel}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Badge */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-3 p-1.5 rounded-xl hover:bg-slate-100 transition"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-red-600 to-rose-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-slate-800 leading-tight">{user?.name}</div>
              <div className="text-[10px] text-red-600 uppercase font-extrabold">{user?.role}</div>
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl p-2 z-50">
              <div className="px-3 py-2 border-b border-slate-100">
                <div className="text-xs font-bold text-slate-900">{user?.name}</div>
                <div className="text-[11px] text-slate-500 truncate">{user?.email}</div>
                <div className="mt-1 flex items-center space-x-1 text-[10px] font-bold text-red-600">
                  <Shield className="w-3 h-3" />
                  <span>{user?.organization?.name}</span>
                </div>
              </div>

              <div className="py-1">
                {user?.role === 'ADMIN' && (
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/app/settings');
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-red-50 hover:text-red-600 rounded-lg flex items-center space-x-2"
                  >
                    <User className="w-4 h-4" />
                    <span>Organization Settings</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-lg flex items-center space-x-2 font-semibold"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
