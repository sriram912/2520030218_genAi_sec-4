import React, { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import CampusModel3D from '../components/3d/CampusModel3D';
import SceneSetup from '../components/3d/SceneSetup';
import FloatingParticles from '../components/3d/FloatingParticles';
import { CanvasErrorBoundary, CanvasLoadingFallback } from '../components/3d/CanvasContainer';
import { api } from '../utils/api';
import {
  Building,
  ImpactCalculation,
  Scenario,
} from '../types';
import {
  Sliders,
  Play,
  RotateCcw,
  Save,
  Zap,
  Truck,
  Trash2,
  TrendingDown,
  ArrowRight,
  ShieldCheck,
  Building2,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Info,
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
} from 'recharts';

export default function ImpactLabPage() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [baselineCalculation, setBaselineCalculation] = useState<ImpactCalculation | null>(null);

  // Baseline Current Numerical Values
  const [currentElecKwh, setCurrentElecKwh] = useState<number>(12500);
  const [currentTransKm, setCurrentTransKm] = useState<number>(4200);
  const [currentFoodKg, setCurrentFoodKg] = useState<number>(450);
  const [currentPlasticKg, setCurrentPlasticKg] = useState<number>(280);
  const [currentPaperKg, setCurrentPaperKg] = useState<number>(320);

  // Simulated Slider Values (Target Numbers & Percentage Reductions)
  const [simElecKwh, setSimElecKwh] = useState<number>(9375); // -25%
  const [simTransKm, setSimTransKm] = useState<number>(2940); // -30%
  const [simFoodKg, setSimFoodKg] = useState<number>(225); // -50%
  const [simPlasticKg, setSimPlasticKg] = useState<number>(140); // -50%
  const [simPaperKg, setSimPaperKg] = useState<number>(160); // -50%

  // Capital Cost Estimation
  const [estimatedCostUsd, setEstimatedCostUsd] = useState<number>(28000);
  const [scenarioName, setScenarioName] = useState('My Proposed Decarbonization Plan');
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Simulation Computed Results
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [selectedBuildingId, setSelectedBuildingId] = useState<number>(1);

  // Load Baseline Data on Mount
  useEffect(() => {
    let isMounted = true;
    async function loadBaseline() {
      try {
        const [bldList, calcList] = await Promise.all([
          api.getBuildings().catch(() => []),
          api.getCalculations().catch(() => []),
        ]);

        if (isMounted) {
          setBuildings(bldList);
          if (calcList.length > 0) {
            const base = calcList[0];
            setBaselineCalculation(base);

            const bElec = base.breakdown?.electricity?.consumption_kwh || 12500;
            const bTrans = base.breakdown?.transportation?.distance_km || 4200;
            const bWaste = base.activity_data?.waste;

            setCurrentElecKwh(bElec);
            setCurrentTransKm(bTrans);
            setCurrentFoodKg(bWaste?.food_waste_kg || 450);
            setCurrentPlasticKg(bWaste?.plastic_waste_kg || 280);
            setCurrentPaperKg(bWaste?.paper_waste_kg || 320);

            // Set simulated initial values (-20% default)
            setSimElecKwh(Math.round(bElec * 0.8));
            setSimTransKm(Math.round(bTrans * 0.8));
            setSimFoodKg(Math.round((bWaste?.food_waste_kg || 450) * 0.7));
            setSimPlasticKg(Math.round((bWaste?.plastic_waste_kg || 280) * 0.7));
            setSimPaperKg(Math.round((bWaste?.paper_waste_kg || 320) * 0.7));
          }
        }
      } catch (err) {
        console.warn('Simulator baseline note:', err);
      }
    }
    loadBaseline();
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute Immediate Deterministic Scenario Results whenever sliders change
  useEffect(() => {
    // Factors
    const elecFactor = 0.417; // kg CO2e / kWh
    const transFactor = 0.890; // shuttle transit factor
    const foodFactor = 1.15; // landfill food factor
    const plasticFactor = 0.04;
    const paperFactor = 1.28;
    const generalFactor = 0.587;
    const baseGeneralKg = 1100;

    // Baseline Emissions
    const baseElecEmissions = currentElecKwh * elecFactor;
    const baseTransEmissions = currentTransKm * transFactor;
    const baseWasteEmissions =
      currentFoodKg * foodFactor +
      currentPlasticKg * plasticFactor +
      currentPaperKg * paperFactor +
      baseGeneralKg * generalFactor;
    const baseTotalEmissions = baseElecEmissions + baseTransEmissions + baseWasteEmissions;

    // Simulated Emissions
    const simElecEmissions = simElecKwh * elecFactor;
    const simTransEmissions = simTransKm * transFactor;
    const simWasteEmissions =
      simFoodKg * foodFactor +
      simPlasticKg * plasticFactor +
      simPaperKg * paperFactor +
      baseGeneralKg * generalFactor;
    const simTotalEmissions = simElecEmissions + simTransEmissions + simWasteEmissions;

    const carbonSaved = Math.max(0, baseTotalEmissions - simTotalEmissions);
    const reductionPercent =
      baseTotalEmissions > 0 ? (carbonSaved / baseTotalEmissions) * 100 : 0;

    setSimulationResult({
      baseline_emissions_kg: Math.round(baseTotalEmissions * 10) / 10,
      simulated_emissions_kg: Math.round(simTotalEmissions * 10) / 10,
      carbon_saved_kg: Math.round(carbonSaved * 10) / 10,
      carbon_saved_tonnes: Math.round((carbonSaved / 1000) * 100) / 100,
      reduction_percentage: Math.round(reductionPercent * 10) / 10,
      categories: [
        {
          name: 'Electricity',
          baseline: Math.round(baseElecEmissions),
          simulated: Math.round(simElecEmissions),
          saved: Math.round(baseElecEmissions - simElecEmissions),
        },
        {
          name: 'Transportation',
          baseline: Math.round(baseTransEmissions),
          simulated: Math.round(simTransEmissions),
          saved: Math.round(baseTransEmissions - simTransEmissions),
        },
        {
          name: 'Solid Waste',
          baseline: Math.round(baseWasteEmissions),
          simulated: Math.round(simWasteEmissions),
          saved: Math.round(baseWasteEmissions - simWasteEmissions),
        },
      ],
    });
  }, [
    currentElecKwh,
    currentTransKm,
    currentFoodKg,
    currentPlasticKg,
    currentPaperKg,
    simElecKwh,
    simTransKm,
    simFoodKg,
    simPlasticKg,
    simPaperKg,
  ]);

  // Save Scenario to Comparison Pool
  const handleSaveScenario = async () => {
    if (!simulationResult) return;
    try {
      const elecRedPct = Math.round(((currentElecKwh - simElecKwh) / currentElecKwh) * 100);
      const transRedPct = Math.round(((currentTransKm - simTransKm) / currentTransKm) * 100);
      const foodRedPct = Math.round(((currentFoodKg - simFoodKg) / currentFoodKg) * 100);

      const scenarioToSave: Partial<Scenario> = {
        name: scenarioName || `Scenario ${Date.now()}`,
        description: `Simulated intervention: ${elecRedPct}% electricity reduction, ${transRedPct}% transit reduction`,
        adjustments: {
          electricity_percent: elecRedPct,
          transport_percent: transRedPct,
          food_waste_percent: foodRedPct,
        },
        estimated_cost_usd: estimatedCostUsd,
        payback_years: Math.round((estimatedCostUsd / Math.max(1, simulationResult.carbon_saved_kg * 0.15)) * 10) / 10,
        calculated: {
          baseline_emissions_kg: simulationResult.baseline_emissions_kg,
          simulated_emissions_kg: simulationResult.simulated_emissions_kg,
          carbon_saved_kg: simulationResult.carbon_saved_kg,
          reduction_percentage: simulationResult.reduction_percentage,
        },
      };

      await api.saveScenario(scenarioToSave);
      setSaveSuccessMessage(`Scenario "${scenarioName}" saved to Comparison Pool!`);
      setTimeout(() => setSaveSuccessMessage(null), 4000);
    } catch (err: any) {
      console.error('Failed to save scenario:', err);
    }
  };

  // Reset sliders back to baseline
  const handleResetToBaseline = () => {
    setSimElecKwh(currentElecKwh);
    setSimTransKm(currentTransKm);
    setSimFoodKg(currentFoodKg);
    setSimPlasticKg(currentPlasticKg);
    setSimPaperKg(currentPaperKg);
  };

  // Percentage Helpers
  const calcPercent = (current: number, simulated: number) => {
    if (current <= 0) return 0;
    return Math.round(((current - simulated) / current) * 100);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* ── HEADER BANNER ────────────────────────────────────────────── */}
      <div className="glass-card p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono">
            <Sliders className="w-3.5 h-3.5" />
            WHAT-IF SIMULATION ENGINE • ZERO HISTORICAL RECORD OVERWRITE
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Impact Lab – What Happens If?
          </h1>
          <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
            Experiment with proactive decarbonization strategies before committing capital budgets. 
            Adjust operational sliders to instantly observe deterministic carbon savings and dynamic 3D facility luminescence.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 z-10">
          <button
            onClick={handleResetToBaseline}
            className="px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-900 text-slate-300 text-xs font-mono flex items-center gap-1.5 hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Baseline</span>
          </button>
          <button
            onClick={() => setScenarioName(`${scenarioName} (Variant ${new Date().toLocaleTimeString().slice(0, 5)})`)}
            className="px-3.5 py-2 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs font-mono flex items-center gap-1.5 hover:bg-amber-500/20 transition-colors"
          >
            <span>Duplicate Draft</span>
          </button>
          <a
            href="/scenarios"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs font-mono flex items-center gap-1.5 hover:brightness-110 shadow-lg shadow-emerald-500/20 transition-all"
          >
            <span>Compare Portfolios</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Save Success Alert Notification */}
      {saveSuccessMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{saveSuccessMessage}</span>
          </div>
          <a href="/scenarios" className="underline font-bold text-white hover:text-emerald-300">
            View in Scenario Comparison →
          </a>
        </motion.div>
      )}

      {/* ── SPLIT WORKBENCH: CONTROLS & 3D INTERACTIVE VISUALIZER ─────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: INTERACTIVE LEVERS & SLIDERS (6 Cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="glass-card p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-emerald-500/10 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  Intervention Levers & Operational Target Sliders
                </h3>
                <p className="text-[11px] font-mono text-slate-400">
                  Slide or enter proposed activity levels relative to actual baseline.
                </p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                Live Re-calculation
              </span>
            </div>

            {/* 1. Electricity Lever */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-emerald-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <Zap className="w-4 h-4" />
                  Facility Electricity (kWh)
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                  -{calcPercent(currentElecKwh, simElecKwh)}% Load
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-2 rounded bg-slate-950/70 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block">Actual Baseline</span>
                  <span className="text-white font-bold">{currentElecKwh.toLocaleString()} kWh</span>
                </div>
                <div className="p-2 rounded bg-slate-950/70 border border-emerald-500/30">
                  <span className="text-[10px] text-emerald-400 uppercase block">Simulated Target</span>
                  <input
                    type="number"
                    min="0"
                    max={currentElecKwh * 1.5}
                    value={simElecKwh}
                    onChange={(e) => setSimElecKwh(Number(e.target.value))}
                    className="w-full bg-transparent text-emerald-300 font-bold focus:outline-none"
                  />
                </div>
              </div>

              <input
                type="range"
                min="0"
                max={currentElecKwh}
                step="250"
                value={simElecKwh}
                onChange={(e) => setSimElecKwh(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* 2. Transportation Lever */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-sky-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                  <Truck className="w-4 h-4" />
                  Transit Activity (vehicle-km)
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold">
                  -{calcPercent(currentTransKm, simTransKm)}% Travel
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-2 rounded bg-slate-950/70 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block">Actual Baseline</span>
                  <span className="text-white font-bold">{currentTransKm.toLocaleString()} km</span>
                </div>
                <div className="p-2 rounded bg-slate-950/70 border border-sky-500/30">
                  <span className="text-[10px] text-sky-400 uppercase block">Simulated Target</span>
                  <input
                    type="number"
                    min="0"
                    max={currentTransKm * 1.5}
                    value={simTransKm}
                    onChange={(e) => setSimTransKm(Number(e.target.value))}
                    className="w-full bg-transparent text-sky-300 font-bold focus:outline-none"
                  />
                </div>
              </div>

              <input
                type="range"
                min="0"
                max={currentTransKm}
                step="100"
                value={simTransKm}
                onChange={(e) => setSimTransKm(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
              />
            </div>

            {/* 3. Solid Waste Fractions */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-amber-500/20 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Trash2 className="w-4 h-4" />
                  Landfill Waste Reduction Levers
                </span>
                <span className="text-[10px] font-mono text-amber-400">Composting & Recycling</span>
              </div>

              {/* Food waste slider */}
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Food Waste Diversion:</span>
                  <span className="text-amber-300">
                    {simFoodKg} kg (Base: {currentFoodKg} kg • -{calcPercent(currentFoodKg, simFoodKg)}%)
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={currentFoodKg}
                  step="10"
                  value={simFoodKg}
                  onChange={(e) => setSimFoodKg(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>

              {/* Plastic waste slider */}
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Plastic Polymer Reduction:</span>
                  <span className="text-amber-300">
                    {simPlasticKg} kg (Base: {currentPlasticKg} kg • -{calcPercent(currentPlasticKg, simPlasticKg)}%)
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={currentPlasticKg}
                  step="10"
                  value={simPlasticKg}
                  onChange={(e) => setSimPlasticKg(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>

              {/* Paper waste slider */}
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Paperless Workflow Target:</span>
                  <span className="text-amber-300">
                    {simPaperKg} kg (Base: {currentPaperKg} kg • -{calcPercent(currentPaperKg, simPaperKg)}%)
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={currentPaperKg}
                  step="10"
                  value={simPaperKg}
                  onChange={(e) => setSimPaperKg(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>
            </div>

            {/* Scenario Name & Save Bar */}
            <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/20 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">
                    Scenario Title
                  </label>
                  <input
                    type="text"
                    value={scenarioName}
                    onChange={(e) => setScenarioName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400 font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">
                    Estimated Implementation Capital ($USD)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={estimatedCostUsd}
                    onChange={(e) => setEstimatedCostUsd(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400 font-mono"
                  />
                </div>
              </div>

              <button
                onClick={handleSaveScenario}
                className="w-full py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs font-mono uppercase tracking-wider hover:brightness-110 active:scale-95 shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save as Scenario for Committee Comparison
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 3D DIGITAL TWIN & REAL-TIME IMPACT DASHBOARD (6 Cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* 3D Campus Scene Reflecting Simulated Levers */}
          <div className="glass-card h-72 relative overflow-hidden">
            <div className="absolute top-3 left-3 z-10 flex items-center gap-2 px-3 py-1 rounded bg-slate-950/80 border border-emerald-500/30 text-[10px] font-mono text-emerald-400 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>3D SPATIAL RESPONSE GLOW ACTIVE</span>
            </div>

            <div className="absolute top-3 right-3 z-10">
              <select
                value={selectedBuildingId}
                onChange={(e) => setSelectedBuildingId(Number(e.target.value))}
                className="bg-slate-950/80 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono rounded px-2 py-1 focus:outline-none"
              >
                {buildings.map((b) => (
                  <option key={b.id} value={b.id}>
                    Focus: {b.name}
                  </option>
                ))}
              </select>
            </div>

            <CanvasErrorBoundary>
              <Suspense fallback={<CanvasLoadingFallback text="Updating 3D Simulation Mesh..." />}>
                <Canvas camera={{ position: [14, 11, 14], fov: 42 }}>
                  <SceneSetup enableControls={true} enableStars={false} fog={true} />
                  <FloatingParticles count={50} area={20} speed={0.2} />
                  <CampusModel3D
                    selectedBuildingId={selectedBuildingId}
                    buildingData={buildings}
                    isSimulationMode={true}
                    simulationImprovements={{
                      electricity_reduction: calcPercent(currentElecKwh, simElecKwh),
                    }}
                  />
                </Canvas>
              </Suspense>
            </CanvasErrorBoundary>
          </div>

          {/* Real-Time Impact Metric Cards */}
          {simulationResult && (
            <div className="space-y-4">
              {/* Savings Highlight Box */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-950/70 via-slate-900/90 to-teal-950/70 border border-emerald-500/40 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 block mb-1">
                    Projected Carbon Abatement
                  </span>
                  <div className="text-4xl font-black text-white">
                    -{simulationResult.carbon_saved_kg.toLocaleString()}{' '}
                    <span className="text-base font-normal text-emerald-400 font-mono">kg CO₂e</span>
                  </div>
                  <span className="text-xs text-slate-300 font-mono mt-1 block">
                    = -{simulationResult.carbon_saved_tonnes} Metric Tonnes Avoided Monthly
                  </span>
                </div>

                <div className="px-5 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-right">
                  <span className="text-3xl font-black font-mono text-emerald-400">
                    -{simulationResult.reduction_percentage}%
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                    Net Abatement
                  </span>
                </div>
              </div>

              {/* Tangible Environmental Equivalents */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-emerald-500/20 text-center">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">Urban Trees Planted</span>
                  <span className="text-xl font-bold font-mono text-emerald-400">
                    {Math.round(simulationResult.carbon_saved_kg / 21.77).toLocaleString()}
                  </span>
                  <span className="text-[9px] text-slate-500 block">EPA: 21.8 kg/yr</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-sky-500/20 text-center">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">Passenger Cars Off Road</span>
                  <span className="text-xl font-bold font-mono text-sky-400">
                    {Math.round((simulationResult.carbon_saved_kg / 383) * 10) / 10}
                  </span>
                  <span className="text-[9px] text-slate-500 block">Cars / month</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-amber-500/20 text-center">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">Utility Bill Savings</span>
                  <span className="text-xl font-bold font-mono text-amber-300">
                    ${Math.round(simulationResult.carbon_saved_kg * 0.16).toLocaleString()}
                  </span>
                  <span className="text-[9px] text-slate-500 block">Estimated monthly</span>
                </div>
              </div>

              {/* Side-by-Side Baseline vs Simulated Comparison */}
              <div className="grid grid-cols-2 gap-4">
                {/* Actual Baseline */}
                <div className="glass-card p-4 space-y-2 border-slate-700">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block pb-1 border-b border-slate-800">
                    ACTUAL BASELINE DATA
                  </span>
                  <div className="text-xl font-black text-slate-200">
                    {simulationResult.baseline_emissions_kg.toLocaleString()}{' '}
                    <span className="text-xs font-normal text-slate-400 font-mono">kg</span>
                  </div>
                  <div className="space-y-1 text-[11px] font-mono text-slate-400 pt-1">
                    <div>Power: {currentElecKwh.toLocaleString()} kWh</div>
                    <div>Transit: {currentTransKm.toLocaleString()} km</div>
                  </div>
                </div>

                {/* Simulated Scenario */}
                <div className="glass-card p-4 space-y-2 border-emerald-500/40 bg-emerald-950/20">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 block pb-1 border-b border-emerald-500/20">
                    SIMULATED SCENARIO DATA
                  </span>
                  <div className="text-xl font-black text-emerald-300">
                    {simulationResult.simulated_emissions_kg.toLocaleString()}{' '}
                    <span className="text-xs font-normal text-emerald-400 font-mono">kg</span>
                  </div>
                  <div className="space-y-1 text-[11px] font-mono text-emerald-400 pt-1">
                    <div>Power: {simElecKwh.toLocaleString()} kWh</div>
                    <div>Transit: {simTransKm.toLocaleString()} km</div>
                  </div>
                </div>
              </div>

              {/* Category-Wise Delta Comparison Chart */}
              <div className="glass-card p-5 space-y-3">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block">
                  Category Abatement Breakdown (kg CO₂e)
                </span>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={simulationResult.categories}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(16, 185, 129, 0.1)" />
                      <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                      <YAxis stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(15, 23, 42, 0.95)',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          borderRadius: '8px',
                          fontSize: '11px',
                          color: '#f8fafc',
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                      <Bar dataKey="baseline" name="Baseline" fill="#475569" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="simulated" name="Simulated Target" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
