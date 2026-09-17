import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, User, Shield, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('[LoginPage] Sign in failed:', err);
      setErrorMsg(err?.message || err?.error || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col justify-center py-16 px-4 sm:px-6 lg:px-8 bg-[#F1F4EE]/40 text-[#1A2421]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-3 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1C5C53]/10 text-[#1C5C53] text-xs font-mono font-bold uppercase tracking-wider">
          <Shield className="w-3.5 h-3.5 text-[#FF5A4E]" />
          <span>User Authentication</span>
        </div>
        <h2 className="text-3xl font-extrabold text-[#11332D] font-display">
          Sign In to Golden Hours
        </h2>
        <p className="text-sm text-[#5A6B66]">
          Don't have an account yet?{' '}
          <Link to="/auth/signup" className="font-bold text-[#FF5A4E] hover:underline">
            Create an account & profile
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 border border-[#D9DFD6] sm:rounded-3xl sm:px-10 shadow-sm space-y-6">
          
          {/* Sign In / Sign Up Tabs */}
          <div className="grid grid-cols-2 p-1 bg-[#F1F4EE] rounded-2xl border border-[#D9DFD6]">
            <Link
              to="/auth/login"
              className="py-2.5 text-center text-xs font-bold rounded-xl bg-white text-[#11332D] shadow-xs cursor-default"
            >
              Sign In
            </Link>
            <Link
              to="/auth/signup"
              className="py-2.5 text-center text-xs font-bold rounded-xl text-[#5A6B66] hover:text-[#11332D] hover:bg-white/60 transition-all flex items-center justify-center gap-1.5"
            >
              <User className="w-3.5 h-3.5 text-[#FF5A4E]" />
              <span>Sign Up</span>
            </Link>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#11332D]">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#5A6B66] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D9DFD6] focus:outline-none focus:border-[#1C5C53] text-sm bg-[#F1F4EE]/30"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#11332D]">Password</label>
                <Link to="/auth/forgot-password" className="text-xs font-semibold text-[#FF5A4E] hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#5A6B66] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D9DFD6] focus:outline-none focus:border-[#1C5C53] text-sm bg-[#F1F4EE]/30"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-full bg-[#11332D] hover:bg-[#1C5C53] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Account'}</span>
              <ArrowRight className="w-4 h-4 text-[#FF5A4E]" />
            </button>

            <div className="pt-3 text-center border-t border-[#D9DFD6]/60">
              <Link
                to="/auth/signup"
                className="w-full py-2.5 px-4 rounded-xl border border-[#FF5A4E]/30 bg-rose-50/60 hover:bg-rose-100/60 text-[#FF5A4E] text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                <span>New to Golden Hours? Click here to Sign Up</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </form>

        </div>
      </div>
    </main>
  );
};
