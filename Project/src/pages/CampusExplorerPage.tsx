import React from 'react';
import { StagedModuleNotice } from '../components/ui/StagedModuleNotice';

export default function CampusExplorerPage() {
  return (
    <StagedModuleNotice
      moduleName="Interactive 3D Campus Explorer"
      milestoneWeek="Week 3"
      deliverables={[
        'Full-scale 3D isometric campus digital twin with OrbitControls',
        'Multi-facility selection with real-time metered telemetry panel',
        'Environmental intelligence overlays (Carbon Intensity, Eco-Score, Stale telemetry)',
        'High-contrast accessible 2D floorplan fallback mode',
      ]}
    />
  );
}
