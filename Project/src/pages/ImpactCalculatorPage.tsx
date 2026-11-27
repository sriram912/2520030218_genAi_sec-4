import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../utils/api';
import CanvasContainer from '../components/3d/CanvasContainer';
import EnergyGrid3D from '../components/3d/EnergyGrid3D';
import TransitFleet3D from '../components/3d/TransitFleet3D';
import WasteSegregation3D from '../components/3d/WasteSegregation3D';
import CarbonSphere3D from '../components/3d/CarbonSphere3D';
import {
  Building,
  CampusActivity,
  ImpactCalculation,
  AIRecommendation,
  RegionEmissionFactor,
} from '../types';
import {
  Zap,
  Truck,
  Trash2,
  Calculator,
  Save,
  RotateCcw,
  Sparkles,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Layers,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Building2,
  FileText,
  BookmarkCheck,
  ListFilter,
  BarChart2,
  PieChart as PieIcon,
  HelpCircle,
  Upload,
  Globe,
  FileSpreadsheet,
  X,
  Info,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const PIE_COLORS = ['#10b981', '#38bdf8', '#fbbf24', '#a855f7'];

export default function ImpactCalculatorPage() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [activitiesList, setActivitiesList] = useState<CampusActivity[]>([]);
  const [savedCalculations, setSavedCalculations] = useState<ImpactCalculation[]>([]);
  const [regions, setRegions] = useState<RegionEmissionFactor[]>([]);

  // Navigation & Mode State
  const [activeTab, setActiveTab] = useState<'form' | 'history'>('form');
  const [inputMode, setInputMode] = useState<'form' | 'wizard'>('form');
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [selectedActivityId, setSelectedActivityId] = useState<number | null>(null);
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [csvMessage, setCsvMessage] = useState<string | null>(null);

  // Audit Meta
  const [auditTitle, setAuditTitle] = useState('Campus Operations Footprint Audit');
  const [reportingPeriod, setReportingPeriod] = useState('2026-10');
  const [selectedRegion, setSelectedRegion] = useState<string>('US_EGRID');

  // A. Electricity State
  const [buildingId, setBuildingId] = useState<number>(1);
  const [elecMonth, setElecMonth] = useState('2026-10');
  const [elecKwh, setElecKwh] = useState<number>(12500);
  const [elecNotes, setElecNotes] = useState('Laboratory ventilation fans and chiller operation');

  // B. Transportation State
  const [vehicleCategory, setVehicleCategory] = useState<'passenger_car' | 'campus_shuttle' | 'motorcycle' | 'utility_van'>('campus_shuttle');
  const [fuelType, setFuelType] = useState<'petrol' | 'diesel' | 'electric' | 'cng'>('diesel');
  const [distanceKm, setDistanceKm] = useState<number>(4200);
  const [vehicleCount, setVehicleCount] = useState<number>(4);
  const [fuelLiters, setFuelLiters] = useState<number>(850);
  const [transPeriod, setTransPeriod] = useState('Monthly');

  // C. Waste State
  const [foodWasteKg, setFoodWasteKg] = useState<number>(450);
  const [plasticWasteKg, setPlasticWasteKg] = useState<number>(280);
  const [paperWasteKg, setPaperWasteKg] = useState<number>(320);
  const [generalWasteKg, setGeneralWasteKg] = useState<number>(1100);
  const [disposalMethod, setDisposalMethod] = useState<'landfill' | 'compost' | 'recycled' | 'waste_to_energy'>('landfill');

  // Calculation & AI Results State
  const [calculationResult, setCalculationResult] = useState<ImpactCalculation | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>([]);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiProvider, setAiProvider] = useState<string>('');
  const [aiMessage, setAiMessage] = useState<string | null>(null);

  // Load initial references
  useEffect(() => {
    let isMounted = true;
    async function loadInitialData() {
      try {
        const [bldRes, actRes, calcRes, regionsRes] = await Promise.all([
          api.getBuildings().catch(() => []),
          api.getActivities().catch(() => []),
          api.getCalculations().catch(() => []),
          api.getRegionalEmissionFactors().catch(() => ({ default_region: 'US_EGRID', regions: [] })),
        ]);
        if (isMounted) {
          setBuildings(bldRes);
          setActivitiesList(actRes);
          setSavedCalculations(calcRes);
          if (regionsRes.regions && regionsRes.regions.length > 0) {
            setRegions(regionsRes.regions);
            const savedDefault = localStorage.getItem('greencampus_default_region');
            setSelectedRegion(savedDefault || regionsRes.default_region || 'US_EGRID');
          }
          if (calcRes.length > 0) {
            setCalculationResult(calcRes[0]);
            const recs = await api.getRecommendations(calcRes[0].id).catch(() => []);
            setAiRecommendations(recs);
          }
        }
      } catch (err) {
        console.warn('Initialization note:', err);
      }
    }
    loadInitialData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Validation Warnings
  const warnings: string[] = [];
  if (elecKwh > 100000) {
    warnings.push('High electricity volume: >100,000 kWh exceeds standard academic block baseline by +140%.');
  }
  if (elecKwh < 0 || distanceKm < 0 || foodWasteKg < 0 || plasticWasteKg < 0 || paperWasteKg < 0 || generalWasteKg < 0) {
    warnings.push('Negative values are not valid for physical meters.');
  }
  if (distanceKm > 50000) {
    warnings.push('Distance >50,000 km exceeds typical monthly single-route campus transit.');
  }

  // Handle Loading an Existing Activity into Form
  const handleLoadActivity = (act: CampusActivity) => {
    setSelectedActivityId(act.id || null);
    setAuditTitle(act.title);
    setReportingPeriod(act.reporting_period);

    if (act.electricity) {
      setBuildingId(act.electricity.building_id || 1);
      setElecMonth(act.electricity.reporting_month || act.reporting_period);
      setElecKwh(act.electricity.consumption_kwh || 0);
      setElecNotes(act.electricity.notes || '');
    }

    if (act.transportation) {
      setVehicleCategory(act.transportation.vehicle_category || 'campus_shuttle');
      setFuelType(act.transportation.fuel_type || 'diesel');
      setDistanceKm(act.transportation.distance_km || 0);
      setVehicleCount(act.transportation.vehicle_count || 1);
      setFuelLiters(act.transportation.fuel_liters || 0);
      setTransPeriod(act.transportation.reporting_period || 'Monthly');
    }

    if (act.waste) {
      setFoodWasteKg(act.waste.food_waste_kg || 0);
      setPlasticWasteKg(act.waste.plastic_waste_kg || 0);
      setPaperWasteKg(act.waste.paper_waste_kg || 0);
      setGeneralWasteKg(act.waste.general_waste_kg || 0);
      setDisposalMethod(act.waste.disposal_method || 'landfill');
    }

    setActiveTab('form');
  };

  // Build Payload from form
  const getPayload = (): Partial<CampusActivity> => {
    const selectedBld = buildings.find((b) => b.id === Number(buildingId));
    return {
      id: selectedActivityId || undefined,
      title: auditTitle,
      reporting_period: reportingPeriod,
      electricity: {
        building_id: Number(buildingId),
        building_name: selectedBld?.name || 'Science Building',
        reporting_month: elecMonth,
        consumption_kwh: Number(elecKwh) || 0,
        notes: elecNotes,
      },
      transportation: {
        vehicle_category: vehicleCategory,
        fuel_type: fuelType,
        distance_km: Number(distanceKm) || 0,
        vehicle_count: Number(vehicleCount) || 1,
        fuel_liters: Number(fuelLiters) || 0,
        reporting_period: transPeriod,
      },
      waste: {
        food_waste_kg: Number(foodWasteKg) || 0,
        plastic_waste_kg: Number(plasticWasteKg) || 0,
        paper_waste_kg: Number(paperWasteKg) || 0,
        general_waste_kg: Number(generalWasteKg) || 0,
        disposal_method: disposalMethod,
      },
    };
  };

  // 1. Calculate Emissions (Deterministic)
  const handleCalculateEmissions = async () => {
    setIsCalculating(true);
    setAiMessage(null);
    try {
      const payload = getPayload();
      const res = await api.calculateImpact(payload, true, auditTitle, selectedRegion);
      setCalculationResult(res.results);

      // Refresh calculation history
      const updatedCalcs = await api.getCalculations();
      setSavedCalculations(updatedCalcs);

      // Save activity if not already saved
      const savedAct = await api.saveActivity(payload as CampusActivity);
      setSelectedActivityId(savedAct.id || null);
      const updatedActs = await api.getActivities();
      setActivitiesList(updatedActs);
    } catch (err: any) {
      console.error('Calculation error:', err);
    } finally {
      setIsCalculating(false);
    }
  };

  // 2. Generate Gemini AI Recommendations
  const handleGenerateAiRecommendations = async () => {
    if (!calculationResult) return;
    setIsGeneratingAi(true);
    setAiMessage(null);
    try {
      const res = await api.generateImpactRecommendations({
        calculation_id: calculationResult.id,
        activity_data: getPayload(),
        calculation_results: calculationResult,
      });

      setAiRecommendations(res.recommendations);
      setAiProvider(res.provider);
      setAiMessage(`Generated 4 tailored recommendations powered by ${res.provider}.`);
    } catch (err: any) {
      console.error('AI Recommendations failed:', err);
      setAiMessage(`Notice: ${err.message || 'Connecting with local intelligence rules'}`);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // 3. Update Recommendation Status
  const handleUpdateStatus = async (recId: number, newStatus: 'Planned' | 'In Progress' | 'Completed') => {
    try {
      const updated = await api.updateRecommendationStatus(recId, newStatus);
      setAiRecommendations((prev) =>
        prev.map((r) => (r.id === recId ? { ...r, status: updated.status } : r))
      );
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  // 4. Handle CSV Import
  const handleParseCsv = () => {
    try {
      const lines = csvText.trim().split('\n');
      if (lines.length < 2) {
        setCsvMessage('Error: CSV must contain a header and at least one data row.');
        return;
      }

      let parsedKwh = elecKwh;
      let parsedDist = distanceKm;
      let parsedFood = foodWasteKg;
      let parsedPlastic = plasticWasteKg;

      lines.slice(1).forEach((line) => {
        const parts = line.split(',').map((p) => p.trim());
        const cat = (parts[0] || '').toLowerCase();
        const val = Number(parts[2]) || Number(parts[1]) || 0;

        if (cat.includes('elec') || cat.includes('energy') || cat.includes('kwh')) {
          parsedKwh = val;
        } else if (cat.includes('trans') || cat.includes('fleet') || cat.includes('km')) {
          parsedDist = val;
        } else if (cat.includes('food')) {
          parsedFood = val;
        } else if (cat.includes('plastic')) {
          parsedPlastic = val;
        }
      });

      setElecKwh(parsedKwh);
      setDistanceKm(parsedDist);
      setFoodWasteKg(parsedFood);
      setPlasticWasteKg(parsedPlastic);
      setCsvMessage(`Successfully imported activity records into calculator!`);
      setTimeout(() => {
        setShowCsvModal(false);
        setCsvMessage(null);
      }, 1500);
    } catch (e: any) {
      setCsvMessage(`Parsing failed: ${e.message}`);
    }
  };

  // Active Region Info
  const activeRegionObj = regions.find((r) => r.code === selectedRegion) || {
    code: 'US_EGRID',
    name: 'US Average (EPA eGRID 2024)',
    electricity: 0.417,
    unit: 'kg CO2e/kWh',
    source: 'EPA eGRID 2024',
    uncertainty: '±3.5%',
  };

  // Prepare chart data
  const pieChartData = calculationResult
    ? [
        { name: 'Electricity (Scope 2)', value: calculationResult.breakdown.electricity.emissions_kg_co2e },
        { name: 'Transit Fleet (Scope 1)', value: calculationResult.breakdown.transportation.emissions_kg_co2e },
        { name: 'Waste (Scope 3)', value: calculationResult.breakdown.waste.emissions_kg_co2e },
      ]
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* ── HEADER TITLE ────────────────────────────────────────────── */}
      <div className="glass-card p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
            <Calculator className="w-3.5 h-3.5" />
            ADMINISTRATIVE CARBON ACCOUNTING • MULTI-REGIONAL FACTOR ENGINE
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Campus Impact Calculator
          </h1>
          <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
            Record actual operational metrics across electricity, transit, and solid waste.
            Compute gross vs avoided emissions with locked mathematical factors and generate Gemini AI intervention roadmaps.
          </p>
        </div>

        {/* View Switcher Tabs & Tools */}
        <div className="flex flex-wrap items-center gap-2 z-10">
          <button
            onClick={() => setShowCsvModal(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-emerald-500/30 text-emerald-400 hover:bg-slate-800 text-xs font-mono font-medium flex items-center gap-2 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import CSV</span>
          </button>

          <div className="flex items-center bg-slate-900/90 border border-emerald-500/20 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('form')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'form'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Audit Entry</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>History ({savedCalculations.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── CSV IMPORT MODAL ────────────────────────────────────────── */}
      <AnimatePresence>
        {showCsvModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-950 border border-emerald-500/30 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span>Import Activity Data from CSV</span>
                </div>
                <button
                  onClick={() => setShowCsvModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed font-mono">
                Paste utility bill or fleet telemetry rows in CSV format. Format: <br />
                <code className="text-emerald-300">Category, Subtype, Quantity, Unit, Notes</code>
              </p>

              <textarea
                rows={5}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder="Category,Subtype,Quantity,Unit,Notes&#10;Electricity,Science Complex,12500,kWh,Main meter&#10;Transportation,campus_shuttle,4200,km,Diesel fleet&#10;Waste,food,450,kg,Dining organics&#10;Waste,plastic,280,kg,MRF bales"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
              />

              {csvMessage && (
                <div className="text-xs font-mono text-emerald-400 p-2 rounded bg-emerald-500/10 border border-emerald-500/30">
                  {csvMessage}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowCsvModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-mono text-slate-300 hover:bg-slate-900"
                >
                  Cancel
                </button>
                <button
                  onClick={handleParseCsv}
                  className="px-4 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs font-mono hover:bg-emerald-400"
                >
                  Parse & Load
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── CONDITIONAL VIEW: HISTORY TABLE VS FORM ─────────────────── */}
      {activeTab === 'history' ? (
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-500/10 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white">Historical Campus Activity Records</h2>
              <p className="text-xs text-slate-400 font-mono">
                Select an audited period to review calculations or update baseline parameters.
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedActivityId(null);
                setAuditTitle('New Campus Operations Audit');
                setActiveTab('form');
              }}
              className="px-4 py-2 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs font-mono hover:brightness-110"
            >
              + Create New Entry
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900/80 text-slate-400 border-b border-emerald-500/20">
                <tr>
                  <th className="p-3">Record Title</th>
                  <th className="p-3">Period</th>
                  <th className="p-3">Net Footprint</th>
                  <th className="p-3">Electricity (kWh)</th>
                  <th className="p-3">Transit Mode</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {savedCalculations.map((calc) => (
                  <tr key={calc.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-3 font-semibold text-slate-200">{calc.title}</td>
                    <td className="p-3 text-emerald-400">{calc.reporting_period || '2026-10'}</td>
                    <td className="p-3 text-white font-bold">
                      {calc.total_tonnes_co2e} t CO₂e
                    </td>
                    <td className="p-3 text-slate-300">
                      {calc.breakdown?.electricity?.consumption_kwh?.toLocaleString()} kWh
                    </td>
                    <td className="p-3 text-slate-300">
                      {calc.breakdown?.transportation?.distance_km?.toLocaleString()} km
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => {
                          setCalculationResult(calc);
                          setActiveTab('form');
                        }}
                        className="px-3 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500 hover:text-slate-950 font-bold transition-all"
                      >
                        Load Audit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* ── TOP CONTROL BAR: REGION SELECTOR & GUIDED WIZARD TOGGLE ── */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-emerald-500/20 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Region Selector */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="text-xs font-mono text-slate-300 font-semibold">Grid Interconnect:</span>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="bg-slate-950 border border-emerald-500/30 rounded-xl px-3 py-1.5 text-xs text-emerald-300 font-mono focus:outline-none focus:border-emerald-400"
                >
                  {(regions.length > 0 ? regions : [
                    { code: 'US_EGRID', name: 'US Average (EPA eGRID 2024)' },
                    { code: 'UK_DEFRA', name: 'United Kingdom (DEFRA / DESNZ 2024)' },
                    { code: 'EU_AVERAGE', name: 'European Union (EEA 2024)' },
                    { code: 'INDIA_CEA', name: 'India National Grid (CEA v19)' },
                    { code: 'GLOBAL_DEFAULT', name: 'Global Average (IEA 2023)' },
                  ]).map((r) => (
                    <option key={r.code} value={r.code}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
              <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                ({activeRegionObj.electricity} {activeRegionObj.unit})
              </span>
            </div>

            {/* Input Mode Toggle */}
            <div className="flex items-center gap-2 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setInputMode('form')}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                  inputMode === 'form'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Standard Form
              </button>
              <button
                onClick={() => setInputMode('wizard')}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                  inputMode === 'wizard'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Guided Wizard (8 Steps)
              </button>
            </div>
          </div>

          {/* Validation Warnings Banner */}
          {warnings.length > 0 && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-mono text-amber-300 space-y-1">
              {warnings.map((w, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{w}</span>
                </div>
              ))}
            </div>
          )}

          {/* ── 8-STEP WIZARD MODE ────────────────────────────────────── */}
          {inputMode === 'wizard' ? (
            <div className="glass-card p-6 sm:p-8 space-y-6">
              {/* Wizard Steps Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span className="text-emerald-400 font-bold">Step {wizardStep} of 8</span>
                  <span>
                    {wizardStep === 1 && 'Audit Title & Period'}
                    {wizardStep === 2 && 'Facility Target & Grid Interconnect'}
                    {wizardStep === 3 && 'Electricity Consumption (kWh)'}
                    {wizardStep === 4 && 'Transit Vehicle Category & Fuel'}
                    {wizardStep === 5 && 'Distance Traveled & Fleet Size'}
                    {wizardStep === 6 && 'Organic & General Waste Masses'}
                    {wizardStep === 7 && 'Recyclable Diversion Fractions'}
                    {wizardStep === 8 && 'Disposal Destination & Compute'}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden flex">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <div
                      key={s}
                      className={`flex-1 h-full transition-all border-r border-slate-950 ${
                        s <= wizardStep ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-slate-800'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Wizard Step Content */}
              <div className="min-h-[160px] py-4">
                {wizardStep === 1 && (
                  <div className="space-y-4 max-w-lg">
                    <h3 className="text-base font-bold text-white">Name Your Campus Audit</h3>
                    <div>
                      <label className="text-xs font-mono text-slate-400 block mb-1">Audit Title</label>
                      <input
                        type="text"
                        value={auditTitle}
                        onChange={(e) => setAuditTitle(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-emerald-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-mono text-slate-400 block mb-1">Reporting Period</label>
                      <input
                        type="month"
                        value={reportingPeriod}
                        onChange={(e) => setReportingPeriod(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-emerald-400"
                      />
                    </div>
                  </div>
                )}

                {wizardStep === 2 && (
                  <div className="space-y-4 max-w-lg">
                    <h3 className="text-base font-bold text-white">Select Facility</h3>
                    <div>
                      <label className="text-xs font-mono text-slate-400 block mb-1">Building</label>
                      <select
                        value={buildingId}
                        onChange={(e) => setBuildingId(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-emerald-400"
                      >
                        {buildings.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name} ({b.type})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {wizardStep === 3 && (
                  <div className="space-y-4 max-w-lg">
                    <h3 className="text-base font-bold text-white">Grid Electricity Draw</h3>
                    <div>
                      <label className="text-xs font-mono text-slate-400 block mb-1">Meter Consumption (kWh)</label>
                      <input
                        type="number"
                        min="0"
                        value={elecKwh}
                        onChange={(e) => setElecKwh(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:border-emerald-400"
                      />
                    </div>
                  </div>
                )}

                {wizardStep === 4 && (
                  <div className="space-y-4 max-w-lg">
                    <h3 className="text-base font-bold text-white">Transit Fleet Configuration</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-mono text-slate-400 block mb-1">Category</label>
                        <select
                          value={vehicleCategory}
                          onChange={(e) => setVehicleCategory(e.target.value as any)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                        >
                          <option value="campus_shuttle">Campus Transit Shuttle</option>
                          <option value="passenger_car">Passenger Fleet Car</option>
                          <option value="utility_van">Facilities Utility Van</option>
                          <option value="motorcycle">Campus Motorcycle</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-mono text-slate-400 block mb-1">Fuel Type</label>
                        <select
                          value={fuelType}
                          onChange={(e) => setFuelType(e.target.value as any)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                        >
                          <option value="diesel">Diesel</option>
                          <option value="petrol">Petrol (Gasoline)</option>
                          <option value="electric">Electric (EV)</option>
                          <option value="cng">CNG</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {wizardStep === 5 && (
                  <div className="space-y-4 max-w-lg">
                    <h3 className="text-base font-bold text-white">Fleet Operating Distance</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-mono text-slate-400 block mb-1">Distance (km)</label>
                        <input
                          type="number"
                          min="0"
                          value={distanceKm}
                          onChange={(e) => setDistanceKm(Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-mono text-slate-400 block mb-1">Vehicles Count</label>
                        <input
                          type="number"
                          min="1"
                          value={vehicleCount}
                          onChange={(e) => setVehicleCount(Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {wizardStep === 6 && (
                  <div className="space-y-4 max-w-lg">
                    <h3 className="text-base font-bold text-white">Food & General Waste</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-mono text-slate-400 block mb-1">Food Waste (kg)</label>
                        <input
                          type="number"
                          min="0"
                          value={foodWasteKg}
                          onChange={(e) => setFoodWasteKg(Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-mono text-slate-400 block mb-1">General Trash (kg)</label>
                        <input
                          type="number"
                          min="0"
                          value={generalWasteKg}
                          onChange={(e) => setGeneralWasteKg(Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {wizardStep === 7 && (
                  <div className="space-y-4 max-w-lg">
                    <h3 className="text-base font-bold text-white">Recyclable Streams (Avoided Credits)</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-mono text-slate-400 block mb-1">Plastic Waste (kg)</label>
                        <input
                          type="number"
                          min="0"
                          value={plasticWasteKg}
                          onChange={(e) => setPlasticWasteKg(Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-mono text-slate-400 block mb-1">Paper Waste (kg)</label>
                        <input
                          type="number"
                          min="0"
                          value={paperWasteKg}
                          onChange={(e) => setPaperWasteKg(Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {wizardStep === 8 && (
                  <div className="space-y-4 max-w-lg">
                    <h3 className="text-base font-bold text-white">Disposal Route & Verification</h3>
                    <div>
                      <label className="text-xs font-mono text-slate-400 block mb-1">Disposal Method</label>
                      <select
                        value={disposalMethod}
                        onChange={(e) => setDisposalMethod(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white"
                      >
                        <option value="landfill">Municipal Landfill</option>
                        <option value="compost">Managed Aerobic Compost System</option>
                        <option value="recycled">Materials Recovery Facility (Recycling)</option>
                        <option value="waste_to_energy">Waste-to-Energy Combustion</option>
                      </select>
                    </div>
                    <p className="text-xs font-mono text-emerald-400">
                      Ready to execute mathematical emission calculation.
                    </p>
                  </div>
                )}
              </div>

              {/* Wizard Nav Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  disabled={wizardStep === 1}
                  onClick={() => setWizardStep((prev) => Math.max(1, prev - 1))}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-slate-300 disabled:opacity-30 flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                {wizardStep < 8 ? (
                  <button
                    onClick={() => setWizardStep((prev) => Math.min(8, prev + 1))}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs font-mono hover:bg-emerald-400 flex items-center gap-1.5"
                  >
                    <span>Next Step</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={handleCalculateEmissions}
                    disabled={isCalculating}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs font-mono hover:brightness-110 flex items-center gap-2 shadow-lg shadow-emerald-500/25"
                  >
                    <Calculator className="w-4 h-4" />
                    <span>{isCalculating ? 'Computing...' : 'Calculate Footprint'}</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* ── STANDARD FORM MODE (3 CARDS) ────────────────────────── */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Electricity Card */}
              <div className="glass-card p-6 space-y-4 border-t-4 border-t-emerald-500">
                <div className="flex items-center justify-between pb-2 border-b border-emerald-500/10">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <Zap className="w-5 h-5" />
                    <span>A. Building Electricity</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                    Scope 2
                  </span>
                </div>

                {/* 3D High-Voltage Substation Visualizer */}
                <div className="w-full h-36 rounded-xl overflow-hidden border border-emerald-500/20 bg-slate-950/70 relative">
                  <CanvasContainer camera={{ position: [0, 1.8, 3.8], fov: 46 }}>
                    <EnergyGrid3D kwh={elecKwh} />
                  </CanvasContainer>
                  <div className="absolute top-2 right-2 text-[9px] font-mono text-emerald-400/80 bg-slate-950/80 px-2 py-0.5 rounded border border-emerald-500/30 pointer-events-none">
                    3D Grid Flow
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-mono text-slate-400 block mb-1">Target Building</label>
                    <select
                      value={buildingId}
                      onChange={(e) => setBuildingId(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-emerald-500/30 rounded-lg px-2.5 py-2 text-xs text-white"
                    >
                      {buildings.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.type})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-slate-400 block mb-1">Electricity (kWh)</label>
                    <input
                      type="number"
                      min="0"
                      value={elecKwh}
                      onChange={(e) => setElecKwh(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-emerald-500/30 rounded-lg px-3 py-2 text-xs text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-slate-400 block mb-1">Notes</label>
                    <input
                      type="text"
                      value={elecNotes}
                      onChange={(e) => setElecNotes(e.target.value)}
                      className="w-full bg-slate-900 border border-emerald-500/30 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex justify-between">
                  <span>Emission Rate:</span>
                  <span className="text-emerald-400 font-bold">
                    {Math.round(elecKwh * activeRegionObj.electricity).toLocaleString()} kg CO₂e
                  </span>
                </div>
              </div>

              {/* Transportation Card */}
              <div className="glass-card p-6 space-y-4 border-t-4 border-t-sky-500">
                <div className="flex items-center justify-between pb-2 border-b border-sky-500/10">
                  <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
                    <Truck className="w-5 h-5" />
                    <span>B. Campus Transit Fleet</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-400">
                    Scope 1
                  </span>
                </div>

                {/* 3D Transit Shuttle & Fleet Track */}
                <div className="w-full h-36 rounded-xl overflow-hidden border border-sky-500/20 bg-slate-950/70 relative">
                  <CanvasContainer camera={{ position: [0, 2.2, 3.8], fov: 46 }}>
                    <TransitFleet3D
                      vehicleCategory={vehicleCategory}
                      fuelType={fuelType}
                      distanceKm={distanceKm}
                      vehicleCount={vehicleCount}
                    />
                  </CanvasContainer>
                  <div className="absolute top-2 right-2 text-[9px] font-mono text-sky-400/80 bg-slate-950/80 px-2 py-0.5 rounded border border-sky-500/30 pointer-events-none">
                    3D Fleet Dynamic
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-mono text-slate-400 block mb-1">Vehicle</label>
                      <select
                        value={vehicleCategory}
                        onChange={(e) => setVehicleCategory(e.target.value as any)}
                        className="w-full bg-slate-900 border border-sky-500/30 rounded-lg px-2.5 py-2 text-xs text-white"
                      >
                        <option value="campus_shuttle">Shuttle</option>
                        <option value="passenger_car">Car</option>
                        <option value="utility_van">Van</option>
                        <option value="motorcycle">Motorcycle</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-mono text-slate-400 block mb-1">Fuel</label>
                      <select
                        value={fuelType}
                        onChange={(e) => setFuelType(e.target.value as any)}
                        className="w-full bg-slate-900 border border-sky-500/30 rounded-lg px-2.5 py-2 text-xs text-white"
                      >
                        <option value="diesel">Diesel</option>
                        <option value="petrol">Petrol</option>
                        <option value="electric">EV</option>
                        <option value="cng">CNG</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-mono text-slate-400 block mb-1">Distance (km)</label>
                      <input
                        type="number"
                        min="0"
                        value={distanceKm}
                        onChange={(e) => setDistanceKm(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-sky-500/30 rounded-lg px-3 py-2 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-mono text-slate-400 block mb-1">Vehicle Count</label>
                      <input
                        type="number"
                        min="1"
                        value={vehicleCount}
                        onChange={(e) => setVehicleCount(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-sky-500/30 rounded-lg px-3 py-2 text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex justify-between">
                  <span>Emission Rate:</span>
                  <span className="text-sky-400 font-bold">
                    {Math.round(distanceKm * (vehicleCategory === 'campus_shuttle' ? 0.89 : 0.17)).toLocaleString()} kg CO₂e
                  </span>
                </div>
              </div>

              {/* Waste Card */}
              <div className="glass-card p-6 space-y-4 border-t-4 border-t-amber-500">
                <div className="flex items-center justify-between pb-2 border-b border-amber-500/10">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                    <Trash2 className="w-5 h-5" />
                    <span>C. Solid Waste & Recycling</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400">
                    Scope 3
                  </span>
                </div>

                {/* 3D Smart Waste & Materials Recovery Loop */}
                <div className="w-full h-36 rounded-xl overflow-hidden border border-amber-500/20 bg-slate-950/70 relative">
                  <CanvasContainer camera={{ position: [0, 2.0, 3.8], fov: 46 }}>
                    <WasteSegregation3D
                      foodWasteKg={foodWasteKg}
                      plasticWasteKg={plasticWasteKg}
                      paperWasteKg={paperWasteKg}
                      generalWasteKg={generalWasteKg}
                      disposalMethod={disposalMethod}
                    />
                  </CanvasContainer>
                  <div className="absolute top-2 right-2 text-[9px] font-mono text-amber-400/80 bg-slate-950/80 px-2 py-0.5 rounded border border-amber-500/30 pointer-events-none">
                    3D Recovery Loop
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-mono text-slate-400 block mb-1">Food (kg)</label>
                      <input
                        type="number"
                        min="0"
                        value={foodWasteKg}
                        onChange={(e) => setFoodWasteKg(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-amber-500/30 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-mono text-slate-400 block mb-1">Plastic (kg)</label>
                      <input
                        type="number"
                        min="0"
                        value={plasticWasteKg}
                        onChange={(e) => setPlasticWasteKg(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-amber-500/30 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-mono text-slate-400 block mb-1">Paper (kg)</label>
                      <input
                        type="number"
                        min="0"
                        value={paperWasteKg}
                        onChange={(e) => setPaperWasteKg(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-amber-500/30 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-mono text-slate-400 block mb-1">General (kg)</label>
                      <input
                        type="number"
                        min="0"
                        value={generalWasteKg}
                        onChange={(e) => setGeneralWasteKg(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-amber-500/30 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-slate-400 block mb-1">Destination</label>
                    <select
                      value={disposalMethod}
                      onChange={(e) => setDisposalMethod(e.target.value as any)}
                      className="w-full bg-slate-900 border border-amber-500/30 rounded-lg px-3 py-1.5 text-xs text-white"
                    >
                      <option value="landfill">Municipal Landfill</option>
                      <option value="compost">Compost Program</option>
                      <option value="recycled">Recycling Diversion</option>
                      <option value="waste_to_energy">Waste to Energy</option>
                    </select>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex justify-between">
                  <span>Total Mass:</span>
                  <span className="text-amber-400 font-bold">
                    {(foodWasteKg + plasticWasteKg + paperWasteKg + generalWasteKg).toLocaleString()} kg
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions Button Bar */}
          {inputMode === 'form' && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-emerald-500/20">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Audited via {activeRegionObj.name} ({activeRegionObj.source})</span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => {
                    setElecKwh(10000);
                    setDistanceKm(3000);
                    setFoodWasteKg(300);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-slate-300 text-xs font-mono flex items-center justify-center gap-2 hover:bg-slate-800"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
                </button>
                <button
                  onClick={handleCalculateEmissions}
                  disabled={isCalculating}
                  className="flex-1 sm:flex-none px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 text-slate-950 font-bold text-xs font-mono uppercase tracking-wider shadow-lg shadow-emerald-500/25 hover:brightness-110 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Calculator className="w-4 h-4" />
                  {isCalculating ? 'Computing Mathematical Factors...' : 'Calculate Carbon Footprint'}
                </button>
              </div>
            </div>
          )}

          {/* ── SECTION 2: ATTRACTIVE CARBON CALCULATION RESULTS ─────── */}
          {calculationResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 pt-4"
            >
              <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
                <div className="flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-xl font-black text-white tracking-tight">
                    Audited Carbon Calculation Results
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    Uncertainty: {calculationResult.uncertainty_rating || '±3.5% (Tier 1)'}
                  </span>
                  <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    {calculationResult.region_name || activeRegionObj.name}
                  </span>
                </div>
              </div>

              {/* Gross, Avoided, and Net Emission Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Net Audited Emissions Card */}
                <div className="md:col-span-2 glass-card p-6 bg-gradient-to-br from-emerald-950/40 via-slate-900/90 to-teal-950/40 border border-emerald-500/40 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 block mb-1">
                      Net Carbon Footprint (Audited)
                    </span>
                    <div className="text-4xl sm:text-5xl font-black text-white">
                      {calculationResult.total_kg_co2e.toLocaleString()}{' '}
                      <span className="text-lg font-normal text-emerald-400 font-mono">kg CO₂e</span>
                    </div>
                    <div className="text-base text-slate-300 font-mono mt-1">
                      = <span className="font-bold text-white">{calculationResult.total_tonnes_co2e}</span> Metric Tonnes CO₂e
                    </div>
                  </div>

                  {/* Gross vs Avoided Disclosures */}
                  <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-emerald-500/20 text-xs font-mono">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Gross Emissions:</span>
                      <span className="text-white font-bold">
                        {(calculationResult.gross_emissions_kg || calculationResult.total_kg_co2e).toLocaleString()} kg
                      </span>
                    </div>
                    <div>
                      <span className="text-teal-400 block text-[10px]">Avoided Recycling Credits:</span>
                      <span className="text-teal-300 font-bold">
                        -{(calculationResult.avoided_emissions_kg || 0).toLocaleString()} kg
                      </span>
                    </div>
                  </div>
                </div>

                {/* Highest Contributor Card */}
                <div className="glass-card p-5 border-amber-500/30 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-mono uppercase text-amber-400 block mb-1 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Highest Impact Driver
                    </span>
                    <div className="text-2xl font-black text-white mt-1">
                      {calculationResult.highest_contributor.category}
                    </div>
                    <p className="text-xs text-slate-300 font-mono mt-2 leading-relaxed">
                      {calculationResult.highest_contributor.details}
                    </p>
                  </div>
                  <div className="mt-3 text-xs font-mono text-amber-400 font-bold">
                    {calculationResult.highest_contributor.percentage}% of Footprint
                  </div>
                </div>

                {/* Scope Coverage Card */}
                <div className="glass-card p-5 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-mono uppercase text-slate-400 block mb-1">
                      Boundary Contribution
                    </span>
                    <div className="space-y-1.5 mt-2 text-xs font-mono text-slate-300">
                      <div className="flex justify-between">
                        <span>Electricity (Scope 2):</span>
                        <span className="text-emerald-400 font-bold">
                          {calculationResult.breakdown.electricity.percentage}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Transit (Scope 1):</span>
                        <span className="text-sky-400 font-bold">
                          {calculationResult.breakdown.transportation.percentage}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Solid Waste (Scope 3):</span>
                        <span className="text-amber-400 font-bold">
                          {calculationResult.breakdown.waste.percentage}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-500">
                    ISO 14064 Institutional Standard
                  </div>
                </div>
              </div>

              {/* ── 3D VOLUMETRIC CARBON ALLOTROPE VORTEX ──────────────── */}
              <div className="glass-card p-6 border-emerald-500/30 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1 space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
                    3D VOLUMETRIC EMISSION MATRIX
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    Dynamic Carbon Allotrope & Scope Ring Model
                  </h3>
                  <p className="text-xs text-slate-300 font-mono leading-relaxed">
                    Interactive 3D particle vortex modeling Scope 1 Direct Emissions (Sky Blue ring), Scope 2 Purchased Grid Electricity (Emerald ring), and Scope 3 Solid Waste (Amber ring) proportional to calculated tonnage. Outer pulsating green shield represents avoided recycling credits.
                  </p>
                  <div className="flex flex-wrap gap-4 pt-2 text-[11px] font-mono">
                    <span className="flex items-center gap-1.5 text-sky-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                      Scope 1: {calculationResult.breakdown.transportation.emissions_kg_co2e.toLocaleString()} kg
                    </span>
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                      Scope 2: {calculationResult.breakdown.electricity.emissions_kg_co2e.toLocaleString()} kg
                    </span>
                    <span className="flex items-center gap-1.5 text-amber-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      Scope 3: {calculationResult.breakdown.waste.emissions_kg_co2e.toLocaleString()} kg
                    </span>
                  </div>
                </div>

                <div className="w-full md:w-80 h-64 relative rounded-2xl overflow-hidden border border-emerald-500/20 bg-slate-950/80 shadow-2xl flex-shrink-0">
                  <CanvasContainer camera={{ position: [0, 0, 4.2], fov: 46 }}>
                    <CarbonSphere3D
                      totalKgCo2e={calculationResult.total_kg_co2e}
                      grossKg={calculationResult.gross_emissions_kg}
                      avoidedKg={calculationResult.avoided_emissions_kg}
                      scope1Ratio={calculationResult.breakdown.transportation.percentage / 100}
                      scope2Ratio={calculationResult.breakdown.electricity.percentage / 100}
                      scope3Ratio={calculationResult.breakdown.waste.percentage / 100}
                    />
                  </CanvasContainer>
                  <div className="absolute bottom-2 right-2 text-[10px] font-mono text-emerald-400/90 bg-slate-950/90 px-2 py-0.5 rounded border border-emerald-500/40 pointer-events-none flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Carbon Vortex 3D
                  </div>
                </div>
              </div>

              {/* ── DETAILED MATHEMATICAL AUDIT FORMULAS ──────────────── */}
              <div className="glass-card p-6 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  Deterministic Audit Formula Breakdown
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <span className="text-emerald-400 font-semibold block">Scope 2 (Electricity)</span>
                    <div className="text-slate-300">{calculationResult.breakdown.electricity.formula}</div>
                    <div className="text-[10px] text-slate-500">
                      {calculationResult.breakdown.electricity.source_description}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <span className="text-sky-400 font-semibold block">Scope 1 (Transit Fleet)</span>
                    <div className="text-slate-300">{calculationResult.breakdown.transportation.formula}</div>
                    <div className="text-[10px] text-slate-500">
                      {calculationResult.breakdown.transportation.source_description}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <span className="text-amber-400 font-semibold block">Scope 3 (Materials & Waste)</span>
                    <div className="text-slate-300">
                      Gross: {calculationResult.breakdown.waste.gross_emissions_kg || calculationResult.breakdown.waste.emissions_kg_co2e} kg - Offset: {calculationResult.breakdown.waste.avoided_emissions_kg || 0} kg
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {calculationResult.breakdown.waste.source_description}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── AI RECOMMENDATIONS ACTION TRIGGER ──────────────────── */}
              <div className="glass-card p-6 space-y-4 border border-emerald-500/30 bg-gradient-to-r from-slate-900 via-slate-900 to-teal-950/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                      Synthesize Decarbonization Roadmap with Gemini AI
                    </h3>
                    <p className="text-xs text-slate-400 font-mono mt-1">
                      Generates 4 auditable engineering interventions with citations to ASHRAE 90.1, EPA WARM, and ISO 50001.
                    </p>
                  </div>

                  <button
                    onClick={handleGenerateAiRecommendations}
                    disabled={isGeneratingAi}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs font-mono hover:brightness-110 shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{isGeneratingAi ? 'Synthesizing Roadmap...' : 'Generate AI Recommendations'}</span>
                  </button>
                </div>

                {aiMessage && (
                  <div className="text-xs font-mono text-emerald-400 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    {aiMessage}
                  </div>
                )}

                {/* Recommendations Grid */}
                {aiRecommendations.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {aiRecommendations.map((rec) => (
                      <div
                        key={rec.id}
                        className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-sm">{rec.title}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                            rec.priority === 'High' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}>
                            {rec.priority} Priority
                          </span>
                        </div>
                        <p className="text-slate-300 text-xs leading-relaxed">{rec.description}</p>
                        <div className="p-2 rounded bg-slate-900 text-slate-400 font-mono text-[11px]">
                          <strong>Benefit:</strong> {rec.expected_benefit}
                        </div>
                        <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-slate-500">
                          <span>Ref: {rec.references?.join(', ') || 'ASHRAE 90.1'}</span>
                          <button
                            onClick={() => handleUpdateStatus(rec.id, rec.status === 'Completed' ? 'Planned' : 'Completed')}
                            className="text-emerald-400 hover:underline"
                          >
                            Status: {rec.status || 'Planned'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}