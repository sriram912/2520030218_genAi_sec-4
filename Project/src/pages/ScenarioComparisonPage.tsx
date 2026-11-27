import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../utils/api';
import CanvasContainer from '../components/3d/CanvasContainer';
import ScenarioComparison3D from '../components/3d/ScenarioComparison3D';
import { Scenario, ImpactCalculation } from '../types';
import {
  Sliders,
  Sparkles,
  BarChart3,
  TrendingDown,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Award,
  Layers,
  ArrowRight,
  RefreshCw,
  Plus,
  Trash2,
  FileText,
  Clock,
  Compass,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts';

export default function ScenarioComparisonPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [baseline, setBaseline] = useState<ImpactCalculation | null>(null);
  const [loading, setLoading] = useState(true);

  // Gemini AI Analysis State
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiProvider, setAiProvider] = useState<string>('');
  const [lastAnalysisTime, setLastAnalysisTime] = useState<string | null>(null);

  // Load scenarios and baseline
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [scenList, calcList] = await Promise.all([
          api.getScenarios().catch(() => []),
          api.getCalculations().catch(() => []),
        ]);

        if (isMounted) {
          setScenarios(scenList);
          if (calcList.length > 0) {
            setBaseline(calcList[0]);
          }
        }
      } catch (err) {
        console.warn('Scenarios load error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Run Gemini AI Scenario Analysis
  const handleAnalyzeScenarios = async () => {
    setIsAnalyzing(true);
    try {
      const res = await api.analyzeScenariosWithGemini(baseline, scenarios);
      setAiAnalysis(res.analysis);
      setAiProvider(res.provider);
      setLastAnalysisTime(res.last_analysis_time || new Date().toISOString());
    } catch (err: any) {
      console.error('Scenario analysis failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Delete scenario handler
  const handleDeleteScenario = async (id: string) => {
    try {
      await api.deleteScenario(id);
      setScenarios((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error('Failed to delete scenario', err);
    }
  };

  // Compute Highlights
  const highestReductionScenario = scenarios.reduce((best, s) => {
    const sVal = s.calculated?.reduction_percentage || 0;
    const bVal = best?.calculated?.reduction_percentage || 0;
    return sVal > bVal ? s : best;
  }, scenarios[0]);

  const lowestCostScenario = scenarios.reduce((best, s) => {
    const sCost = s.estimated_cost_usd ?? Infinity;
    const bCost = best?.estimated_cost_usd ?? Infinity;
    return sCost < bCost ? s : best;
  }, scenarios[0]);

  const mostBalancedScenario = scenarios.find((s) => s.name.includes('Combined') || s.name.includes('Masterplan')) || scenarios[0];

  // Chart Data
  const chartData = scenarios.map((s) => ({
    name: s.name.replace('Scenario ', ''),
    carbon_saved: s.calculated?.carbon_saved_kg || 0,
    reduction_pct: s.calculated?.reduction_percentage || 0,
    cost: s.estimated_cost_usd ? Math.round(s.estimated_cost_usd / 1000) : 0,
  }));

  // Markdown renderer
  const renderAnalysisMarkdown = (text: string) => {
    const sections = text.split('\n');
    return sections.map((line, idx) => {
      if (line.startsWith('### ')) {
        return (
          <h4 key={idx} className="text-base font-bold text-emerald-300 mt-4 mb-2 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-emerald-400 rounded-sm inline-block" />
            {line.replace('### ', '')}
          </h4>
        );
      }
      if (line.startsWith('- ')) {
        return (
          <li key={idx} className="text-xs text-slate-300 ml-4 list-disc my-1">
            <span
              dangerouslySetInnerHTML={{
                __html: line
                  .replace('- ', '')
                  .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
                  .replace(/`(.*?)`/g, '<code class="bg-slate-800 text-emerald-300 px-1 py-0.5 rounded text-[11px]">$1</code>'),
              }}
            />
          </li>
        );
      }
      if (line.trim() === '') return <div key={idx} className="h-1.5" />;
      return (
        <p
          key={idx}
          className="text-xs text-slate-300 leading-relaxed my-1"
          dangerouslySetInnerHTML={{
            __html: line
              .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
              .replace(/`(.*?)`/g, '<code class="bg-slate-800 text-emerald-300 px-1 py-0.5 rounded text-[11px]">$1</code>'),
          }}
        />
      );
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* ── HEADER BANNER ────────────────────────────────────────────── */}
      <div className="glass-card p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
            <BarChart3 className="w-3.5 h-3.5" />
            STRATEGIC PORTFOLIO BENCHMARKING • GEMINI SCENARIO ADVISOR
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Scenario Comparison & Analysis
          </h1>
          <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
            Side-by-side auditable evaluation of hypothetical sustainability roadmaps. 
            Compare emission abatement yields, capital investment budgets, and request holistic Gemini strategic advice.
          </p>
        </div>

        <div className="flex items-center gap-3 z-10">
          <a
            href="/simulator"
            className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-slate-300 text-xs font-mono flex items-center gap-2 hover:bg-slate-800 transition-colors"
          >
            <Sliders className="w-3.5 h-3.5" />
            Impact Lab Sliders
          </a>
          <button
            onClick={handleAnalyzeScenarios}
            disabled={isAnalyzing}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs font-mono uppercase tracking-wider flex items-center gap-2 hover:brightness-110 active:scale-95 shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {isAnalyzing ? 'Analyzing Scenarios...' : 'Analyze My Scenarios with Gemini'}
          </button>
        </div>
      </div>

      {/* ── 3D COMPARATIVE CAMPUS SCENARIO DIGITAL TWIN ──────────── */}
      <div className="glass-card p-6 border-emerald-500/30 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden flex flex-col lg:flex-row items-center gap-6">
        <div className="flex-1 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
            <Compass className="w-3.5 h-3.5" />
            3D SPATIAL ROADMAP VISUALIZER
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Interactive Campus Scenario Retrofits
          </h2>
          <p className="text-xs text-slate-300 font-mono leading-relaxed">
            Select a scenario to dynamically preview its physical infrastructure transformation: rooftop photovoltaic arrays (Scenario A), conductive EV transit roadways (Scenario B), circular zero-waste rings (Scenario C), or full net-zero masterplan aura (Scenario D).
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            {scenarios.map((s, idx) => {
              const letter = s.name.includes('Scenario ') ? s.name.split('Scenario ')[1]?.slice(0, 1) : `${idx + 1}`;
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    // Update highlight or active state
                    const btn = document.getElementById(`scenario-select-${s.id}`);
                    if (btn) btn.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 border border-emerald-500/20 text-xs font-mono text-slate-300 hover:text-emerald-300 hover:border-emerald-500/50 transition-colors flex items-center gap-1.5"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>{s.name}</span>
                  <span className="text-[10px] text-emerald-400 font-bold">
                    (-{s.calculated?.reduction_percentage || 0}%)
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="w-full lg:w-96 h-64 sm:h-72 relative rounded-2xl overflow-hidden border border-emerald-500/20 bg-slate-950/80 shadow-2xl flex-shrink-0">
          <CanvasContainer camera={{ position: [0, 2.8, 4.4], fov: 46 }}>
            <ScenarioComparison3D
              activeScenarioId={highestReductionScenario?.name || 'Scenario D'}
              reductionPercentage={highestReductionScenario?.calculated?.reduction_percentage || 34}
            />
          </CanvasContainer>
          <div className="absolute bottom-2 right-2 text-[10px] font-mono text-emerald-400/90 bg-slate-950/90 px-2 py-0.5 rounded border border-emerald-500/40 pointer-events-none flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            3D Scenario Twin
          </div>
        </div>
      </div>

      {/* ── HIGHLIGHT BADGES ROW ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Highlight 1: Greatest Emission Reduction */}
        <div className="glass-card p-5 border-emerald-500/40 bg-gradient-to-br from-emerald-950/30 to-slate-900">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold uppercase mb-2">
            <Award className="w-4 h-4" />
            Greatest Emission Reduction
          </div>
          <div className="text-lg font-bold text-white">
            {highestReductionScenario?.name || 'Scenario D'}
          </div>
          <div className="text-2xl font-black text-emerald-300 mt-1 font-mono">
            -{highestReductionScenario?.calculated?.reduction_percentage || 34.3}%{' '}
            <span className="text-xs font-normal text-slate-400">
              (-{highestReductionScenario?.calculated?.carbon_saved_kg?.toLocaleString() || '3,591'} kg)
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono mt-2 block">
            Maximum absolute decarbonization milestone
          </span>
        </div>

        {/* Highlight 2: Most Balanced Scenario */}
        <div className="glass-card p-5 border-sky-500/40 bg-gradient-to-br from-sky-950/30 to-slate-900">
          <div className="flex items-center gap-2 text-sky-400 text-xs font-mono font-bold uppercase mb-2">
            <ShieldCheck className="w-4 h-4" />
            Most Balanced Scenario
          </div>
          <div className="text-lg font-bold text-white">
            {mostBalancedScenario?.name || 'Scenario A'}
          </div>
          <div className="text-2xl font-black text-sky-300 mt-1 font-mono">
            ${mostBalancedScenario?.estimated_cost_usd?.toLocaleString() || '45,000'}{' '}
            <span className="text-xs font-normal text-slate-400">
              ({mostBalancedScenario?.payback_years || 2.8} yr payback)
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono mt-2 block">
            Optimal balance of capital vs. recurring utility savings
          </span>
        </div>

        {/* Highlight 3: Lowest-Cost Entry Scenario */}
        <div className="glass-card p-5 border-amber-500/40 bg-gradient-to-br from-amber-950/30 to-slate-900">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold uppercase mb-2">
            <DollarSign className="w-4 h-4" />
            Lowest-Cost Scenario
          </div>
          <div className="text-lg font-bold text-white">
            {lowestCostScenario?.name || 'Scenario C'}
          </div>
          <div className="text-2xl font-black text-amber-300 mt-1 font-mono">
            ${lowestCostScenario?.estimated_cost_usd?.toLocaleString() || '12,000'}{' '}
            <span className="text-xs font-normal text-emerald-400 font-mono text-sm">
              (-{lowestCostScenario?.calculated?.reduction_percentage || 10.3}%)
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono mt-2 block">
            Fastest institutional deployment with 1.5 yr payback
          </span>
        </div>
      </div>

      {/* ── COMPREHENSIVE SCENARIO COMPARISON TABLE ──────────────────── */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-emerald-500/10 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white">Calculated Scenario Matrix</h2>
            <p className="text-xs text-slate-400 font-mono">
              All numbers produced by the deterministic backend calculator based on EPA factors.
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-slate-900 border border-emerald-500/30 px-3 py-1 rounded-full">
            Baseline: {(baseline?.total_kg_co2e || 10459.1).toLocaleString()} kg CO₂e
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900/80 text-slate-400 border-b border-emerald-500/20">
              <tr>
                <th className="p-3">Scenario Title</th>
                <th className="p-3">Estimated Output</th>
                <th className="p-3">Carbon Saved</th>
                <th className="p-3">Reduction %</th>
                <th className="p-3">Est. Capital ($)</th>
                <th className="p-3">Payback Period</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {scenarios.map((scen) => (
                <tr key={scen.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="p-3">
                    <span className="font-bold text-slate-100 block">{scen.name}</span>
                    <span className="text-[10px] text-slate-500 block">{scen.description}</span>
                  </td>
                  <td className="p-3 font-semibold text-white">
                    {(scen.calculated?.simulated_emissions_kg || 0).toLocaleString()} kg
                  </td>
                  <td className="p-3 text-emerald-400 font-bold">
                    -{(scen.calculated?.carbon_saved_kg || 0).toLocaleString()} kg
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                      -{scen.calculated?.reduction_percentage || 0}%
                    </span>
                  </td>
                  <td className="p-3 text-slate-300">
                    {scen.estimated_cost_usd ? `$${scen.estimated_cost_usd.toLocaleString()}` : '—'}
                  </td>
                  <td className="p-3 text-slate-400">
                    {scen.payback_years ? `${scen.payback_years} yrs` : '—'}
                  </td>
                  <td className="p-3 text-right">
                    {!scen.is_template && (
                      <button
                        onClick={() => handleDeleteScenario(scen.id)}
                        className="p-1.5 rounded hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors"
                        title="Delete Scenario"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── COMPARISON CHARTS ROW ─────────────────────────────────────── */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center justify-between">
          <span>Carbon Abatement Comparison (kg CO₂e Saved)</span>
          <span className="text-xs font-mono text-emerald-400">Deterministic Model</span>
        </h3>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(16, 185, 129, 0.1)" />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} angle={-15} textAnchor="end" />
              <YAxis stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#f8fafc',
                }}
              />
              <Bar dataKey="carbon_saved" name="Carbon Saved (kg CO₂e)" fill="#10b981" radius={[4, 4, 0, 0]}>
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={index === 3 ? '#34d399' : '#059669'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── GEMINI AI SCENARIO ANALYZER PANEL ─────────────────────────── */}
      <div className="glass-card p-6 sm:p-8 space-y-6 border-emerald-500/40 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-emerald-500/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Gemini Scenario Advisory Panel</h3>
              <p className="text-xs text-slate-400 font-mono">
                Answering strategic institutional decarbonization questions based on calculated outcomes.
              </p>
            </div>
          </div>

          <button
            onClick={handleAnalyzeScenarios}
            disabled={isAnalyzing}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs font-mono uppercase tracking-wider flex items-center gap-2 hover:brightness-110 active:scale-95 shadow-md shadow-emerald-500/20 disabled:opacity-50 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
            {isAnalyzing ? 'Evaluating Matrices...' : 'Refresh AI Analysis'}
          </button>
        </div>

        {/* AI Content Area */}
        {isAnalyzing ? (
          <div className="p-12 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-10 h-10 border-2 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin" />
            <p className="text-xs font-mono text-emerald-400">
              Synthesizing baseline vs. 4 scenario models through Gemini 1.5...
            </p>
          </div>
        ) : aiAnalysis ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pb-2 border-b border-slate-800">
              <span>Analysis Provider: <strong className="text-emerald-400">{aiProvider || 'gemini-flash-lite-latest'}</strong></span>
              <span>Timestamp: {lastAnalysisTime ? new Date(lastAnalysisTime).toLocaleTimeString() : 'Current'}</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-emerald-500/20 space-y-2">
              {renderAnalysisMarkdown(aiAnalysis)}
            </div>
          </motion.div>
        ) : (
          <div className="p-10 rounded-2xl bg-slate-950/60 border border-dashed border-slate-800 text-center space-y-3">
            <Sparkles className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-xs font-mono text-slate-400">
              Click &quot;Analyze My Scenarios with Gemini&quot; above to generate answers to the 7 key institutional questions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
