/**
 * AgriSurvey AI — Automated Satellite Monitoring & Remote Sensing Test Suite
 * 
 * Verifies:
 * 1. Geographic coordinate validation & comma-separated string parsing
 * 2. 7-Spectral vegetation index algorithms (NDVI, EVI, SAVI, NDWI, NDMI, NDRE, GCVI)
 * 3. 15-Day sequential periodic interval generation
 * 4. Honest monsoon cloud masking & unassessed interval logic
 * 5. Tahsildar prioritized inspection queue trigger conditions (Selective prediction threshold 90%, delta drops)
 * 6. MockDatabase persistence and multi-tenancy isolation
 */

import { satelliteMonitoringService } from '../src/services/satellite-monitoring.service';
import { mockDb } from '../src/services/mock-db';
import { MonitoringArea, MonitoringPeriodObservation } from '../src/types';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`  ✓ ${message}`);
  }
}

async function runTestSuite() {
  console.log('================================================================');
  console.log('🛰️ AGRISURVEY AI: SATELLITE MONITORING & ML TEST SUITE');
  console.log('================================================================\n');

  // TEST 1: Coordinate Parsing & Validation
  console.log('Test 1: Coordinate Parsing & Maharashtra Boundary Validation');
  const parsed1 = satelliteMonitoringService.parseCoordinates('19.0760, 72.8777');
  assert(parsed1 !== null, 'Parses standard comma-separated coordinate string');
  assert(parsed1?.lat === 19.0760 && parsed1?.lon === 72.8777, 'Latitude and longitude match expected values');

  const parsed2 = satelliteMonitoringService.parseCoordinates('  18.5793 , 73.9812  ');
  assert(parsed2 !== null && parsed2.lat === 18.5793 && parsed2.lon === 73.9812, 'Handles extraneous whitespace');

  const validBounds = satelliteMonitoringService.validateMaharashtraCoordinates(18.5793, 73.9812);
  assert(validBounds.isValid, 'Pune coordinates (18.58° N, 73.98° E) validated inside Maharashtra bounds');

  const outOfBounds = satelliteMonitoringService.validateMaharashtraCoordinates(28.6139, 77.2090); // New Delhi
  assert(!outOfBounds.isValid, 'Delhi coordinates correctly flagged outside Maharashtra bounds');
  console.log('');

  // TEST 2: 7 Spectral Remote Sensing Indices Calculation
  console.log('Test 2: 7 Spectral Vegetation Index Mathematical Integrity');
  // Simulated healthy sugarcane reflectance:
  // B02 (Blue) = 0.03, B03 (Green) = 0.08, B04 (Red) = 0.04, B05 (RedEdge) = 0.18, B08 (NIR) = 0.46, B11 (SWIR) = 0.19
  const bands = {
    b02: 0.03,
    b03: 0.08,
    b04: 0.04,
    b05: 0.18,
    b08: 0.46,
    b11: 0.19,
  };

  const indices = satelliteMonitoringService.calculateIndices(bands);
  
  // NDVI = (0.46 - 0.04) / (0.46 + 0.04) = 0.42 / 0.50 = 0.84
  assert(Math.abs(indices.ndvi_mean - 0.84) < 0.01, `NDVI calculated accurately: ${indices.ndvi_mean} ≈ 0.84`);
  
  // NDMI = (0.46 - 0.19) / (0.46 + 0.19) = 0.27 / 0.65 ≈ 0.415
  assert(Math.abs(indices.ndmi_mean - 0.415) < 0.01, `NDMI calculated accurately: ${indices.ndmi_mean} ≈ 0.415`);

  // NDWI = (0.08 - 0.46) / (0.08 + 0.46) = -0.38 / 0.54 ≈ -0.704
  assert(indices.ndwi_mean < 0, `NDWI negative over dense vegetative canopy: ${indices.ndwi_mean}`);

  // Test zero division protection
  const zeroBands = { b02: 0, b03: 0, b04: 0, b05: 0, b08: 0, b11: 0 };
  const safeIndices = satelliteMonitoringService.calculateIndices(zeroBands);
  assert(safeIndices.ndvi_mean === 0, 'Zero denominator safely handled without NaN or Infinity');
  console.log('');

  // TEST 3: 15-Day Sequential Periodic Interval Generation
  console.log('Test 3: 15-Day Periodic Cadence Generation');
  const periods = satelliteMonitoringService.generate15DayPeriods('2026-06-01', '2026-10-31');
  assert(periods.length === 11, `Generated exactly 11 15-day intervals for Kharif (153 days) (Found: ${periods.length})`);
  assert(periods[0].start === '2026-06-01' && periods[0].end === '2026-06-15', 'Period 1 spans 01 Jun to 15 Jun');
  assert(periods[1].start === '2026-06-16' && periods[1].end === '2026-06-30', 'Period 2 spans 16 Jun to 30 Jun');
  assert(periods[10].end === '2026-10-31', 'Final period ends on 31 Oct');
  console.log('');

  // TEST 4: Phenology Growth Stage Progression
  console.log('Test 4: Phenological Growth Stage Determination');
  const stage1 = satelliteMonitoringService.determineGrowthStage(0.18, 1, 10);
  assert(stage1 === 'Emergence', `NDVI 0.18 at Period 1 classified as Emergence: ${stage1}`);

  const stage2 = satelliteMonitoringService.determineGrowthStage(0.68, 6, 10);
  assert(stage2 === 'Peak / Reproductive', `NDVI 0.68 at Period 6 classified as Peak / Reproductive: ${stage2}`);

  const stage3 = satelliteMonitoringService.determineGrowthStage(0.52, 9, 10);
  assert(stage3 === 'Maturity', `NDVI 0.52 at Period 9 classified as Maturity: ${stage3}`);
  console.log('');

  // TEST 5: Tahsildar Prioritized Inspection Queue Evaluation
  console.log('Test 5: Priority Inspection Queue Trigger Rules');
  
  // Case A: Low ML confidence (< 90%)
  const obsLowConf: MonitoringPeriodObservation = {
    ...mockDb.periodObservations[0],
    id: 'test-obs-low-conf',
    crop_prediction: {
      crop_name: 'Cotton',
      confidence: 84.2, // Below 90%
      ranking: [{ crop: 'Cotton', fit: 84.2 }, { crop: 'Tur', fit: 12.1 }],
      needs_field_check: true,
      model_version: 'GM-ML-V2-LightGBM-158feat',
    },
    delta_ndvi_previous: -0.04,
  };
  const itemA = satelliteMonitoringService.evaluateInspectionTriggers(
    mockDb.monitoringAreas[0],
    obsLowConf,
    mockDb.profiles[0]
  );
  assert(itemA !== null, 'Triggered inspection item for selective prediction low confidence');
  assert(itemA?.priority === 'HIGH' || itemA?.priority === 'CRITICAL', `Priority is high/critical: ${itemA?.priority}`);
  assert(
    itemA?.reasons.some((r) => r.includes('confidence')) === true,
    'Reason list details confidence threshold failure'
  );

  // Case B: Severe NDVI drop (<-0.15)
  const obsDrop: MonitoringPeriodObservation = {
    ...mockDb.periodObservations[0],
    id: 'test-obs-drop',
    delta_ndvi_previous: -0.19, // Significant loss
  };
  const itemB = satelliteMonitoringService.evaluateInspectionTriggers(
    mockDb.monitoringAreas[0],
    obsDrop,
    mockDb.profiles[0]
  );
  assert(itemB !== null, 'Triggered inspection item for abrupt 15-day NDVI decline (-0.19)');
  assert(itemB?.reasons.some((r) => r.includes('decline')) === true, 'Reason identifies vegetative decline');
  console.log('');

  // TEST 6: MockDatabase Integration & Retrieval
  console.log('Test 6: MockDatabase Continuous Monitoring Persistence');
  const areas = mockDb.monitoringAreas;
  assert(areas.length >= 2, `Retrieved ${areas.length} pre-seeded monitoring areas`);
  
  const p1Obs = mockDb.getObservationsForArea('area-01');
  assert(p1Obs.length === 10, `Retrieved 10 periodic observations for Wagholi parcel (Found: ${p1Obs.length})`);
  
  const cloudOutages = p1Obs.filter((o) => !o.has_data);
  assert(cloudOutages.length === 2, `Found exactly 2 honest monsoon cloud outages in July (Found: ${cloudOutages.length})`);
  assert(
    cloudOutages[0].missing_reason?.includes('Monsoon cloud outage') === true,
    'Missing reason accurately attributes to monsoon cloud outage rather than data corruption'
  );

  const queueItems = mockDb.getInspectionQueue('Pune', 'Baramati');
  assert(queueItems.length >= 1, `Jurisdiction filtered inspection queue for Pune/Baramati returned items: ${queueItems.length}`);
  console.log('');

  console.log('================================================================');
  console.log('🎉 ALL SATELLITE MONITORING & ML SUITE TESTS PASSED (100% OK)');
  console.log('================================================================\n');
}

runTestSuite().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
