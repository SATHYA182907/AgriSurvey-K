import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Eye,
  MapPin,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  Building2,
  Clock,
  AlertCircle,
  UserCheck,
  Sprout,
  Copy,
  Check,
  ExternalLink,
  Smartphone,
  RefreshCw,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { PropertyMap } from '@/components/maps/PropertyMap';
import { registrationService } from '@/services/registration.service';
import { inspectionService } from '@/services/inspection.service';
import { msg91Service } from '@/services/msg91.service';
import { mockDb } from '@/services/mock-db';
import {
  RegistrationApplication,
  Property,
  NotificationJob,
} from '@/types';
import { PUNE_TALUKS } from '@/lib/constants';
import { useLanguage } from '@/context/LanguageContext';
import { getTahsildarLabel, getStatusLabel, localizePlotOrCropName } from '@/lib/dashboard-localizer';

export const TahsildarRegistrationsPage: React.FC = () => {
  const { t, language } = useLanguage();
  const tl = (key: string) => getTahsildarLabel(key, language);
  const tahsildar = mockDb.currentUser;

  // Queue State
  const [applications, setApplications] = useState<RegistrationApplication[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [talukFilter, setTalukFilter] = useState('ALL');

  // Review Modal State
  const [selectedApp, setSelectedApp] = useState<RegistrationApplication | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [decisionType, setDecisionType] = useState<'APPROVE' | 'REJECT' | 'REQUEST_INFO' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [additionalInfoMsg, setAdditionalInfoMsg] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [approvalResultModal, setApprovalResultModal] = useState<{
    app: RegistrationApplication;
    username: string;
    activationUrl?: string;
    smsJob?: NotificationJob;
    smsMessage?: string;
  } | null>(null);
  const [isRetryingSms, setIsRetryingSms] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Assign Inspection Modal State
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState('usr-worker-01');
  const [scheduledDate, setScheduledDate] = useState('2026-10-30');
  const [fieldNotes, setFieldNotes] = useState('Standard drone photogrammetry and crop boundary survey.');

  const loadApplications = useCallback(async () => {
    const list = await registrationService.listApplicationsForTahsildar({
      status: statusFilter,
      taluk: talukFilter,
      search: searchTerm,
    });
    setApplications(list);
  }, [statusFilter, talukFilter, searchTerm]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const handleOpenReview = async (app: RegistrationApplication) => {
    setSelectedApp(app);
    setReviewModalOpen(true);
    setDecisionType(null);
    setRejectionReason('');
    setAdditionalInfoMsg('');
    setReviewNotes('');

    if (app.status === 'PENDING_TAHSILDAR_REVIEW' || app.status === 'PENDING_VERIFICATION') {
      try {
        await registrationService.startReview(app.id);
        loadApplications();
      } catch (e) {
        console.warn('Could not auto-start review', e);
      }
    }
  };

  const handlePreConfirmDecision = () => {
    if (!decisionType) {
      alert('Please select an administrative decision (Approve, Request More Info, or Reject).');
      return;
    }
    if (decisionType === 'REJECT' && !rejectionReason.trim()) {
      alert('Please enter an official rejection reason.');
      return;
    }
    if (decisionType === 'REQUEST_INFO' && !additionalInfoMsg.trim()) {
      alert('Please specify the additional documentation or clarification required.');
      return;
    }
    setConfirmModalOpen(true);
  };

  const handleCopyActivationLink = (url?: string) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleRetrySms = async () => {
    if (!approvalResultModal?.smsJob?.id) return;
    setIsRetryingSms(true);
    try {
      const updatedJob = await msg91Service.retryNotificationJob(approvalResultModal.smsJob.id);
      setApprovalResultModal((prev) => (prev ? { ...prev, smsJob: updatedJob } : null));
    } catch (e: any) {
      alert('Failed to retry SMS: ' + (e.message || 'Unknown error'));
    } finally {
      setIsRetryingSms(false);
    }
  };

  const handleExecuteDecision = async () => {
    if (!selectedApp || !decisionType) return;
    setIsProcessing(true);

    try {
      if (decisionType === 'APPROVE') {
        const res = await registrationService.reviewApplication(selectedApp.id, 'APPROVED', {
          notes: reviewNotes || 'Application complies with 7/12 land revenue extract.',
        });

        setConfirmModalOpen(false);
        setReviewModalOpen(false);
        loadApplications();

        setApprovalResultModal({
          app: res.application,
          username: res.username || res.application.farmer?.username || 'MH-PUN-0000',
          activationUrl: res.activationUrl,
          smsJob: res.smsJob,
          smsMessage: res.smsMessage,
        });
        return;
      } else if (decisionType === 'REJECT') {
        await registrationService.reviewApplication(selectedApp.id, 'REJECTED', {
          rejectionReason,
          notes: reviewNotes,
        });
        alert(`Application ${selectedApp.application_reference} rejected. Notification sent to farmer.`);
      } else if (decisionType === 'REQUEST_INFO') {
        await registrationService.reviewApplication(
          selectedApp.id,
          'ADDITIONAL_INFORMATION_REQUIRED',
          {
            additionalInfoRequest: additionalInfoMsg,
            notes: reviewNotes,
          }
        );
        alert(`Clarification requested from farmer. Application marked "Additional Information Required".`);
      }

      setConfirmModalOpen(false);
      setReviewModalOpen(false);
      loadApplications();
    } catch (err: any) {
      alert(err.message || 'Error recording decision');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAssignInspection = async () => {
    if (!selectedApp) return;
    setIsProcessing(true);

    try {
      await inspectionService.assignInspection({
        applicationId: selectedApp.id,
        propertyId: selectedApp.property_id,
        workerId: selectedWorkerId,
        scheduledAt: scheduledDate,
        fieldNotes,
      });

      alert(`✅ Field inspection assigned to field worker. Scheduled for ${scheduledDate}.`);
      setAssignModalOpen(false);
      loadApplications();
    } catch (err: any) {
      alert(err.message || 'Error assigning inspection');
    } finally {
      setIsProcessing(false);
    }
  };

  // Stats computed from applications in this jurisdiction
  const totalApps = applications.length;
  const pendingApps = applications.filter(
    (a) => a.status === 'PENDING_TAHSILDAR_REVIEW' || a.status === 'PENDING_VERIFICATION' || a.status === 'SUBMITTED'
  ).length;
  const underReviewApps = applications.filter((a) => a.status === 'UNDER_REVIEW').length;
  const actionRequiredApps = applications.filter((a) => a.status === 'ADDITIONAL_INFORMATION_REQUIRED').length;
  const approvedApps = applications.filter((a) => a.status === 'APPROVED').length;
  const rejectedApps = applications.filter((a) => a.status === 'REJECTED').length;

  return (
    <DashboardLayout
      title={tl('tabQueue')}
      subtitle={`${tl('assignedJurisdiction')} • ${tl('haveliTaluk')} • ${tahsildar.full_name}`}
    >
      <div className="space-y-6 pb-8">
        {/* Desk Header Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {tl('tabQueue')}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Review 7/12 land records, verify landholder boundaries, and record administrative determinations.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <Building2 className="w-4 h-4 text-slate-400" />
            <span>{tl('assignedJurisdiction')}: <strong>{tl('haveliTaluk')}</strong></span>
          </div>
        </div>

        {/* 6 Administrative Status Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <Card className="p-4 bg-white border-slate-200">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>{tl('totalInQueue')}</span>
              <FileText className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{totalApps}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{tl('assignedTaluk')}</div>
          </Card>

          <Card className="p-4 bg-amber-50/50 border-amber-200">
            <div className="flex items-center justify-between text-xs font-semibold text-amber-800">
              <span>{tl('pendingReview')}</span>
              <Clock className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <div className="text-2xl font-extrabold text-amber-950 mt-1">{pendingApps}</div>
            <div className="text-[10px] text-amber-700 mt-0.5">{tl('awaitingReview')}</div>
          </Card>

          <Card className="p-4 bg-blue-50/50 border-blue-200">
            <div className="flex items-center justify-between text-xs font-semibold text-blue-800">
              <span>{tl('underReview')}</span>
              <Eye className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="text-2xl font-extrabold text-blue-950 mt-1">{underReviewApps}</div>
            <div className="text-[10px] text-blue-700 mt-0.5">{tl('activeInspection')}</div>
          </Card>

          <Card className="p-4 bg-purple-50/50 border-purple-200">
            <div className="flex items-center justify-between text-xs font-semibold text-purple-800">
              <span>{tl('infoRequested')}</span>
              <HelpCircle className="w-3.5 h-3.5 text-purple-600" />
            </div>
            <div className="text-2xl font-extrabold text-purple-950 mt-1">{actionRequiredApps}</div>
            <div className="text-[10px] text-purple-700 mt-0.5">{tl('farmerResponseAwaited')}</div>
          </Card>

          <Card className="p-4 bg-emerald-50/50 border-emerald-200">
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-800">
              <span>{tl('approved')}</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-950 mt-1">{approvedApps}</div>
            <div className="text-[10px] text-emerald-700 mt-0.5">{tl('verifiedLandholders')}</div>
          </Card>

          <Card className="p-4 bg-red-50/50 border-red-200">
            <div className="flex items-center justify-between text-xs font-semibold text-red-800">
              <span>{tl('rejected')}</span>
              <XCircle className="w-3.5 h-3.5 text-red-600" />
            </div>
            <div className="text-2xl font-extrabold text-red-950 mt-1">{rejectedApps}</div>
            <div className="text-[10px] text-red-700 mt-0.5">{tl('withRecordedReason')}</div>
          </Card>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={tl('searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-700"
            >
              <option value="ALL">{tl('statusAll')}</option>
              <option value="PENDING_TAHSILDAR_REVIEW">{tl('pendingReview')}</option>
              <option value="UNDER_REVIEW">{tl('underReview')}</option>
              <option value="ADDITIONAL_INFORMATION_REQUIRED">{tl('infoRequested')}</option>
              <option value="APPROVED">{tl('approved')}</option>
              <option value="REJECTED">{tl('rejected')}</option>
            </select>

            <select
              value={talukFilter}
              onChange={(e) => setTalukFilter(e.target.value)}
              className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-700"
            >
              <option value="ALL">{tl('talukAll')}</option>
              {PUNE_TALUKS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-4">{tl('colAppRef')}</th>
                  <th className="py-3 px-4">{tl('colFarmerName')}</th>
                  <th className="py-3 px-4">{tl('colSurveyNumber')}</th>
                  <th className="py-3 px-4">{tl('colTaluk')}</th>
                  <th className="py-3 px-4">{tl('colLandArea')}</th>
                  <th className="py-3 px-4">{tl('colCrop')}</th>
                  <th className="py-3 px-4">{tl('colStatus')}</th>
                  <th className="py-3 px-4 text-right">{tl('colActions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      {tl('noApplicationsFound')}
                    </td>
                  </tr>
                ) : (
                  applications.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {app.application_reference}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{app.farmer?.full_name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {app.farmer?.phone_number}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">
                          {tl('survey')} {app.property?.survey_number}
                        </div>
                        <div className="text-[10px] text-slate-500">{app.property?.village}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{app.property?.taluk}</td>
                      <td className="py-3.5 px-4 font-mono">
                        {app.property?.land_area} {app.property?.land_area_unit}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        {localizePlotOrCropName((app.property as any)?.crop_name || app.property?.farm_type || 'Sugarcane', language)}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            app.status === 'APPROVED'
                              ? 'success'
                              : app.status === 'REJECTED'
                              ? 'danger'
                              : app.status === 'UNDER_REVIEW'
                              ? 'info'
                              : app.status === 'ADDITIONAL_INFORMATION_REQUIRED'
                              ? 'neutral'
                              : 'warning'
                          }
                        >
                          {getStatusLabel(app.status, language)}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenReview(app)}
                          >
                            {tl('reviewFile')}
                          </Button>
                          {app.status === 'APPROVED' && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => {
                                setSelectedApp(app);
                                setAssignModalOpen(true);
                              }}
                            >
                              {tl('assignDrone')}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* =========================================================================
          REVIEW MODAL
      ========================================================================== */}
      {selectedApp && (
        <Modal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          title={`Administrative 7/12 Review: ${selectedApp.application_reference}`}
          size="xl"
        >
          <div className="space-y-6 text-xs text-slate-700 max-h-[75vh] overflow-y-auto pr-1">
            {/* Applicant Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">
                  Applicant Name
                </span>
                <p className="font-bold text-slate-900 mt-0.5">{selectedApp.farmer?.full_name}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">
                  Contact Phone
                </span>
                <p className="font-mono text-slate-900 mt-0.5">{selectedApp.farmer?.phone_number}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">
                  Survey / Gat No.
                </span>
                <p className="font-bold text-slate-900 mt-0.5">
                  {selectedApp.property?.survey_number}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">
                  Village & Taluk
                </span>
                <p className="text-slate-900 mt-0.5">
                  {selectedApp.property?.village}, {selectedApp.property?.taluk}
                </p>
              </div>
            </div>

            {/* Document Verification Section */}
            <div className="border border-slate-200 rounded-xl p-4 space-y-3">
              <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wide flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>Uploaded 7/12 Land Revenue Extract</span>
              </h4>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-5 h-5 text-slate-500" />
                  <div>
                    <div className="font-semibold text-slate-800">
                      {selectedApp.property?.land_document_reference || '7_12_Extract_Certified.pdf'}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Digitally signed by Mahabhumi Revenue Portal • 1.4 MB PDF
                    </div>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => alert('Viewing 7/12 extract PDF')}>
                  <Eye className="w-3.5 h-3.5 mr-1" />
                  <span>View 7/12</span>
                </Button>
              </div>
            </div>

            {/* Geographic Coordinates & Map */}
            {selectedApp.property?.latitude && selectedApp.property?.longitude && (
              <div className="border border-slate-200 rounded-xl p-4 space-y-3">
                <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wide flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>Land Parcel Coordinates & GIS Overlay</span>
                </h4>
                <div className="h-48 rounded-lg overflow-hidden border border-slate-200">
                  <PropertyMap
                    latitude={selectedApp.property.latitude || 18.5793}
                    longitude={selectedApp.property.longitude || 73.9824}
                    propertyName={selectedApp.property.property_name || 'Land Parcel'}
                    surveyNumber={selectedApp.property.survey_number}
                    landArea={`${selectedApp.property.land_area} ${selectedApp.property.land_area_unit}`}
                    height="192px"
                  />
                </div>
              </div>
            )}

            {/* Administrative Decision Choice */}
            <div className="space-y-3 border-t border-slate-200 pt-4">
              <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wide">
                Official Administrative Determination
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setDecisionType('APPROVE')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    decisionType === 'APPROVE'
                      ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-500'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Approve Application</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    7/12 title verified. Generates login credentials and activates monitoring.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setDecisionType('REQUEST_INFO')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    decisionType === 'REQUEST_INFO'
                      ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-500'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-purple-800">
                    <HelpCircle className="w-4 h-4 text-purple-600" />
                    <span>Request Info</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Ask farmer to upload clarified 7/12 extract or boundary clarification.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setDecisionType('REJECT')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    decisionType === 'REJECT'
                      ? 'border-red-600 bg-red-50 ring-2 ring-red-500'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-red-800">
                    <XCircle className="w-4 h-4 text-red-600" />
                    <span>Reject Application</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Document mismatch, forged extract, or invalid jurisdiction land.
                  </p>
                </button>
              </div>

              {/* Conditional Inputs based on Decision */}
              {decisionType === 'REJECT' && (
                <div className="space-y-1.5 pt-2">
                  <label className="font-semibold text-slate-700">Official Reason for Rejection *</label>
                  <textarea
                    rows={2}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter statutory reason under Maharashtra Land Revenue Code (e.g. Survey number mismatch with Mahabhumi portal)..."
                    className="w-full p-2.5 border border-red-200 rounded-lg text-xs focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                  />
                </div>
              )}

              {decisionType === 'REQUEST_INFO' && (
                <div className="space-y-1.5 pt-2">
                  <label className="font-semibold text-slate-700">Information Required from Farmer *</label>
                  <textarea
                    rows={2}
                    value={additionalInfoMsg}
                    onChange={(e) => setAdditionalInfoMsg(e.target.value)}
                    placeholder="Describe missing documentation or clarification required (e.g., please submit 8-A khata extract)..."
                    className="w-full p-2.5 border border-purple-200 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                  />
                </div>
              )}

              <div className="space-y-1.5 pt-2">
                <label className="font-semibold text-slate-700">Internal Tahsildar Notes (Optional)</label>
                <textarea
                  rows={2}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Notes for office audit log and talathi record..."
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between border-t border-slate-200 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setReviewModalOpen(false);
                  setAssignModalOpen(true);
                }}
              >
                <Layers className="w-3.5 h-3.5 mr-1" />
                <span>Assign Field Drone Survey</span>
              </Button>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setReviewModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  disabled={!decisionType}
                  onClick={handlePreConfirmDecision}
                  className={
                    decisionType === 'APPROVE'
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white font-bold'
                      : decisionType === 'REJECT'
                      ? 'bg-red-600 hover:bg-red-700 text-white font-bold'
                      : 'bg-purple-600 hover:bg-purple-700 text-white font-bold'
                  }
                >
                  Proceed with Decision
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirmation Modal */}
      <Modal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title="Confirm Administrative Determination"
      >
        <div className="space-y-4 text-xs text-slate-700">
          <p>
            Are you sure you want to record decision <strong>{decisionType}</strong> for application{' '}
            <strong>{selectedApp?.application_reference}</strong>?
          </p>
          <p className="text-[11px] text-slate-500">
            This action will be logged in the immutable audit ledger with your digital signature.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setConfirmModalOpen(false)}>
              Back
            </Button>
            <Button
              size="sm"
              disabled={isProcessing}
              onClick={handleExecuteDecision}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            >
              {isProcessing ? 'Recording...' : 'Confirm & Execute'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Approval Result Modal */}
      {approvalResultModal && (
        <Modal
          isOpen={true}
          onClose={() => setApprovalResultModal(null)}
          title="Application Approved & Account Provisioned"
          size="lg"
        >
          <div className="space-y-4 text-xs text-slate-700">
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-emerald-900 text-sm">
                  Farmer Account Successfully Activated
                </h4>
                <p className="text-emerald-800 text-xs mt-1">
                  Application <strong>{approvalResultModal.app.application_reference}</strong> has
                  been verified against the 7/12 extract and approved.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Farmer Name</span>
                <p className="font-bold text-slate-900">
                  {approvalResultModal.app.farmer?.full_name}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Username</span>
                <p className="font-mono font-bold text-emerald-700">
                  {approvalResultModal.username}
                </p>
              </div>
            </div>

            {/* Activation link */}
            {approvalResultModal.activationUrl && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">
                  Secure Activation URL
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={approvalResultModal.activationUrl}
                    className="flex-1 bg-white border border-slate-200 rounded px-2.5 py-1 text-xs font-mono select-all"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopyActivationLink(approvalResultModal.activationUrl)}
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </Button>
                </div>
              </div>
            )}

            {/* MSG91 SMS Dispatch Card */}
            {approvalResultModal.smsJob && (
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    <span>MSG91 SMS Notification</span>
                  </div>
                  <Badge
                    variant={
                      approvalResultModal.smsJob.status === 'DELIVERED'
                        ? 'success'
                        : approvalResultModal.smsJob.status === 'FAILED'
                        ? 'danger'
                        : 'warning'
                    }
                  >
                    {approvalResultModal.smsJob.status}
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-600 font-mono bg-slate-50 p-2.5 rounded border border-slate-100">
                  {approvalResultModal.smsMessage}
                </p>
                {approvalResultModal.smsJob.status === 'FAILED' && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isRetryingSms}
                    onClick={handleRetrySms}
                    className="text-xs"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 mr-1 ${isRetryingSms ? 'animate-spin' : ''}`} />
                    <span>Retry SMS Dispatch</span>
                  </Button>
                )}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                onClick={() => setApprovalResultModal(null)}
              >
                Done
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Assign Field Drone Survey Modal */}
      {selectedApp && (
        <Modal
          isOpen={assignModalOpen}
          onClose={() => setAssignModalOpen(false)}
          title={`Assign Drone Inspection: ${selectedApp.application_reference}`}
        >
          <div className="space-y-4 text-xs text-slate-700">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Assign Field Worker / Drone Pilot *
              </label>
              <select
                value={selectedWorkerId}
                onChange={(e) => setSelectedWorkerId(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg text-xs"
              >
                <option value="usr-worker-01">Prakash Mahadev Jadhav (Field Worker #01 - Haveli)</option>
                <option value="usr-worker-02">Ramesh Shinde (Drone Pilot #02 - Baramati)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Scheduled Inspection Date *
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Inspection Mission Directives
              </label>
              <textarea
                rows={3}
                value={fieldNotes}
                onChange={(e) => setFieldNotes(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setAssignModalOpen(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={isProcessing}
                onClick={handleAssignInspection}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                {isProcessing ? 'Assigning...' : 'Dispatch Mission'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
};
export default TahsildarRegistrationsPage;
