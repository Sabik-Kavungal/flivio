import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft } from 'lucide-react';
import { adminService, DEMO_ADMIN_CREDENTIALS } from '../../services/adminService';
import { useStore } from '../../store/useStore';

export const AdminLoginPage: React.FC = () => {
  const { setAdminSession, pushToast } = useStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const session = adminService.login(email, password);
      setAdminSession(session);
      pushToast({ title: 'Signed in to FLIVIO Admin', type: 'success' });
      navigate('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.');
    }
  };

  const handleAutoFill = () => {
    setEmail(DEMO_ADMIN_CREDENTIALS.email);
    setPassword(DEMO_ADMIN_CREDENTIALS.password);
  };

  return (
    <div className="min-h-screen bg-[#F7F6F2] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white border border-[#E5E1D8] p-8">
        <div className="flex items-center justify-between mb-6">
          <span className="font-display text-xl font-bold tracking-[0.14em] text-[#1E2022]">
            FLIVIO
          </span>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-[#5C5E64] hover:text-[#1E2022]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Storefront</span>
          </Link>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#1B2A4A]">
          <Lock className="w-3.5 h-3.5" />
          <span>Admin Console</span>
        </div>
        <h1 className="mt-1 font-display text-2xl font-semibold text-[#1E2022]">
          Store Management Sign In
        </h1>
        <p className="mt-1.5 text-xs text-[#5C5E64] leading-relaxed">
          Frontend demonstration guard only. Not intended as production server authentication.
        </p>

        <div className="mt-4 p-3.5 bg-[#F7F6F2] border border-[#E5E1D8] text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[#1E2022]">Demo Admin Credentials</span>
            <button
              type="button"
              onClick={handleAutoFill}
              className="px-2.5 py-1 bg-white border border-[#E5E1D8] hover:border-[#1B2A4A] text-[11px] font-semibold text-[#1E2022]"
            >
              Auto-fill
            </button>
          </div>
          <p className="font-mono text-[11px] text-[#5C5E64]">
            Email: {DEMO_ADMIN_CREDENTIALS.email}
          </p>
          <p className="font-mono text-[11px] text-[#5C5E64]">
            Password: {DEMO_ADMIN_CREDENTIALS.password}
          </p>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-xs text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#1E2022] mb-1.5">
              Admin Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@flivio.store"
              className="w-full px-3.5 py-2.5 text-sm border border-[#E5E1D8] focus:border-[#1B2A4A] outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#1E2022] mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 text-sm border border-[#E5E1D8] focus:border-[#1B2A4A] outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3.5 bg-[#1E2022] hover:bg-[#1B2A4A] text-white text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            Enter Admin Dashboard
          </button>
        </form>
      </div>
    </div>
  );
};
