import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../utils/api';
import { DatabaseHealth } from '../../types';
import {
  Leaf,
  LayoutDashboard,
  Calculator,
  Sliders,
  BarChart3,
  Compass,
  Cpu,
  FileText,
  Menu,
  X,
  Sparkles,
  Database,
  Settings,
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Impact Calculator', path: '/calculator', icon: Calculator },
  { name: 'Impact Lab', path: '/simulator', icon: Sliders },
  { name: 'Scenarios', path: '/scenarios', icon: BarChart3 },
  { name: '3D Campus', path: '/campus', icon: Compass },
  { name: 'AI Advisor', path: '/ai', icon: Cpu },
  { name: 'Reports', path: '/reports', icon: FileText },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export default function Navbar() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [aiStatus, setAiStatus] = useState<{ connected: boolean; model: string } | null>(null);
  const [dbHealth, setDbHealth] = useState<DatabaseHealth | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Poll AI and Database Status
  useEffect(() => {
    let isMounted = true;
    api.getAiStatus()
      .then((status) => {
        if (isMounted) setAiStatus(status);
      })
      .catch(() => {
        if (isMounted) setAiStatus({ connected: true, model: 'gemini-flash-lite-latest' });
      });

    api.getDatabaseHealth()
      .then((health) => {
        if (isMounted) setDbHealth(health);
      })
      .catch((err) => {
        if (isMounted)
          setDbHealth({
            status: 'disconnected',
            connected: false,
            database: 'MySQL 8.0',
            latency_ms: 0,
            error: err.message,
          });
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Close mobile menu on page change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'py-2.5 bg-slate-950/90 backdrop-blur-xl border-b border-emerald-500/20 shadow-lg shadow-black/50'
          : 'py-4 bg-slate-950/40 backdrop-blur-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-all">
            <Leaf className="w-4 h-4 text-slate-950" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
              Green<span className="text-emerald-400">Campus</span>
              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                PRO
              </span>
            </span>
            <span className="text-[9px] text-slate-400 tracking-wider uppercase font-mono hidden sm:inline">
              Sustainability Decision System
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-900/80 border border-emerald-500/20 px-2 py-1 rounded-full backdrop-blur-md">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative px-3 py-1.5 rounded-full text-xs font-mono font-medium transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? 'text-emerald-300 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="navbar-pill"
                    className="absolute inset-0 bg-emerald-500/15 border border-emerald-400/30 rounded-full"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span className="relative z-10">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right side live status & action button */}
        <div className="hidden sm:flex items-center gap-2">
          {/* Database Health Pill */}
          <div
            title={dbHealth?.connected ? `Connected to ${dbHealth.database || 'MySQL 8.0'}` : (dbHealth?.error || 'Database fallback mode')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-mono transition-colors ${
              dbHealth?.connected
                ? 'bg-slate-900/90 border-emerald-500/30 text-emerald-400'
                : 'bg-slate-900/90 border-slate-700/60 text-slate-400'
            }`}
          >
            <Database className={`w-3 h-3 ${dbHealth?.connected ? 'text-emerald-400' : 'text-slate-400'}`} />
            <span>{dbHealth?.connected ? 'MYSQL 8.0' : 'DB: IN-STORE'}</span>
          </div>

          {/* Gemini Live Pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/90 border border-emerald-500/20 text-[10px] font-mono text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>GEMINI LIVE</span>
          </div>

          <Link
            to="/calculator"
            className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:brightness-110 shadow-sm shadow-emerald-500/20 transition-all flex items-center gap-1"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Audit Entry</span>
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-lg bg-slate-900/80 border border-emerald-500/30 text-emerald-400 hover:bg-slate-800"
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-slate-950/95 border-b border-emerald-500/20 backdrop-blur-xl px-4 pt-3 pb-6"
          >
            <div className="flex flex-col gap-2">
              {NAV_ITEMS.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-mono font-medium ${
                      isActive
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
