# ML Integration Audit: AgriSurvey AI & GM-ML-V2

**Date:** 28 October 2026  
**Auditor:** Senior Remote-Sensing Engineer & Geospatial ML Architect  
**Repository:** `PuneAgriMain` with Model Archive `GM-ML-V2`  

---

## 1. Executive Summary

This audit inspects the machine-learning artifacts and remote sensing framework provided in `GM-ML-V2`, analyzes the current state of `PuneAgriMain`, and defines the integration architecture for continuous 15-day satellite crop monitoring across Maharashtra.

The provided `GM-ML-V2` system contains a complete geospatial remote-sensing and ML architecture tailored specifically for Maharashtra agro-ecological zones (Kharif, Rabi, Summer), utilizing Sentinel-2 L2A BOA reflectance from AWS Open Data / Element 84 Earth Search STAC API, 15-day compositing, phenological feature extraction (158 features), LightGBM/Random Forest classifiers with isotonic calibration, and growth stage / health assessment models.

---

## 2. ML Model Artifacts & Architecture

| Property | Value / Specification |
|---|---|
| **Primary Production Model** | **LightGBM Gradient Boosted Decision Trees** (`CropClassifier` in `cropsurvey.models.classifier`) |
| **Alternative / Deep Models** | **TempCNN** (Pelletier et al. 2019) & **LTAE** (Lightweight Temporal Attention Encoder, Garnot & Landrieu 2020) in `cropsurvey.models.deep` |
| **Baseline Model** | **Random Forest** ensemble |
| **Framework & Version** | LightGBM >= 4.0, Scikit-Learn >= 1.3, NumPy >= 1.26, Pandas >= 2.1, PyTorch (optional for deep models) |
| **Input Shape / Feature Schema** | **158 engineered phenological features** per parcel/coordinate window: <br>• 7 spectral/radar indices: NDVI, EVI, SAVI, NDWI, NDMI, NDRE, GCVI, plus SAR VH/VV ratio and RVI.<br>• 7 distribution statistics each: min, max, mean, median, standard deviation, 10th percentile, 90th percentile.<br>• 10 phenological metrics for 4 primary indices: start of season (SOS), peak day of year (Peak DOY), end of season (EOS), seasonal length, amplitude, integral, green-up rate, senescence rate, base value, peak value.<br>• 2 cross-index features: moisture-to-greenness ratio and optical-to-radar peak lag. |
| **Handling of Missing Data / Clouds** | Native NaN handling in tree branching without forced imputation. For deep models, pairing with binary validity mask channels `(T=36, C=14)`. |
| **Output Classes (12 Classes)** | 1. **Cotton** (`code: 1`, Kharif, 180d, peak NDVI: 0.78)<br>2. **Soybean** (`code: 2`, Kharif, 105d, peak NDVI: 0.82)<br>3. **Sugarcane** (`code: 3`, Annual, 330d, peak NDVI: 0.86)<br>4. **Tur (pigeon pea)** (`code: 4`, Kharif, 165d, peak NDVI: 0.72)<br>5. **Jowar (sorghum)** (`code: 5`, Kharif, 115d, peak NDVI: 0.68)<br>6. **Bajra (pearl millet)** (`code: 6`, Kharif, 90d, peak NDVI: 0.62)<br>7. **Gram (chickpea)** (`code: 7`, Rabi, 110d, peak NDVI: 0.70)<br>8. **Wheat** (`code: 8`, Rabi, 120d, peak NDVI: 0.80)<br>9. **Onion** (`code: 9`, Rabi, 140d, peak NDVI: 0.66)<br>10. **Grapes** (`code: 10`, Annual, 300d, peak NDVI: 0.74)<br>11. **Fallow / bare** (`code: 11`, Any, peak NDVI < 0.30)<br>12. **Non-crop** (`code: 12`, Any, seasonal amplitude < 0.18) |
| **Probability Calibration** | **Isotonic Calibration enabled by default** via `ProbabilityCalibrator`. Reduces Expected Calibration Error (ECE) from 0.1108 down to 0.0046 (24x improvement), ensuring confidence probabilities reflect real accuracy. |
| **Abstention & Inspection Routing** | When prediction confidence < 0.947 (or configurable threshold) or when margin between top-2 crops (e.g. Cotton vs Tur) is < 5%, the parcel is automatically routed to the **Tahsildar Field Inspection Queue** rather than falsely confirmed. |

