import React, { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { Leaf, ShieldCheck, Heart } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const isLanding = location.pathname === '/';

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950">
      <Navbar />

      {/* Main Content Area */}
      <div className="flex-1 flex pt-16">
        {!isLanding && <Sidebar />}
        <main className={`flex-1 transition-all duration-300 ${!isLanding ? 'md:pl-64' : ''}`}>
          {children}
        </main>
      </div>

      {/* Premium Footer */}
      <footer className={`border-t border-emerald-500/10 bg-slate-950/80 backdrop-blur-md py-8 mt-16 ${!isLanding ? 'md:pl-64' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-mono">
          <div className="flex items-center gap-2 text-slate-400">
            <Leaf className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-300">GreenCampus Platform</span>
            <span>—</span>
            <span>Deterministic Auditable Carbon Calculations</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5 text-emerald-400/90">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>EPA GHG Inventory Standards</span>
            </div>
            <span>•</span>
            <span>Powered by Google Gemini & MySQL 8.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
