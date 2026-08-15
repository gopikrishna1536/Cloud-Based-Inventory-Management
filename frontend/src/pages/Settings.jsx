import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Building2, Globe, Clock, ShieldCheck, AlertCircle } from 'lucide-react';
import api from '../services/api';
import Loading from '../components/Loading';

const Settings = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/settings');
      if (res.data.success && res.data.data) {
        setFormData({
          name: res.data.data.name || '',
          email: res.data.data.email || '',
          phone: res.data.data.phone || '',
          address: res.data.data.address || '',
          currency: res.data.data.currency || 'INR',
          timezone: res.data.data.timezone || 'Asia/Kolkata',
        });
      }
    } catch (err) {
      console.error('Failed to load settings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const res = await api.put('/settings', formData);
      if (res.data.success) {
        setMessage('Organization settings saved successfully!');
      }
    } catch (err) {
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Organization Profile & Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">Configure your SaaS business profile, contact details, currency, and timezone.</p>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-xs">
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Building2 className="w-4 h-4 text-red-600" />
            <span>Company General Profile</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Company / Organization Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Official Contact Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Office Street Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="104 Tech Park, Bengaluru"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Globe className="w-4 h-4 text-red-600" />
            <span>Localization & Currency Format</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Default Currency Symbol</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none"
              >
                <option value="INR">Indian Rupee (₹ INR)</option>
                <option value="USD">US Dollar ($ USD)</option>
                <option value="EUR">Euro (€ EUR)</option>
                <option value="GBP">British Pound (£ GBP)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Timezone</label>
              <select
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none"
              >
                <option value="Asia/Kolkata">Asia/Kolkata (IST +5:30)</option>
                <option value="UTC">Coordinated Universal Time (UTC)</option>
                <option value="America/New_York">America/New_York (EST)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-md shadow-red-500/20 hover:scale-105 disabled:opacity-50 transition flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Settings...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
