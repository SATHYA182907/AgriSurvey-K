import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  MapPin,
  Layers,
  ArrowRight,
  ShieldCheck,
  Building2,
  UserCheck,
  Plane,
  Camera,
  Eye,
  AlertCircle,
  FileText,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { inspectionService } from '@/services/inspection.service';
import { registrationService } from '@/services/registration.service';
import { mockDb } from '@/services/mock-db';
import {
  FieldInspection,
  RegistrationApplication,
  Property,
} from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { getTahsildarLabel, getStatusLabel, localizePlotOrCropName } from '@/lib/dashboard-localizer';

export const TahsildarAssignInspectionsPage: React.FC = () => {
  const { t, language } = useLanguage();
  const tl = (key: string) => getTahsildarLabel(key, language);
  const tahsildar = mockDb.currentUser;

  // Active Tab: Scheduled Inspections vs Parcels Needing Inspection
  const [activeTab, setActiveTab] = useState<'roster' | 'needing_inspection'>('roster');

  // Inspection lists
  const [inspections, setInspections] = useState<FieldInspection[]>([]);
  const [applications, setApplications] = useState<RegistrationApplication[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal State
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState<string>('');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [selectedWorkerId, setSelectedWorkerId] = useState('usr-worker-01');
  const [scheduledDate, setScheduledDate] = useState('2026-10-31');
  const [surveyType, setSurveyType] = useState('DRONE_ORTHOMOSAIC');
  const [priority, setPriority] = useState('HIGH');
  const [fieldNotes, setFieldNotes] = useState('Capture 4K orthomosaic, boundary check with adjacent village road, and verify crop canopy.');
  const [isProcessing, setIsProcessing] = useState(false);

  const loadData = useCallback(async () => {
    // Get all inspections enriched with property and worker
    const list = await inspectionService.getInspectionsForWorker('');
    setInspections(list);

    // Get all applications
    const apps = await registrationService.listApplicationsForTahsildar({
      status: 'ALL',
      taluk: 'ALL',
      search: '',
    });
    setApplications(apps);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Derived counts
  const totalInspections = inspections.length;
  const pendingCount = inspections.filter((i) => i.inspection_status === 'ASSIGNED').length;
  const scheduledCount = inspections.filter((i) => i.inspection_status === 'SCHEDULED').length;
  const inProgressCount = inspections.filter((i) => i.inspection_status === 'IN_PROGRESS').length;
  const evidenceUploadedCount = inspections.filter(
    (i) => i.inspection_status === 'EVIDENCE_UPLOADED' || i.inspection_status === 'COMPLETED'
  ).length;

  // Parcels needing inspection (e.g., approved or pending review without active inspection)
  const inspectedAppIds = new Set(inspections.map((i) => i.application_id));
  const parcelsNeedingInspection = applications.filter((a) => !inspectedAppIds.has(a.id));

  // Filtered roster
  const filteredInspections = inspections.filter((insp) => {
    const matchesStatus =
      statusFilter === 'ALL' || insp.inspection_status === statusFilter;
    const term = searchTerm.toLowerCase();
    const propName = insp.property?.property_name?.toLowerCase() || '';
    const surveyNo = insp.property?.survey_number?.toLowerCase() || '';
    const workerName = insp.assigned_worker?.full_name?.toLowerCase() || '';
    const id = insp.id.toLowerCase();
    const matchesSearch =
      !term ||
      propName.includes(term) ||
      surveyNo.includes(term) ||
      workerName.includes(term) ||
      id.includes(term);
    return matchesStatus && matchesSearch;
  });

  const handleOpenAssignModalForApp = (app: RegistrationApplication) => {
    setSelectedAppId(app.id);
    setSelectedPropertyId(app.property_id);
    setFieldNotes(`Verification mission for Survey No. ${app.property?.survey_number} (${app.property?.village}, ${app.property?.taluk}). Verify 7/12 crop & boundary.`);
    setAssignModalOpen(true);
  };

  const handleExecuteAssign = async () => {
    if (!selectedAppId || !selectedPropertyId) {
      alert('Please select an application or land parcel to assign.');
      return;
    }
    setIsProcessing(true);

    try {
      await inspectionService.assignInspection({
        applicationId: selectedAppId,
        propertyId: selectedPropertyId,
        workerId: selectedWorkerId,
        scheduledAt: scheduledDate,
        fieldNotes: `[${surveyType}] [Priority: ${priority}] ${fieldNotes}`,
      });

      alert(`✅ Mission assigned to field surveyor! Scheduled for ${scheduledDate}. Notification dispatched.`);
      setAssignModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error assigning inspection');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <DashboardLayout
      title={tl('assignInspectionsTitle')}
      subtitle={`${tl('assignInspectionsSubtitle')} • ${tahsildar.full_name}`}
    >
      <div className="space-y-6 pb-8">
        {/* Top Header & Dispatch Trigger Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 rounded-2xl border border-indigo-900/50 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  {tl('assignInspectionsTitle')}
                </h2>
                <Badge variant="info" className="bg-indigo-500/20 text-indigo-300 border-indigo-400/30 text-[10px]">
                  RTK GPS Drones
                </Badge>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {tl('assignInspectionsSubtitle')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => {
                const firstNeeding = parcelsNeedingInspection[0] || applications[0];
                if (firstNeeding) {
                  setSelectedAppId(firstNeeding.id);
                  setSelectedPropertyId(firstNeeding.property_id);
                }
                setAssignModalOpen(true);
              }}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{tl('btnAssignNewInspection')}</span>
            </Button>
          </div>
        </div>

        {/* 5 Operations KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <Card className="p-4 bg-amber-50/50 border-amber-200">
            <div className="flex items-center justify-between text-xs font-semibold text-amber-800">
              <span>{tl('pendingInspectionsCount')}</span>
              <Clock className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <div className="text-2xl font-extrabold text-amber-950 mt-1">{pendingCount}</div>
            <div className="text-[10px] text-amber-700 mt-0.5">Assigned & Awaiting Pilot</div>
          </Card>

          <Card className="p-4 bg-blue-50/50 border-blue-200">
            <div className="flex items-center justify-between text-xs font-semibold text-blue-800">
              <span>{tl('scheduledInspectionsCount')}</span>
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="text-2xl font-extrabold text-blue-950 mt-1">{scheduledCount}</div>
            <div className="text-[10px] text-blue-700 mt-0.5">Flight window locked</div>
          </Card>

          <Card className="p-4 bg-indigo-50/50 border-indigo-200">
            <div className="flex items-center justify-between text-xs font-semibold text-indigo-800">
              <span>{tl('inProgressInspectionsCount')}</span>
              <Plane className="w-3.5 h-3.5 text-indigo-600" />
            </div>
            <div className="text-2xl font-extrabold text-indigo-950 mt-1">{inProgressCount}</div>
            <div className="text-[10px] text-indigo-700 mt-0.5">Surveyor on-site</div>
          </Card>

          <Card className="p-4 bg-emerald-50/50 border-emerald-200">
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-800">
              <span>{tl('completedInspectionsCount')}</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-950 mt-1">{evidenceUploadedCount}</div>
            <div className="text-[10px] text-emerald-700 mt-0.5">Ready for comparison</div>
          </Card>

          <Card className="p-4 bg-slate-50 border-slate-200">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
              <span>{tl('activeFieldStaff')}</span>
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">2</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Haveli & Baramati beats</div>
          </Card>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-3 sm:p-4 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('roster')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'roster'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>{tl('tabActiveInspections')} ({inspections.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('needing_inspection')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'needing_inspection'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-4 h-4 text-amber-600" />
              <span>{tl('tabPendingParcels')} ({parcelsNeedingInspection.length})</span>
            </button>
          </div>

          {activeTab === 'roster' && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by survey, worker, ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-700"
              >
                <option value="ALL">All Mission Statuses</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="EVIDENCE_UPLOADED">Evidence Uploaded</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          )}
        </div>

        {/* =========================================================================
            TAB 1: SCHEDULED INSPECTIONS ROSTER
        ========================================================================== */}
        {activeTab === 'roster' && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px]">
                  <tr>
                    <th className="py-3 px-4">{tl('colInspectionRef')}</th>
                    <th className="py-3 px-4">{tl('colParcelDetails')}</th>
                    <th className="py-3 px-4">{tl('colAssignedWorker')}</th>
                    <th className="py-3 px-4">{tl('colScheduledDate')}</th>
                    <th className="py-3 px-4">{tl('colSurveyScope')}</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInspections.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No field inspections found for selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredInspections.map((insp) => (
                      <tr key={insp.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                          {insp.id}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900">
                            {tl('survey')} {insp.property?.survey_number || 'N/A'}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {insp.property?.village}, {insp.property?.taluk} • {insp.property?.land_area} Ha
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900">
                            {insp.assigned_worker?.full_name || 'Assigned Drone Pilot'}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {insp.assigned_worker?.phone_number || '+91 98220 11223'}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-700">
                          {insp.scheduled_at ? insp.scheduled_at.split('T')[0] : '2026-10-30'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                          {insp.field_notes || 'Standard photogrammetry survey'}
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge
                            variant={
                              insp.inspection_status === 'COMPLETED' || insp.inspection_status === 'EVIDENCE_UPLOADED'
                                ? 'success'
                                : insp.inspection_status === 'IN_PROGRESS'
                                ? 'info'
                                : 'warning'
                            }
                          >
                            {insp.inspection_status}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {insp.inspection_status === 'EVIDENCE_UPLOADED' || insp.inspection_status === 'COMPLETED' ? (
                              <Link to="/tahsildar/image-comparison">
                                <Button size="sm" variant="outline" className="text-emerald-700 border-emerald-200 hover:bg-emerald-50">
                                  <Eye className="w-3.5 h-3.5 mr-1" />
                                  <span>{tl('btnInspectEvidence')}</span>
                                </Button>
                              </Link>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedAppId(insp.application_id);
                                  setSelectedPropertyId(insp.property_id);
                                  setAssignModalOpen(true);
                                }}
                              >
                                {tl('btnReassign')}
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
        )}

        {/* =========================================================================
            TAB 2: LAND PARCELS & APPLICATIONS AWAITING FIELD SURVEY
        ========================================================================== */}
        {activeTab === 'needing_inspection' && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px]">
                  <tr>
                    <th className="py-3 px-4">{tl('colAppRef')}</th>
                    <th className="py-3 px-4">{tl('colFarmerName')}</th>
                    <th className="py-3 px-4">{tl('colParcelDetails')}</th>
                    <th className="py-3 px-4">{tl('colLandArea')}</th>
                    <th className="py-3 px-4">{tl('colCrop')}</th>
                    <th className="py-3 px-4">Urgency</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parcelsNeedingInspection.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        All applications currently have field inspections scheduled or completed!
                      </td>
                    </tr>
                  ) : (
                    parcelsNeedingInspection.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                          {app.application_reference}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          {app.farmer?.full_name}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900">
                            {tl('survey')} {app.property?.survey_number}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {app.property?.village}, {app.property?.taluk}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono">
                          {app.property?.land_area} {app.property?.land_area_unit}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700">
                          {localizePlotOrCropName((app.property as any)?.crop_name || app.property?.farm_type || 'Sugarcane', language)}
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge variant="warning">Inspection Awaited</Badge>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                            onClick={() => handleOpenAssignModalForApp(app)}
                          >
                            <Plus className="w-3.5 h-3.5 mr-1" />
                            <span>Assign Inspection</span>
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          ASSIGN INSPECTION MODAL
      ========================================================================== */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Dispatch Field Surveyor / Drone Inspection Mission"
        size="lg"
      >
        <div className="space-y-4 text-xs text-slate-700">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Select Target Land Parcel / Application *
            </label>
            <select
              value={selectedAppId}
              onChange={(e) => {
                setSelectedAppId(e.target.value);
                const found = applications.find((a) => a.id === e.target.value);
                if (found) setSelectedPropertyId(found.property_id);
              }}
              className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-800"
            >
              <option value="">-- Choose Application / Survey Number --</option>
              {applications.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.application_reference} — Survey {app.property?.survey_number} ({app.farmer?.full_name}, {app.property?.village})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Authorized Field Worker / Drone Pilot *
              </label>
              <select
                value={selectedWorkerId}
                onChange={(e) => setSelectedWorkerId(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-800"
              >
                <option value="usr-worker-01">Prakash Mahadev Jadhav (Field Worker #01 - Haveli)</option>
                <option value="usr-worker-02">Ramesh Shinde (Certified Drone Pilot #02 - Baramati)</option>
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Survey Scope & Equipment *
              </label>
              <select
                value={surveyType}
                onChange={(e) => setSurveyType(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-800"
              >
                <option value="DRONE_ORTHOMOSAIC">Drone 4K Orthomosaic (DJI Matrice 350 RTK)</option>
                <option value="MULTISPECTRAL_NDVI">Multispectral NDVI & NDMI Aerial Survey</option>
                <option value="BOUNDARY_TRUTH">Ground Truth Boundary Demarcation (DGPS Rover)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Priority Level *
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-800"
              >
                <option value="NORMAL">Normal Priority</option>
                <option value="HIGH">High Priority (Fast-track)</option>
                <option value="CRITICAL">Critical Priority (Court / Dispute / Distress)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Mission Flight Directives & Agronomic Notes
            </label>
            <textarea
              rows={3}
              value={fieldNotes}
              onChange={(e) => setFieldNotes(e.target.value)}
              placeholder="Specify flight altitude, boundary overlap percentage, crop stage check, and surveyor instructions..."
              className="w-full p-2.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-200 pt-3">
            <Button variant="ghost" size="sm" onClick={() => setAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={isProcessing}
              onClick={handleExecuteAssign}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            >
              {isProcessing ? 'Dispatching...' : 'Dispatch Mission'}
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
};
export default TahsildarAssignInspectionsPage;
