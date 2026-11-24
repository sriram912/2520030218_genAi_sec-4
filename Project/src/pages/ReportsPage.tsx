import React from 'react';
import { StagedModuleNotice } from '../components/ui/StagedModuleNotice';

export default function ReportsPage() {
  return (
    <StagedModuleNotice
      moduleName="Institutional Compliance & Audit Reports"
      milestoneWeek="Week 6"
      deliverables={[
        'GHG Protocol & ISO 14064 compliance reporting dossier',
        '3D Holographic Audit Tablet with spinning verification seal',
        'Downloadable JSON audit export and institutional print PDF styling',
        'Facility-level emissions inventory breakdown table',
      ]}
    />
  );
}
