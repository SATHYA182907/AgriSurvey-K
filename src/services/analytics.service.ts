import { mockDb } from './mock-db';
import { AuditLog, StaffRegion } from '@/types';

export interface DashboardStats {
  totalFarmers: number;
  totalProperties: number;
  pendingRegistrations: number;
  approvedRegistrations: number;
  rejectedRegistrations: number;
  pendingInspections: number;
  droneReportsAwaitingReview: number;
  completedVerifications: number;
  totalLandAreaAcres: number;
}

export class AnalyticsService {
  async getDashboardStats(): Promise<DashboardStats> {
    const totalFarmers = mockDb.profiles.filter((p) => p.role === 'farmer').length;
    const totalProperties = mockDb.properties.length;
    const pendingRegistrations = mockDb.applications.filter((a) => a.status === 'PENDING_TAHSILDAR_REVIEW').length;
    const approvedRegistrations = mockDb.applications.filter((a) => a.status === 'APPROVED').length;
    const rejectedRegistrations = mockDb.applications.filter((a) => a.status === 'REJECTED').length;
    const pendingInspections = mockDb.inspections.filter((i) => i.inspection_status === 'ASSIGNED' || i.inspection_status === 'SCHEDULED' || i.inspection_status === 'IN_PROGRESS').length;
    const droneReportsAwaitingReview = mockDb.inspections.filter((i) => i.inspection_status === 'EVIDENCE_UPLOADED' || i.inspection_status === 'SUBMITTED_FOR_REVIEW').length;
    const completedVerifications = mockDb.reports.filter((r) => r.final_status === 'VERIFIED').length;
    const totalLandAreaAcres = mockDb.properties.reduce((acc, p) => acc + Number(p.land_area || 0), 0);

    return {
      totalFarmers,
      totalProperties,
      pendingRegistrations,
      approvedRegistrations,
      rejectedRegistrations,
      pendingInspections,
      droneReportsAwaitingReview,
      completedVerifications,
      totalLandAreaAcres: Math.round(totalLandAreaAcres * 10) / 10,
    };
  }

  async getRegistrationsOverTime(): Promise<Array<{ month: string; applications: number; verified: number }>> {
    return [
      { month: 'Oct 2025', applications: 14, verified: 10 },
      { month: 'Nov 2025', applications: 28, verified: 22 },
      { month: 'Dec 2025', applications: 45, verified: 38 },
      { month: 'Jan 2026', applications: 62, verified: 51 },
      { month: 'Feb 2026', applications: 84, verified: 72 },
      { month: 'Mar 2026', applications: 98, verified: 85 },
    ];
  }

  async getDistrictDistribution(): Promise<Array<{ district: string; acres: number; properties: number }>> {
    return [
      { district: 'Pune (Haveli)', acres: 245.5, properties: 58 },
      { district: 'Pune (Baramati)', acres: 380.2, properties: 72 },
      { district: 'Pune (Shirur)', acres: 190.8, properties: 41 },
      { district: 'Pune (Daund)', acres: 165.0, properties: 34 },
      { district: 'Ahmednagar', acres: 210.4, properties: 49 },
      { district: 'Solapur', acres: 175.6, properties: 39 },
    ];
  }

  async getCropDistribution(): Promise<Array<{ name: string; count: number; color: string }>> {
    return [
      { name: 'Sugarcane', count: 42, color: '#15803D' },
      { name: 'Soybean', count: 35, color: '#0F766E' },
      { name: 'Onion', count: 28, color: '#0891B2' },
      { name: 'Wheat', count: 22, color: '#D97706' },
      { name: 'Horticulture / Grapes', count: 18, color: '#8B5CF6' },
    ];
  }

  async getAuditLogs(): Promise<AuditLog[]> {
    return mockDb.auditLogs;
  }

  async getStaffRegions(): Promise<StaffRegion[]> {
    return mockDb.staffRegions;
  }
}

export const analyticsService = new AnalyticsService();
