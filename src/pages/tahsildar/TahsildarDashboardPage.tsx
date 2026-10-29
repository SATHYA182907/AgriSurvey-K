import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
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
  ChevronRight,
  AlertCircle,
  UserCheck,
  Sprout,
  Activity,
  RefreshCw,
  BarChart3,
  Wifi,
  WifiOff,
  Copy,
  Check,
  ExternalLink,
  Smartphone,
  Satellite,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { PropertyMap } from '@/components/maps/PropertyMap';
import { AgriculturalJurisdictionMap } from '@/components/maps/AgriculturalJurisdictionMap';
import { InspectionQueueTable } from '@/components/satellite/InspectionQueueTable';
import { ContinuousMonitoringTimeline } from '@/components/satellite/ContinuousMonitoringTimeline';
import { TahsildarSatelliteCoordinateModal } from '@/components/satellite/TahsildarSatelliteCoordinateModal';
import { satelliteMonitoringService } from '@/services/satellite-monitoring.service';
import { registrationService } from '@/services/registration.service';
import { inspectionService } from '@/services/inspection.service';
import { plantIntelligenceService } from '@/services/plant-intelligence.service';
import { msg91Service } from '@/services/msg91.service';
import { mockDb } from '@/services/mock-db';
import {
  RegistrationApplication,
  MonitoringUnit,
  Property,
  NotificationJob,
  MonitoringArea,
  MonitoringPeriodObservation,
} from '@/types';
import { PUNE_TALUKS } from '@/lib/constants';
import { useLanguage } from '@/context/LanguageContext';
import { getTahsildarLabel, getStatusLabel, localizePlotOrCropName } from '@/lib/dashboard-localizer';

