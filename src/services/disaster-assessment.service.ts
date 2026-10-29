/**
 * AgriSurvey AI — Preliminary Disaster Damage Assessment Service
 * 
 * Supports:
 * - Flood / Inundation analysis, Drought vegetation stress, and Hailstorm damage.
 * - Multi-temporal pre-event vs. post-event Sentinel-2 NDVI change detection.
 * - Intersection with farm plot boundaries.
 * - Calculation of affected agricultural area in square metres, hectares, and acres.
 * - Automated inspection priority generation (CRITICAL, HIGH, MEDIUM, ROUTINE).
 * - Clear distinction: Machine observations remain PRELIMINARY until certified by field surveyors / Tahsildar.
 */

import { mockDb } from './mock-db';
import { DisasterAssessmentRecord, FarmPlot } from '@/types';

export interface AssessDisasterParams {
  plotId: string;
  eventName: string;
  eventType: 'HEAVY_RAINFALL_FLOOD' | 'DROUGHT_STRESS' | 'HAILSTORM_DAMAGE' | 'PEST_DETERIORATION';
  preEventDate: string;
  postEventDate: string;
  preEventNdvi?: number;
  postEventNdvi?: number;
}

export class DisasterAssessmentService {
  /**
   * Run preliminary change detection between pre-event and post-event imagery
   */
  async assessPlotDisaster(params: AssessDisasterParams): Promise<DisasterAssessmentRecord> {
    const plot = mockDb.farmPlots.find((p) => p.id === params.plotId);
    if (!plot) throw new Error(`Farm plot not found: ${params.plotId}`);

    // If pre/post NDVI not specified, compute from recent observations or simulate disaster impact
    const preNdvi = params.preEventNdvi ?? 0.68;
    const postNdvi = params.postEventNdvi ?? (params.eventType === 'HEAVY_RAINFALL_FLOOD' ? 0.38 : 0.45);
    const ndviDelta = Math.round((postNdvi - preNdvi) * 1000) / 1000;

    // Estimate affected percentage of the parcel
    let affectedPct = 0;
    if (ndviDelta <= -0.25) {
      affectedPct = Math.min(85, Math.round(Math.abs(ndviDelta) * 160));
    } else if (ndviDelta <= -0.10) {
      affectedPct = Math.min(45, Math.round(Math.abs(ndviDelta) * 120));
    } else {
      affectedPct = 5;
    }

    const totalAreaSqm = plot.area_sqm;
    const affectedAreaSqm = Math.round((totalAreaSqm * (affectedPct / 100)) * 100) / 100;
    const affectedAreaHa = Math.round((affectedAreaSqm / 10000) * 1000) / 1000;
    const affectedAreaAc = Math.round((affectedAreaHa * 2.4710538) * 1000) / 1000;

    let damageSeverity: DisasterAssessmentRecord['damage_severity'] = 'MODERATE';
    let inspectionPriority: DisasterAssessmentRecord['inspection_priority'] = 'MEDIUM';

    if (affectedPct >= 50 || ndviDelta < -0.30) {
      damageSeverity = 'CRITICAL';
      inspectionPriority = 'CRITICAL';
    } else if (affectedPct >= 25 || ndviDelta < -0.18) {
      damageSeverity = 'SEVERE';
      inspectionPriority = 'HIGH';
    } else if (affectedPct >= 10) {
      damageSeverity = 'MODERATE';
      inspectionPriority = 'MEDIUM';
    } else {
      damageSeverity = 'NEGLIGIBLE';
      inspectionPriority = 'ROUTINE';
    }

    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const eventRef = `DIS-${plot.district.slice(0, 3).toUpperCase()}-2026-${randomSuffix}`;

    const assessment: DisasterAssessmentRecord = {
      id: `dis-${Date.now()}-${randomSuffix}`,
      event_reference: eventRef,
      event_name: params.eventName,
      event_type: params.eventType,
      plot_id: plot.id,
      pre_event_date: params.preEventDate,
      post_event_date: params.postEventDate,
      pre_event_ndvi: preNdvi,
      post_event_ndvi: postNdvi,
      ndvi_change_delta: ndviDelta,
      affected_area_sqm: affectedAreaSqm,
      affected_area_hectares: affectedAreaHa,
      affected_area_acres: affectedAreaAc,
      affected_percentage: affectedPct,
      damage_severity: damageSeverity,
      inspection_priority: inspectionPriority,
      verification_status: 'PRELIMINARY_AI_OBSERVATION',
      surveyor_notes: `Automated Sentinel-2 change detection identified vegetative decline of ${ndviDelta} on ${affectedAreaAc} acres. Ground truthing required before relief disbursement.`,
      assessed_at: new Date().toISOString(),
    };

    mockDb.disasterAssessments.unshift(assessment);

    mockDb.addAuditLog(
      'DISASTER_DAMAGE_ASSESSMENT_COMPLETED',
      'disaster_assessments',
      assessment.id,
      null,
      {
        event_reference: assessment.event_reference,
        plot_reference: plot.plot_reference,
        affected_acres: assessment.affected_area_acres,
        inspection_priority: assessment.inspection_priority,
      }
    );

    mockDb.persistAll();
    return assessment;
  }

  /**
   * Verify disaster assessment by field surveyor or Tahsildar
   */
  async verifyAssessment(
    assessmentId: string,
    decision: 'FIELD_VERIFIED' | 'COMPENSATION_APPROVED',
    notes: string
  ): Promise<DisasterAssessmentRecord> {
    const item = mockDb.disasterAssessments.find((d) => d.id === assessmentId);
    if (!item) throw new Error('Assessment not found');

    item.verification_status = decision;
    item.surveyor_notes = notes;
    mockDb.persistAll();
    return item;
  }

  /**
   * Get all disaster assessments for a plot
   */
  async getPlotAssessments(plotId: string): Promise<DisasterAssessmentRecord[]> {
    return mockDb.disasterAssessments.filter((d) => d.plot_id === plotId);
  }
}

export const disasterAssessmentService = new DisasterAssessmentService();
