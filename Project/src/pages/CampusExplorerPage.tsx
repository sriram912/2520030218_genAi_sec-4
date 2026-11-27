import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import CampusModel3D from '../components/3d/CampusModel3D';
import SceneSetup from '../components/3d/SceneSetup';
import FloatingParticles from '../components/3d/FloatingParticles';
import { CanvasErrorBoundary, CanvasLoadingFallback } from '../components/3d/CanvasContainer';
import { api } from '../utils/api';
import { Building, EnergyReading, EmissionResult, AIRecommendation } from '../types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Compass,
  Zap,
  Flame,
  Droplets,
  Leaf,
  Sparkles,
  Building2,
  Sliders,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
  Info,
} from 'lucide-react';

export default function CampusExplorerPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialBuilding = searchParams.get('building') ? Number(searchParams.get('building')) : 1;

  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(initialBuilding);
  const [buildingDetail, setBuildingDetail] = useState<{
    building: Building;
    readings: EnergyReading[];
    emissions: EmissionResult | null;
  } | null>(null);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [loadingBuildings, setLoadingBuildings] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [cameraKey, setCameraKey] = useState(0);

  // 3D Simulation Overlay & Modes
  const [isSimMode, setIsSimMode] = useState(false);
  const [simReductionPct, setSimReductionPct] = useState(25);
  const [overlayMode, setOverlayMode] = useState<'default' | 'emissions' | 'score' | 'stale'>('default');
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');

  // Load building list
  useEffect(() => {
    let isMounted = true;
    async function fetchList() {
      try {
        const list = await api.getBuildings();
        if (isMounted) setBuildings(list);
      } catch (err) {
        console.warn('Could not load buildings list, using fallback', err);
      } finally {
        if (isMounted) setLoadingBuildings(false);
      }
    }
    fetchList();
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync selectedId with query param
  useEffect(() => {
    const q = searchParams.get('building');
    if (q) setSelectedId(Number(q));
  }, [searchParams]);

  // Load details & AI recommendations for selected building
  useEffect(() => {
    if (!selectedId) return;

    let isMounted = true;
    setLoadingDetail(true);

    async function fetchBuildingData() {
      try {
        const [detailRes, recRes] = await Promise.all([
          api.getBuilding(selectedId!),
          api.getBuildingRecommendations(selectedId!).catch(() => ({ recommendations: [] })),
        ]);

        if (isMounted) {
          setBuildingDetail(detailRes);
          const recList = Array.isArray(recRes) ? recRes : recRes?.recommendations || [];
          setRecommendations(recList);
        }
      } catch (err) {
        console.warn('Error loading building details', err);
      } finally {
        if (isMounted) setLoadingDetail(false);
      }
    }

    fetchBuildingData();

    return () => {
      isMounted = false;
    };
  }, [selectedId]);

  const handleSelectBuilding = (id: number) => {
    setSelectedId(id);
    setSearchParams({ building: id.toString() });
  };

  const selectedBuildingMeta = buildings.find((b) => b.id === selectedId);
  const latestReading = buildingDetail?.readings?.[buildingDetail.readings.length - 1];

  // Campus average calculation for comparison
  const avgElectricity = buildings.length
    ? Math.round(
        buildings.reduce((sum, b) => sum + (b.latest_electricity || 0), 0) / buildings.length
      )
    : 6500;

  const currentElec = latestReading?.electricity_kwh ?? selectedBuildingMeta?.latest_electricity ?? 7000;
  const comparisonPercent = Math.round(((currentElec - avgElectricity) / avgElectricity) * 100);

  return (
    <div className="relative w-full h-[calc(100vh-5rem)] flex flex-col overflow-hidden bg-slate-950">
      {/* ── TOP ACTION BAR ────────────────────────────────────────────── */}
      <div className="min-h-12 py-2 border-b border-emerald-500/20 bg-slate-950/90 backdrop-blur-md px-4 sm:px-6 flex flex-wrap items-center justify-between gap-3 z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
            <Compass className="w-4 h-4 animate-spin-slow shrink-0" />
            <span className="font-bold tracking-wider uppercase">Campus Digital Twin</span>
          </div>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <span className="text-xs text-slate-400 font-mono hidden md:inline">
            10 Facilities Synchronized
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Overlay Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono">
            <span className="text-[10px] text-slate-400 uppercase hidden sm:inline">Overlay:</span>
            <select
              value={overlayMode}
              onChange={(e) => setOverlayMode(e.target.value as any)}
              className="bg-transparent text-emerald-300 font-bold focus:outline-none"
            >
              <option value="default" className="bg-slate-950 text-white">Default Materials</option>
              <option value="emissions" className="bg-slate-950 text-white">Carbon Intensity (Red/Amber/Green)</option>
              <option value="score" className="bg-slate-950 text-white">Green Score (0-100)</option>
              <option value="stale" className="bg-slate-950 text-white">Missing/Stale Telemetry Flag</option>
            </select>
          </div>

          {/* 3D vs 2D View Switcher */}
          <div className="flex items-center bg-slate-900 rounded-lg border border-slate-700 p-0.5 text-xs font-mono">
            <button
              onClick={() => setViewMode('3d')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                viewMode === '3d' ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30' : 'text-slate-400'
              }`}
            >
              3D WebGL
            </button>
            <button
              onClick={() => setViewMode('2d')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                viewMode === '2d' ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30' : 'text-slate-400'
              }`}
            >
              2D Floorplan
            </button>
          </div>

          {/* 3D Simulation Overlay Toggle */}
          <button
            onClick={() => setIsSimMode(!isSimMode)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono transition-all ${
              isSimMode
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'bg-slate-900 border border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            {isSimMode ? `Sim: -${simReductionPct}%` : 'Simulate'}
          </button>

          {viewMode === '3d' && (
            <button
              onClick={() => setCameraKey((k) => k + 1)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono bg-slate-900 border border-emerald-500/20 text-slate-300 hover:text-emerald-300 transition-colors"
              title="Reset Camera"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          )}

          <Link
            to="/simulator"
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 transition-colors"
          >
            <Sliders className="w-3 h-3" />
            <span className="hidden sm:inline">Impact Lab</span>
          </Link>
        </div>
      </div>

      {/* ── MAIN CONTENT: SPLIT 3D SCENE & TELEMETRY DRAWER ───────────── */}
      <div className="flex-1 relative flex flex-col lg:flex-row overflow-hidden">
        {/* LEFT / MAIN: 3D Isometric Viewport or 2D Floorplan */}
        <div className="w-full lg:w-3/5 h-[48vh] lg:h-full relative bg-slate-950">
          {viewMode === '3d' ? (
            <CanvasErrorBoundary>
              <Suspense fallback={<CanvasLoadingFallback text="Loading 3D Campus Mesh..." />}>
                <Canvas
                  key={cameraKey}
                  camera={{ position: [14, 11, 14], fov: 42 }}
                  shadows
                  gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
                >
                  <SceneSetup
                    enableControls={true}
                    enableStars={true}
                    fog={true}
                    minDistance={5}
                    maxDistance={35}
                  />
                  <FloatingParticles count={90} area={24} speed={0.2} />
                  <CampusModel3D
                    onBuildingClick={handleSelectBuilding}
                    selectedBuildingId={selectedId}
                    buildingData={buildings}
                    isSimulationMode={isSimMode}
                    overlayMode={overlayMode}
                    simulationImprovements={{
                      electricity_reduction: isSimMode ? simReductionPct : 0,
                      solar_increase: isSimMode ? 20 : 0,
                      greening_factor: isSimMode ? 1.2 : 1.0,
                    }}
                  />
                </Canvas>
              </Suspense>
            </CanvasErrorBoundary>
          ) : (
            /* 2D High-Contrast Interactive Floorplan Fallback */
            <div className="w-full h-full p-6 overflow-y-auto bg-slate-950 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3 text-xs font-mono text-slate-400 border-b border-slate-800 pb-2">
                  <span className="uppercase text-emerald-400 font-bold">2D High-Efficiency Campus Grid</span>
                  <span>Select any facility to load audit telemetry</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {buildings.map((b) => {
                    const isSelected = selectedId === b.id;
                    const elec = Number(b.latest_electricity || 12000);
                    const score = Number(b.sustainability_score || 70);

                    // Color based on active overlay
                    let statusColor = 'border-slate-800 bg-slate-900/60';
                    if (overlayMode === 'emissions') {
                      statusColor = elec > 13000 ? 'border-rose-500/50 bg-rose-950/20' : elec > 9000 ? 'border-amber-500/50 bg-amber-950/20' : 'border-emerald-500/50 bg-emerald-950/20';
                    } else if (overlayMode === 'score') {
                      statusColor = score >= 75 ? 'border-emerald-500/50 bg-emerald-950/20' : score >= 68 ? 'border-sky-500/50 bg-sky-950/20' : 'border-amber-500/50 bg-amber-950/20';
                    } else if (isSelected) {
                      statusColor = 'border-emerald-400 bg-emerald-950/40 shadow-lg shadow-emerald-950';
                    }

                    return (
                      <div
                        key={b.id}
                        onClick={() => handleSelectBuilding(b.id)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] text-xs font-mono space-y-1.5 ${statusColor} ${
                          isSelected ? 'ring-2 ring-emerald-400' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white truncate">{b.name}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                            {b.type}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span>{elec.toLocaleString()} kWh</span>
                          <span className={score >= 75 ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                            Score: {score}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="text-[10px] font-mono text-slate-500 bg-slate-900/50 p-2.5 rounded-xl border border-slate-800">
                2D Fallback view is active for battery conservation and low-spec environments. Switch back to 3D WebGL anytime.
              </div>
            </div>
          )}

          {/* Controls helper HUD overlay & Overlay Legend */}
          <div className="absolute bottom-4 left-4 right-4 sm:right-auto flex flex-wrap items-center gap-2 pointer-events-none bg-slate-950/80 border border-emerald-500/20 px-3 py-1.5 rounded-lg text-[10px] font-mono text-slate-400 backdrop-blur-md">
            {overlayMode === 'emissions' && (
              <span className="flex items-center gap-3">
                <span className="text-rose-400">● High (&gt;13k kWh)</span>
                <span className="text-amber-400">● Medium (9k-13k kWh)</span>
                <span className="text-emerald-400">● Low (&lt;9k kWh)</span>
              </span>
            )}
            {overlayMode === 'score' && (
              <span className="flex items-center gap-3">
                <span className="text-emerald-400">● Top (&ge;75)</span>
                <span className="text-sky-400">● Moderate (68-74)</span>
                <span className="text-amber-400">● Baseline (&lt;68)</span>
              </span>
            )}
            {overlayMode === 'default' && (
              <span>Left Click: Rotate • Right Click: Pan • Scroll: Zoom • Click Building to Focus</span>
            )}
          </div>
        </div>

        {/* RIGHT: Building Telemetry & AI Recommendations Panel */}
        <div className="w-full lg:w-2/5 h-[52vh] lg:h-full border-t lg:border-t-0 lg:border-l border-emerald-500/20 bg-slate-950/90 backdrop-blur-xl flex flex-col overflow-y-auto">
          {loadingDetail ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-10 h-10 border-2 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin mb-3" />
              <p className="text-xs font-mono text-emerald-400/80">Fetching Meter Telemetry...</p>
            </div>
          ) : buildingDetail ? (
            <div className="p-6 space-y-6">
              {/* Header Title & Eco-Badge */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono uppercase mb-1.5">
                    {buildingDetail.building.type}
                  </div>
                  <h2 className="text-2xl font-black text-white">
                    {buildingDetail.building.name}
                  </h2>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    {buildingDetail.building.floors} Floors • {buildingDetail.building.area_sqft.toLocaleString()} sq ft • {buildingDetail.building.solar_panels} Solar Modules
                  </p>
                </div>

                {/* Circular Sustainability Gauge */}
                <div className="flex flex-col items-center">
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="32"
                        cy="32"
                        r="26"
                        stroke="#1e293b"
                        strokeWidth="5"
                        fill="transparent"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="26"
                        stroke="#10b981"
                        strokeWidth="5"
                        fill="transparent"
                        strokeDasharray={163.3}
                        strokeDashoffset={
                          163.3 - (163.3 * buildingDetail.building.sustainability_score) / 100
                        }
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute text-sm font-black font-mono text-emerald-400">
                      {buildingDetail.building.sustainability_score}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 mt-1">Eco-Score</span>
                </div>
              </div>

              {/* Monthly Consumption Cards (Grid) */}
              <div className="grid grid-cols-3 gap-3">
                <div className="glass-card p-3 text-center">
                  <Zap className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Electricity</span>
                  <div className="text-sm font-bold text-white mt-0.5">
                    {latestReading?.electricity_kwh.toLocaleString() ?? '—'}
                  </div>
                  <span className="text-[9px] font-mono text-emerald-400">kWh</span>
                </div>

                <div className="glass-card p-3 text-center">
                  <Flame className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Natural Gas</span>
                  <div className="text-sm font-bold text-white mt-0.5">
                    {latestReading?.natural_gas_therms.toLocaleString() ?? '—'}
                  </div>
                  <span className="text-[9px] font-mono text-amber-400">therms</span>
                </div>

                <div className="glass-card p-3 text-center">
                  <Droplets className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Water</span>
                  <div className="text-sm font-bold text-white mt-0.5">
                    {latestReading?.water_gallons.toLocaleString() ?? '—'}
                  </div>
                  <span className="text-[9px] font-mono text-cyan-400">gal</span>
                </div>
              </div>

              {/* Carbon Footprint & Campus Comparison Banner */}
              <div className="glass-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
                    <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                    Audited Monthly Emissions
                  </span>
                  <span className="text-sm font-black font-mono text-emerald-400">
                    {buildingDetail.emissions?.total_emissions_kg_co2.toLocaleString()} kg CO₂
                  </span>
                </div>

                {/* Campus Benchmarking */}
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-emerald-500/10 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Vs Campus Average:</span>
                  <span
                    className={
                      comparisonPercent > 0 ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'
                    }
                  >
                    {comparisonPercent > 0 ? `+${comparisonPercent}% higher` : `${Math.abs(comparisonPercent)}% lower`}
                  </span>
                </div>
              </div>

              {/* Energy Trend Micro-Chart */}
              <div className="glass-card p-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>12-Month Electricity Profile (kWh)</span>
                  <span className="text-emerald-400">{latestReading?.month}</span>
                </div>
                <div className="h-28 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={buildingDetail.readings}
                      margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                    >
                      <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 9, fill: '#94a3b8' }} />
                      <YAxis stroke="#64748b" tick={{ fontSize: 9, fill: '#94a3b8' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(15, 23, 42, 0.95)',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          borderRadius: '6px',
                          fontSize: '11px',
                          color: '#f8fafc',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="electricity_kwh"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={false}
                        name="Electricity"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* AI Improvement Recommendations */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    Gemini AI Facility Retrofits
                  </h3>
                  <span className="text-[10px] font-mono text-emerald-400">Priority Ranked</span>
                </div>

                <div className="space-y-2">
                  {recommendations.length > 0 ? (
                    recommendations.map((rec, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-900/60 border border-emerald-500/20 hover:border-emerald-500/40 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-slate-100">{rec.title}</span>
                          <span
                            className={`text-[9px] font-mono px-2 py-0.5 rounded uppercase ${
                              rec.priority?.toLowerCase() === 'high'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            {rec.priority}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed mb-2">
                          {rec.description}
                        </p>
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                          <span className="uppercase text-emerald-400/90">{rec.category || 'EFFICIENCY'}</span>
                          <span className="text-emerald-400 font-semibold">
                            Est. -{rec.estimated_savings_percent || 15}% Emissions
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-center text-xs text-slate-400 font-mono">
                      Generating tailored Gemini recommendations for this facility...
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <Building2 className="w-12 h-12 text-slate-600 mb-3" />
              <p className="text-sm font-medium">Select a Building</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Click any building in the 3D campus viewport or use the facility buttons below.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── BOTTOM FACILITY SELECTOR BAR ──────────────────────────────── */}
      <div className="h-16 border-t border-emerald-500/20 bg-slate-950/95 backdrop-blur-xl px-4 flex items-center overflow-x-auto gap-2 z-20">
        <span className="text-[10px] font-mono uppercase text-slate-500 px-2 flex-shrink-0">
          Facilities:
        </span>
        {buildings.map((b) => (
          <button
            key={b.id}
            onClick={() => handleSelectBuilding(b.id)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
              selectedId === b.id
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/30'
                : 'bg-slate-900 text-slate-300 border border-emerald-500/10 hover:border-emerald-500/40 hover:text-white'
            }`}
          >
            <span>{b.name}</span>
            <span
              className={`text-[10px] ${
                selectedId === b.id ? 'text-slate-950/80 font-bold' : 'text-emerald-400'
              }`}
            >
              {b.sustainability_score}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