export const TahsildarDashboardPage: React.FC = () => {
  const { t, language } = useLanguage();
  const tl = (key: string) => getTahsildarLabel(key, language);
  const tahsildar = mockDb.currentUser;

  // Active Tab: 'queue' vs 'monitoring' vs 'satellite_inspection'
  const [activeTab, setActiveTab] = useState<'queue' | 'monitoring' | 'satellite_inspection'>('queue');
  const [satCoordModalOpen, setSatCoordModalOpen] = useState(false);
  const [inspectedAreaId, setInspectedAreaId] = useState<string | null>('area-02');
  const [inspectedArea, setInspectedArea] = useState<MonitoringArea | null>(
    mockDb.getMonitoringAreaById('area-02') || mockDb.monitoringAreas[0] || null
  );
  const [inspectedAreaObs, setInspectedAreaObs] = useState<MonitoringPeriodObservation[]>(
    mockDb.getObservationsForArea('area-02')
  );

  const handleInspectArea = (areaId: string) => {
    setInspectedAreaId(areaId);
    const area = mockDb.getMonitoringAreaById(areaId);
    setInspectedArea(area || null);
    const obs = mockDb.getObservationsForArea(areaId);
    setInspectedAreaObs(obs);
  };

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

  // Assign Inspection Modal State
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState('usr-worker-01');
  const [scheduledDate, setScheduledDate] = useState('2026-10-25');
  const [fieldNotes, setFieldNotes] = useState('Standard drone photogrammetry and crop boundary survey.');

  // Jurisdiction Agricultural Monitoring View State
  const [monitoringSummary, setMonitoringSummary] = useState<{
    assignedJurisdiction: string;
    totalMonitoredFarms: number;
    totalMonitoredUnits: number;
    healthDistribution: Record<string, number>;
    criticalAlertCount: number;
    activeSensorsCount: number;
    disconnectedSensorsCount: number;
    staleDataUnitsCount: number;
    cropDistribution: Array<{ crop: string; unitCount: number; percentage: number }>;
    unitsWithCriticalAlerts: MonitoringUnit[];
    farmsWithStaleData: MonitoringUnit[];
  } | null>(null);

  const [jurisdictionProperties, setJurisdictionProperties] = useState<Property[]>([]);
  const [jurisdictionUnits, setJurisdictionUnits] = useState<MonitoringUnit[]>([]);

  const loadApplications = useCallback(async () => {
    const list = await registrationService.listApplicationsForTahsildar({
      status: statusFilter,
      taluk: talukFilter,
      search: searchTerm,
    });
    setApplications(list);
  }, [statusFilter, talukFilter, searchTerm]);

  const loadMonitoringSummary = useCallback(async () => {
    const summary = await plantIntelligenceService.getTahsildarJurisdictionMonitoringSummary(
      tahsildar.id
    );
    setMonitoringSummary(summary);

    // Load properties & units in jurisdiction for map
    const props = mockDb.properties.filter((p) => p.district === 'Pune');
    setJurisdictionProperties(props);
    const units = await plantIntelligenceService.getMonitoringUnits();
    setJurisdictionUnits(units);
  }, [tahsildar.id]);

  useEffect(() => {
    loadApplications();
    loadMonitoringSummary();
  }, [loadApplications, loadMonitoringSummary]);

  const handleOpenReview = async (app: RegistrationApplication) => {
    setSelectedApp(app);
    setReviewModalOpen(true);
    setDecisionType(null);
    setRejectionReason('');
    setAdditionalInfoMsg('');
    setReviewNotes('');

    // If currently PENDING, automatically start review (UNDER_REVIEW)
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

  const [copiedLink, setCopiedLink] = useState(false);

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
        loadMonitoringSummary();

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
      loadMonitoringSummary();
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
      title={t('dashboard.tahsildarTitle', 'Tahsildar Administrative Desk')}
      subtitle={`${t('dashboard.tahsildarSubtitle', 'Revenue Office • Pune Division Jurisdiction')} • ${tahsildar.full_name}`}
    >
      <div className="space-y-6">
        {/* Top View Selector: Verification Queue vs Agricultural Monitoring */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setActiveTab('queue')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'queue'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>{tl('tabQueue')} ({pendingApps + underReviewApps})</span>
            </button>
            <button
              onClick={() => setActiveTab('monitoring')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'monitoring'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sprout className="w-4 h-4 text-emerald-600" />
              <span>{tl('tabMonitoring')}</span>
            </button>
            <button
              onClick={() => setActiveTab('satellite_inspection')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'satellite_inspection'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Satellite className="w-4 h-4 text-emerald-600" />
              <span>{tl('tabSatellite')} ({mockDb.inspectionQueue.length})</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              size="sm"
              variant="outline"
              className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 shadow-xs flex items-center gap-1.5 font-bold"
              onClick={() => setSatCoordModalOpen(true)}
            >
              <Satellite className="w-3.5 h-3.5 text-emerald-600" />
              <span>{tl('getSatelliteImages')}</span>
            </Button>

            <div className="text-xs text-slate-500 font-semibold flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-400" />
              <span>{tl('assignedJurisdiction')} <strong>{tl('haveliTaluk')}</strong></span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            TAB 1: LAND REVENUE VERIFICATION QUEUE
        ========================================================================== */}
        {activeTab === 'queue' && (
          <div className="space-y-6">
            {/* 6 Administrative Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              <Card className="p-4">
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
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-emerald-600"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="ALL">{tl('allStatuses')}</option>
                  <option value="PENDING_TAHSILDAR_REVIEW">{getStatusLabel('PENDING_TAHSILDAR_REVIEW', language)}</option>
                  <option value="UNDER_REVIEW">{getStatusLabel('UNDER_REVIEW', language)}</option>
                  <option value="ADDITIONAL_INFORMATION_REQUIRED">{getStatusLabel('ADDITIONAL_INFORMATION_REQUIRED', language)}</option>
                  <option value="RESUBMITTED">{getStatusLabel('RESUBMITTED', language)}</option>
                  <option value="APPROVED">{getStatusLabel('APPROVED', language)}</option>
                  <option value="REJECTED">{getStatusLabel('REJECTED', language)}</option>
                </select>

                <select
                  value={talukFilter}
                  onChange={(e) => setTalukFilter(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="ALL">{tl('allTaluks')}</option>
                  {PUNE_TALUKS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Verification Queue Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">{tl('thAppRef')}</th>
                      <th className="py-3 px-4">{tl('thFarmerName')}</th>
                      <th className="py-3 px-4">{tl('thSurveyVillage')}</th>
                      <th className="py-3 px-4">{tl('thArea')}</th>
                      <th className="py-3 px-4">{tl('thSubmitted')}</th>
                      <th className="py-3 px-4">{tl('thStatus')}</th>
                      <th className="py-3 px-4 text-right">{tl('thActions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {applications.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400">
                          {tl('noApplications')}
                        </td>
                      </tr>
                    ) : (
                      applications.map((app) => (
                        <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                            {app.application_reference}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-900">{app.farmer?.full_name}</div>
                            <div className="text-[10px] text-slate-400">{app.farmer?.phone_number}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-mono font-bold text-emerald-800">
                              {tl('survey')} {app.property?.survey_number}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {app.property?.village}, {app.property?.taluk}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-700">
                            {app.property?.land_area} {app.property?.land_area_unit}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500">
                            {new Date(app.submitted_at).toLocaleDateString()}
                          </td>
                          <td className="py-3.5 px-4">
                            <Badge status={app.status} size="sm" />
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
        )}

        {/* =========================================================================
            TAB 2: AGRICULTURAL MONITORING VIEW (JURISDICTION-WIDE)
        ========================================================================== */}
        {activeTab === 'monitoring' && monitoringSummary && (
          <div className="space-y-6">
            {/* Mandatory Administrative Notice */}
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-950 space-y-1">
              <div className="flex items-center gap-2 font-bold text-emerald-900 text-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Agricultural Situational Awareness & Crop Telemetry View</span>
              </div>
              <p className="leading-relaxed text-emerald-900">
                <strong>Administrative Separation Principle:</strong> Plant health data, sensor readings, and foliar disease alerts are collected for agricultural monitoring and farmer advisory. Crop condition or plant health alerts do <strong>NOT</strong> alter official land revenue title or property verification status.
              </p>
            </div>

            {/* Jurisdiction Monitoring KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              <Card className="p-4">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span>Monitored Farms</span>
                  <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="text-2xl font-extrabold text-slate-900 mt-1">
                  {monitoringSummary.totalMonitoredFarms}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Approved parcels</div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span>Monitored Units</span>
                  <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="text-2xl font-extrabold text-slate-900 mt-1">
                  {monitoringSummary.totalMonitoredUnits}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Active crop plots</div>
              </Card>

              <Card className="p-4 bg-red-50/50 border-red-200">
                <div className="flex items-center justify-between text-xs font-semibold text-red-800">
                  <span>Critical Plant Alerts</span>
                  <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                </div>
                <div className="text-2xl font-extrabold text-red-950 mt-1">
                  {monitoringSummary.criticalAlertCount}
                </div>
                <div className="text-[10px] text-red-700 mt-0.5">Moisture/drought crisis</div>
              </Card>

              <Card className="p-4 bg-emerald-50/50 border-emerald-200">
                <div className="flex items-center justify-between text-xs font-semibold text-emerald-800">
                  <span>Active Sensor Nodes</span>
                  <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="text-2xl font-extrabold text-emerald-950 mt-1">
                  {monitoringSummary.activeSensorsCount}
                </div>
                <div className="text-[10px] text-emerald-700 mt-0.5">IoT gateways transmitting</div>
              </Card>

              <Card className="p-4 bg-slate-50 border-slate-200">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                  <span>Stale Telemetry Units</span>
                  <WifiOff className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="text-2xl font-extrabold text-slate-900 mt-1">
                  {monitoringSummary.staleDataUnitsCount}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">&gt;72h or disconnected</div>
              </Card>
            </div>

            {/* Jurisdiction Map & Crop Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Geospatial Health Map (7 cols) */}
              <div className="lg:col-span-7 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    {tl('geoCoverageTitle')}
                  </h3>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {tl('haveliTaluk')}
                  </span>
                </div>
                <AgriculturalJurisdictionMap
                  properties={jurisdictionProperties}
                  monitoringUnits={jurisdictionUnits}
                  height="360px"
                />
              </div>

              {/* Crop Distribution in Jurisdiction (5 cols) */}
              <Card className="lg:col-span-5 p-5 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-emerald-600" />
                  {tl('cropDistributionTitle')}
                </h3>

                <div className="space-y-3">
                  {monitoringSummary.cropDistribution.map((c) => (
                    <div key={c.crop} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800">{localizePlotOrCropName(c.crop, language)}</span>
                        <span className="text-slate-500 font-mono">
                          {c.unitCount} ({c.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-emerald-600 h-2 rounded-full"
                          style={{ width: `${c.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                  {tl('cropCoverageNote')}
                </div>
              </Card>
            </div>

            {/* Units with Critical Alerts in Jurisdiction */}
            {monitoringSummary.unitsWithCriticalAlerts.length > 0 && (
              <div className="bg-white rounded-2xl border border-red-200 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-red-900 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    {tl('attentionParcelsTitle')}
                  </h3>
                  <span className="text-[10px] text-red-700 bg-red-50 px-2 py-0.5 rounded font-bold">
                    {tl('directFarmerNotification')}
                  </span>
                </div>

                <div className="divide-y divide-slate-100 text-xs">
                  {monitoringSummary.unitsWithCriticalAlerts.map((u) => (
                    <div key={u.id} className="py-3 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900">{u.unit_name}</span>
                        <div className="text-slate-500">
                          {u.property?.property_name} • {tl('survey')} {u.property?.survey_number} ({u.property?.village})
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 bg-red-100 text-red-800 font-bold rounded text-[10px]">
                          {tl('criticalMoistureStress')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 3: CONTINUOUS SATELLITE MONITORING & INSPECTION QUEUE
        ========================================================================== */}
        {activeTab === 'satellite_inspection' && (
          <div className="space-y-6">
            {/* Quick Coordinate Search Action Banner */}
            <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-emerald-950 rounded-2xl p-5 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-emerald-800/40">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0">
                  <Satellite className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    {tl('satInspectorBannerTitle')}
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {tl('liveSatelliteView')}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {tl('satInspectorBannerDesc')}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setSatCoordModalOpen(true)}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shrink-0 shadow-lg"
              >
                <Search className="w-3.5 h-3.5 mr-1.5" />
                {tl('queryByCoords')}
              </Button>
            </div>

            {/* Priority Inspection Queue Table */}
            <InspectionQueueTable onInspectArea={handleInspectArea} />

            {/* Selected Area Continuous 15-Day Satellite Deep Dive */}
            {inspectedArea && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
                      <Satellite className="w-5 h-5" />
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        {inspectedArea.name} — 15-Day Crop Growth & Health Timeline
                      </h3>
                      <p className="text-xs text-slate-500">
                        Review satellite passes every 15 days, crop greenness changes, and verified field health.
                      </p>
                    </div>
                  </div>
                </div>

                <ContinuousMonitoringTimeline
                  area={inspectedArea}
                  observations={inspectedAreaObs}
                  onRefreshObservations={async () => {
                    await satelliteMonitoringService.processAreaObservations(inspectedArea.id, {
                      usePythonBackend: true,
                    });
                    const updatedObs = mockDb.getObservationsForArea(inspectedArea.id);
                    setInspectedAreaObs(updatedObs);
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedApp && (
        <Modal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          title={`Land Record Review: ${selectedApp.application_reference}`}
          size="lg"
        >
          <div className="space-y-5 text-xs max-h-[75vh] overflow-y-auto pr-1">
            {/* Farmer & Property Summary Cards */}
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Farmer Khatedar</span>
                <div className="font-bold text-slate-900">{selectedApp.farmer?.full_name}</div>
                <div className="text-slate-500">Phone: +91 {selectedApp.farmer?.phone_number}</div>
                <div className="text-emerald-700 font-semibold">Identity: Verified Document Attached ✓</div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Land Revenue Record</span>
                <div className="font-bold text-slate-900">Survey No. {selectedApp.property?.survey_number}</div>
                <div className="text-slate-500">
                  {selectedApp.property?.village}, {selectedApp.property?.taluk}, {selectedApp.property?.district}
                </div>
                <div className="font-mono text-slate-700">Doc: {selectedApp.property?.land_document_reference}</div>
              </div>
            </div>

            {/* Map Preview of Parcel */}
            <div>
              <span className="block font-bold text-slate-700 mb-1.5">
                Cadastral Survey Demarcation Map
              </span>
              <PropertyMap
                latitude={selectedApp.property?.latitude || 18.5793}
                longitude={selectedApp.property?.longitude || 73.9824}
                propertyName={selectedApp.property?.property_name || 'Land Parcel'}
                surveyNumber={selectedApp.property?.survey_number}
                landArea={`${selectedApp.property?.land_area} ${selectedApp.property?.land_area_unit}`}
                height="180px"
              />
            </div>

            {/* Decision Selection Buttons */}
            <div>
              <span className="block font-bold text-slate-800 mb-2">
                Administrative Decision:
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  disabled={selectedApp.status === 'APPROVED'}
                  onClick={() => setDecisionType('APPROVE')}
                  className={`p-3 rounded-xl border text-center font-semibold transition-all ${
                    decisionType === 'APPROVE'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 mx-auto mb-1 text-current" />
                  <span>Approve Registration</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDecisionType('REQUEST_INFO')}
                  className={`p-3 rounded-xl border text-center font-semibold transition-all ${
                    decisionType === 'REQUEST_INFO'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50'
                  }`}
                >
                  <HelpCircle className="w-4 h-4 mx-auto mb-1 text-current" />
                  <span>Request Clarification</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDecisionType('REJECT')}
                  className={`p-3 rounded-xl border text-center font-semibold transition-all ${
                    decisionType === 'REJECT'
                      ? 'bg-red-600 text-white border-red-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-red-50'
                  }`}
                >
                  <XCircle className="w-4 h-4 mx-auto mb-1 text-current" />
                  <span>Reject Registration</span>
                </button>
              </div>
            </div>

            {/* Context Inputs based on Decision */}
            {decisionType === 'APPROVE' && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 text-emerald-900">
                <span className="font-bold block">Approval Confirmation & Credentials Dispatch</span>
                <p className="leading-relaxed">
                  Approving this record will mark the land parcel verified, unlock plant intelligence monitoring, and dispatch official login credentials via SMS to +91 {selectedApp.farmer?.phone_number}.
                </p>
                <textarea
                  rows={2}
                  placeholder="Official approval remarks (recorded in revenue audit log)..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-emerald-300 bg-white"
                />
              </div>
            )}

            {decisionType === 'REQUEST_INFO' && (
              <div className="space-y-2">
                <label className="block font-bold text-amber-800">
                  Required Additional Information / Documents *
                </label>
                <textarea
                  rows={3}
                  placeholder="Specify survey clarification, TILR sketch, mutation extract..."
                  value={additionalInfoMsg}
                  onChange={(e) => setAdditionalInfoMsg(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-amber-300 bg-amber-50/40"
                  required
                />
              </div>
            )}

            {decisionType === 'REJECT' && (
              <div className="space-y-2">
                <label className="block font-bold text-red-800">
                  Official Rejection Reason (Mandatory) *
                </label>
                <textarea
                  rows={3}
                  placeholder="Record formal statutory reason for refusal under Maharashtra Land Revenue Code..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-red-300 bg-red-50/40"
                  required
                />
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <Button variant="outline" onClick={() => setReviewModalOpen(false)}>
                Cancel
              </Button>
              <Button
                disabled={!decisionType}
                onClick={handlePreConfirmDecision}
              >
                Continue to Confirm Decision
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirmation Dialog to Prevent Conflicting / Accidental Actions */}
      <Modal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title="Confirm Administrative Decision"
        size="sm"
      >
        <div className="space-y-3 text-xs">
          <p className="text-slate-700 leading-relaxed">
            Are you sure you want to execute the decision <strong>{decisionType}</strong> on application <strong>{selectedApp?.application_reference}</strong>?
          </p>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-600">
            This action will be stamped with your officer ID, timestamped, and recorded in the immutable administrative audit ledger.
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setConfirmModalOpen(false)}>
              Back
            </Button>
            <Button onClick={handleExecuteDecision} isLoading={isProcessing}>
              Confirm & Execute
            </Button>
          </div>
        </div>
      </Modal>

      {/* Assign Field Worker Modal */}
      {selectedApp && (
        <Modal
          isOpen={assignModalOpen}
          onClose={() => setAssignModalOpen(false)}
          title={`Assign Drone Photogrammetry: Survey ${selectedApp.property?.survey_number}`}
          size="md"
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Field Worker
              </label>
              <select
                value={selectedWorkerId}
                onChange={(e) => setSelectedWorkerId(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 bg-white"
              >
                <option value="usr-worker-01">Prakash Mahadev Jadhav (Certified Drone Pilot)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Inspection Scheduled Date
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Flight Mission Instructions
              </label>
              <textarea
                rows={2}
                value={fieldNotes}
                onChange={(e) => setFieldNotes(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" onClick={() => setAssignModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAssignInspection} isLoading={isProcessing}>
                Dispatch Inspection
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Administrative Approval & MSG91 SMS Provisioning Result Modal */}
      {approvalResultModal && (
        <Modal
          isOpen={!!approvalResultModal}
          onClose={() => setApprovalResultModal(null)}
          title="Registration Approved & Account Provisioned"
          size="lg"
        >
          <div className="space-y-5 text-xs">
            {/* Success Header Banner */}
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
              <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-emerald-950">
                  Land Registration Formally Approved
                </h4>
                <p className="text-emerald-800">
                  Application <strong>{approvalResultModal.app.application_reference}</strong> for{' '}
                  <strong>{approvalResultModal.app.farmer?.full_name}</strong> has been marked as{' '}
                  <span className="font-semibold uppercase text-emerald-900">Approved</span>. The farmer's land records and AI plant monitoring services are provisioned.
                </p>
                <div className="flex items-center gap-3 pt-1 text-[11px] text-emerald-700">
                  <span>Taluk: <strong>{approvalResultModal.app.property?.taluk}</strong></span>
                  <span>•</span>
                  <span>Survey #{approvalResultModal.app.property?.survey_number}</span>
                  <span>•</span>
                  <span>Phone: <strong>+91 {approvalResultModal.app.farmer?.phone_number}</strong></span>
                </div>
              </div>
            </div>

            {/* Account Credentials & Activation Link */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Generated Account Credentials
                </span>
                <Badge variant="warning">Pending Password Activation</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Assigned Portal Username
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-sm text-slate-900">
                      {approvalResultModal.username}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(approvalResultModal.username);
                        alert('Username copied to clipboard!');
                      }}
                      className="p-1 text-slate-400 hover:text-slate-600"
                      title="Copy Username"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Security Token Validity
                  </span>
                  <span className="font-medium text-slate-700 flex items-center gap-1.5 text-xs">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    Single-use, expires in 48 hours
                  </span>
                </div>
              </div>

              {approvalResultModal.activationUrl && (
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-700 block">
                    Secure Account Activation URL (Farmer Password Setup)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={approvalResultModal.activationUrl}
                      className="flex-1 bg-white font-mono text-[11px] text-slate-700 px-3 py-2 rounded-lg border border-slate-300 select-all"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyActivationLink(approvalResultModal.activationUrl)}
                    >
                      {copiedLink ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600 mr-1" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 mr-1" /> Copy
                        </>
                      )}
                    </Button>
                    <a
                      href={approvalResultModal.activationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Test Link
                    </a>
                  </div>
                  <p className="text-[10px] text-slate-500 italic">
                    Security policy: The farmer does not have a default password. They must follow this link to establish their private password before logging into the portal.
                  </p>
                </div>
              )}
            </div>

            {/* MSG91 SMS Notification Dispatch */}
            <div className="border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-sky-600" />
                  MSG91 SMS Notification Dispatch
                </span>
                {approvalResultModal.smsJob?.status === 'SENT' || approvalResultModal.smsJob?.status === 'DELIVERED' ? (
                  <Badge variant="success">SMS Dispatched (MSG91)</Badge>
                ) : approvalResultModal.smsJob?.status === 'PROVIDER_UNAVAILABLE' ? (
                  <Badge variant="warning">SMS Gateway Unavailable</Badge>
                ) : (
                  <Badge variant="error">{approvalResultModal.smsJob?.status || 'Failed'}</Badge>
                )}
              </div>

              {approvalResultModal.smsJob?.status === 'PROVIDER_UNAVAILABLE' && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-[11px] space-y-1">
                  <p className="font-semibold flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    MSG91 Credentials not active or gateway unreachable.
                  </p>
                  <p className="text-amber-800">
                    The approval has been executed and the activation token is securely generated. You can copy the activation link above and communicate it to the farmer, or retry sending once MSG91 configuration is verified.
                  </p>
                </div>
              )}

              {approvalResultModal.smsJob?.error_details && approvalResultModal.smsJob.status !== 'PROVIDER_UNAVAILABLE' && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-[11px]">
                  <strong>SMS Error:</strong> {approvalResultModal.smsJob.error_details}
                </div>
              )}

              {approvalResultModal.smsMessage && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                    SMS Message Body (Sent to +91 {approvalResultModal.app.farmer?.phone_number})
                  </span>
                  <div className="p-3 bg-slate-900 text-slate-100 font-mono text-[11px] rounded-lg border border-slate-800 whitespace-pre-wrap leading-relaxed">
                    {approvalResultModal.smsMessage}
                  </div>
                </div>
              )}

              {approvalResultModal.smsJob && (approvalResultModal.smsJob.status === 'PROVIDER_UNAVAILABLE' || approvalResultModal.smsJob.status === 'FAILED') && (
                <div className="flex justify-end pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRetrySms}
                    isLoading={isRetryingSms}
                  >
                    <RefreshCw className="w-3.5 h-3.5 mr-1" /> Retry SMS Dispatch
                  </Button>
                </div>
              )}
            </div>

            {/* Action Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="text-[11px] text-slate-500">
                Administrative desk updated • Status marked Approved
              </span>
              <Button onClick={() => setApprovalResultModal(null)}>
                Done & Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Satellite Coordinate Search Modal for Tahsildar */}
      <TahsildarSatelliteCoordinateModal
        isOpen={satCoordModalOpen}
        onClose={() => setSatCoordModalOpen(false)}
        onRegisterMonitoringArea={(newAreaId) => {
          setActiveTab('satellite_inspection');
          handleInspectArea(newAreaId);
        }}
      />
    </DashboardLayout>
  );
};
