import React, { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import CampusModel3D from '../components/3d/CampusModel3D';
import SceneSetup from '../components/3d/SceneSetup';
import FloatingParticles from '../components/3d/FloatingParticles';
import { CanvasErrorBoundary, CanvasLoadingFallback } from '../components/3d/CanvasContainer';
import { api } from '../utils/api';
import { Building, SimulationResult } from '../types';
import {
  Sliders,
  Play,
  RotateCcw,
  Zap,
  Flame,
  Droplets,
  Trash2,
  Recycle,
  AlertTriangle,
  CheckCircle,
  TrendingDown,
  ArrowRight,
  ShieldCheck,
  Building2,
  Sparkles,
} from 'lucide-react';

export default function SimulatorPage() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState<number>(1);
  const [electricityReduction, setElectricityReduction] = useState<number>(20);
  const [gasReduction, setGasReduction] = useState<number>(15);
  const [waterReduction, setWaterReduction] = useState<number>(10);
  const [wasteReduction, setWasteReduction] = useState<number>(15);
  const [recyclingIncrease, setRecyclingIncrease] = useState<number>(25);

  const [simResult, setSimResult] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Load buildings list
  useEffect(() => {
    let isMounted = true;
    async function loadBuildings() {
      try {
        const list = await api.getBuildings();
        if (isMounted) {
          setBuildings(list);
          if (list.length > 0) setSelectedBuildingId(list[0].id);
        }
      } catch (err) {
        console.warn('Error fetching building list', err);
      } finally {
        if (isMounted) setInitialLoading(false);
      }
    }
    loadBuildings();
    return () => {
      isMounted = false;
    };
  }, []);

  // Run initial default simulation once building is loaded
  useEffect(() => {
    if (selectedBuildingId) {
      handleRunSimulation();
    }
  }, [selectedBuildingId]);

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    try {
      const res = await api.simulate(selectedBuildingId, {
        electricity_reduction: electricityReduction,
        gas_reduction: gasReduction,
        water_reduction: waterReduction,
        waste_reduction: wasteReduction,
        recycling_increase: recyclingIncrease,
      });
      setSimResult(res);
    } catch (err) {
      console.error('Simulation calculation failed', err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleResetSliders = () => {
    setElectricityReduction(0);
    setGasReduction(0);
    setWaterReduction(0);
    setWasteReduction(0);
    setRecyclingIncrease(0);
  };

  const selectedBuilding = buildings.find((b) => b.id === selectedBuildingId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* ── HEADER BANNER ────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 glass-card">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono mb-2">
            <AlertTriangle className="w-3.5 h-3.5" />
            WHAT-IF SIMULATION BENCHMARK • DETERMINISTIC ARITHMETIC
          </div>
          <h1 className="text-3xl font-extrabold text-white">
            3D Scenario Simulator
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Simulate operational decarbonization strategies and observe real-time 3D campus responses.
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch md:self-auto">
          <button
            onClick={handleResetSliders}
            className="flex-1 md:flex-none px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-slate-300 hover:text-white text-xs font-mono flex items-center justify-center gap-2 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Parameters
          </button>
          <button
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="flex-1 md:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-xs font-bold font-mono flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            {isSimulating ? 'Computing...' : 'Recalculate Projections'}
          </button>
        </div>
      </div>

      {/* ── MAIN GRID: CONTROLS & 3D SIMULATION CANVAS ───────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: PARAMETER SLIDERS (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Facility Target Selection */}
          <div className="glass-card p-5 space-y-3">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-400" />
              Target Campus Facility
            </label>
            <select
              value={selectedBuildingId}
              onChange={(e) => setSelectedBuildingId(Number(e.target.value))}
              className="w-full bg-slate-900 border border-emerald-500/30 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400 transition-colors"
            >
              {buildings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.type}) • Score {b.sustainability_score}
                </option>
              ))}
            </select>
          </div>

          {/* Operational Sliders */}
          <div className="glass-card p-5 space-y-5">
            <div className="flex items-center justify-between border-b border-emerald-500/10 pb-3">
              <span className="text-xs font-mono font-bold uppercase text-emerald-400 flex items-center gap-2">
                <Sliders className="w-4 h-4" />
                Intervention Levers
              </span>
              <span className="text-[10px] font-mono text-slate-500">Live Adjustment</span>
            </div>

            {/* Slider 1: Electricity */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  Electricity Reduction
                </span>
                <span className="text-emerald-400 font-bold">-{electricityReduction}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                value={electricityReduction}
                onChange={(e) => setElectricityReduction(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[9px] font-mono text-slate-500">
                <span>0% (Baseline)</span>
                <span>25% (HVAC Retrofit)</span>
                <span>50% (Max Deep Retrofit)</span>
              </div>
            </div>

            {/* Slider 2: Natural Gas */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  Heating Gas Reduction
                </span>
                <span className="text-amber-400 font-bold">-{gasReduction}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                value={gasReduction}
                onChange={(e) => setGasReduction(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Slider 3: Water */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                  Water Conservation
                </span>
                <span className="text-cyan-400 font-bold">-{waterReduction}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                value={waterReduction}
                onChange={(e) => setWaterReduction(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>

            {/* Slider 4: Solid Waste */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  Landfill Waste Reduction
                </span>
                <span className="text-rose-400 font-bold">-{wasteReduction}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                value={wasteReduction}
                onChange={(e) => setWasteReduction(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
            </div>

            {/* Slider 5: Recycling */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Recycle className="w-3.5 h-3.5 text-emerald-400" />
                  Recycling Diverted
                </span>
                <span className="text-emerald-400 font-bold">+{recyclingIncrease}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="10"
                value={recyclingIncrease}
                onChange={(e) => setRecyclingIncrease(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 3D SIMULATION VISUALIZER & RESULTS (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* 3D Campus Responsive Scene */}
          <div className="glass-card overflow-hidden h-80 relative">
            <div className="absolute top-3 left-3 z-10 flex items-center gap-2 px-2.5 py-1 rounded bg-slate-950/80 border border-emerald-500/30 text-[10px] font-mono text-emerald-400 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>3D SIMULATION GLOW ENGINE ACTIVE</span>
            </div>

            <CanvasErrorBoundary>
              <Suspense fallback={<CanvasLoadingFallback text="Updating 3D Simulation..." />}>
                <Canvas camera={{ position: [14, 11, 14], fov: 42 }}>
                  <SceneSetup enableControls={true} enableStars={false} fog={true} />
                  <FloatingParticles count={60} area={20} speed={0.2} />
                  <CampusModel3D
                    selectedBuildingId={selectedBuildingId}
                    buildingData={buildings}
                    isSimulationMode={true}
                    simulationImprovements={{
                      electricity_reduction: electricityReduction,
                    }}
                  />
                </Canvas>
              </Suspense>
            </CanvasErrorBoundary>
          </div>

          {/* SIMULATION SUMMARY CARDS */}
          {simResult && (
            <div className="space-y-4">
              {/* Highlight Savings Banner */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900/80 to-teal-950/60 border border-emerald-500/30 backdrop-blur-xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 flex items-center gap-1.5 mb-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      Calculated Carbon Avoidance
                    </span>
                    <div className="text-3xl sm:text-4xl font-black text-white">
                      -{simResult.savings_kg_co2.toLocaleString()}
                      <span className="text-sm font-normal text-emerald-400 ml-2 font-mono">
                        kg CO₂ / Month
                      </span>
                    </div>
                  </div>

                  <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-right">
                    <span className="text-2xl font-black font-mono text-emerald-400">
                      -{simResult.savings_percent}%
                    </span>
                    <p className="text-[10px] font-mono text-slate-400">Net Facility Abatement</p>
                  </div>
                </div>
              </div>

              {/* Side-by-Side Current vs Simulated Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Measured Baseline */}
                <div className="glass-card p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-mono uppercase text-slate-400">
                      Measured Baseline
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {simResult.month}
                    </span>
                  </div>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between text-slate-300">
                      <span>Electricity Load:</span>
                      <span>{simResult.current.data.electricity_kwh.toLocaleString()} kWh</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Natural Gas:</span>
                      <span>{simResult.current.data.natural_gas_therms.toLocaleString()} therms</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Total Baseline CO₂:</span>
                      <span className="text-slate-100 font-bold">
                        {simResult.current.emissions.total_emissions_kg_co2.toLocaleString()} kg
                      </span>
                    </div>
                  </div>
                </div>

                {/* Simulated Target */}
                <div className="glass-card p-4 space-y-3 border-emerald-500/40">
                  <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                    <span className="text-xs font-mono uppercase text-emerald-400">
                      Simulated Target
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                      PROJECTION
                    </span>
                  </div>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between text-slate-300">
                      <span>Simulated Electricity:</span>
                      <span className="text-emerald-400">
                        {Math.round(simResult.simulated.data.electricity_kwh).toLocaleString()} kWh
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Simulated Natural Gas:</span>
                      <span className="text-emerald-400">
                        {Math.round(simResult.simulated.data.natural_gas_therms).toLocaleString()} therms
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Simulated Output:</span>
                      <span className="text-emerald-400 font-bold">
                        {simResult.simulated.emissions.total_emissions_kg_co2.toLocaleString()} kg
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Verified Emission Factors Footnote */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] font-mono text-slate-400 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>
                  Formulas computed with deterministic EPA eGRID factor (0.417 kg CO₂/kWh), 
                  combustion factor (5.3 kg CO₂/therm), and EPA WARM recycling offset (-183 kg CO₂/ton).
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
