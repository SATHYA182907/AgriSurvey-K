import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  Clock,
  ArrowRight,
  MapPin,
  Camera,
  Layers,
  Sprout,
  AlertCircle,
  FileCheck2,
  PlusCircle,
  Sparkles,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { mockDb } from '@/services/mock-db';
import { registrationService } from '@/services/registration.service';
import { reportService } from '@/services/report.service';
import { RegistrationApplication, Property, VerificationReport } from '@/types';

export const FarmerDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const farmer = mockDb.currentUser;
  const [applications, setApplications] = useState<RegistrationApplication[]>([]);
  const [selectedApp, setSelectedApp] = useState<RegistrationApplication | null>(null);
  const [report, setReport] = useState<VerificationReport | null>(null);

  useEffect(() => {
    loadFarmerData();
  }, [farmer.id]);

  const loadFarmerData = async () => {
    const apps = await registrationService.getMyApplications(farmer.id);
    setApplications(apps);
    if (apps.length > 0) {
      setSelectedApp(apps[0]);
      const rep = await reportService.getReportByApplicationId(apps[0].id);
      setReport(rep);
    }
  };

  const handleSelectApp = async (app: RegistrationApplication) => {
    setSelectedApp(app);
    const rep = await reportService.getReportByApplicationId(app.id);
    setReport(rep);
  };

  // Timeline Step States
  const getTimelineSteps = (app: RegistrationApplication) => {
    const isSubmitted = Boolean(app.submitted_at);
    const isApproved = app.status === 'APPROVED';
    const isRejected = app.status === 'REJECTED';
    const hasImages = mockDb.landImages.some((img) => img.application_id === app.id);
    const inspection = mockDb.inspections.find((i) => i.application_id === app.id);
    const hasDroneImages = mockDb.droneImagery.some((img) => img.application_id === app.id);
    const hasCropVerif = mockDb.cropVerifications.some((c) => c.application_id === app.id);
    const hasReport = mockDb.reports.some((r) => r.application_id === app.id);

    return [
      { id: 1, title: 'Registration Submitted', completed: isSubmitted, date: app.submitted_at },
      { id: 2, title: 'Tahsildar Review', completed: isApproved || isRejected, current: app.status === 'PENDING_TAHSILDAR_REVIEW', date: app.reviewed_at },
      { id: 3, title: 'Registration Approved', completed: isApproved, date: isApproved ? app.reviewed_at : null },
      { id: 4, title: 'Land Images Uploaded', completed: hasImages, current: isApproved && !hasImages },
      { id: 5, title: 'Field Drone Inspection', completed: inspection?.inspection_status === 'EVIDENCE_UPLOADED' || inspection?.inspection_status === 'COMPLETED' },
      { id: 6, title: 'Drone Evidence Reviewed', completed: hasDroneImages },
      { id: 7, title: 'Crop Verification', completed: hasCropVerif },
      { id: 8, title: 'Final Verification Report', completed: hasReport },
    ];
  };

  const totalProps = applications.length;
  const pendingApps = applications.filter((a) => a.status === 'PENDING_TAHSILDAR_REVIEW').length;
  const approvedApps = applications.filter((a) => a.status === 'APPROVED').length;
  const verifiedReports = mockDb.reports.filter((r) => applications.some((a) => a.id === r.application_id)).length;

  return (
    <DashboardLayout
      title="Farmer Portal Overview"
      subtitle={`Welcome back, ${farmer.full_name} • Central Agricultural Land Registry`}
    >
      <div className="space-y-6">
        {/* Welcome Section & Action Banner */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span>Khatedar Domicile: Pune Division (Haveli Taluk)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Welcome back, {farmer.full_name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {selectedApp?.status === 'APPROVED'
                ? 'Your land registration is approved. Please ensure your 5–6 ground photographs are uploaded so our field drone team can schedule the boundary survey.'
                : selectedApp?.status === 'PENDING_TAHSILDAR_REVIEW'
                ? 'Your registration application is currently under official review by the responsible Tahsildar.'
                : 'Manage your agricultural landholdings, review inspection stages, and download official verification reports.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
            <Link to="/farmer/register">
              <Button icon={<PlusCircle className="w-4 h-4" />}>
                Register New Land
              </Button>
            </Link>
            {selectedApp?.status === 'APPROVED' && (
              <Link to="/farmer/upload-images">
                <Button variant="secondary" icon={<UploadCloud className="w-4 h-4" />}>
                  Upload Land Images
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* 4 Summary Stat Cards (Section 8 Requirement) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">My Properties</span>
              <MapPin className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">{totalProps}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Agricultural plots registered</div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Pending Review</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">{pendingApps}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Awaiting Tahsildar decision</div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Approved Registrations</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">{approvedApps}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Ready for field inspection</div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Verified Reports</span>
              <FileCheck2 className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">{verifiedReports}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Certified PDF available</div>
          </Card>
        </div>

        {/* Main Grid: My Properties & Selected Application Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Properties List (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                My Agricultural Properties
              </h3>
              <span className="text-xs text-slate-500">{applications.length} applications</span>
            </div>

            {applications.map((app) => {
              const isSelected = selectedApp?.id === app.id;
              const prop = app.property;
              return (
                <div
                  key={app.id}
                  onClick={() => handleSelectApp(app)}
                  className={`bg-white rounded-xl border p-5 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-emerald-500 ring-2 ring-emerald-500/10 shadow-md'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">
                          {prop?.property_name || `Survey No. ${prop?.survey_number}`}
                        </h4>
                        <Badge status={app.status} size="sm" />
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 font-mono">
                        Ref: {app.application_reference}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-bold text-emerald-800">
                        {prop?.land_area} {prop?.land_area_unit}
                      </div>
                      <div className="text-[10px] text-slate-400">{prop?.farm_type}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg mb-4">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Survey Number</span>
                      <span className="font-semibold font-mono">{prop?.survey_number}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Location</span>
                      <span className="truncate">{prop?.village}, {prop?.taluk}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Land Category</span>
                      <span>{prop?.land_type}</span>
                    </div>
                  </div>

                  {/* Actions for current status */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <span className="text-slate-400 text-[11px]">
                      Submitted on: {new Date(app.submitted_at).toLocaleDateString()}
                    </span>

                    <div className="flex items-center gap-2">
                      {app.status === 'APPROVED' && (
                        <Link
                          to="/farmer/upload-images"
                          className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                        >
                          <UploadCloud className="w-3.5 h-3.5" />
                          <span>Upload Photos</span>
                        </Link>
                      )}
                      {report && app.id === report.application_id && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            reportService.generatePdfReport(report);
                          }}
                          className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1"
                        >
                          <FileCheck2 className="w-3.5 h-3.5" />
                          <span>Download PDF</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Application Timeline & Evidence Status (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Application Timeline
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {selectedApp?.application_reference}
                  </p>
                </div>
                {selectedApp && <Badge status={selectedApp.status} size="sm" />}
              </div>

              {selectedApp && (
                <div className="space-y-4">
                  {getTimelineSteps(selectedApp).map((step, idx) => (
                    <div key={step.id} className="flex items-start gap-3 relative">
                      {/* Vertical line connecting steps */}
                      {idx < 7 && (
                        <div
                          className={`absolute left-3.5 top-7 w-0.5 h-7 ${
                            step.completed ? 'bg-emerald-500' : 'bg-slate-200'
                          }`}
                        />
                      )}

                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 text-xs font-bold ${
                          step.completed
                            ? 'bg-emerald-600 text-white'
                            : step.current
                            ? 'bg-amber-100 text-amber-800 ring-4 ring-amber-50'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {step.completed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p
                            className={`text-xs font-semibold ${
                              step.completed
                                ? 'text-slate-900'
                                : step.current
                                ? 'text-amber-800 font-bold'
                                : 'text-slate-400'
                            }`}
                          >
                            {step.title}
                          </p>
                          {step.date && (
                            <span className="text-[10px] text-slate-400">
                              {new Date(step.date).toLocaleDateString([], {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Quick Report Download Banner if report is ready */}
            {report && (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-800 to-teal-900 text-white shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                    Official Verification Report Ready
                  </div>
                  <FileCheck2 className="w-5 h-5 text-emerald-400" />
                </div>
                <h4 className="text-base font-bold">
                  {report.report_reference}
                </h4>
                <p className="text-xs text-emerald-100 leading-relaxed">
                  Field drone photogrammetry and crop verification have been signed by the Tahsildar.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => reportService.generatePdfReport(report)}
                  className="w-full bg-white text-slate-900 hover:bg-emerald-50 border-0 font-bold"
                >
                  Download Certified PDF Report
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
