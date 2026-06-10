import React, { useState } from 'react';
import api from '../utils/api';
import { Mail, Lock, User, LogIn, UserPlus, AlertCircle } from 'lucide-react';

const Auth = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin ? { email, password } : { username, email, password };
      
      const { data } = await api.post(endpoint, payload);
      onAuthSuccess(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto my-8 px-4">
      <div className="glass-panel rounded-2xl shadow-xl p-8 border border-slate-800">
        
        {/* Tab Toggle */}
        <div className="flex bg-slate-900/60 p-1 rounded-xl mb-8 border border-slate-800">
          <button
            onClick={() => { setIsLogin(true); setError(''); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              isLogin ? 'bg-brand-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LogIn size={16} />
            Login
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(''); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              !isLogin ? 'bg-brand-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus size={16} />
            Register
          </button>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center mb-2">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="text-sm text-slate-400 text-center mb-6">
          {isLogin ? 'Log in to join the social stream' : 'Sign up to connect and share moments'}
        </p>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-300 rounded-xl p-3 text-sm flex items-start gap-2 mb-6 animate-pulse-slow">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Username
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. janesmith"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-800 focus:border-brand-500 rounded-xl pl-10 pr-4 py-3 text-sm outline-none text-slate-100 placeholder-slate-500 transition-all focus:ring-2 focus:ring-brand-500/10"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="email"
                required
                placeholder="e.g. name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900/60 border border-slate-800 focus:border-brand-500 rounded-xl pl-10 pr-4 py-3 text-sm outline-none text-slate-100 placeholder-slate-500 transition-all focus:ring-2 focus:ring-brand-500/10"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900/60 border border-slate-800 focus:border-brand-500 rounded-xl pl-10 pr-4 py-3 text-sm outline-none text-slate-100 placeholder-slate-500 transition-all focus:ring-2 focus:ring-brand-500/10"
              />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-800 focus:border-brand-500 rounded-xl pl-10 pr-4 py-3 text-sm outline-none text-slate-100 placeholder-slate-500 transition-all focus:ring-2 focus:ring-brand-500/10"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-500 active:scale-95 disabled:opacity-50 text-white rounded-xl py-3 text-sm font-semibold shadow-lg hover:shadow-brand-500/25 transition-all flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                {isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
                {isLogin ? 'Login to Account' : 'Register Account'}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Auth;
