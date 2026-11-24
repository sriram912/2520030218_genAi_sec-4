import {
  CampusActivity,
  ImpactCalculation,
  AIRecommendation,
  Scenario,
  AIStatus,
  CampusDashboardData,
  Building,
  DatabaseHealth,
  SustainabilityTarget,
  AnomalyAlert,
  SustainabilityScore,
  RegionEmissionFactor,
  BriefingResponse,
  BuildingRanking,
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '';

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || res.statusText);
  }
  return res.json();
}

export const api = {
  // ── Campus Impact Calculator & Activities ─────────────────────
  getActivities: () => fetchJSON<CampusActivity[]>('/api/activities'),
  getActivity: (id: number) => fetchJSON<CampusActivity>(`/api/activities/${id}`),
  saveActivity: (activity: CampusActivity) =>
    fetchJSON<CampusActivity>('/api/activities', {
      method: 'POST',
      body: JSON.stringify(activity),
    }),
  deleteActivity: (id: number) =>
    fetchJSON<{ success: boolean }>(`/api/activities/${id}`, {
      method: 'DELETE',
    }),

  calculateImpact: (activityData: Partial<CampusActivity>, saveToHistory = true, title?: string, regionCode = 'US_EGRID') =>
    fetchJSON<{ calculation: ImpactCalculation; results: ImpactCalculation }>('/api/calculate/impact', {
      method: 'POST',
      body: JSON.stringify({
        activity_data: activityData,
        save_to_history: saveToHistory,
        title,
        region_code: regionCode,
      }),
    }),

  getCalculations: () => fetchJSON<ImpactCalculation[]>('/api/calculations'),
  getCalculation: (id: number) => fetchJSON<ImpactCalculation>(`/api/calculations/${id}`),

  // ── Gemini AI Recommendations ─────────────────────────────────
  generateImpactRecommendations: (data: {
    calculation_id?: number;
    activity_data?: any;
    calculation_results?: any;
  }) =>
    fetchJSON<{
      provider: string;
      recommendations: AIRecommendation[];
      last_analysis_time: string;
    }>('/api/ai/impact-recommendations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getRecommendations: (calculationId?: number) =>
    fetchJSON<AIRecommendation[]>(
      calculationId ? `/api/recommendations?calculation_id=${calculationId}` : '/api/recommendations'
    ),

  updateRecommendationStatus: (id: number, status: 'Planned' | 'In Progress' | 'Completed') =>
    fetchJSON<AIRecommendation>(`/api/recommendations/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  // ── Scenarios & What-If Impact Lab ────────────────────────────
  getScenarios: () => fetchJSON<Scenario[]>('/api/scenarios'),
  saveScenario: (scenario: Partial<Scenario>) =>
    fetchJSON<Scenario>('/api/scenarios', {
      method: 'POST',
      body: JSON.stringify(scenario),
    }),
  deleteScenario: (id: string) =>
    fetchJSON<{ success: boolean }>(`/api/scenarios/${id}`, {
      method: 'DELETE',
    }),

  simulateScenario: (payload: {
    baseline_data?: any;
    adjustments: any;
    scenario_name?: string;
    estimated_cost_usd?: number;
  }) =>
    fetchJSON<any>('/api/simulate/scenario', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  analyzeScenariosWithGemini: (baseline?: any, scenarios?: Scenario[]) =>
    fetchJSON<{
      analysis: string;
      provider: string;
      last_analysis_time: string;
      id?: number;
    }>('/api/ai/analyze-scenarios', {
      method: 'POST',
      body: JSON.stringify({ baseline, scenarios }),
    }),

  // ── AI Health / Live Status ───────────────────────────────────
  getAiStatus: () => fetchJSON<AIStatus>('/api/ai/status'),
  getDatabaseHealth: () => fetchJSON<DatabaseHealth>('/api/health/database'),

  // ── Sustainability Targets & Alerts ─────────────────────────────
  getTargets: () => fetchJSON<SustainabilityTarget[]>('/api/targets'),
  createTarget: (target: Partial<SustainabilityTarget>) =>
    fetchJSON<SustainabilityTarget>('/api/targets', {
      method: 'POST',
      body: JSON.stringify(target),
    }),
  updateTargetProgress: (id: number, current_progress_percentage: number, status?: string) =>
    fetchJSON<SustainabilityTarget>(`/api/targets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ current_progress_percentage, status }),
    }),
  getAlerts: () => fetchJSON<AnomalyAlert[]>('/api/alerts'),
  getScores: () => fetchJSON<SustainabilityScore[]>('/api/scores'),
  getDashboardAnalytics: () => fetchJSON<any>('/api/analytics/dashboard'),

  // ── Authentication & User Management ──────────────────────────
  register: (data: { name: string; email: string; password: string; role?: string }) =>
    fetchJSON<any>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  login: (data: { email: string; password: string }) =>
    fetchJSON<any>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getProfile: () => fetchJSON<any>('/api/auth/profile'),

  // ── Campus Buildings & Telemetry ──────────────────────────────
  getBuildings: () => fetchJSON<Building[]>('/api/buildings'),
  getBuilding: (id: number) => fetchJSON<any>(`/api/buildings/${id}`),
  createBuilding: (data: Partial<Building>) =>
    fetchJSON<Building>('/api/buildings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateBuilding: (id: number, data: Partial<Building>) =>
    fetchJSON<Building>(`/api/buildings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteBuilding: (id: number) =>
    fetchJSON<{ success: boolean }>(`/api/buildings/${id}`, {
      method: 'DELETE',
    }),
  getCampusSummary: () => fetchJSON<CampusDashboardData>('/api/campus/summary'),
  getEmissionFactors: () => fetchJSON<any[]>('/api/emission-factors'),

  // ── Legacy Simulation & Building Recommendations ─────────────
  simulate: (buildingId: number, parameters: any) =>
    fetchJSON<any>('/api/simulate', {
      method: 'POST',
      body: JSON.stringify({ building_id: buildingId, parameters }),
    }),
  getBuildingRecommendations: (buildingId: number) =>
    fetchJSON<{ recommendations: AIRecommendation[] }>(`/api/ai/recommendations/${buildingId}`),

  // ── Conversational AI Assistant ───────────────────────────────
  chat: (message: string, sessionId: string) =>
    fetchJSON<any>('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, session_id: sessionId }),
    }),
  getSuggestions: () => fetchJSON<string[]>('/api/ai/suggestions'),

  // ── Regional Factors & Executive Briefing ─────────────────────
  getRegionalEmissionFactors: () =>
    fetchJSON<{ default_region: string; regions: RegionEmissionFactor[] }>('/api/emission-factors/regions'),
  getCampusBriefing: () => fetchJSON<BriefingResponse>('/api/ai/briefing'),
  getAnomalies: () => fetchJSON<AnomalyAlert[]>('/api/analytics/anomalies'),
  getActions: () => fetchJSON<AIRecommendation[]>('/api/actions'),
  assignAction: (
    id: number,
    data: {
      responsible_department?: string;
      target_completion_date?: string;
      status?: string;
      actual_measured_reduction_kg?: number;
    }
  ) =>
    fetchJSON<AIRecommendation>(`/api/actions/${id}/assign`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  getBuildingRankings: () => fetchJSON<BuildingRanking[]>('/api/buildings/rankings'),
};
