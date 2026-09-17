import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, Shield, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { api } from '../../services/api';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setTokenError('Missing password reset token in link.');
      setVerifying(false);
      return;
    }

    api.verifyResetToken(token)
      .then((res) => {
        if (!res.valid) {
          setTokenError(res.error || 'This password reset link is invalid or has expired.');
        }
      })
      .catch((err) => {
        console.error('[ResetPasswordPage] Verification error:', err);
        setTokenError('Unable to verify reset link. Please request a new one.');
      })
      .finally(() => {
        setVerifying(false);
      });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match. Please re-type your password.');
      return;
    }

    setLoading(true);

    try {
      await api.resetPassword(token, password);
      setSuccess(true);
    } catch (err: any) {
      console.error('[ResetPasswordPage] Reset failed:', err);
      setFormError(err.message || 'Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col justify-center py-16 px-4 sm:px-6 lg:px-8 bg-[#F1F4EE]/40 text-[#1A2421]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-3 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1C5C53]/10 text-[#1C5C53] text-xs font-mono font-bold uppercase tracking-wider">
          <Shield className="w-3.5 h-3.5 text-[#FF5A4E]" />
          <span>Security Portal</span>
        </div>
        <h2 className="text-3xl font-extrabold text-[#11332D] font-display">
          Reset Your Password
        </h2>
        <p className="text-sm text-[#5A6B66]">
          Choose a strong new password for your Golden Hour account.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 border border-[#D9DFD6] sm:rounded-3xl sm:px-10 shadow-sm space-y-6">
          {verifying ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-[#1C5C53] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-mono text-[#5A6B66]">Verifying security token...</p>
            </div>
          ) : tokenError ? (
            <div className="space-y-6 text-center py-2">
              <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-600 border border-rose-200">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-[#11332D]">Invalid or Expired Link</h3>
                <p className="text-xs text-[#5A6B66] leading-relaxed">
                  {tokenError}
                </p>
              </div>
              <div className="space-y-2 pt-2">
                <Link
                  to="/auth/forgot-password"
                  className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-full bg-[#FF5A4E] hover:bg-[#FF5A4E]/90 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  <span>Request New Reset Link</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/auth/login"
                  className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-full border border-[#D9DFD6] text-xs font-bold text-[#5A6B66] hover:text-[#11332D] hover:bg-slate-50 transition-all"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </div>
          ) : success ? (
            <div className="space-y-6 text-center py-2">
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600 border border-emerald-200">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-[#11332D]">Password Updated!</h3>
                <p className="text-xs text-[#5A6B66] leading-relaxed">
                  Your Golden Hour password has been reset successfully. You can now log in using your new credentials.
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/auth/login')}
                  className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-full bg-[#11332D] hover:bg-[#1C5C53] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  <span>Proceed to Sign In</span>
                  <ArrowRight className="w-4 h-4 text-[#FF5A4E]" />
                </button>
              </div>
            </div>
          ) : (
            <>
              {formError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#11332D]">New Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#5A6B66] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Minimum 6 characters"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D9DFD6] focus:outline-none focus:border-[#1C5C53] text-sm bg-[#F1F4EE]/30"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#11332D]">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#5A6B66] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="Re-enter password"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D9DFD6] focus:outline-none focus:border-[#1C5C53] text-sm bg-[#F1F4EE]/30"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-full bg-[#11332D] hover:bg-[#1C5C53] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <span>{loading ? 'Updating Password...' : 'Save New Password'}</span>
                  <ArrowRight className="w-4 h-4 text-[#FF5A4E]" />
                </button>
              </form>

              <div className="pt-3 text-center border-t border-[#D9DFD6]/60">
                <Link
                  to="/auth/login"
                  className="text-xs font-bold text-[#5A6B66] hover:text-[#11332D] inline-flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Cancel and return to Sign In</span>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
};
