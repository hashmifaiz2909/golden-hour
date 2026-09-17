import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, Shield, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { api } from '../../services/api';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      await api.forgotPassword(email.trim().toLowerCase());
      setIsSubmitted(true);
    } catch (err: any) {
      console.error('[ForgotPasswordPage] Error:', err);
      setErrorMsg(err.message || 'Unable to process your request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col justify-center py-16 px-4 sm:px-6 lg:px-8 bg-[#F1F4EE]/40 text-[#1A2421]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-3 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1C5C53]/10 text-[#1C5C53] text-xs font-mono font-bold uppercase tracking-wider">
          <Shield className="w-3.5 h-3.5 text-[#FF5A4E]" />
          <span>Account Recovery</span>
        </div>
        <h2 className="text-3xl font-extrabold text-[#11332D] font-display">
          Forgot Password?
        </h2>
        <p className="text-sm text-[#5A6B66]">
          Enter your registered email and we'll send you a secure password reset link.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 border border-[#D9DFD6] sm:rounded-3xl sm:px-10 shadow-sm space-y-6">
          {isSubmitted ? (
            <div className="space-y-6 text-center py-2">
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600 border border-emerald-200">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-[#11332D]">Reset Link Dispatched</h3>
                <p className="text-xs text-[#5A6B66] leading-relaxed">
                  If an account exists with <strong>{email}</strong>, a secure password reset email has been sent. The link expires in 60 minutes.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  to="/auth/login"
                  className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-full bg-[#11332D] hover:bg-[#1C5C53] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Return to Sign In</span>
                </Link>
              </div>
            </div>
          ) : (
            <>
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-full bg-[#FF5A4E] hover:bg-[#FF5A4E]/90 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <span>{loading ? 'Sending Reset Link...' : 'Send Password Reset Link'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="pt-3 text-center border-t border-[#D9DFD6]/60">
                <Link
                  to="/auth/login"
                  className="text-xs font-bold text-[#1C5C53] hover:underline inline-flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
};
