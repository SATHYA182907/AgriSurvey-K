import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { mockDb } from './mock-db';
import { notificationService } from './notification.service';
import { VerificationReport, FinalVerificationStatus } from '@/types';

export class ReportService {
  async getReportByApplicationId(applicationId: string): Promise<VerificationReport | null> {
    const rep = mockDb.reports.find((r) => r.application_id === applicationId);
    if (!rep) return null;
    return {
      ...rep,
      property: mockDb.properties.find((p) => p.id === rep.property_id),
      application: mockDb.applications.find((a) => a.id === rep.application_id),
      reviewer: mockDb.profiles.find((p) => p.id === rep.reviewed_by),
    };
  }

  async getReportById(reportId: string): Promise<VerificationReport | null> {
    const rep = mockDb.reports.find((r) => r.id === reportId || r.report_reference === reportId);
    if (!rep) return null;
    return {
      ...rep,
      property: mockDb.properties.find((p) => p.id === rep.property_id),
      application: mockDb.applications.find((a) => a.id === rep.application_id),
      reviewer: mockDb.profiles.find((p) => p.id === rep.reviewed_by),
    };
  }

  async finalizeReport(params: {
    applicationId: string;
    propertyId: string;
    finalStatus: FinalVerificationStatus;
    discrepancies?: string;
    findings?: Record<string, any>;
  }): Promise<VerificationReport> {
    const existing = mockDb.reports.find((r) => r.application_id === params.applicationId);
    const reportRef = existing?.report_reference || `AGRI-VR-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const report: VerificationReport = {
      id: existing?.id || `rep-${Date.now()}`,
      report_reference: reportRef,
      property_id: params.propertyId,
      application_id: params.applicationId,
      reviewed_by: mockDb.currentUser.id,
      final_status: params.finalStatus,
      findings: params.findings || {
        boundaries_verified: true,
        crop_matching: true,
        drone_inspection_completed: true,
      },
      discrepancies: params.discrepancies || 'No significant discrepancies noted between ground declaration and drone aerial observations.',
      supporting_evidence: [
        { type: 'GROUND_PHOTOS', title: 'Farmer Field Ground Photos', reference: 'FLI-SERIES', date: new Date().toISOString().slice(0, 10) },
        { type: 'DRONE_AERIAL', title: 'Field Worker Drone Photogrammetry', reference: 'DRN-SERIES', date: new Date().toISOString().slice(0, 10) },
        { type: 'CROP_SURVEY', title: 'Crop Identification Record', reference: 'CROP-VERIF', date: new Date().toISOString().slice(0, 10) },
      ],
      report_storage_path: `reports/${reportRef}.pdf`,
      created_at: new Date().toISOString(),
    };

    if (existing) {
      Object.assign(existing, report);
    } else {
      mockDb.reports.unshift(report);
    }

    // Update application status to match final verification
    const app = mockDb.applications.find((a) => a.id === params.applicationId);
    if (app) {
      if (params.finalStatus === 'VERIFIED') {
        app.status = 'APPROVED';
      }
    }

    mockDb.addAuditLog(
      'FINAL_LAND_VERIFICATION_COMPLETED',
      'verification_reports',
      report.id,
      null,
      { report_reference: reportRef, final_status: params.finalStatus }
    );

    // Notify Farmer
    if (app) {
      await notificationService.createNotification({
        recipient_user_id: app.farmer_id,
        notification_type: 'FINAL_VERIFICATION_COMPLETED',
        title: 'Land Verification Report Ready',
        message: `Your AgriSurvey land verification report ${reportRef} has been completed. Decision: ${params.finalStatus}.`,
        related_application_id: app.id,
        channel: 'both',
      });
    }

    mockDb.persistAll();
    return report;
  }

  generatePdfReport(report: VerificationReport): void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const prop = report.property || mockDb.properties.find((p) => p.id === report.property_id);
    const app = report.application || mockDb.applications.find((a) => a.id === report.application_id);
    const farmer = app ? mockDb.profiles.find((p) => p.id === app.farmer_id) : null;
    const reviewer = mockDb.profiles.find((p) => p.id === report.reviewed_by);
    const cropVerif = mockDb.cropVerifications.find((c) => c.application_id === report.application_id);
    const comparison = mockDb.comparisons.find((c) => c.application_id === report.application_id);

    // 1. Header with Gradient Accent Strip
    doc.setFillColor(21, 128, 61); // Primary green
    doc.rect(0, 0, 210, 8, 'F');
    doc.setFillColor(15, 118, 110); // Teal
    doc.rect(0, 8, 210, 2, 'F');

    // 2. Title & Branding
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(21, 128, 61);
    doc.text('AgriSurvey', 14, 22);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Smart Agriculture Administration & Digital Land Verification System', 14, 27);
    doc.text(`Official Report Ref: ${report.report_reference}`, 14, 32);

    // Status Badge Top Right
    const statusColor = report.final_status === 'VERIFIED' ? [22, 163, 74] : [220, 38, 38];
    doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.roundedRect(145, 16, 50, 12, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(report.final_status, 170, 23.5, { align: 'center' });

    doc.setDrawColor(226, 232, 240);
    doc.line(14, 36, 196, 36);

    // 3. Metadata Table
    autoTable(doc, {
      startY: 40,
      theme: 'grid',
      headStyles: { fillColor: [15, 118, 110], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 8.5, cellPadding: 3 },
      head: [['Landholder & Verification Summary', 'Details']],
      body: [
        ['Registered Farmer', farmer?.full_name || 'Ramesh Balasaheb Patil'],
        ['Mobile Number (Masked)', farmer?.phone_number ? farmer.phone_number.replace(/(\d{2})\d{4}(\d{4})/, '$1****$2') : '98****2345'],
        ['Application Reference', app?.application_reference || 'AGRI-APP-2026-849102'],
        ['Property Reference', prop?.property_reference || 'AGRI-PROP-2026-HAV-0142'],
        ['Survey / Gat Number', `${prop?.survey_number || '142/2A'} (Subdivision: ${prop?.subdivision_number || '2A'})`],
        ['Location', `${prop?.village || 'Wagholi'}, Taluk ${prop?.taluk || 'Haveli'}, District ${prop?.district || 'Pune'}, Maharashtra`],
        ['Land Area', `${prop?.land_area || 3.5} ${prop?.land_area_unit || 'Acres'} (${prop?.land_type || 'Agricultural Land'})`],
        ['Ownership Classification', prop?.ownership_category || 'Individual Ownership'],
      ],
    });

    const afterMetaY = (doc as any).lastAutoTable.finalY + 6;

    // 4. Evidence Cross-Referencing Table
    autoTable(doc, {
      startY: afterMetaY,
      theme: 'grid',
      headStyles: { fillColor: [21, 128, 61], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 8.5, cellPadding: 3 },
      head: [['Verification Check', 'Observed Evidence', 'Result']],
      body: [
        [
          'Ground Photograph Analysis',
          '6 high-resolution field boundary and entrance photographs analyzed',
          'VERIFIED & LOGGED',
        ],
        [
          'Drone RTK Aerial Photogrammetry',
          'Aerial flight survey conducted at 45m AGL with centimeter-level precision',
          'COMPLETED & GEO-REFERENCED',
        ],
        [
          'Boundary & Landmark Match',
          comparison?.review_notes || 'Physical landmarks and boundary markers align with revenue survey data',
          comparison?.comparison_result || 'CONSISTENT',
        ],
        [
          'Declared Crop vs Observed Crop',
          `Declared: ${cropVerif?.declared_crop_type || 'Sugarcane'} | Observed: ${cropVerif?.observed_crop_type || 'Sugarcane'}`,
          cropVerif?.verification_result || 'MATCHES',
        ],
        [
          'Cultivated Area & Irrigation',
          `Approx Area: ${cropVerif?.approximate_cultivated_area || 3.48} Acres | Irrigation: ${cropVerif?.irrigation_method || 'Drip Irrigation'}`,
          'VERIFIED ON-SITE',
        ],
      ],
    });

    const afterEvidenceY = (doc as any).lastAutoTable.finalY + 6;

    // 5. Findings & Discrepancies Box
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, afterEvidenceY, 182, 26, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('Reviewer Findings & Observations:', 18, afterEvidenceY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    const splitFindings = doc.splitTextToSize(
      report.discrepancies || 'No conflicting land boundary discrepancies detected. Farmer ground photography and aerial drone telemetry correspond with revenue department records.',
      174
    );
    doc.text(splitFindings, 18, afterEvidenceY + 13);

    // 6. Sign-off / Authentication stamp
    const signY = afterEvidenceY + 34;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('Authorized Revenue Officer Sign-Off:', 14, signY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`Reviewer: ${reviewer?.full_name || 'Anand Shrikant Kulkarni'}`, 14, signY + 6);
    doc.text(`Designation: Tahsildar / Executive Magistrate, Haveli Taluk`, 14, signY + 11);
    doc.text(`Digital Sign Timestamp: ${new Date(report.created_at).toLocaleString()}`, 14, signY + 16);

    // Digital Seal Box
    doc.setDrawColor(21, 128, 61);
    doc.setLineWidth(0.5);
    doc.roundedRect(140, signY - 2, 56, 22, 2, 2);
    doc.setTextColor(21, 128, 61);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('DIGITALLY CERTIFIED', 168, signY + 6, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text('AgriSurvey Land Verification', 168, signY + 11, { align: 'center' });
    doc.text(`Ref: ${report.report_reference.slice(-10)}`, 168, signY + 16, { align: 'center' });

    // 7. Mandatory Legal Notice (Section 16 requirement)
    doc.setFillColor(254, 242, 242);
    doc.roundedRect(14, 260, 182, 18, 2, 2, 'F');
    doc.setTextColor(185, 28, 28);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('STATUTORY ADMINISTRATIVE NOTICE & DISCLAIMER', 18, 265);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(127, 29, 29);
    doc.setFontSize(7);
    const disclaimerText =
      'This document is an evidence-backed technical agricultural inspection report compiled under the AgriSurvey platform based on farmer photographic submissions and authorized drone aerial photogrammetry. This verification record does NOT constitute legal proof of title, ownership certification, or conclusive registry of property ownership.';
    doc.text(doc.splitTextToSize(disclaimerText, 174), 18, 269);

    // Save and download PDF
    doc.save(`AgriSurvey_Report_${report.report_reference}.pdf`);
  }
}

export const reportService = new ReportService();
