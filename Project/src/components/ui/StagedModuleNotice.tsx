import React from 'react';
import { Clock, ShieldCheck, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface StagedModuleProps {
  moduleName: string;
  milestoneWeek: string;
  deliverables: string[];
}

export function StagedModuleNotice({ moduleName, milestoneWeek, deliverables }: StagedModuleProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
        <Clock className="w-4 h-4 text-emerald-300 animate-pulse" />
        SCHEDULED MILESTONE: {milestoneWeek.toUpperCase()}
      </div>

      <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
        {moduleName}
      </h1>

      <p className="text-slate-400 text-sm max-w-xl mx-auto font-mono">
        This module is staged for the upcoming weekly release schedule according to the project development plan.
      </p>

      <div className="glass-card p-6 text-left max-w-lg mx-auto space-y-3 border-emerald-500/20">
        <span className="text-xs font-mono uppercase text-slate-400 font-bold block mb-1">
          Planned Deliverables in {milestoneWeek}:
        </span>
        <ul className="space-y-2 text-xs font-mono text-slate-300">
          {deliverables.map((d, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
              <span>{d}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="pt-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 border border-emerald-500/30 text-emerald-400 text-xs font-mono hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to 3D Landing Page
        </Link>
      </div>
    </div>
  );
}
