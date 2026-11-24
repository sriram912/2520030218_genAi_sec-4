import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  ClipboardList,
  Calculator,
  Cpu,
  Sliders,
  BarChart3,
  Compass,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Leaf,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export const SIDEBAR_ITEMS = [
  { name: 'Overview', path: '/dashboard', icon: LayoutDashboard, badge: 'Live' },
  { name: 'Campus Data', path: '/calculator?tab=history', icon: ClipboardList, badge: null },
  { name: 'Impact Calculator', path: '/calculator', icon: Calculator, badge: null },
  { name: 'AI Insights', path: '/ai', icon: Cpu, badge: 'Gemini' },
  { name: 'Impact Lab', path: '/simulator', icon: Sliders, badge: null },
  { name: 'Scenario Comparison', path: '/scenarios', icon: BarChart3, badge: null },
  { name: '3D Campus', path: '/campus', icon: Compass, badge: '3D' },
  { name: 'Reports', path: '/reports', icon: FileText, badge: 'PDF' },
  { name: 'Settings', path: '/settings', icon: Settings, badge: null },
];

export default function Sidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`fixed top-16 left-0 bottom-0 z-40 bg-slate-950/95 backdrop-blur-xl border-r border-emerald-500/15 flex flex-col transition-all duration-300 select-none ${
        collapsed ? 'w-18' : 'w-64'
      }`}
    >
      {/* Brand Header / Expand-Collapse toggle */}
      <div className="flex items-center justify-between px-3.5 py-4 border-b border-emerald-500/10">
        {!collapsed && (
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold truncate">
              Navigation Suite
            </span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-900 border border-slate-800 transition-colors ${
            collapsed ? 'mx-auto' : ''
          }`}
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800">
        {SIDEBAR_ITEMS.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path.includes('?') && location.pathname === item.path.split('?')[0]);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              to={item.path}
              title={collapsed ? item.name : undefined}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-mono font-medium transition-all group ${
                isActive
                  ? 'text-emerald-300 font-bold bg-emerald-950/40 border border-emerald-500/30 shadow-lg shadow-emerald-950/50'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60 border border-transparent'
              }`}
            >
              <div
                className={`flex items-center justify-center transition-transform group-hover:scale-110 ${
                  isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-emerald-400'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
              </div>

              {!collapsed && (
                <div className="flex-1 flex items-center justify-between truncate">
                  <span className="truncate">{item.name}</span>
                  {item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono font-semibold ${
                        item.badge === 'Live'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : item.badge === 'Gemini'
                          ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}

              {isActive && (
                <motion.div
                  layoutId="active-nav-indicator"
                  className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-emerald-400 rounded-r-full shadow-sm shadow-emerald-400"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer System Pill */}
      {!collapsed ? (
        <div className="p-3 border-t border-emerald-500/10 bg-slate-950/60 text-[10px] font-mono text-slate-400 space-y-1.5">
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>GHG Protocol</span>
            </span>
            <span className="text-emerald-400 font-bold">Tier 1 Audited</span>
          </div>
          <p className="text-[9px] text-slate-400 leading-tight">
            ISO 14064 & EPA eGRID multi-region emission verification engine.
          </p>
        </div>
      ) : (
        <div className="p-2 border-t border-emerald-500/10 flex justify-center text-emerald-400">
          <span title="GHG Protocol Verified">
            <ShieldCheck className="w-4 h-4" />
          </span>
        </div>
      )}
    </aside>
  );
}