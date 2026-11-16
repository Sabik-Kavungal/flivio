import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Eye, EyeOff, Lock, Mail, User, Phone, Loader2, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { customerService } from '../services/customerService';
import { useStore } from '../store/useStore';

function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: '', color: 'bg-[#E5E1D8]' };
  let score = 0;
  if (pw.length >= 6) score += 1;
  if (pw.length >= 8) score += 1;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score += 1;
  if (/[0-9!@#$%^&*]/.test(pw)) score += 1;

  if (score <= 1) return { score: 1, label: 'Weak — use 6+ characters', color: 'bg-red-500' };
  if (score === 2) return { score: 2, label: 'Fair', color: 'bg-amber-500' };
  if (score === 3) return { score: 3, label: 'Good', color: 'bg-[#1B2A4A]' };
  return { score: 4, label: 'Strong password', color: 'bg-emerald-600' };
}

const AuthModeTabs: React.FC<{ active: 'login' | 'register' }> = ({ active }) => (
  <div className="grid grid-cols-2 bg-[#F7F6F2] p-1 border border-[#E5E1D8] mb-6">
    <Link
      to="/login"
      className={`py-2 text-center text-xs font-semibold uppercase tracking-wider transition-all ${
        active === 'login'
          ? 'bg-white text-[#1E2022] shadow-xs border border-[#E5E1D8]'
          : 'text-[#5C5E64] hover:text-[#1E2022] border border-transparent'
      }`}
    >
      Sign In
    </Link>
    <Link
      to="/register"
      className={`py-2 text-center text-xs font-semibold uppercase tracking-wider transition-all ${
        active === 'register'
          ? 'bg-white text-[#1E2022] shadow-xs border border-[#E5E1D8]'
          : 'text-[#5C5E64] hover:text-[#1E2022] border border-transparent'
      }`}
    >
      Create Account
    </Link>
  </div>
);

export const LoginPage: React.FC = () => {
  const setCurrentCustomer = useStore((s) => s.setCurrentCustomer);
  const pushToast = useStore((s) => s.pushToast);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError('');
    setIsSubmitting(true);

    requestAnimationFrame(() => {
      try {
        const cust = customerService.login(email, password);
        setCurrentCustomer(cust);
        pushToast({ title: `Welcome back, ${cust.name}`, type: 'success' });
        navigate('/account');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to sign in.');
        setIsSubmitting(false);
      }
    });
  };

  const fillDemo = () => {
    setError('');
    setEmail('arjun@flivio.store');
    setPassword('Flivio@2026');
  };

  return (
    <div className="bg-[#F7F6F2] min-h-[78vh] py-10 sm:py-16 px-4 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md bg-white border border-[#E5E1D8] p-6 sm:p-8 shadow-[0_14px_40px_-16px_rgba(27,42,74,0.12)]"
      >
        <div className="text-center mb-6">
          <p className="font-display text-lg font-bold tracking-[0.2em] text-[#1E2022]">
            FLIVIO
          </p>
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1B2A4A]">
            Member Access
          </p>
          <h1 className="mt-1.5 font-display text-2xl sm:text-3xl font-semibold text-[#1E2022]">
            Welcome Back
          </h1>
          <p className="mt-1 text-xs text-[#5C5E64]">
            Access saved delivery addresses, wishlist picks, and order receipts.
          </p>
        </div>

        <AuthModeTabs active="login" />

        <div className="p-3 bg-[#F7F6F2] border border-[#E5E1D8] text-xs text-[#5C5E64] flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="font-semibold text-[#1E2022]">Demo Customer</p>
            <p className="font-mono text-[11px] break-all">arjun@flivio.store / Flivio@2026</p>
          </div>
          <button
            type="button"
            onClick={fillDemo}
            className="px-3 py-1.5 border border-[#E5E1D8] bg-white text-[11px] font-semibold text-[#1E2022] hover:border-[#1B2A4A] hover:text-[#1B2A4A] shrink-0 transition-colors active:scale-95"
          >
            Auto-fill
          </button>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
              className="mt-4 p-3 border border-red-200 bg-red-50/80 text-xs text-red-700 flex items-start gap-2"
              role="alert"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#1E2022] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#86888E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 text-base sm:text-sm border border-[#E5E1D8] focus:border-[#1B2A4A] focus:ring-1 focus:ring-[#1B2A4A]/20 outline-none transition-all bg-white"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-[#1E2022]">Password</label>
              <Link
                to="/forgot-password"
                className="text-xs text-[#5C5E64] hover:text-[#1B2A4A] transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#86888E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 text-base sm:text-sm border border-[#E5E1D8] focus:border-[#1B2A4A] focus:ring-1 focus:ring-[#1B2A4A]/20 outline-none transition-all bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#5C5E64] hover:text-[#1B2A4A] transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-[#1E2022] hover:bg-[#1B2A4A] disabled:opacity-65 text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors active:scale-[0.98]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export const RegisterPage: React.FC = () => {
  const setCurrentCustomer = useStore((s) => s.setCurrentCustomer);
  const pushToast = useStore((s) => s.pushToast);
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const strength = getPasswordStrength(password);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError('');

    if (name.trim().length < 2) {
      setError('Please enter your full name.');
      return;
    }
    if (!/^[0-9+\-\s]{10,15}$/.test(mobile.trim())) {
      setError('Please enter a valid 10–15 digit mobile number.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    requestAnimationFrame(() => {
      try {
        const cust = customerService.register({ name, email, mobile, password });
        setCurrentCustomer(cust);
        pushToast({
          title: 'Account created',
          description: `Welcome to FLIVIO, ${cust.name}`,
          type: 'success',
        });
        navigate('/account');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to register.');
        setIsSubmitting(false);
      }
    });
  };

  return (
    <div className="bg-[#F7F6F2] min-h-[78vh] py-10 sm:py-16 px-4 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md bg-white border border-[#E5E1D8] p-6 sm:p-8 shadow-[0_14px_40px_-16px_rgba(27,42,74,0.12)]"
      >
        <div className="text-center mb-6">
          <p className="font-display text-lg font-bold tracking-[0.2em] text-[#1E2022]">
            FLIVIO
          </p>
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1B2A4A]">
            Join FLIVIO
          </p>
          <h1 className="mt-1.5 font-display text-2xl sm:text-3xl font-semibold text-[#1E2022]">
            Create Account
          </h1>
          <p className="mt-1 text-xs text-[#5C5E64]">
            Save your delivery addresses and check out in seconds.
          </p>
        </div>

        <AuthModeTabs active="register" />

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
              className="mb-4 p-3 border border-red-200 bg-red-50/80 text-xs text-red-700 flex items-start gap-2"
              role="alert"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#1E2022] mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#86888E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full pl-10 pr-3.5 py-2.5 text-base sm:text-sm border border-[#E5E1D8] focus:border-[#1B2A4A] focus:ring-1 focus:ring-[#1B2A4A]/20 outline-none transition-all bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#1E2022] mb-1.5">
              Mobile Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-[#86888E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="tel"
                required
                autoComplete="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="9876543210"
                className="w-full pl-10 pr-3.5 py-2.5 text-base sm:text-sm border border-[#E5E1D8] focus:border-[#1B2A4A] focus:ring-1 focus:ring-[#1B2A4A]/20 outline-none transition-all bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#1E2022] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#86888E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 text-base sm:text-sm border border-[#E5E1D8] focus:border-[#1B2A4A] focus:ring-1 focus:ring-[#1B2A4A]/20 outline-none transition-all bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#1E2022] mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#86888E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full pl-10 pr-10 py-2.5 text-base sm:text-sm border border-[#E5E1D8] focus:border-[#1B2A4A] focus:ring-1 focus:ring-[#1B2A4A]/20 outline-none transition-all bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#5C5E64] hover:text-[#1B2A4A] transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {password.length > 0 && (
              <div className="mt-2 space-y-1">
                <div className="grid grid-cols-4 gap-1">
                  {[1, 2, 3, 4].map((step) => (
                    <span
                      key={step}
                      className={`h-1 transition-colors duration-200 ${
                        step <= strength.score ? strength.color : 'bg-[#E5E1D8]'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[11px] text-[#5C5E64]">{strength.label}</p>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-[#1E2022] hover:bg-[#1B2A4A] disabled:opacity-65 text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors active:scale-[0.98]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="bg-[#F7F6F2] min-h-[75vh] py-10 sm:py-16 px-4 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md bg-white border border-[#E5E1D8] p-6 sm:p-8 shadow-[0_14px_40px_-16px_rgba(27,42,74,0.12)]"
      >
        <p className="font-display text-lg font-bold tracking-[0.2em] text-[#1E2022]">
          FLIVIO
        </p>
        <h1 className="mt-2 font-display text-2xl font-semibold text-[#1E2022]">
          Reset Password
        </h1>
        <p className="mt-2 text-xs text-[#5C5E64] leading-relaxed">
          Enter your registered email below, or sign in directly using demo credentials{' '}
          <span className="font-mono text-[#1E2022]">arjun@flivio.store</span>.
        </p>

        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="submitted"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-6 p-4 bg-[#F7F6F2] border border-[#E5E1D8] text-xs text-[#1E2022] space-y-3"
            >
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#1B2A4A] shrink-0 mt-0.5" />
                <p>
                  Password reset instructions have been prepared for <strong>{email}</strong>. Need immediate access? Message our team on WhatsApp.
                </p>
              </div>
              <Link
                to="/login"
                className="inline-block text-xs font-semibold text-[#1B2A4A] underline"
              >
                Return to Sign In
              </Link>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onSubmit={handleSubmit}
              className="mt-6 space-y-4"
            >
              <div>
                <label className="block text-xs font-medium text-[#1E2022] mb-1.5">
                  Registered Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#86888E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-3.5 py-2.5 text-base sm:text-sm border border-[#E5E1D8] focus:border-[#1B2A4A] focus:ring-1 focus:ring-[#1B2A4A]/20 outline-none transition-all bg-white"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-3.5 bg-[#1E2022] hover:bg-[#1B2A4A] text-white text-xs font-semibold uppercase tracking-wider transition-colors active:scale-[0.98]"
              >
                Request Reset
              </button>
              <div className="text-center pt-1">
                <Link
                  to="/login"
                  className="text-xs text-[#5C5E64] hover:text-[#1B2A4A] transition-colors"
                >
                  Back to Sign In
                </Link>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
