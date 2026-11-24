import React from 'react';
import { StagedModuleNotice } from '../components/ui/StagedModuleNotice';

export default function DashboardPage() {
  return (
    <StagedModuleNotice
      moduleName="Executive Sustainability Dashboard"
      milestoneWeek="Week 2"
      deliverables={[
        'Interactive 3D Digital Twin Nexus & Podium',
        'Orbiting holographic metric nodes (Energy, Carbon, Water, Waste)',
        'Building telemetry rankings & Energy Use Intensity (EUI) benchmarks',
        'Executive environmental KPIs & status cards',
      ]}
    />
  );
}
