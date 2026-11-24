import React from 'react';
import { StagedModuleNotice } from '../components/ui/StagedModuleNotice';

export default function AIAssistantPage() {
  return (
    <StagedModuleNotice
      moduleName="AI Sustainability Advisor"
      milestoneWeek="Week 6"
      deliverables={[
        'Google Gemini Generative AI conversational agent grounded in campus telemetry',
        '3D Synaptic Neural Orb with live reasoning animation state',
        'Auditable deterministic carbon reasoning without hallucinations',
        'Institutional action item generation & dispatch',
      ]}
    />
  );
}
