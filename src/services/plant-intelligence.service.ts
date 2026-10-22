import { supabase, isLiveSupabaseConfigured } from '@/lib/supabase';
import { mockDb } from './mock-db';
import { PlantHealthEngine, DEFAULT_CROP_THRESHOLDS } from './plant-health.service';
import { notificationService } from './notification.service';
import {
  MonitoringUnit,
  PlantObservation,
  SensorDevice,
  SensorReading,
  PlantHealthAssessment,
  PlantHealthAlert,
  Crop,
  CropHealthThreshold,
  PlantHealthStatus,
} from '@/types';

export class PlantIntelligenceService {
  /**
   * Fetch all monitoring units, optionally filtered by property or farmer
   */
  async getMonitoringUnits(params?: {
    propertyId?: string;
    farmerId?: string;
  }): Promise<MonitoringUnit[]> {
    if (isLiveSupabaseConfigured && supabase) {
      let query = supabase
        .from('monitoring_units')
        .select(`
          *,
          property:properties(*),
          crop:crops(*)
        `)
        .order('created_at', { ascending: false });

      if (params?.propertyId) {
        query = query.eq('property_id', params.propertyId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }

    // Local Persistent DB
    let list = mockDb.monitoringUnits.map((u) => {
      const prop = mockDb.properties.find((p) => p.id === u.property_id);
      const crop = mockDb.crops.find((c) => c.id === u.crop_id);
      const latestAssessment = mockDb.plantHealthAssessments.find(
        (a) => a.monitoring_unit_id === u.id
      );
      const activeAlerts = mockDb.plantHealthAlerts.filter(
        (a) => a.monitoring_unit_id === u.id && a.status === 'active'
      ).length;

      return {
        ...u,
        property: prop,
        crop,
        latest_assessment: latestAssessment,
        active_alerts_count: activeAlerts,
      };
    });

    if (params?.propertyId) {
      list = list.filter((u) => u.property_id === params.propertyId);
    }
    if (params?.farmerId) {
      list = list.filter((u) => u.property?.farmer_id === params.farmerId);
    }
    return list;
  }

  /**
   * Get single monitoring unit by ID with its readings, observations, and assessment
   */
  async getMonitoringUnitById(unitId: string): Promise<{
    unit: MonitoringUnit | null;
    readings: SensorReading[];
    observations: PlantObservation[];
    assessment: PlantHealthAssessment | null;
    device: SensorDevice | null;
    alerts: PlantHealthAlert[];
  }> {
    const units = await this.getMonitoringUnits();
    const unit = units.find((u) => u.id === unitId) || null;
    if (!unit) {
      return { unit: null, readings: [], observations: [], assessment: null, device: null, alerts: [] };
    }

    const readings = mockDb.sensorReadings
      .filter((r) => r.monitoring_unit_id === unitId)
      .sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime());

    const observations = mockDb.plantObservations
      .filter((o) => o.monitoring_unit_id === unitId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const assessment = mockDb.plantHealthAssessments.find(
      (a) => a.monitoring_unit_id === unitId
    ) || null;

    const device = mockDb.sensorDevices.find(
      (d) => d.monitoring_unit_id === unitId
    ) || null;

    const alerts = mockDb.plantHealthAlerts.filter(
      (a) => a.monitoring_unit_id === unitId
    );

    return { unit, readings, observations, assessment, device, alerts };
  }

  /**
   * Register a new monitoring unit on an approved agricultural property
   */
  async createMonitoringUnit(params: {
    propertyId: string;
    unitName: string;
    unitType: MonitoringUnit['unit_type'];
    cropVariety: string;
    cropId?: string;
    plantingDate?: string;
    zoneIdentifier: string;
    latitude?: number | null;
    longitude?: number | null;
    areaCovered?: number;
    areaUnit?: string;
  }): Promise<MonitoringUnit> {
    const { propertyId, unitName, unitType, cropVariety, cropId, plantingDate, zoneIdentifier, latitude, longitude, areaCovered, areaUnit } = params;

    // Enforcement: Check that property is verified/approved by Tahsildar
    const prop = mockDb.properties.find((p) => p.id === propertyId);
    if (!prop) throw new Error('Target agricultural property not found.');

    const app = mockDb.applications.find((a) => a.property_id === propertyId);
    if (app && app.status !== 'APPROVED') {
      throw new Error(
        `Cannot activate plant monitoring on unverified property. Current status: ${app.status}. Tahsildar official approval is required first.`
      );
    }

    const newUnit: MonitoringUnit = {
      id: `unit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      property_id: propertyId,
      unit_name: unitName,
      unit_type: unitType,
      crop_id: cropId || 'crop-sugarcane',
      crop_variety: cropVariety,
      planting_date: plantingDate || new Date().toISOString().split('T')[0],
      zone_identifier: zoneIdentifier,
      latitude: latitude ?? prop.latitude,
      longitude: longitude ?? prop.longitude,
      area_covered: areaCovered || 1.0,
      area_unit: areaUnit || prop.land_area_unit || 'Acres',
      current_health_status: 'Insufficient Data',
      last_assessed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mockDb.addMonitoringUnit(newUnit);

    mockDb.addAuditLog(
      'MONITORING_UNIT_REGISTERED',
      'monitoring_units',
      newUnit.id,
      null,
      { unit_name: unitName, crop_variety: cropVariety, zone_identifier: zoneIdentifier }
    );

    return newUnit;
  }

  /**
   * Method A & C: Record a plant observation (Photo or Manual Field Check)
   * Automatically re-evaluates plant health condition and generates alerts if needed!
   */
  async recordObservation(params: {
    monitoringUnitId: string;
    propertyId: string;
    recordedBy: string;
    observationType: 'image' | 'manual' | 'field_inspection';
    collectionMethod: string;
    dataSource: 'farmer_mobile' | 'field_worker_tablet' | 'iot_gateway' | 'agronomist';
    photographs?: PlantObservation['photographs'];
    growthStage?: PlantObservation['growth_stage'];
    irrigationCondition?: PlantObservation['irrigation_condition'];
    wiltingObserved?: boolean;
    leafDiscoloration?: PlantObservation['leaf_discoloration'];
    pestObserved?: boolean;
    pestDetails?: string;
    visibleDiseaseSymptoms?: string;
    generalNotes?: string;
    aiPrediction?: PlantObservation['ai_prediction'];
  }): Promise<{ observation: PlantObservation; assessment: PlantHealthAssessment }> {
    const unit = mockDb.monitoringUnits.find((u) => u.id === params.monitoringUnitId);
    if (!unit) throw new Error('Monitoring unit not found.');

    const newObs: PlantObservation = {
      id: `obs-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      monitoring_unit_id: params.monitoringUnitId,
      property_id: params.propertyId,
      recorded_by: params.recordedBy,
      recorded_by_name: mockDb.currentUser.full_name,
      observation_type: params.observationType,
      collection_method: params.collectionMethod,
      data_source: params.dataSource,
      timestamp: new Date().toISOString(),
      photographs: params.photographs || [],
      growth_stage: params.growthStage,
      irrigation_condition: params.irrigationCondition,
      wilting_observed: Boolean(params.wiltingObserved),
      leaf_discoloration: params.leafDiscoloration || 'None',
      pest_observed: Boolean(params.pestObserved),
      pest_details: params.pestDetails,
      visible_disease_symptoms: params.visibleDiseaseSymptoms,
      general_notes: params.generalNotes,
      ai_prediction: params.aiPrediction,
      created_at: new Date().toISOString(),
    };

    mockDb.addPlantObservation(newObs);

    // Recalculate Health Assessment
    const assessment = await this.recalculateUnitHealth(params.monitoringUnitId);

    mockDb.addAuditLog(
      'PLANT_OBSERVATION_RECORDED',
      'plant_observations',
      newObs.id,
      null,
      {
        unit_name: unit.unit_name,
        type: params.observationType,
        health_result: assessment.overall_status,
      }
    );

    return { observation: newObs, assessment };
  }

  /**
   * Method B: Ingest a sensor reading
   * Validates measurement, persists reading, and triggers real-time health engine recalculation.
   */
  async ingestSensorReading(params: {
    monitoringUnitId: string;
    propertyId: string;
    parameter: SensorReading['parameter'];
    value: number;
    unit: string;
    sourceDevice?: string;
    deviceId?: string;
  }): Promise<{ reading: SensorReading; assessment: PlantHealthAssessment }> {
    const unit = mockDb.monitoringUnits.find((u) => u.id === params.monitoringUnitId);
    if (!unit) throw new Error('Monitoring unit not found.');

    // Validate reading range
    const validation = PlantHealthEngine.validateReading({
      parameter: params.parameter,
      value: params.value,
    });

    const newReading: SensorReading = {
      id: `rd-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      device_id: params.deviceId,
      property_id: params.propertyId,
      monitoring_unit_id: params.monitoringUnitId,
      parameter: params.parameter,
      value: params.value,
      unit: params.unit,
      recorded_at: new Date().toISOString(),
      source_device: params.sourceDevice || 'IoT-Edge-Gateway',
      data_quality: validation.isValid ? 'validated' : 'suspect',
      created_at: new Date().toISOString(),
    };

    mockDb.addSensorReading(newReading);

    // If device exists, update its heartbeat
    if (params.deviceId) {
      const dev = mockDb.sensorDevices.find((d) => d.id === params.deviceId);
      if (dev) {
        dev.last_heartbeat = new Date().toISOString();
        dev.status = 'active';
        mockDb.persistAll();
      }
    }

    // Trigger Health Engine Recalculation
    const assessment = await this.recalculateUnitHealth(params.monitoringUnitId);

    return { reading: newReading, assessment };
  }

  /**
   * Recalculates health assessment for a given unit based on active readings and observations
   */
  async recalculateUnitHealth(unitId: string): Promise<PlantHealthAssessment> {
    const unit = mockDb.monitoringUnits.find((u) => u.id === unitId);
    if (!unit) throw new Error('Monitoring unit not found.');

    const prop = mockDb.properties.find((p) => p.id === unit.property_id);

    const readings = mockDb.sensorReadings.filter((r) => r.monitoring_unit_id === unitId);
    const observations = mockDb.plantObservations.filter((o) => o.monitoring_unit_id === unitId);

    const assessment = PlantHealthEngine.evaluateHealth({
      unitId,
      propertyId: unit.property_id,
      cropVariety: unit.crop_variety,
      readings,
      observations,
      configuredThresholds: mockDb.cropThresholds,
    });

    // Save assessment to persistent DB
    mockDb.addPlantAssessment(assessment);

    // Check if new alert is warranted
    const alert = PlantHealthEngine.generateAlertFromAssessment({
      assessment,
      unitName: unit.unit_name,
      propertyName: prop?.property_name || 'Farmland',
      cropVariety: unit.crop_variety,
    });

    if (alert) {
      // Check if duplicate active alert already exists for same unit and reason
      const existing = mockDb.plantHealthAlerts.find(
        (a) => a.monitoring_unit_id === unitId && a.status === 'active' && a.severity === alert.severity
      );
      if (!existing) {
        mockDb.addPlantAlert(alert);

        // Notify farmer in-app
        if (prop?.farmer_id) {
          await notificationService.createNotification({
            recipient_user_id: prop.farmer_id,
            notification_type: 'PLANT_HEALTH_ALERT',
            title: `Critical Alert: ${unit.unit_name}`,
            message: `${alert.reason} Recommended: ${alert.recommended_action}`,
            related_application_id: null,
            channel: 'in_app',
          });
        }
      }
    }

    return assessment;
  }

  /**
   * Retrieve alerts
   */
  async getAlerts(params?: {
    propertyId?: string;
    farmerId?: string;
    unitId?: string;
    status?: 'active' | 'acknowledged' | 'resolved' | 'ALL';
  }): Promise<PlantHealthAlert[]> {
    let list = [...mockDb.plantHealthAlerts];

    if (params?.status && params.status !== 'ALL') {
      list = list.filter((a) => a.status === params.status);
    }
    if (params?.unitId) {
      list = list.filter((a) => a.monitoring_unit_id === params.unitId);
    }
    if (params?.propertyId) {
      list = list.filter((a) => a.property_id === params.propertyId);
    }
    if (params?.farmerId) {
      list = list.filter((a) => {
        const prop = mockDb.properties.find((p) => p.id === a.property_id);
        return prop?.farmer_id === params.farmerId;
      });
    }

    return list.sort((a, b) => new Date(b.detected_at).getTime() - new Date(a.detected_at).getTime());
  }

  /**
   * Acknowledge alert (Note: does NOT resolve underlying plant stress!)
   */
  async acknowledgeAlert(alertId: string, userId: string): Promise<void> {
    mockDb.updateAlertStatus(alertId, 'acknowledged', userId);
    mockDb.addAuditLog(
      'PLANT_ALERT_ACKNOWLEDGED',
      'plant_health_alerts',
      alertId,
      { status: 'active' },
      { status: 'acknowledged' }
    );
  }

  /**
   * Mark alert as resolved
   */
  async resolveAlert(alertId: string, userId: string): Promise<void> {
    mockDb.updateAlertStatus(alertId, 'resolved', userId);
    mockDb.addAuditLog(
      'PLANT_ALERT_RESOLVED',
      'plant_health_alerts',
      alertId,
      { status: 'acknowledged' },
      { status: 'resolved' }
    );
  }

  /**
   * Get all registered crop categories
   */
  async getCrops(): Promise<Crop[]> {
    return mockDb.crops;
  }

  /**
   * Get configurable thresholds
   */
  async getCropThresholds(cropName?: string): Promise<CropHealthThreshold[]> {
    if (cropName) {
      return mockDb.cropThresholds.filter(
        (th) => th.crop_name.toLowerCase() === cropName.toLowerCase()
      );
    }
    return mockDb.cropThresholds;
  }

  /**
   * Update crop threshold (Administrator / Agronomist action)
   */
  async updateCropThreshold(threshold: CropHealthThreshold): Promise<void> {
    const idx = mockDb.cropThresholds.findIndex((th) => th.id === threshold.id);
    if (idx >= 0) {
      const prev = mockDb.cropThresholds[idx];
      mockDb.cropThresholds[idx] = threshold;
      mockDb.persistAll();
      mockDb.addAuditLog(
        'CROP_HEALTH_THRESHOLD_UPDATED',
        'crop_health_thresholds',
        threshold.id,
        prev,
        threshold
      );
    }
  }

  /**
   * Agricultural Monitoring View for Tahsildars:
   * Summarizes verified agricultural monitoring across their jurisdiction.
   */
  async getTahsildarJurisdictionMonitoringSummary(tahsildarId: string): Promise<{
    assignedJurisdiction: string;
    totalMonitoredFarms: number;
    totalMonitoredUnits: number;
    healthDistribution: Record<PlantHealthStatus, number>;
    criticalAlertCount: number;
    activeSensorsCount: number;
    disconnectedSensorsCount: number;
    staleDataUnitsCount: number;
    cropDistribution: Array<{ crop: string; unitCount: number; percentage: number }>;
    unitsWithCriticalAlerts: MonitoringUnit[];
    farmsWithStaleData: MonitoringUnit[];
  }> {
    // Determine Tahsildar jurisdiction
    const regions = mockDb.staffRegions.filter((sr) => sr.staff_user_id === tahsildarId);
    const assignedTaluk = regions[0]?.taluk || 'Haveli';
    const assignedDistrict = regions[0]?.district || 'Pune';

    // Properties in this jurisdiction
    const jurisdictionProperties = mockDb.properties.filter(
      (p) => p.district === assignedDistrict && (!assignedTaluk || p.taluk === assignedTaluk)
    );
    const propertyIds = new Set(jurisdictionProperties.map((p) => p.id));

    // Monitoring units in this jurisdiction
    const units = mockDb.monitoringUnits.filter((u) => propertyIds.has(u.property_id));

    const healthDistribution: Record<PlantHealthStatus, number> = {
      Healthy: 0,
      'Needs Attention': 0,
      'At Risk': 0,
      Critical: 0,
      'Insufficient Data': 0,
    };

    let criticalAlertsCount = 0;
    const cropCounts: Record<string, number> = {};
    const criticalUnits: MonitoringUnit[] = [];
    const staleUnits: MonitoringUnit[] = [];

    for (const unit of units) {
      healthDistribution[unit.current_health_status] =
        (healthDistribution[unit.current_health_status] || 0) + 1;

      // Crop count
      cropCounts[unit.crop_variety] = (cropCounts[unit.crop_variety] || 0) + 1;

      // Critical check
      if (unit.current_health_status === 'Critical') {
        criticalUnits.push({
          ...unit,
          property: jurisdictionProperties.find((p) => p.id === unit.property_id),
        });
      }

      // Stale check
      if (
        unit.current_health_status === 'Insufficient Data' ||
        !unit.last_assessed_at ||
        Date.now() - new Date(unit.last_assessed_at).getTime() > 72 * 60 * 60 * 1000
      ) {
        staleUnits.push({
          ...unit,
          property: jurisdictionProperties.find((p) => p.id === unit.property_id),
        });
      }
    }

    // Active alerts in jurisdiction
    const alerts = mockDb.plantHealthAlerts.filter(
      (a) => propertyIds.has(a.property_id) && a.status === 'active'
    );
    criticalAlertsCount = alerts.filter((a) => a.severity === 'critical').length;

    // Devices in jurisdiction
    const devices = mockDb.sensorDevices.filter((d) => propertyIds.has(d.property_id));
    const activeSensorsCount = devices.filter((d) => d.status === 'active').length;
    const disconnectedSensorsCount = devices.filter((d) => d.status !== 'active').length;

    // Crop distribution percentage
    const totalUnits = units.length || 1;
    const cropDistribution = Object.entries(cropCounts).map(([crop, count]) => ({
      crop,
      unitCount: count,
      percentage: Math.round((count / totalUnits) * 100),
    }));

    return {
      assignedJurisdiction: `${assignedTaluk} Taluk, ${assignedDistrict} District`,
      totalMonitoredFarms: new Set(units.map((u) => u.property_id)).size,
      totalMonitoredUnits: units.length,
      healthDistribution,
      criticalAlertCount: criticalAlertsCount,
      activeSensorsCount,
      disconnectedSensorsCount,
      staleDataUnitsCount: staleUnits.length,
      cropDistribution,
      unitsWithCriticalAlerts: criticalUnits,
      farmsWithStaleData: staleUnits,
    };
  }
}

export const plantIntelligenceService = new PlantIntelligenceService();
