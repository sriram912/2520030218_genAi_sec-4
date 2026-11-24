import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import { Loader2 } from 'lucide-react';

// Lazy load pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ImpactCalculatorPage = lazy(() => import('./pages/ImpactCalculatorPage'));
const ImpactLabPage = lazy(() => import('./pages/ImpactLabPage'));
const ScenarioComparisonPage = lazy(() => import('./pages/ScenarioComparisonPage'));
const CampusExplorerPage = lazy(() => import('./pages/CampusExplorerPage'));
const AIAssistantPage = lazy(() => import('./pages/AIAssistantPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

function PageLoadingSpinner() {
  return (
    <div className="w-full min-h-[70vh] flex flex-col items-center justify-center p-8">
      <div className="relative flex items-center justify-center mb-4">
        <div className="w-14 h-14 rounded-full border-2 border-emerald-500/20 border-t-emerald-400 animate-spin" />
        <Loader2 className="w-6 h-6 text-emerald-400 animate-pulse absolute" />
      </div>
      <p className="text-xs font-mono uppercase tracking-widest text-emerald-400/80">
        Loading GreenCampus Decision Engine...
      </p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Suspense fallback={<PageLoadingSpinner />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/calculator" element={<ImpactCalculatorPage />} />
            <Route path="/simulator" element={<ImpactLabPage />} />
            <Route path="/impact-lab" element={<ImpactLabPage />} />
            <Route path="/scenarios" element={<ScenarioComparisonPage />} />
            <Route path="/campus" element={<CampusExplorerPage />} />
            <Route path="/ai" element={<AIAssistantPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Layout>
    </BrowserRouter>
  );
}
