# GreenCampus – Capstone Project Development Roadmap & Weekly Schedule

**Repository:** `2520030218_genAi_sec-4`  
**Project Folder:** `Project/`  
**Author:** `srir49639-dotcom` (`srir49639@gmail.com`)  
**Core Pillars:**
1. Deterministic EPA Carbon Calculation Engine
2. Google Gemini Generative AI Model Grounding
3. Interactive Three.js 3D Campus Digital Twin
4. MySQL 8.0 Enterprise Database Architecture

---

## 📅 Weekly Milestone Schedule & Implementation Plan

### ✅ Week 1 (Current Initial Commit): Frontend Foundations, 3D Landing Experience & System Architecture
- **Deliverables:**
  - Modern TypeScript, Vite, React 19, and TailwindCSS application scaffolding.
  - Core navigation layouts (`Layout.tsx`, `Navbar.tsx`, `Sidebar.tsx`).
  - Foundational Three.js / React Three Fiber canvas engine (`CanvasContainer.tsx`, `SceneSetup.tsx`, `FloatingParticles.tsx`).
  - Interactive 3D Landing Page featuring rotating 3D Earth (`Earth3D.tsx`), miniature 3D campus model (`CampusModel3D.tsx`), solar panels, wind turbines, and live sustainability metrics.
  - Complete TypeScript domain models (`src/types/index.ts`) and API client abstractions (`src/utils/api.ts`).

### ✅ Week 2 (Current Commit): Frontend Part 2 – Complete Operational Modules & Dedicated 3D Scenes
- **Deliverables:**
  - Executive Dashboard with 3D Digital Twin Nexus (`DashboardTwin3D.tsx`) and 4 orbiting metric nodes.
  - Interactive 3D Campus Explorer (`CampusExplorerPage.tsx`) with 4 telemetry overlay modes and 2D fallback.
  - Campus Impact Calculator (`ImpactCalculatorPage.tsx`) with 4 dedicated 3D stream models (`EnergyGrid3D.tsx`, `TransitFleet3D.tsx`, `WasteSegregation3D.tsx`, `CarbonSphere3D.tsx`).
  - What-If Decarbonization Simulator (`ImpactLabPage.tsx`) with real-time luminescence feedback.
  - Strategic Scenario Comparison (`ScenarioComparisonPage.tsx`) with 3D Spatial Roadmap Visualizer (`ScenarioComparison3D.tsx`).
  - Gemini AI Sustainability Advisor (`AIAssistantPage.tsx`) with 3D Neural Intelligence Orb (`AIOrb3D.tsx`).
  - Institutional Compliance Reports (`ReportsPage.tsx`) with 3D Holographic Audit Dossier (`ReportBinder3D.tsx`).
  - System Infrastructure & Settings (`SettingsPage.tsx`) with 3D Spatial Server Node (`ServerNode3D.tsx`).

### ⏳ Week 3: Interactive 3D Campus Explorer & Environmental Telemetry
- **Deliverables:**
  - Full-scale isometric 3D campus digital twin with 360° rotate, zoom, and pan controls.
  - 4 Environmental Intelligence shader overlay modes:
    - Default architectural view
    - Carbon Intensity Heatmap (red/amber/green)
    - Sustainability Eco-Score Mode
    - Stale / Missing Telemetry Diagnostic Mode
  - High-contrast, accessible 2D floorplan fallback view.

### ⏳ Week 4: Campus Impact Calculator & 3D Stream Visualizers
- **Deliverables:**
  - Scope 1, Scope 2, and Scope 3 input streams with validation.
  - 3D High-Voltage Substation (`EnergyGrid3D.tsx`) reacting dynamically to entered kWh.
  - 3D Campus Transit Fleet (`TransitFleet3D.tsx`) featuring electric shuttle dynamics and exhaust particle plumes.
  - 3D Materials Recovery Bins (`WasteSegregation3D.tsx`) with circular recovery loops.
  - 3D Volumetric Carbon Vortex (`CarbonSphere3D.tsx`) displaying audited Scope rings and avoided emission credit halos.

### ⏳ Week 5: Impact Lab – What-If Decarbonization Simulator & Scenario Comparison
- **Deliverables:**
  - Interactive What-If simulation engine with live percentage reduction sliders.
  - Real-time 3D campus luminescence and green halo visual feedback.
  - Multi-scenario comparative evaluation matrix (Scenario A: Solar Retrofit, Scenario B: Fleet EV, Scenario C: Zero-Waste, Scenario D: Masterplan).
  - 3D Spatial Roadmap Visualizer (`ScenarioComparison3D.tsx`) displaying physical infrastructure retrofits.

### ⏳ Week 6: Google Gemini AI Advisor, Compliance Reporting & MySQL 8.0 Backend
- **Deliverables:**
  - Google Gemini Generative AI conversational assistant grounded in campus database telemetry.
  - 3D Synaptic Neural Orb (`AIOrb3D.tsx`) with real-time reasoning animation states.
  - Institutional GHG Protocol & ISO 14064 Compliance Dossier (`ReportBinder3D.tsx`) with JSON data export and printable PDF styling.
  - High-density 3D Database Cluster Node (`ServerNode3D.tsx`) with live MySQL connection pool latency probes.
  - Production Node/Express API server, normalized MySQL 8.0 schema, and automated E2E test verification suite.
