import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Activity, Radio, QrCode, PlayCircle, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { user, logout, setDemoUser } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-rose-500 p-0.5 shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <Shield className="w-5 h-5 text-sky-400" />
              </div>
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
                GOLDEN HOUR
                <span className="text-[10px] uppercase font-bold tracking-widest bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">
                  LIVE
                </span>
              </span>
              <p className="text-[11px] text-slate-400 hidden sm:block">Emergency Crash Response & Triage</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1 text-sm font-medium">
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg transition-colors ${
                isActive('/') ? 'bg-slate-800 text-sky-400' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Home
            </Link>

            <Link
              to="/mobile"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors ${
                isActive('/mobile') ? 'bg-slate-800 text-sky-400' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Activity className="w-4 h-4 text-emerald-400" />
              Rider App
            </Link>

            <Link
              to="/responder/dashboard"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors ${
                isActive('/responder/dashboard') ? 'bg-slate-800 text-sky-400' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Radio className="w-4 h-4 text-rose-400" />
              Responder Command
            </Link>

            <Link
              to="/id/GH-7749"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors ${
                isActive('/id/GH-7749') ? 'bg-slate-800 text-sky-400' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <QrCode className="w-4 h-4 text-sky-400" />
              Sample QR Profile
            </Link>

            <Link
              to="/demo"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold transition-all ${
                isActive('/demo')
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md'
                  : 'bg-sky-500/10 text-sky-300 border border-sky-500/30 hover:bg-sky-500/20'
              }`}
            >
              <PlayCircle className="w-4 h-4" />
              Demo Simulator
            </Link>
          </div>

          {/* User / Demo Quick Actions */}
          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2">
                <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg text-xs text-slate-300 border border-slate-700">
                  <UserIcon className="w-3.5 h-3.5 text-sky-400" />
                  <span>{user.name} ({user.role})</span>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDemoUser('rider')}
                  className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg font-medium border border-slate-700 transition-colors"
                >
                  Demo Rider
                </button>
                <button
                  onClick={() => setDemoUser('responder')}
                  className="text-xs bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 px-3 py-1.5 rounded-lg font-medium border border-rose-800/40 transition-colors"
                >
                  Demo Responder
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};
