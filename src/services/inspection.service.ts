import { supabase, isLiveSupabaseConfigured } from '@/lib/supabase';
import { mockDb } from './mock-db';
import { notificationService } from './notification.service';
import { FieldInspection, InspectionStatus } from '@/types';

export class InspectionService {
  async getInspectionsForWorker(workerId: string): Promise<FieldInspection[]> {
    return mockDb.inspections
      .filter((i) => !workerId || i.assigned_worker_id === workerId)
      .map((i) => ({
        ...i,
        property: mockDb.properties.find((p) => p.id === i.property_id),
        application: mockDb.applications.find((a) => a.id === i.application_id),
        assigned_worker: mockDb.profiles.find((p) => p.id === i.assigned_worker_id),
      }));
  }

  async getInspectionById(id: string): Promise<FieldInspection | null> {
    const insp = mockDb.inspections.find((i) => i.id === id);
    if (!insp) return null;
    return {
      ...insp,
      property: mockDb.properties.find((p) => p.id === insp.property_id),
      application: mockDb.applications.find((a) => a.id === insp.application_id),
      assigned_worker: mockDb.profiles.find((p) => p.id === insp.assigned_worker_id),
    };
  }

  async assignInspection(params: {
    propertyId: string;
    applicationId: string;
    workerId: string;
    scheduledAt?: string;
    fieldNotes?: string;
  }): Promise<FieldInspection> {
    const newInsp: FieldInspection = {
      id: `insp-${Date.now()}`,
      property_id: params.propertyId,
      application_id: params.applicationId,
      assigned_worker_id: params.workerId,
      assigned_tahsildar_id: mockDb.currentUser.id,
      inspection_status: 'ASSIGNED',
      scheduled_at: params.scheduledAt || new Date(Date.now() + 86400000 * 2).toISOString(),
      started_at: null,
      completed_at: null,
      field_notes: params.fieldNotes || 'Standard drone photogrammetry mission assigned.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mockDb.inspections.unshift(newInsp);

    mockDb.addAuditLog(
      'FIELD_INSPECTION_ASSIGNED',
      'field_inspections',
      newInsp.id,
      null,
      { assigned_worker_id: params.workerId, scheduled_at: newInsp.scheduled_at }
    );

    await notificationService.createNotification({
      recipient_user_id: params.workerId,
      notification_type: 'NEW_INSPECTION_ASSIGNED',
      title: 'New Drone Inspection Assigned',
      message: `You have been assigned inspection for land parcel at Survey No. ${mockDb.properties.find((p) => p.id === params.propertyId)?.survey_number}.`,
      related_application_id: params.applicationId,
      channel: 'in_app',
    });

    mockDb.persistAll();
    return newInsp;
  }

  async updateInspectionStatus(
    inspectionId: string,
    status: InspectionStatus,
    notes?: string
  ): Promise<FieldInspection> {
    const insp = mockDb.inspections.find((i) => i.id === inspectionId);
    if (!insp) throw new Error('Inspection not found');

    const prev = insp.inspection_status;
    insp.inspection_status = status;
    insp.updated_at = new Date().toISOString();
    if (notes) insp.field_notes = notes;

    if (status === 'IN_PROGRESS' && !insp.started_at) {
      insp.started_at = new Date().toISOString();
    } else if (status === 'COMPLETED' || status === 'SUBMITTED_FOR_REVIEW') {
      insp.completed_at = new Date().toISOString();
    }

    mockDb.addAuditLog(
      'FIELD_INSPECTION_STATUS_CHANGED',
      'field_inspections',
      insp.id,
      { status: prev },
      { status, notes }
    );

    // Notify Tahsildar when evidence submitted
    if (status === 'SUBMITTED_FOR_REVIEW' && insp.assigned_tahsildar_id) {
      await notificationService.createNotification({
        recipient_user_id: insp.assigned_tahsildar_id,
        notification_type: 'DRONE_EVIDENCE_READY',
        title: 'Drone Survey Evidence Submitted',
        message: `Field inspector submitted drone evidence for inspection ${insp.id}. Ready for image comparison.`,
        related_application_id: insp.application_id,
        channel: 'in_app',
      });
    }

    mockDb.persistAll();
    return insp;
  }
}

export const inspectionService = new InspectionService();
