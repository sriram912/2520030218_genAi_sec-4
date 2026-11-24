// ── Building Types ──────────────────────────────────────────────
export interface Building {
  id: number;
  name: string;
  type: 'academic' | 'laboratory' | 'recreational' | 'administrative' | 'residential' | 'dining';
  floors: number;
  area_sqft: number;
  solar_panels: number;
  sustainability_score: number;
  latest_electricity?: number;
  latest_month?: string;
}

export interface EnergyReading {
  id: number;
  building_id: number;
  month: string;
  electricity_kwh: number;
  natural_gas_therms: number;
  water_gallons: number;
  waste_tons: number;
  recycled_tons: number;
}

// ── Campus Activity Records (Inputs) ────────────────────────────
export interface ElectricityActivity {
  building_id: number;
  building_name?: string;
  reporting_month: string;
  consumption_kwh: number;
  notes?: string;
}

export interface TransportationActivity {
  vehicle_category: 'passenger_car' | 'campus_shuttle' | 'motorcycle' | 'utility_van';
  fuel_type: 'petrol' | 'diesel' | 'electric' | 'cng';
  distance_km: number;
  vehicle_count: number;
  fuel_liters?: number;
  reporting_period?: string;
}

export interface WasteActivity {
  food_waste_kg: number;
  plastic_waste_kg: number;
  paper_waste_kg: number;
  general_waste_kg: number;
  disposal_method: 'landfill' | 'compost' | 'recycled' | 'waste_to_energy';
}

export interface CampusActivity {
  id?: number;
  title: string;
  reporting_period: string;
  created_at?: string;
  updated_at?: string;
  electricity: ElectricityActivity;
  transportation: TransportationActivity;
  waste: WasteActivity;
}

// ── Carbon Calculation Results ──────────────────────────────────
export interface CategoryBreakdown {
  consumption_kwh?: number;
  distance_km?: number;
  total_waste_kg?: number;
  emissions_kg_co2e: number;
  gross_emissions_kg?: number;
  avoided_emissions_kg?: number;
  factor?: number;
  factor_unit?: string;
  percentage: number;
  formula?: string;
  source_description?: string;
  food_emissions_kg?: number;
  plastic_emissions_kg?: number;
  paper_emissions_kg?: number;
  general_emissions_kg?: number;
  disposal_method?: string;
}

export interface ImpactCalculation {
  id?: number;
  activity_id?: number;
  title: string;
  reporting_period?: string;
  calculated_at?: string;
  region_code?: string;
  region_name?: string;
  gross_emissions_kg?: number;
  avoided_emissions_kg?: number;
  uncertainty_rating?: string;
  total_kg_co2e: number;
  total_tonnes_co2e: number;
  breakdown: {
    electricity: CategoryBreakdown;
    transportation: CategoryBreakdown;
    waste: CategoryBreakdown;
  };
  highest_contributor: {
    category: string;
    percentage: number;
    emissions_kg_co2e: number;
    details?: string;
    facility?: string;
  };
  comparison_with_previous?: {
    previous_id?: number;
    previous_total_kg: number;
    previous_date?: string;
    delta_kg: number;
    delta_percentage: number;
  } | null;
  activity_data?: CampusActivity;
}

export interface RegionEmissionFactor {
  code: string;
  name: string;
  electricity: number;
  unit: string;
  source: string;
  uncertainty?: string;
}

export interface BriefingResponse {
  briefing: string;
  provider: string;
  generated_at: string;
  metadata?: {
    total_kg_co2e: number;
    highest_contributor: any;
    active_alerts: number;
    progress: number;
  };
}

export interface BuildingRanking {
  id: number;
  name: string;
  type: string;
  floors?: number;
  area_sqft: number;
  occupants: number;
  latest_electricity_kwh: number;
  emissions_kg_co2e: number;
  eui_kwh_per_sqft: number;
  emissions_per_occupant_kg: number;
  sustainability_score: number;
  solar_panels: number;
}

// ── Emission Result ─────────────────────────────────────────────
export interface EmissionResult {
  total_emissions_kg_co2: number;
  electricity_emissions_kg?: number;
  natural_gas_emissions_kg?: number;
  water_emissions_kg?: number;
  waste_emissions_kg?: number;
}

