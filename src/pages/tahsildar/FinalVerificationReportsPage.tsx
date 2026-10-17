import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  Download,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Building2,
  FileText,
  Calendar,
  Layers,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { reportService } from '@/services/report.service';
import { mockDb } from '@/services/mock-db';
import { VerificationReport, FinalVerificationStatus } from '@/types';

export const FinalVerificationReportsPage: React.FC = () => {
  const [reports, setReports] = useState<VerificationReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<VerificationReport | null>(null);
  const [compileModalOpen, setCompileModalOpen] = useState(false);
  const [finalStatus, setFinalStatus] = useState<FinalVerificationStatus>('VERIFIED');
  const [discrepanciesText, setDiscrepanciesText] = useState(
    'Negligible 0.02 acre buffer variation on western boundary hedge with adjacent cart-track. No boundary encroachment.'
  );
  const [isCompiling, setIsCompiling] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    // Enrich reports with joined property & farmer details
    const list = mockDb.reports.map((r) => ({
      ...r,
      property: mockDb.properties.find((p) => p.id === r.property_id),
      application: mockDb.applications.find((a) => a.id === r.application_id),
      reviewer: mockDb.profiles.find((p) => p.id === r.reviewed_by),
    }));
    setReports(list);
    if (list.length > 0) setSelectedReport(list[0]);
  };

  const handleCompileNewReport = async () => {
    setIsCompiling(true);
    try {
      const rep = await reportService.finalizeReport({
        applicationId: 'app-01',
        propertyId: 'prop-01',
        finalStatus,
        discrepancies: discrepanciesText,
        findings: {
          boundaries_verified: true,
          crop_matching: true,
          similarity_score: 93.4,
          crop_verified: 'Sugarcane (ऊस)',
          irrigation_verified: 'Drip Irrigation',
        },
      });

      setIsCompiling(false);
      setCompileModalOpen(false);
      loadReports();
      setSelectedReport(rep);
    } catch (err: any) {
      setIsCompiling(false);
      alert(err.message || 'Error compiling report');
    }
  };

  const handleDownloadPdf = (rep: VerificationReport) => {
    reportService.generatePdfReport(rep);
  };

  return (
    <DashboardLayout
      title="Land Verification Reports"
      subtitle="Issue and manage certified technical evidence reports for revenue administration"
    >
      <div className="space-y-6">
        {/* Top Control Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Certified Verification Records ({reports.length})
            </h3>
            <p className="text-xs text-slate-500">
              Evidence-backed cross-referencing between farmer submissions and drone photogrammetry
            </p>
          </div>

          <Button
            size="sm"
            onClick={() => setCompileModalOpen(true)}
            icon={<FileCheck2 className="w-3.5 h-3.5" />}
          >
            Compile New Verification Report
          </Button>
        </div>

        {/* Reports Grid and Detail View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Reports Table / List (5 Cols) */}
          <div className="lg:col-span-5 space-y-3">
            {reports.map((rep) => {
              const isSelected = selectedReport?.id === rep.id;
              const prop = rep.property;
              const app = rep.application;
              return (
                <div
                  key={rep.id}
                  onClick={() => setSelectedReport(rep)}
                  className={`bg-white rounded-xl border p-4 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-emerald-500 ring-2 ring-emerald-500/10 shadow-md'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="font-mono font-bold text-slate-900 text-xs block">
                        {rep.report_reference}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Survey {prop?.survey_number} • {prop?.village}, {prop?.taluk}
                      </span>
                    </div>
                    <Badge status={rep.final_status} size="sm" />
                  </div>

                  <div className="text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
                    <span>Issued: {new Date(rep.created_at).toLocaleDateString()}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadPdf(rep);
                      }}
                      className="text-emerald-700 font-semibold hover:underline flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download PDF</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Report Detailed View (7 Cols) */}
          <div className="lg:col-span-7">
            {selectedReport ? (
              <Card className="p-6 sm:p-8 space-y-6">
                {/* Official Header */}
                <div className="border-b border-slate-200 pb-4 flex items-start justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">
                      AgriSurvey Official Technical Record
                    </span>
                    <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
                      {selectedReport.report_reference}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono">
                      App Ref: {selectedReport.application?.application_reference}
                    </p>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => handleDownloadPdf(selectedReport)}
                    icon={<Download className="w-3.5 h-3.5" />}
                  >
                    Export Certified PDF
                  </Button>
                </div>

                {/* Status & Reviewer Summary */}
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Verification Decision</span>
                    <div className="mt-1">
                      <Badge status={selectedReport.final_status} />
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Authorized Officer</span>
                    <span className="font-semibold text-slate-800">
                      {selectedReport.reviewer?.full_name || 'Anand S. Kulkarni (Tahsildar)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Surveyed Parcel</span>
                    <span className="font-semibold text-slate-800">
                      Gat No. {selectedReport.property?.survey_number} ({selectedReport.property?.land_area} Acres)
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Digital Timestamp</span>
                    <span className="font-mono text-slate-700">
                      {new Date(selectedReport.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Evidence Chain Table */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">
                    Evidence Verification Trail
                  </h4>
                  <div className="border border-slate-200 rounded-lg overflow-x-auto text-xs">
                    <table className="w-full text-left min-w-[280px]">
                      <thead className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-500 uppercase font-bold">
                        <tr>
                          <th className="py-2 px-3">Evidence Source</th>
                          <th className="py-2 px-3">Reference</th>
                          <th className="py-2 px-3">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedReport.supporting_evidence.map((ev, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="py-2 px-3 font-medium text-slate-800">{ev.title}</td>
                            <td className="py-2 px-3 font-mono text-slate-600">{ev.reference}</td>
                            <td className="py-2 px-3 text-slate-400">{ev.date || '2026-02-18'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Discrepancies and Findings Memo */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Reviewer Discrepancies & Findings
                  </h4>
                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
                    {selectedReport.discrepancies || 'No conflicting land boundary discrepancies detected.'}
                  </p>
                </div>

                {/* Statutory Disclaimer Notice (Section 16 Requirement) */}
                <div className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-xl text-[11px] text-rose-950 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-rose-800">
                    <ShieldCheck className="w-4 h-4 text-rose-600" />
                    <span>Statutory Administrative Notice & Legal Disclaimer</span>
                  </div>
                  <p className="leading-relaxed">
                    This document is a technical field verification record compiled under the AgriSurvey platform based on farmer photographic submissions and authorized drone aerial photogrammetry. This verification record does NOT constitute legal proof of title, ownership certification, or conclusive registry of property ownership.
                  </p>
                </div>
              </Card>
            ) : (
              <div className="p-12 text-center text-xs text-slate-400">
                Select a verification report to inspect details and export PDF.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Compile Report Modal */}
      <Modal
        isOpen={compileModalOpen}
        onClose={() => setCompileModalOpen(false)}
        title="Finalize Land Verification Report"
        description="Compile evidence findings and issue signed administrative verification report"
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Select Application to Finalize
            </label>
            <select className="w-full p-2.5 rounded-lg border border-slate-300 bg-white">
              <option value="app-01">
                AGRI-APP-2026-849102 • Ramesh Patil • Survey 142/2A Wagholi (Ready for Finalization)
              </option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Final Verification Status
            </label>
            <select
              value={finalStatus}
              onChange={(e) => setFinalStatus(e.target.value as any)}
              className="w-full p-2.5 rounded-lg border border-slate-300 bg-white"
            >
              <option value="VERIFIED">VERIFIED (Evidence fully corresponds)</option>
              <option value="ADDITIONAL_EVIDENCE_REQUIRED">ADDITIONAL EVIDENCE REQUIRED</option>
              <option value="REINSPECTION_REQUIRED">REINSPECTION REQUIRED</option>
              <option value="REJECTED">REJECTED (Boundary or title conflict)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Findings & Discrepancy Statement
            </label>
            <textarea
              rows={3}
              value={discrepanciesText}
              onChange={(e) => setDiscrepanciesText(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="ghost" onClick={() => setCompileModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCompileNewReport} isLoading={isCompiling}>
              Compile & Sign Report
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
};
