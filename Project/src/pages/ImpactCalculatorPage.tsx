import React from 'react';
import { StagedModuleNotice } from '../components/ui/StagedModuleNotice';

export default function ImpactCalculatorPage() {
  return (
    <StagedModuleNotice
      moduleName="Campus Impact Calculator"
      milestoneWeek="Week 4"
      deliverables={[
        'Dedicated 3D High-Voltage Substation for Scope 2 Electricity entry',
        'Dedicated 3D Campus Transit Fleet track for Scope 1 Mobile Emissions',
        'Dedicated 3D Materials Recovery Bins & Loop for Scope 3 Solid Waste',
        '3D Volumetric Carbon Vortex for Audited Results & Regional Emission Factor library',
      ]}
    />
  );
}