---

## 3. Training & Validation Methodology

- **Validation Protocol:** 5-fold **spatially blocked** cross-validation across 259 distinct spatial blocks (villages / revenue zones) to prevent spatial autocorrelation leakage.
- **Performance Upper Bounds (Synthetic Baseline):**
  - TempCNN: Accuracy 0.9755, Kappa 0.9704, Macro F1 0.9775
  - LightGBM: Accuracy 0.9655, Kappa 0.9582, Macro F1 0.9631, ECE 0.0231
  - Random Forest: Accuracy 0.9480, Kappa 0.9369, Macro F1 0.9465
- **Real-World Calibration Note:** The model documentation explicitly notes that headline kappa > 0.95 reflects an upper bound on synthetic curves; real-world field kappa is expected in the **0.65 – 0.85** range. Field ground truth integration is mandatory for legal revenue determinations.

---

## 4. Known Error Modes & Mitigations

1. **Cotton vs. Tur (Pigeon Pea) Confusion:** Both crops peak within days of each other and exhibit similar canopy development. The system uses SWIR moisture and SAR backscatter features, flagging predictions when top-2 probability difference is < 5%.
2. **Window Truncation on Long-Duration Crops (Sugarcane):** Sugarcane spans 330 days. If an observation window is restricted to a 170-day Kharif slice, the growth curve appears truncated. The pipeline detects curve truncation and widens the assessment window (to Jan 31) to prevent false classification as Sorghum.
3. **Monsoon Cloud Outages:** Persistent cloud cover in July–August. The system flags periods with zero clear pixels as `"Monsoon cloud outage (No observation)"` and preserves historical indices without manufactured values.
4. **Fallow & Non-Crop Rejection:** A strict deterministic rule is applied before classifier inference: peak NDVI < 0.30 or amplitude < 0.18 classifies the parcel as Fallow/Non-Crop to prevent bare fields from being predicted as crops.

---

## 5. Existing Web Application Stack (`PuneAgriMain`)

- **Frontend:** React 18 with TypeScript, Vite 8, Tailwind CSS, Lucide icons, Recharts, Leaflet GIS.
- **Backend Services:** Node/TypeScript services for plot management, registration, reports, NDVI calculation, and Supabase integration.
- **Database:** Supabase PostgreSQL with PostGIS extension (with local persistent `mockDb` fallback for offline / self-contained operations).
- **Satellite Client:** STAC API client connecting to Element 84 Earth Search (`https://earth-search.aws.element84.com/v1`).
- **Roles:** Farmer, Tahsildar, Field Worker, Administrator with role-based routing and localized interfaces across 10 Indic languages.

---

## 6. Integration Architecture Plan

1. **Persistent Coordinate Monitoring:**
   - Add database entities / mockDb stores for `MonitoringArea`, `MonitoringObservation`, and `MonitoringSchedule`.
   - Support coordinate inputs `(lat, lon)`, radius, date range, 15-day intervals, and parcel polygon association.
2. **Satellite & Remote Sensing Integration:**
   - Wire the Earth Search STAC API client to retrieve Sentinel-2 L2A scene metadata, BOA offsets (-1000 DN), 10m/20m rescaled bands (B02, B03, B04, B08, B11, B12), and SCL cloud masking.
3. **15-Day Composite & Phenology Engine:**
   - Execute period compositing using Maximum-NDVI over 15-day bins.
   - Calculate 7 vegetation indices (NDVI, EVI, SAVI, NDWI, NDMI, NDRE, GCVI).
   - Compute delta changes between successive observations.
4. **ML Inference Bridge:**
   - Connect the Python ML backend (`cropsurvey.periodic.analyse_coordinate` and `CropClassifier`) via a robust HTTP API (`/api/analyze`, `/api/result/{key}`, `/api/status/{key}`).
   - Provide client-side deterministic phenology fallback for standalone deployment if the Python server is offline.
5. **Dashboard Integration:**
   - Farmer Dashboard: Live coordinate monitoring widget, 15-day timeline, NDVI map layer, growth trend charts, potential stress indicators.
   - Tahsildar Dashboard: Jurisdiction-filtered monitoring records, inspection prioritization queue, discrepancy reviews, and official export.
