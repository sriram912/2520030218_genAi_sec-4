import React from 'react';
import { StagedModuleNotice } from '../components/ui/StagedModuleNotice';

export default function ImpactLabPage() {
  return (
    <StagedModuleNotice
      moduleName="Impact Lab – What-If Simulator"
      milestoneWeek="Week 5"
      deliverables={[
        'Real-time What-If decarbonization levers & sliders',
        'Interactive 3D campus with live luminescence and green halo feedback',
        'Tangible carbon equivalents (urban trees, passenger vehicles, dollars)',
        'Scenario persistence and baseline comparison',
      ]}
    />
  );
}
