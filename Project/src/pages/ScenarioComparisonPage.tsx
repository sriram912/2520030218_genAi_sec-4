import React from 'react';
import { StagedModuleNotice } from '../components/ui/StagedModuleNotice';

export default function ScenarioComparisonPage() {
  return (
    <StagedModuleNotice
      moduleName="Scenario Comparison & Roadmap Analysis"
      milestoneWeek="Week 5"
      deliverables={[
        'Side-by-side auditable evaluation of decarbonization roadmaps',
        '3D Spatial Roadmap Visualizer displaying physical infrastructure retrofits',
        'Comprehensive comparative metrics (carbon saved, cost, payback period)',
        'Multi-scenario portfolio analysis',
      ]}
    />
  );
}
