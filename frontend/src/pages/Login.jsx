import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Cloud, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate('/app/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoCreds = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
        {/* Logo Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-600 flex items-center justify-center shadow-md shadow-red-500/20">
              <Cloud className="w-7 h-7 text-white" />
            </div>
            <span className="font-black text-2xl text-slate-900 tracking-tight">
              Stock<span className="text-red-600">Cloud</span>
            </span>
          </Link>
          <h2 className="text-xl font-extrabold text-slate-900">Welcome Back</h2>
          <p className="text-xs text-slate-500 mt-1">Sign in to your organization workspace</p>
        </div>

        {/* Demo Quick Login Buttons */}
        <div className="mb-6 p-3 rounded-2xl bg-red-50/60 border border-red-100 text-xs">
          <div className="text-red-700 font-bold mb-2 text-center">⚡ One-Click Demo Accounts:</div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillDemoCreds('admin@abcelectronics.com', 'Password123!')}
              className="py-1.5 px-2 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 transition text-[10px] shadow-sm"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => fillDemoCreds('manager@abcelectronics.com', 'Password123!')}
              className="py-1.5 px-2 rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-700 transition text-[10px] shadow-sm"
            >
              Manager
            </button>
            <button
              type="button"
              onClick={() => fillDemoCreds('staff@abcelectronics.com', 'Password123!')}
              className="py-1.5 px-2 rounded-lg bg-slate-700 text-white font-bold hover:bg-slate-800 transition text-[10px] shadow-sm"
            >
              Staff
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Work Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">Password</label>
              <Link to="/forgot-password" className="text-xs text-red-600 font-semibold hover:underline">
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:bg-white transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-sm shadow-md shadow-red-500/20 hover:scale-[1.01] disabled:opacity-50 transition flex items-center justify-center space-x-2 mt-6"
          >
            <span>{isSubmitting ? 'Signing in...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-500">
          Don't have an organization account?{' '}
          <Link to="/register" className="text-red-600 font-bold hover:underline">
            Register Company
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
