import { mockDb } from './mock-db';
import { notificationService } from './notification.service';
import { FarmerLandImage, DroneImagery } from '@/types';

export class DroneService {
  async getFarmerImages(propertyId?: string, applicationId?: string): Promise<FarmerLandImage[]> {
    return mockDb.landImages.filter((img) => {
      if (propertyId && img.property_id !== propertyId) return false;
      if (applicationId && img.application_id !== applicationId) return false;
      return true;
    });
  }

  async getDroneImages(propertyId?: string, applicationId?: string, inspectionId?: string): Promise<DroneImagery[]> {
    return mockDb.droneImagery.filter((img) => {
      if (inspectionId && img.inspection_id !== inspectionId) return false;
      if (propertyId && img.property_id !== propertyId) return false;
      if (applicationId && img.application_id !== applicationId) return false;
      return true;
    });
  }

  async uploadFarmerImages(params: {
    propertyId: string;
    applicationId: string;
    files: Array<{ name: string; url: string; preview: string }>;
  }): Promise<FarmerLandImage[]> {
    const uploadedList: FarmerLandImage[] = [];

    params.files.forEach((file, idx) => {
      const newImg: FarmerLandImage = {
        id: `fli-${Date.now()}-${idx}`,
        property_id: params.propertyId,
        application_id: params.applicationId,
        uploaded_by: mockDb.currentUser.id,
        storage_path: `farmer-images/${params.propertyId}/${file.name}`,
        original_filename: file.name,
        capture_timestamp: new Date().toISOString(),
        latitude: 18.579 + idx * 0.0002,
        longitude: 73.982 + idx * 0.0002,
        metadata_status: 'METADATA_EXTRACTED',
        uploaded_at: new Date().toISOString(),
      };
      mockDb.landImages.push(newImg);
      uploadedList.push(newImg);
    });

    mockDb.addAuditLog(
      'FARMER_LAND_IMAGES_UPLOADED',
      'farmer_land_images',
      params.applicationId,
      null,
      { uploaded_count: params.files.length, property_id: params.propertyId }
    );

    // Notify assigned Tahsildar
    const app = mockDb.applications.find((a) => a.id === params.applicationId);
    if (app && app.assigned_tahsildar_id) {
      await notificationService.createNotification({
        recipient_user_id: app.assigned_tahsildar_id,
        notification_type: 'LAND_IMAGES_SUBMITTED',
        title: 'Farmer Submitted Land Photos',
        message: `Farmer submitted ${params.files.length} ground photos for application ${app.application_reference}.`,
        related_application_id: app.id,
        channel: 'in_app',
      });
    }

    mockDb.persistAll();
    return uploadedList;
  }

  async deleteFarmerImage(imageId: string): Promise<void> {
    mockDb.landImages = mockDb.landImages.filter((img) => img.id !== imageId);
    mockDb.persistAll();
  }

  async uploadDroneImages(params: {
    inspectionId: string;
    propertyId: string;
    applicationId: string;
    missionReference: string;
    files: Array<{ name: string; url: string; preview: string; lat?: number; lng?: number }>;
  }): Promise<DroneImagery[]> {
    const uploadedList: DroneImagery[] = [];

    params.files.forEach((file, idx) => {
      const newDroneImg: DroneImagery = {
        id: `drn-${Date.now()}-${idx}`,
        inspection_id: params.inspectionId,
        property_id: params.propertyId,
        application_id: params.applicationId,
        uploaded_by: mockDb.currentUser.id,
        storage_path: `drone-imagery/${params.inspectionId}/${file.name}`,
        original_filename: file.name,
        capture_timestamp: new Date().toISOString(),
        latitude: file.lat || 18.5793 + idx * 0.0003,
        longitude: file.lng || 73.9824 + idx * 0.0003,
        mission_reference: params.missionReference || 'MISSION-PUN-DRONE-01',
        metadata_status: 'GEO_TAGGED_RTK',
        processing_status: 'PROCESSED',
        uploaded_at: new Date().toISOString(),
      };
      mockDb.droneImagery.push(newDroneImg);
      uploadedList.push(newDroneImg);
    });

    // Update inspection status to EVIDENCE_UPLOADED
    const insp = mockDb.inspections.find((i) => i.id === params.inspectionId);
    if (insp) {
      insp.inspection_status = 'EVIDENCE_UPLOADED';
      insp.updated_at = new Date().toISOString();
    }

    mockDb.addAuditLog(
      'DRONE_IMAGERY_UPLOADED',
      'drone_imagery',
      params.inspectionId,
      null,
      { mission: params.missionReference, count: params.files.length }
    );

    mockDb.persistAll();
    return uploadedList;
  }
}

export const droneService = new DroneService();