// ── AI Recommendations ──────────────────────────────────────────
export interface AIRecommendation {
  id: number;
  calculation_id?: number | null;
  title: string;
  description: string;
  reason?: string;
  expected_benefit?: string;
  difficulty?: 'Low' | 'Medium' | 'High' | string;
  priority?: 'High' | 'Medium' | 'Low' | 'high' | 'medium' | 'low' | string;
  references?: string[];
  status?: 'Planned' | 'In Progress' | 'Completed' | string;
  category?: string;
  estimated_savings_percent?: number;
  responsible_department?: string;
  target_completion_date?: string;
  estimated_reduction_kg?: number;
  actual_measured_reduction_kg?: number;
  created_at?: string;
  updated_at?: string;
}

// ── Scenario Simulator & Comparison ─────────────────────────────
export interface ScenarioAdjustments {
  electricity_percent: number;
  transport_percent: number;
  food_waste_percent?: number;
  plastic_waste_percent?: number;
  paper_waste_percent?: number;
}

export interface ScenarioResultCalculated {
  baseline_emissions_kg: number;
  simulated_emissions_kg: number;
  carbon_saved_kg: number;
  reduction_percentage: number;
  electricity_savings_kg?: number;
  transport_savings_kg?: number;
  waste_savings_kg?: number;
}

export interface Scenario {
  id: string;
  name: string;
  description?: string;
  is_template?: boolean;
  adjustments: ScenarioAdjustments;
  estimated_cost_usd?: number;
  payback_years?: number;
  calculated?: ScenarioResultCalculated;
  created_at?: string;
  updated_at?: string;
}

export interface ScenarioAnalysis {
  id?: number;
  analysis: string;
  provider: string;
  last_analysis_time: string;
}

// ── AI System Status ────────────────────────────────────────────
export interface AIStatus {
  connected: boolean;
  configured: boolean;
  model: string;
  latency_ms: number;
  last_analysis_time?: string;
  approved_tools: string[];
}

// ── Database Health Check ───────────────────────────────────────
export interface DatabaseHealth {
  status: 'healthy' | 'unhealthy' | 'disconnected';
  connected: boolean;
  database: string;
  database_name?: string;
  version?: string;
  host?: string;
  user?: string;
  tables_count?: number;
  tables?: string[];
  latency_ms: number;
  error?: string | null;
  testedAt?: string;
}

// ── Sustainability Targets & Alerts ─────────────────────────────
export interface SustainabilityTarget {
  id: number;
  target_description: string;
  baseline_emissions_kg: number;
  target_reduction_percentage: number;
  target_emissions_kg: number;
  start_date: string;
  deadline: string;
  current_progress_percentage: number;
  status: 'on_track' | 'behind' | 'achieved';
  created_at?: string;
}

export interface AnomalyAlert {
  id: number;
  building_id?: number | null;
  building_name?: string;
  activity_category?: 'electricity' | 'transportation' | 'waste' | string;
  previous_consumption?: number;
  current_consumption?: number;
  percentage_change?: number;
  percentage_deviation?: number;
  alert_description?: string;
  description?: string;
  severity?: 'low' | 'medium' | 'high' | string;
  ai_hypothesis?: string;
  status: 'active' | 'acknowledged' | 'resolved';
  created_date?: string;
  resolved_at?: string | null;
}

export interface SustainabilityScore {
  id: number;
  building_id: number;
  building_name?: string;
  green_score: number;
  scoring_period: string;
  scoring_details?: Record<string, number>;
  created_date?: string;
}

// ── Legacy Types ────────────────────────────────────────────────
export interface CampusSummary {
  month: string;
  total_electricity_kwh: number;
  total_emissions_kg_co2: number;
  total_water_gallons: number;
  total_waste_tons: number;
  total_recycled_tons: number;
  renewable_percentage: number;
  campus_sustainability_score: number;
}

export interface CampusDashboardData {
  latest: CampusSummary;
  history: CampusSummary[];
  buildings: Building[];
  trend: {
    emissions_change: number;
    electricity_change: number;
  } | null;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  intent?: string;
}

export interface SimulationResult {
  is_simulation: boolean;
  current: {
    data: Record<string, number>;
    emissions: { total_emissions_kg_co2: number };
  };
  simulated: {
    data: Record<string, number>;
    emissions: { total_emissions_kg_co2: number };
  };
  savings_kg_co2: number;
  savings_percent: number;
  month: string;
}
