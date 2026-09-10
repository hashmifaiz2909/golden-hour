import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, LogOut, LogIn, Menu, X, QrCode, FileText, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRider } from '../../context/RiderContext';

export const GoldenHoursNavbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { clearProfile } = useRider();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = () => {
    logout();
    clearProfile();
    navigate('/auth/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#F1F4EE]/90 backdrop-blur-md border-b border-[#D9DFD6]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2.5 text-xl font-bold text-[#11332D] font-display">
              <svg width="32" height="32" style={{ width: 32, height: 32, minWidth: 32, minHeight: 32 }} className="w-8 h-8 flex-shrink-0" viewBox="0 0 30 30" fill="none">
                <circle cx="15" cy="15" r="14" stroke="#1C5C53" strokeWidth="2" />
                <path d="M5 15h6l2-6 4 12 2-6h6" stroke="#FF5A4E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-xl font-bold text-[#11332D] tracking-tight">Golden Hours</span>
            </Link>
          </div>

          {/* Center Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-6 text-sm font-medium">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className={`px-3 py-2 rounded-md transition-colors ${
                      isActive('/dashboard') ? 'text-[#11332D] bg-[#D9DFD6]/30 font-bold' : 'text-[#5A6B66] hover:text-[#11332D] hover:bg-[#D9DFD6]/10'
                    }`}
                  >
                    Dashboard
                  </Link>

                  <Link
                    to="/dashboard/profile"
                    className={`px-3 py-2 rounded-md transition-colors ${
                      isActive('/dashboard/profile') ? 'text-[#11332D] bg-[#D9DFD6]/30 font-bold' : 'text-[#5A6B66] hover:text-[#11332D] hover:bg-[#D9DFD6]/10'
                    }`}
                  >
                    Emergency Profile
                  </Link>

                  <Link
                    to="/dashboard/qr"
                    className={`px-3 py-2 rounded-md transition-colors ${
                      isActive('/dashboard/qr') ? 'text-[#11332D] bg-[#D9DFD6]/30 font-bold' : 'text-[#5A6B66] hover:text-[#11332D] hover:bg-[#D9DFD6]/10'
                    }`}
                  >
                    Print QR
                  </Link>

                  <Link
                    to="/admin"
                    className={`px-3 py-2 rounded-md transition-colors ${
                      isActive('/admin') ? 'text-[#11332D] bg-[#D9DFD6]/30 font-bold' : 'text-[#5A6B66] hover:text-[#11332D] hover:bg-[#D9DFD6]/10'
                    }`}
                  >
                    Admin Portal
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/"
                    className={`px-3 py-2 rounded-md transition-colors ${
                      isActive('/') ? 'text-[#11332D] bg-[#D9DFD6]/30 font-bold' : 'text-[#5A6B66] hover:text-[#11332D] hover:bg-[#D9DFD6]/10'
                    }`}
                  >
                    Home
                  </Link>

                  <Link
                    to="/features"
                    className={`px-3 py-2 rounded-md transition-colors ${
                      isActive('/features') ? 'text-[#11332D] bg-[#D9DFD6]/30 font-bold' : 'text-[#5A6B66] hover:text-[#11332D] hover:bg-[#D9DFD6]/10'
                    }`}
                  >
                    Features
                  </Link>

                  <Link
                    to="/admin"
                    className={`px-3 py-2 rounded-md transition-colors ${
                      isActive('/admin') ? 'text-[#11332D] bg-[#D9DFD6]/30 font-bold' : 'text-[#5A6B66] hover:text-[#11332D] hover:bg-[#D9DFD6]/10'
                    }`}
                  >
                    Admin Portal
                  </Link>

                  <Link
                    to="/pricing"
                    className={`px-3 py-2 rounded-md transition-colors ${
                      isActive('/pricing') ? 'text-[#11332D] bg-[#D9DFD6]/30 font-bold' : 'text-[#5A6B66] hover:text-[#11332D] hover:bg-[#D9DFD6]/10'
                    }`}
                  >
                    Pricing
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-[#11332D] hover:text-[#1C5C53] border border-[#D9DFD6] rounded-full hover:bg-white transition-all shadow-sm"
                >
                  <User className="w-4 h-4 text-[#1C5C53]" />
                  <span className="max-w-[120px] truncate">{user.name}</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white bg-[#FF5A4E] hover:bg-[#FF5A4E]/95 rounded-full transition-colors shadow-sm cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/auth/login"
                  className="px-4 py-2 text-sm font-semibold text-[#11332D] hover:text-[#1C5C53] border border-[#D9DFD6] rounded-full hover:bg-white transition-all shadow-sm"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth/signup"
                  className="px-5 py-2 text-sm font-bold text-white bg-[#FF5A4E] hover:bg-[#FF5A4E]/90 rounded-full transition-all shadow-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-[#5A6B66] hover:text-[#11332D] hover:bg-[#D9DFD6]/20"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#D9DFD6] bg-[#F1F4EE] px-4 pt-2 pb-4 space-y-2 text-sm">
          {user ? (
            <>
              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-[#1C5C53] font-bold">Dashboard</Link>
              <Link to="/dashboard/profile" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-[#11332D] font-semibold">Emergency Profile</Link>
              <Link to="/dashboard/qr" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-[#11332D] font-medium">Print QR Tag</Link>
              <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-[#11332D] font-medium">Admin Portal</Link>
            </>
          ) : (
            <>
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-[#11332D] font-bold">Home</Link>
              <Link to="/features" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-[#11332D] font-medium">Features</Link>
              <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-[#11332D] font-medium">Admin Portal</Link>
              <Link to="/pricing" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-[#11332D] font-medium">Pricing</Link>
            </>
          )}
          <div className="pt-2 border-t border-[#D9DFD6]">
            {user ? (
              <button
                onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}
                className="w-full text-left py-2 text-[#FF5A4E] font-bold"
              >
                Sign Out ({user.name})
              </button>
            ) : (
              <div className="space-y-2 pt-1">
                <Link to="/auth/login" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-[#11332D] font-semibold">Sign In</Link>
                <Link to="/auth/signup" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-center text-white bg-[#FF5A4E] font-bold rounded-xl shadow-sm">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
