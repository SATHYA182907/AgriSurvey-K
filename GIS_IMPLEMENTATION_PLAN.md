# AgriSurvey AI — GIS Implementation Plan

**Target Completion:** Immediate Autonomous Execution  
**Environment:** Existing Codebase (`/Users/sathyam/Desktop/PuneAgriMain`)  
**Stack:** React 19, TypeScript, Vite 8, Tailwind CSS 4, Leaflet/React-Leaflet, Turf.js, jsPDF & jsPDF-AutoTable  

---

## 1. Objectives & Guiding Principles

1. **Direct In-Place Evolution:** Do not rebuild from scratch; build directly into existing services, models, and layout components.
2. **Preserve Functionality:** Keep existing authentication, Tahsildar approval workflows, database persistence, and MSG91 SMS dispatch 100% operational.
3. **True Spatial Computations:** Enforce geodesic Turf.js algorithms for ellipsoidal area and perimeter math (m², ha, acres) with zero planar degree approximations.
4. **Transparent Data Provenance:** Clearly separate machine learning predictions and remote sensing anomalies from legal revenue records and statutory approvals.

---

## 2. Phased Implementation Roadmap

### Phase 1: Full 10-Report Suite in `report.service.ts` (Module 11)
- Implement dedicated generators for all 10 problem-statement report types:
  1. `generatePlotSurveyPdf` / `exportPlotSurveyCsv` (Individual Plot Survey Report)
  2. `generateVillageCropSurveyReport` (Village Crop Survey Report)
  3. `generateTalukaCropAreaReport` (Taluka Crop-Area Report)
  4. `generateDistrictCropAreaReport` (District Crop-Area Report)
  5. `generateFieldSurveyCompletionReport` (Field-Survey Completion Report)
  6. `generateSatelliteObservationReport` (Satellite-Observation Report)
  7. `generateCropHealthReport` (Crop-Health Monitoring Report)
  8. `generateCropClassificationEvaluationReport` (Crop-Classification Evaluation Report)
  9. `generateYieldEstimationReport` (Yield-Estimation Report)
  10. `generateDisasterAssessmentReport` (Potential Crop-Damage Assessment Report)
- Embed legal provenance disclaimers and EPSG:4326 CRS coordinates on every exported report.

### Phase 2: Dedicated GIS Crop Survey & Land Plot Registration Portal (Modules 1, 7, 10)
- Create `src/pages/gis/GisCropSurveyPage.tsx`:
  - Full-featured spatial intelligence portal available to all roles (Tahsildar, Admin, Field Worker, Farmer).
  - High-precision interactive map powered by `AgriculturalGISMap.tsx`.
  - Multi-layer toggles: Cadastral Boundaries, Sentinel-2 Scenes, NDVI Overlays, Drone Orthomosaics, Field Surveys.
  - Spatial filtering toolbar: District, Taluka, Village, Season, Crop Type, and Verification Status.
  - Spatial Analytics KPI summary bar: Total Registered Area, Surveyed Area, Verified Area, AI Predicted Area.
  - Integrated Plot Registration Drawer / Modal with all required fields:
    * Farmer / landholder reference
    * Plot identifier & Survey Number / Gat Number
    * Village, Taluka, District, State
    * Crop season & survey date
    * 7/12 land document reference
    * Interactive polygon delineation with real-time geodesic area calculation
    * Declared crop & cultivated acreage
    * Irrigation type & soil condition
  - Direct action triggers on selected plots:
    * Satellite imagery discovery (Earth Search STAC)
    * Live agrometeorology (Open-Meteo)
    * Crop classification & yield forecasting
    * Multi-format report export (PDF & CSV)

### Phase 3: Reports Hub Page (`src/pages/gis/GisReportsPage.tsx`) (Module 11)
- Dedicated reports dashboard enabling authorized officers and farmers to select any of the 10 report types, filter by district/taluka/village/date, inspect preview data, and export in PDF or CSV formats.

### Phase 4: Application Navigation & Routing Integration
- Update `src/App.tsx` to register:
  - `/gis/crop-survey` (Unified GIS Crop Survey & Plot Explorer)
  - `/gis/reports` (Centralized 10-Report Dossier Hub)
- Update `src/components/layout/DashboardLayout.tsx` to include "GIS Crop Survey" and "GIS Reports" across farmer, officer, field worker, and administrator navigation bars.

### Phase 5: End-to-End Automated Testing Suite (`scripts/test-gis-e2e.ts`)
- Implement comprehensive automated test script covering:
  - Test A: Plot registration with valid polygon & geodesic area calculation
  - Test B: Spatial mapping, multi-attribute filtering, and CRS consistency
  - Test C: Satellite discovery via Earth Search STAC API
  - Test D: Genuine NDVI calculation and statistics
  - Test E: Geotagged field surveys with offline drafting & sync
  - Test F: Crop classification inference & separation of official records
  - Test G: Crop area aggregation across administrative units
  - Test H: Role-based authorization & data isolation
  - Test I: Generation of all 10 report types in CSV & PDF formats
  - Test J: Build and type check validation (`npm run build`)
- Execute tests and capture results in `GIS_TEST_RESULTS.md`.
