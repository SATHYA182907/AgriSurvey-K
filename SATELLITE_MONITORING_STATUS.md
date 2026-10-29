# Satellite Monitoring Status: Implementation Tracking

**Date:** 28 October 2026  
**System:** AgriSurvey AI — Maharashtra Geospatial Crop Monitoring Platform  
**Integration Reference:** `GM-ML-V2` Remote Sensing Engine  

---

## 1. Requirements Implementation Matrix

| Requirement Area | Specification | Status | Implementation Details / Artifacts |
|---|---|---|---|
| **1. Coordinate Input** | Latitude, Longitude, Radius (km), Start/End date, 15-day interval, Crop/Season inputs. Coordinate paste parsing (`19.0760, 72.8777`), map click pick. | **IN PROGRESS** | Enhanced UI in Farmer & Tahsildar dashboards with coordinate regex parsing, polygon parcel linking, and WGS84 bounding box calculations. |
| **2. Persistent Monitoring Records** | Store ID, user ID, plot ID, coordinates, geometry, start/end dates, interval, status, timestamps. Survive reloads. | **IN PROGRESS** | Supabase migration + `mockDb` table `monitoring_areas`, `monitoring_observations`, `monitoring_schedules` with local persistence. |
| **3. Real Satellite Integration** | Query Element 84 Earth Search STAC API (`https://earth-search.aws.element84.com/v1`, collection `sentinel-2-l2a`). Retrieve real scenes. | **COMPLETED** | Tested and verified via `GM-ML-V2/sources/earthsearch.py` and `src/services/stac.service.ts`. Retrieves actual scene IDs and metadata. |
| **4. Radiometric & Cloud Masking** | Sentinel-2 BOA offset (-1000 DN for baseline 04.00+), scale factor (1/10000), SCL invalid-pixel masking (shadow, high/med cloud, cirrus, snow). | **COMPLETED** | Verified in Python `earthsearch.py` and TypeScript `stac.service.ts` / `ndvi.service.ts`. Computes clear fraction per parcel. |
| **5. 15-Day Monitoring Scheduler** | Group passes into 15-day intervals, pick max-NDVI composite over aligned grid, idempotent execution, track missing periods honestly. | **IN PROGRESS** | `cropsurvey.composite.build_periods()` / `composite_series()` and frontend periodic monitoring scheduler service. |
| **6. Historical Observation Storage** | Persist observations per 15-day period: acquisition dates, cloud fraction, mean/median indices, model predictions, quality flags. | **IN PROGRESS** | Database schema defined with multi-period observation history linked to monitoring area ID. |
| **7. 7 Vegetation Indices** | NDVI, EVI, SAVI, NDWI, NDMI, NDRE, GCVI using exact Sentinel-2 bands (B02, B03, B04, B05/RedEdge, B08/NIR, B11/SWIR1, B12/SWIR2). | **COMPLETED** | Implemented with scientific division guards (`np.errstate` / NaN propagation) in both Python and TypeScript index engines. |
| **8. ML Model Integration** | 158 phenology features, LightGBM classifier with isotonic calibration, crop class mapping (12 classes), abstention below threshold. | **IN PROGRESS** | `GM-ML-V2/models/classifier.py` and `features.py` verified; integrating bridge API with AgriSurvey AI web services. |
| **9. Continuous Growth & Change Analysis** | Delta NDVI, delta NDMI, growth stage identification (emergence, vegetative, peak, maturity, senesced), baseline comparison. | **IN PROGRESS** | Phenological curve staging in `growth.py` being exposed via REST API and visualized in dashboard Recharts time series. |
| **10. Health Assessment & Alerts** | Peer-relative comparisons, stress flags, qualified advisory warnings, explainable inspection queue prioritization. | **IN PROGRESS** | Priority scoring based on low confidence (<0.947), negative NDVI delta (<-0.15), and moisture drop (<40%). |
| **11. Farmer Dashboard** | Coordinate monitoring panel, 15-day observation gallery, real acquisition dates, NDVI map layer, time-series charts. | **IN PROGRESS** | Adding `CoordinateMonitoringPanel.tsx` and timeline view to `/farmer/dashboard`. |
| **12. Tahsildar Dashboard** | Jurisdiction-restricted monitoring oversight, village/taluka filters, timeline inspection, ground-truth comparison, audit logging. | **IN PROGRESS** | Adding spatial monitoring tab to `/tahsildar/dashboard` with strict revenue jurisdiction guards. |
| **13. Map Visualization** | Selected point, parcel polygon, Sentinel-2 footprint, NDVI false-color raster overlay, historical date selector, legend. | **COMPLETED** | Leaflet-based GIS map with polygon bounds, marker pins, NDVI color ramp (dark red -> amber -> emerald). |
| **14. Network Resilience & Fallback** | Honest reporting of missing periods, caching of previous results, clear distinction between live, cached, and demo modes. | **COMPLETED** | Error boundaries with explicit "Monsoon cloud outage" labels; no synthetic hallucination on live workflows. |
| **15. Automated E2E Testing** | Coordinate validation, STAC query, period compositing, ML inference, change detection, and authorization tests. | **PLANNED** | Automated test script `scripts/test-satellite-monitoring.ts` and Python verification suite. |

---

## 2. Blockers & Dependencies

- **Python Environment:** The host system runs macOS where Homebrew Python 3.13 requires a patched `platform.py` fallback to prevent truststore macOS version query failures during pip wheel installations. Successfully patched and resolved.
- **Satellite Connectivity:** Live Element 84 Earth Search STAC endpoint is reachable with no API key or credentials required.
- **ISRO Bhoonidhi:** Requires explicit user credentials (`BHOONIDHI_USER`, `BHOONIDHI_PASS`); system defaults to Copernicus Sentinel-2 L2A via AWS Open Data for zero-credential operation.
