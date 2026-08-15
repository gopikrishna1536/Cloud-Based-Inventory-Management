import React, { useState, useEffect } from 'react';
import { CreditCard, Check, Zap, Shield, Crown } from 'lucide-react';
import api from '../services/api';
import Loading from '../components/Loading';

const Subscription = () => {
  const [subscription, setSubscription] = useState(null);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  const fetchSubscription = async () => {
    setLoading(true);
    try {
      const res = await api.get('/subscription');
      if (res.data.success) {
        setSubscription(res.data.subscription);
        setUsage(res.data.usage);
      }
    } catch (err) {
      console.error('Failed to load subscription details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  const handleUpgrade = async (plan) => {
    if (window.confirm(`Are you sure you want to upgrade your plan to ${plan}?`)) {
      setUpgrading(true);
      try {
        const res = await api.put('/subscription/upgrade', { plan });
        if (res.data.success) {
          alert(`Successfully updated plan to ${plan}!`);
          fetchSubscription();
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Upgrade failed');
      } finally {
        setUpgrading(false);
      }
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-8 animate-in fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">SaaS Subscription & Billing</h1>
        <p className="text-xs text-slate-500 mt-0.5">Manage your organization subscription plan and feature usage limits.</p>
      </div>

      {/* Current Active Plan Card */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center font-bold">
            <Crown className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-black text-slate-900">{subscription?.plan} PLAN</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-extrabold text-[10px] uppercase">
                {subscription?.status || 'ACTIVE'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Multi-tenant cloud organization license active.</p>
          </div>
        </div>

        {/* Usage Progress */}
        <div className="flex items-center space-x-8 w-full md:w-auto border-t md:border-t-0 border-slate-100 pt-4 md:pt-0">
          <div>
            <div className="text-xs text-slate-500 font-bold uppercase">Products Registered</div>
            <div className="text-lg font-black text-slate-900 mt-0.5">
              {usage?.products?.current} / <span className="text-red-600">{usage?.products?.limit}</span>
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-500 font-bold uppercase">Team Seats</div>
            <div className="text-lg font-black text-slate-900 mt-0.5">
              {usage?.users?.current} / <span className="text-red-600">{usage?.users?.limit}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* FREE */}
        <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Free Plan</div>
            <div className="text-3xl font-black text-slate-900 mt-4">₹0 <span className="text-xs font-normal text-slate-500">/mo</span></div>
            <ul className="mt-6 space-y-2.5 text-xs text-slate-700">
              <li className="flex items-center space-x-2"><Check className="w-4 h-4 text-red-600" /> <span>50 Products limit</span></li>
              <li className="flex items-center space-x-2"><Check className="w-4 h-4 text-red-600" /> <span>2 User seats</span></li>
              <li className="flex items-center space-x-2"><Check className="w-4 h-4 text-red-600" /> <span>Basic Dashboard</span></li>
            </ul>
          </div>
          <button
            onClick={() => handleUpgrade('FREE')}
            disabled={subscription?.plan === 'FREE' || upgrading}
            className="mt-8 w-full py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 disabled:opacity-50 hover:bg-slate-100 transition"
          >
            {subscription?.plan === 'FREE' ? 'Current Active Plan' : 'Downgrade to Free'}
          </button>
        </div>

        {/* PRO */}
        <div className="p-8 rounded-3xl bg-white border-2 border-red-600 shadow-xl flex flex-col justify-between relative">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-red-600 text-white font-extrabold text-[10px] uppercase tracking-widest">
            Recommended
          </div>
          <div>
            <div className="text-xs font-bold text-red-600 uppercase tracking-widest">Pro Plan</div>
            <div className="text-3xl font-black text-slate-900 mt-4">₹1,999 <span className="text-xs font-normal text-slate-500">/mo</span></div>
            <ul className="mt-6 space-y-2.5 text-xs text-slate-700">
              <li className="flex items-center space-x-2"><Check className="w-4 h-4 text-red-600" /> <span>500 Products limit</span></li>
              <li className="flex items-center space-x-2"><Check className="w-4 h-4 text-red-600" /> <span>10 User seats</span></li>
              <li className="flex items-center space-x-2"><Check className="w-4 h-4 text-red-600" /> <span>Recharts Visual Analytics</span></li>
              <li className="flex items-center space-x-2"><Check className="w-4 h-4 text-red-600" /> <span>CSV Export & Profit Audit</span></li>
            </ul>
          </div>
          <button
            onClick={() => handleUpgrade('PRO')}
            disabled={subscription?.plan === 'PRO' || upgrading}
            className="mt-8 w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-xs font-bold text-white shadow-md shadow-red-500/20 disabled:opacity-50 hover:scale-105 transition"
          >
            {subscription?.plan === 'PRO' ? 'Current Active Plan' : 'Upgrade to Pro'}
          </button>
        </div>

        {/* ENTERPRISE */}
        <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold text-purple-600 uppercase tracking-widest">Enterprise Plan</div>
            <div className="text-3xl font-black text-slate-900 mt-4">₹4,999 <span className="text-xs font-normal text-slate-500">/mo</span></div>
            <ul className="mt-6 space-y-2.5 text-xs text-slate-700">
              <li className="flex items-center space-x-2"><Check className="w-4 h-4 text-purple-600" /> <span>Unlimited Products</span></li>
              <li className="flex items-center space-x-2"><Check className="w-4 h-4 text-purple-600" /> <span>Unlimited Team Seats</span></li>
              <li className="flex items-center space-x-2"><Check className="w-4 h-4 text-purple-600" /> <span>Custom Currencies</span></li>
            </ul>
          </div>
          <button
            onClick={() => handleUpgrade('ENTERPRISE')}
            disabled={subscription?.plan === 'ENTERPRISE' || upgrading}
            className="mt-8 w-full py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 disabled:opacity-50 hover:bg-slate-100 transition"
          >
            {subscription?.plan === 'ENTERPRISE' ? 'Current Active Plan' : 'Upgrade to Enterprise'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
