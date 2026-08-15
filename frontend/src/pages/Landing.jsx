import React from 'react';
import { Link } from 'react-router-dom';
import {
  Cloud,
  Shield,
  Zap,
  Layers,
  BarChart3,
  AlertTriangle,
  ArrowRight,
  Check,
  Building2,
  Users,
  Box,
  TrendingUp,
} from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-red-600 selection:text-white">
      {/* 1. Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 lg:px-16 h-20 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-600 flex items-center justify-center shadow-md shadow-red-500/20">
            <Cloud className="w-7 h-7 text-white" />
          </div>
          <span className="font-black text-2xl tracking-tight text-slate-900">
            Stock<span className="text-red-600">Cloud</span>
          </span>
        </div>

        <div className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-600">
          <a href="#features" className="hover:text-red-600 transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-red-600 transition-colors">How It Works</a>
          <a href="#pricing" className="hover:text-red-600 transition-colors">Pricing</a>
        </div>

        <div className="flex items-center space-x-4">
          <Link
            to="/login"
            className="px-4 py-2 text-sm font-bold text-slate-700 hover:text-red-600 transition-colors"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-extrabold text-sm shadow-md shadow-red-500/20 hover:scale-105 transition-all"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="pt-36 pb-20 px-6 lg:px-16 max-w-7xl mx-auto text-center relative">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-red-100/80 border border-red-200 text-red-700 text-xs font-bold uppercase tracking-wider mb-8">
          <Zap className="w-4 h-4" />
          <span>Next-Generation SaaS Inventory Platform</span>
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight leading-tight max-w-5xl mx-auto">
          Smart Inventory Management for <span className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 bg-clip-text text-transparent">Modern Businesses</span>
        </h1>

        <p className="mt-6 text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-normal">
          Manage products, inventory, suppliers, purchases and sales from one powerful cloud-based platform with role-based access control.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/register"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-extrabold text-base shadow-lg shadow-red-500/30 hover:scale-105 transition-all flex items-center justify-center space-x-2"
          >
            <span>Start Free Trial</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white text-slate-800 border border-slate-200 font-bold text-base hover:bg-slate-100 shadow-sm transition-all"
          >
            Live Demo Access
          </Link>
        </div>

        {/* Hero Dashboard Preview */}
        <div className="mt-16 relative rounded-3xl bg-white border border-slate-200 p-4 shadow-xl overflow-hidden max-w-5xl mx-auto">
          <div className="flex items-center space-x-2 pb-3 mb-3 border-b border-slate-100 text-xs text-slate-400">
            <span className="w-3 h-3 rounded-full bg-red-500"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            <span className="ml-4 font-mono text-slate-400">app.stockcloud.io/dashboard</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="p-4 rounded-xl bg-slate-50 text-left border border-slate-200">
              <div className="text-[11px] text-slate-500 uppercase font-bold">Total Products</div>
              <div className="text-2xl font-black text-slate-900 mt-1">250</div>
            </div>
            <div className="p-4 rounded-xl bg-red-50 text-left border border-red-100">
              <div className="text-[11px] text-red-700 uppercase font-bold">Inventory Value</div>
              <div className="text-2xl font-black text-red-600 mt-1">₹12,50,000</div>
            </div>
            <div className="p-4 rounded-xl bg-amber-50 text-left border border-amber-100">
              <div className="text-[11px] text-amber-700 uppercase font-bold">Low Stock</div>
              <div className="text-2xl font-black text-amber-600 mt-1">18 Items</div>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50 text-left border border-emerald-100">
              <div className="text-[11px] text-emerald-700 uppercase font-bold">Today's Sales</div>
              <div className="text-2xl font-black text-emerald-600 mt-1">₹45,200</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Features Section */}
      <section id="features" className="py-24 px-6 lg:px-16 max-w-7xl mx-auto border-t border-slate-200">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">Everything Your Organization Needs</h2>
          <p className="mt-4 text-slate-600 text-base">
            Built from the ground up for multi-tenant scalability, real-time tracking, and automated stock alerts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-white border border-slate-200 hover:border-red-500 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-6">
              <Cloud className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Cloud-Based Architecture</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Access your inventory anywhere, anytime on any web browser with high availability backed by MongoDB Atlas cloud database.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-slate-200 hover:border-red-500 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-6">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Multi-Tenant SaaS</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Strict organization tenant isolation using strict backend context scoping. Organization data is never leaked.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-slate-200 hover:border-red-500 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-6">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Role-Based Access Control</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Granular permissions for Admin, Manager, and Staff roles ensuring tight security and operational compliance.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Pricing Section */}
      <section id="pricing" className="py-24 px-6 lg:px-16 max-w-7xl mx-auto border-t border-slate-200">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">Flexible SaaS Subscription Plans</h2>
          <p className="mt-4 text-slate-600 text-base">Select the plan tailored to your business scale.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Free Plan</div>
              <div className="text-4xl font-black text-slate-900 mt-4">₹0 <span className="text-sm font-normal text-slate-500">/mo</span></div>

              <ul className="mt-8 space-y-3 text-sm text-slate-700">
                <li className="flex items-center space-x-2"><Check className="w-4 h-4 text-red-600" /> <span>Up to 50 Products</span></li>
                <li className="flex items-center space-x-2"><Check className="w-4 h-4 text-red-600" /> <span>2 Team Users</span></li>
                <li className="flex items-center space-x-2"><Check className="w-4 h-4 text-red-600" /> <span>Basic Dashboard</span></li>
              </ul>
            </div>

            <Link
              to="/register"
              className="mt-8 w-full py-3 rounded-xl border border-slate-200 text-center font-bold text-slate-800 hover:bg-slate-100 transition"
            >
              Get Started Free
            </Link>
          </div>

          <div className="p-8 rounded-3xl bg-white border-2 border-red-600 shadow-xl flex flex-col justify-between relative">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-red-600 text-white font-extrabold text-xs uppercase tracking-widest">
              Most Popular
            </div>

            <div>
              <div className="text-xs font-bold text-red-600 uppercase tracking-widest">Pro Plan</div>
              <div className="text-4xl font-black text-slate-900 mt-4">₹1,999 <span className="text-sm font-normal text-slate-500">/mo</span></div>

              <ul className="mt-8 space-y-3 text-sm text-slate-700">
                <li className="flex items-center space-x-2"><Check className="w-4 h-4 text-red-600" /> <span>Up to 500 Products</span></li>
                <li className="flex items-center space-x-2"><Check className="w-4 h-4 text-red-600" /> <span>10 Team Users</span></li>
                <li className="flex items-center space-x-2"><Check className="w-4 h-4 text-red-600" /> <span>Advanced Recharts Analytics</span></li>
                <li className="flex items-center space-x-2"><Check className="w-4 h-4 text-red-600" /> <span>CSV Export & Profit Tracking</span></li>
              </ul>
            </div>

            <Link
              to="/register"
              className="mt-8 w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-center font-bold text-white shadow-md shadow-red-500/20 hover:scale-[1.02] transition"
            >
              Start Pro Plan
            </Link>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-purple-600 uppercase tracking-widest">Enterprise Plan</div>
              <div className="text-4xl font-black text-slate-900 mt-4">₹4,999 <span className="text-sm font-normal text-slate-500">/mo</span></div>

              <ul className="mt-8 space-y-3 text-sm text-slate-700">
                <li className="flex items-center space-x-2"><Check className="w-4 h-4 text-purple-600" /> <span>Unlimited Products</span></li>
                <li className="flex items-center space-x-2"><Check className="w-4 h-4 text-purple-600" /> <span>Unlimited Users</span></li>
                <li className="flex items-center space-x-2"><Check className="w-4 h-4 text-purple-600" /> <span>Custom Currency & Timezone</span></li>
              </ul>
            </div>

            <Link
              to="/register"
              className="mt-8 w-full py-3 rounded-xl border border-slate-200 text-center font-bold text-slate-800 hover:bg-slate-100 transition"
            >
              Contact Enterprise
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Footer */}
      <footer className="border-t border-slate-200 py-12 px-6 lg:px-16 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
        <div className="flex items-center space-x-3 mb-4 md:mb-0">
          <Cloud className="w-5 h-5 text-red-600" />
          <span className="font-bold text-slate-700">StockCloud SaaS Platform © 2026</span>
        </div>
        <div className="flex items-center space-x-6">
          <a href="#features" className="hover:text-red-600">Features</a>
          <a href="#pricing" className="hover:text-red-600">Pricing</a>
          <span className="text-slate-300">|</span>
          <span>B.Tech CS Academic Project</span>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
