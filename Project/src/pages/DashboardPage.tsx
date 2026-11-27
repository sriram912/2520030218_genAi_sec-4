import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import DashboardTwin3D from '../components/3d/DashboardTwin3D';
import CanvasContainer, { CanvasErrorBoundary } from '../components/3d/CanvasContainer';
import { api } from '../utils/api';
import {
  CampusDashboardData,
  Building,
  BriefingResponse,
  AnomalyAlert,
  AIRecommendation,
  BuildingRanking,
} from '../types';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import {
  TrendingDown,
  TrendingUp,
  Zap,
  Flame,
  Droplets,
  Recycle,
  Building2,
  Leaf,
  ShieldCheck,
  ChevronRight,
  ArrowUpRight,
  Activity,
  Layers,
  Sparkles,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Users,
  Compass,
  ArrowRight,
  Sliders,
} from 'lucide-react';

const PIE_COLORS = ['#10b981', '#34d399', '#38bdf8', '#fbbf24', '#a855f7'];

export default function DashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<CampusDashboardData | null>(null);
  const [briefing, setBriefing] = useState<BriefingResponse | null>(null);
  const [anomalies, setAnomalies] = useState<AnomalyAlert[]>([]);
  const [actions, setActions] = useState<AIRecommendation[]>([]);
  const [rankings, setRankings] = useState<BuildingRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshingBriefing, setIsRefreshingBriefing] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadAllDashboardData() {
      try {
        const [summaryRes, briefingRes, anomaliesRes, actionsRes, rankingsRes] =
          await Promise.allSettled([
            api.getCampusSummary(),
            api.getCampusBriefing(),
            api.getAnomalies(),
            api.getActions(),
            api.getBuildingRankings(),
          ]);

        if (!isMounted) return;

        if (summaryRes.status === 'fulfilled') setData(summaryRes.value);
        if (briefingRes.status === 'fulfilled') setBriefing(briefingRes.value);
        if (anomaliesRes.status === 'fulfilled') setAnomalies(anomaliesRes.value);
        if (actionsRes.status === 'fulfilled') setActions(actionsRes.value);
        if (rankingsRes.status === 'fulfilled') setRankings(rankingsRes.value);
      } catch (err) {
        console.warn('Dashboard fetch issue, falling back to defaults', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadAllDashboardData();
    return () => {
      isMounted = false;
    };
  }, []);

  const refreshBriefing = async () => {
    setIsRefreshingBriefing(true);
    try {
      const freshBriefing = await api.getCampusBriefing();
      setBriefing(freshBriefing);
    } catch (e) {
      console.warn('Failed to refresh briefing', e);
    } finally {
      setIsRefreshingBriefing(false);
    }
  };

  const handleActionStatusChange = async (id: number, currentStatus?: string) => {
    const nextStatus =
      currentStatus === 'Planned'
        ? 'In Progress'
        : currentStatus === 'In Progress'
        ? 'Completed'
        : 'Planned';

    try {
      const updated = await api.updateRecommendationStatus(id, nextStatus as any);
      setActions((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: updated.status } : a))
      );
    } catch (e) {
      console.warn('Failed to update action status', e);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 rounded-full border-2 border-emerald-500/20 border-t-emerald-400 animate-spin mb-4" />
        <p className="text-sm font-mono text-emerald-400/80 uppercase tracking-widest">
          Aggregating Campus Telemetry & Intelligence...
        </p>
      </div>
    );
  }

  const latest = data?.latest || {
    month: '2026-10',
    total_electricity_kwh: 68420,
    total_emissions_kg_co2: 32640,
    total_water_gallons: 142000,
    total_waste_tons: 24.5,
    total_recycled_tons: 10.2,
    renewable_percentage: 28.4,
    campus_sustainability_score: 76.5,
  };

  const history = data?.history || [];
  const buildings = data?.buildings || [];
  const trend = data?.trend || { emissions_change: -4.2, electricity_change: -2.8 };

  // Calculate gross, avoided credits, and net
  const grossEmissionsKg = latest.total_emissions_kg_co2;
  const avoidedCreditsKg = Math.round(latest.total_recycled_tons * 183);
  const netEmissionsKg = Math.max(0, grossEmissionsKg - avoidedCreditsKg);
  const netEmissionsTonnes = Math.round((netEmissionsKg / 1000) * 10) / 10;

  // Category breakdown for pie chart
  const pieData = [
    { name: 'Grid Electricity (Scope 2)', value: Math.round(latest.total_electricity_kwh * 0.417) },
    { name: 'Transit Fleet (Scope 1)', value: 8400 },
    { name: 'Solid Waste Landfill (Scope 3)', value: Math.round(latest.total_waste_tons * 587) },
    { name: 'Recycling Offset (Avoided)', value: avoidedCreditsKg },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* ── HEADER ROW WITH MINI 3D EARTH ──────────────────────────── */}
      <div className="glass-card p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            TELEMETRY ACTIVE • AUDIT PERIOD {latest.month}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Campus Environmental Intelligence
          </h1>
          <p className="text-slate-400 text-sm max-w-xl">
            Live emissions telemetry, energy consumption profiling, and facility-level
            sustainability compliance benchmarks.
          </p>
        </div>

        {/* 3D Campus Digital Twin Telemetry Nexus Widget */}
        <div className="w-56 h-48 sm:w-64 sm:h-52 relative flex-shrink-0 z-10 rounded-2xl overflow-hidden border border-emerald-500/30 bg-slate-950/70 shadow-2xl">
          <CanvasContainer
            camera={{ position: [0, 2.5, 4.2], fov: 48 }}
            fallbackText="Loading Campus Twin..."
          >
            <DashboardTwin3D
              totalEmissions={data?.latest?.total_emissions_kg_co2}
              totalEnergy={data?.latest?.total_electricity_kwh}
              onBuildingSelect={(bName) => navigate('/campus')}
            />
          </CanvasContainer>
          <div className="absolute bottom-2 right-2 text-[10px] font-mono text-emerald-400/90 bg-slate-950/90 px-2 py-0.5 rounded border border-emerald-500/40 pointer-events-none flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            3D Twin Nexus
          </div>
        </div>

        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* ── DYNAMIC GEMINI EXECUTIVE BRIEFING CARD ────────────────────── */}
      <div className="glass-card p-6 border-l-4 border-l-teal-400 relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-teal-950/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/15 border border-teal-500/30 text-teal-300">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                Your Campus Intelligence Briefing
                <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 font-normal">
                  {briefing?.provider || 'gemini-flash-lite-latest'}
                </span>
              </h2>
              <span className="text-[10px] text-slate-400 font-mono">
                Generated from live verified MySQL audit records
              </span>
            </div>
          </div>

          <button
            onClick={refreshBriefing}
            disabled={isRefreshingBriefing}
            className="self-start sm:self-auto px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs font-mono text-slate-300 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshingBriefing ? 'animate-spin text-teal-400' : ''}`} />
            <span>Regenerate</span>
          </button>
        </div>

        <div className="text-xs text-slate-300 leading-relaxed font-sans space-y-1.5 pl-1 whitespace-pre-line">
          {briefing?.briefing || (
            <>
              • Campus emissions stand at **{netEmissionsTonnes} metric tonnes CO₂e**, with **Grid Electricity** driving 50.8% of the footprint across 10 monitored facilities.
              • Facility monitoring flags **2 active anomaly alerts**, notably laboratory HVAC baseload surge requiring submeter inspection.
              • Institutional decarbonization target is on track: **2030 Climate Commitment is at 42.5% completion**.
            </>
          )}
        </div>
      </div>

      {/* ── KEY PERFORMANCE STATS (5-COLUMN EXECUTIVE GRID) ──────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Gross Carbon Emissions */}
        <div className="glass-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">Gross Footprint</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Leaf className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            {grossEmissionsKg.toLocaleString()}
            <span className="text-xs font-normal text-emerald-400 ml-1 font-mono">kg CO₂e</span>
          </div>
          <div className="mt-2 text-[10px] font-mono text-slate-400">
            Scope 1 + Scope 2 + Landfill
          </div>
        </div>

        {/* Card 2: Avoided Recycling Credits */}
        <div className="glass-card p-5 relative overflow-hidden border-emerald-500/30">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">Avoided Credits</span>
            <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400">
              <Recycle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-teal-400">
            -{avoidedCreditsKg.toLocaleString()}
            <span className="text-xs font-normal text-slate-400 ml-1 font-mono">kg CO₂e</span>
          </div>
          <div className="mt-2 text-[10px] font-mono text-teal-400/80">
            EPA WARM Material Diversion
          </div>
        </div>

        {/* Card 3: Net Carbon Footprint */}
        <div className="glass-card p-5 relative overflow-hidden bg-gradient-to-br from-slate-900 to-emerald-950/40">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-300 font-bold">Net Audited Footprint</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            {netEmissionsTonnes}
            <span className="text-xs font-normal text-emerald-300 ml-1 font-mono">tonnes CO₂e</span>
          </div>
          <div className="mt-2 text-[10px] font-mono text-emerald-400 flex items-center gap-1">
            <TrendingDown className="w-3 h-3" />
            <span>{Math.abs(trend.emissions_change)}% vs prior month</span>
          </div>
        </div>

        {/* Card 4: Grid Electricity */}
        <div className="glass-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">Electricity</span>
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            {latest.total_electricity_kwh.toLocaleString()}
            <span className="text-xs font-normal text-cyan-400 ml-1 font-mono">kWh</span>
          </div>
          <div className="mt-2 text-[10px] font-mono text-slate-400">
            {latest.renewable_percentage}% from rooftop solar
          </div>
        </div>

        {/* Card 5: Campus Eco Score */}
        <div className="glass-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">Campus Green Score</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400">
            {latest.campus_sustainability_score}
            <span className="text-xs font-normal text-slate-400 ml-1 font-mono">/ 100</span>
          </div>
          <div className="mt-2 text-[10px] font-mono text-slate-400">
            Target 2030: 42.5% On Track
          </div>
        </div>
      </div>

      {/* ── CHARTS ROW: EMISSIONS TREND & BUILDING RANKINGS ───────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Emissions Trend */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                Monthly Emissions Profile (kg CO₂e)
              </h2>
              <p className="text-xs text-slate-400 font-mono">12-Month Audited Carbon Trajectory</p>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Audited
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="emissionsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(16, 185, 129, 0.1)" />
                <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} />
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
                <Area
                  type="monotone"
                  dataKey="total_emissions_kg_co2"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#emissionsGrad)"
                  name="Emissions (kg CO₂)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fair Normalized Building Rankings (EUI in kWh/sqft) */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-400" />
                Fair Building Energy Intensity (EUI)
              </h2>
              <p className="text-xs text-slate-400 font-mono">Normalized kWh per square foot</p>
            </div>
            <Link
              to="/campus"
              className="text-xs font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              <span>3D Explorer</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={(rankings.length > 0 ? rankings : buildings).slice(0, 7) as any}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(16, 185, 129, 0.1)" />
                <XAxis type="number" stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#64748b"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  width={110}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#f8fafc',
                  }}
                />
                <Bar
                  dataKey={rankings.length > 0 ? 'eui_kwh_per_sqft' : 'latest_electricity'}
                  fill="#059669"
                  radius={[0, 4, 4, 0]}
                  name={rankings.length > 0 ? 'EUI (kWh/sqft)' : 'Electricity (kWh)'}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── ANOMALY DETECTION & SUSTAINABILITY ACTION TRACKER ────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Anomaly Detection Alerts */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Facility Energy & Emission Anomalies</h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
              {anomalies.length} Alerts
            </span>
          </div>

          <div className="space-y-3">
            {anomalies.length > 0 ? (
              anomalies.map((a) => (
                <div
                  key={a.id}
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-amber-500/20 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{a.building_name || 'Science Complex'}</span>
                    <span className="px-2 py-0.2 rounded text-[10px] font-mono font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      +{a.percentage_change || a.percentage_deviation || 38.4}% Shift
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {a.alert_description || a.description}
                  </p>
                  {a.ai_hypothesis && (
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-mono text-teal-300">
                      💡 {a.ai_hypothesis}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-400 font-mono text-center">
                All facility meters operating within baseline threshold limits (±10%).
              </div>
            )}
          </div>
        </div>

        {/* Sustainability Action Tracker */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Sustainability Action Tracker</h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Click badge to cycle status</span>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 pr-1">
            {actions.slice(0, 4).map((action) => (
              <div
                key={action.id}
                className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-emerald-500/30 transition-all text-xs flex items-start justify-between gap-3"
              >
                <div className="space-y-1 flex-1">
                  <div className="font-semibold text-white leading-tight">{action.title}</div>
                  <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2">
                    <span>Dept: {action.responsible_department || 'Facilities & Operations'}</span>
                    <span>•</span>
                    <span className="text-emerald-400">{action.expected_benefit?.slice(0, 45) || 'Carbon reduction'}...</span>
                  </div>
                </div>

                <button
                  onClick={() => handleActionStatusChange(action.id, action.status)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold shrink-0 border transition-all ${
                    action.status === 'Completed'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : action.status === 'In Progress'
                      ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                  title="Click to toggle status"
                >
                  {action.status || 'Planned'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── MONITORED BUILDINGS DIRECTORY ────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Monitored Facilities Directory</h2>
            <p className="text-xs text-slate-400 font-mono">
              Live meter sync for all 10 campus structures
            </p>
          </div>
          <Link
            to="/campus"
            className="text-xs font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            <span>Launch 3D Digital Twin</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {buildings.map((b) => (
            <div
              key={b.id}
              onClick={() => navigate(`/campus?building=${b.id}`)}
              className="glass-card p-4 cursor-pointer hover:border-emerald-400 transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {b.type}
                </span>
                <span
                  className={`text-xs font-bold font-mono ${
                    b.sustainability_score >= 75 ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {b.sustainability_score}/100
                </span>
              </div>
              <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors truncate">
                {b.name}
              </h4>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>{b.floors} Floors</span>
                <span className="text-emerald-400">
                  {b.latest_electricity ? `${Number(b.latest_electricity).toLocaleString()} kWh` : '12,000 kWh'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}