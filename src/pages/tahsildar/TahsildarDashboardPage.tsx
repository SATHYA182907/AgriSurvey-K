import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { PropertyMap } from '@/components/maps/PropertyMap';
import { registrationService } from '@/services/registration.service';
import { inspectionService } from '@/services/inspection.service';
import { mockDb } from '@/services/mock-db';
import { RegistrationApplication, Profile } from '@/types';
import { PUNE_TALUKS, MAHARASHTRA_DISTRICTS } from '@/lib/constants';

export const TahsildarDashboardPage: React.FC = () => {
  const tahsildar = mockDb.currentUser;
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

  // Assign Inspection Modal State
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState('usr-worker-01');
  const [scheduledDate, setScheduledDate] = useState('2026-10-20');
  const [fieldNotes, setFieldNotes] = useState('Standard drone photogrammetry and crop boundary survey.');

  useEffect(() => {
    loadApplications();
  }, [statusFilter, talukFilter, searchTerm]);

  const loadApplications = async () => {
    const list = await registrationService.listApplicationsForTahsildar({
      status: statusFilter,
      taluk: talukFilter,
      search: searchTerm,
    });
    setApplications(list);
  };

  const handleOpenReview = (app: RegistrationApplication) => {
    setSelectedApp(app);
    setReviewModalOpen(true);
    setDecisionType(null);
    setRejectionReason('');
    setAdditionalInfoMsg('');
    setReviewNotes('');
  };

  const handleExecuteDecision = async () => {
    if (!selectedApp || !decisionType) return;
    setIsProcessing(true);

    try {
      if (decisionType === 'APPROVE') {
        const res = await registrationService.reviewApplication(selectedApp.id, 'APPROVED', {
          notes: reviewNotes || 'Application complies with 7/12 land revenue extract.',
        });

        const creds = res.credentials;
        if (creds) {
          alert(
            `✅ Land Registration Approved!\n\nOfficial portal login credentials generated and dispatched via SMS text message to +91 ${selectedApp.farmer?.phone_number}:\n\n• Username: ${creds.username}\n• Temporary Password: ${creds.password}\n\nThe farmer has received the SMS notification and can now enter the Farmer Portal.`
          );
        }
      } else if (decisionType === 'REJECT') {
        if (!rejectionReason.trim()) {
          alert('Please enter a rejection reason.');
          setIsProcessing(false);
          return;
        }
        await registrationService.reviewApplication(selectedApp.id, 'REJECTED', {
          rejectionReason,
          notes: reviewNotes,
        });
      } else if (decisionType === 'REQUEST_INFO') {
        if (!additionalInfoMsg.trim()) {
          alert('Please specify the required additional information.');
          setIsProcessing(false);
          return;
        }
        await registrationService.reviewApplication(
          selectedApp.id,
          'ADDITIONAL_INFORMATION_REQUIRED',
          {
            additionalInfoRequest: additionalInfoMsg,
            notes: reviewNotes,
          }
        );
      }

      setIsProcessing(false);
      setReviewModalOpen(false);
      loadApplications();
    } catch (err: any) {
      setIsProcessing(false);
      alert(err.message || 'Error recording decision');
    }
  };

  const handleAssignInspection = async () => {
    if (!selectedApp) return;
    setIsProcessing(true);

    try {
      await inspectionService.assignInspection({
        propertyId: selectedApp.property_id,
        applicationId: selectedApp.id,
        workerId: selectedWorkerId,
        scheduledAt: new Date(scheduledDate).toISOString(),
        fieldNotes,
      });

      setIsProcessing(false);
      setAssignModalOpen(false);
      alert('Field inspection successfully assigned to drone operator.');
      loadApplications();
    } catch (err: any) {
      setIsProcessing(false);
      alert(err.message || 'Error assigning inspection');
    }
  };

  const totalRegistered = mockDb.applications.length;
  const pendingCount = mockDb.applications.filter((a) => a.status === 'PENDING_TAHSILDAR_REVIEW').length;
  const approvedCount = mockDb.applications.filter((a) => a.status === 'APPROVED').length;
  const rejectedCount = mockDb.applications.filter((a) => a.status === 'REJECTED').length;
  const pendingInspections = mockDb.inspections.filter((i) => i.inspection_status !== 'COMPLETED').length;
  const droneAwaiting = mockDb.inspections.filter((i) => i.inspection_status === 'EVIDENCE_UPLOADED').length;
  const completedReports = mockDb.reports.filter((r) => r.final_status === 'VERIFIED').length;

  return (
    <DashboardLayout
      title="Revenue Administration Portal"
      subtitle={`Tahsildar Anand S. Kulkarni • Assigned Jurisdiction: Pune District (Haveli & Baramati Taluks)`}
    >
      <div className="space-y-6">
        {/* Jurisdiction Notice Banner (Section 10 Requirement) */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <Building2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>
              Authorized Geographic Scope: <span className="font-bold text-slate-900">Pune District / Haveli & Baramati Taluks</span> (Staff Region ID: SR-01)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/tahsildar/image-comparison">
              <Button size="sm" variant="outline" icon={<Eye className="w-3.5 h-3.5" />}>
                Comparison Workspace
              </Button>
            </Link>
            <Link to="/tahsildar/crop-verification">
              <Button size="sm" variant="outline">
                Crop Verification
              </Button>
            </Link>
          </div>
        </div>

        {/* 7 Statistics Cards (Section 10 Requirement) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <Card className="p-3.5 text-center">
            <div className="text-[10px] uppercase font-semibold text-slate-400">Total Apps</div>
            <div className="text-xl font-bold text-slate-900 mt-1">{totalRegistered}</div>
          </Card>
          <Card className="p-3.5 text-center border-amber-200 bg-amber-50/30">
            <div className="text-[10px] uppercase font-semibold text-amber-700">Pending Review</div>
            <div className="text-xl font-bold text-amber-800 mt-1">{pendingCount}</div>
          </Card>
          <Card className="p-3.5 text-center border-emerald-200 bg-emerald-50/30">
            <div className="text-[10px] uppercase font-semibold text-emerald-700">Approved</div>
            <div className="text-xl font-bold text-emerald-800 mt-1">{approvedCount}</div>
          </Card>
          <Card className="p-3.5 text-center border-rose-200 bg-rose-50/30">
            <div className="text-[10px] uppercase font-semibold text-rose-700">Rejected</div>
            <div className="text-xl font-bold text-rose-800 mt-1">{rejectedCount}</div>
          </Card>
          <Card className="p-3.5 text-center">
            <div className="text-[10px] uppercase font-semibold text-slate-400">Inspections</div>
            <div className="text-xl font-bold text-slate-900 mt-1">{pendingInspections}</div>
          </Card>
          <Card className="p-3.5 text-center border-teal-200 bg-teal-50/30">
            <div className="text-[10px] uppercase font-semibold text-teal-700">Drone Evidence</div>
            <div className="text-xl font-bold text-teal-800 mt-1">{droneAwaiting}</div>
          </Card>
          <Card className="p-3.5 text-center border-emerald-200 bg-emerald-50/30">
            <div className="text-[10px] uppercase font-semibold text-emerald-700">Verified</div>
            <div className="text-xl font-bold text-emerald-800 mt-1">{completedReports}</div>
          </Card>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search reference, farmer, survey..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Filter:</span>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING_TAHSILDAR_REVIEW">Pending Review</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="ADDITIONAL_INFORMATION_REQUIRED">Info Required</option>
            </select>

            <select
              value={talukFilter}
              onChange={(e) => setTalukFilter(e.target.value)}
              className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 font-medium"
            >
              <option value="ALL">All Taluks (Jurisdiction)</option>
              <option value="Haveli">Haveli Taluk</option>
              <option value="Baramati">Baramati Taluk</option>
            </select>
          </div>
        </div>

        {/* Applications Data Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Application Ref</th>
                  <th className="py-3 px-4">Farmer Name</th>
                  <th className="py-3 px-4">Masked Mobile</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Survey / Gat</th>
                  <th className="py-3 px-4">Area</th>
                  <th className="py-3 px-4">Farm Type</th>
                  <th className="py-3 px-4">Submitted</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-slate-400">
                      No applications found matching current geographic or status filters.
                    </td>
                  </tr>
                ) : (
                  applications.map((app) => {
                    const prop = app.property;
                    const farmerObj = app.farmer;
                    const maskedPhone = farmerObj?.phone_number
                      ? farmerObj.phone_number.replace(/(\d{2})\d{4}(\d{4})/, '$1****$2')
                      : '98****2345';

                    return (
                      <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                          {app.application_reference}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-800">
                          {farmerObj?.full_name}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-500">
                          {maskedPhone}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {prop?.village}, {prop?.taluk}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                          {prop?.survey_number}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700">
                          {prop?.land_area} {prop?.land_area_unit}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">
                          {prop?.farm_type}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">
                          {new Date(app.submitted_at).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4 space-y-1">
                          <Badge status={app.status} size="sm" />
                          {farmerObj?.account_status === 'pending_approval' && app.status === 'PENDING_TAHSILDAR_REVIEW' && (
                            <span className="block text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 whitespace-nowrap">
                              New Registration • Credentials Pending
                            </span>
                          )}
                          {app.status === 'APPROVED' && farmerObj?.generated_credentials && (
                            <span className="block text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 whitespace-nowrap">
                              SMS Sent: +91 {farmerObj.phone_number}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenReview(app)}
                            >
                              Review Application
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
                                Assign Drone
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detailed Application Review Modal (Section 11 Requirement) */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title={`Application Review: ${selectedApp?.application_reference}`}
        description="Verify farmer declaration against revenue records and issue official administrative decision"
        maxWidth="2xl"
      >
        {selectedApp && (
          <div className="space-y-5 text-xs max-h-[75vh] overflow-y-auto pr-1">
            {/* Farmer & Property Summary Cards */}
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Landholder</span>
                <div className="font-bold text-slate-900">{selectedApp.farmer?.full_name}</div>
                <div className="text-slate-500">
                  Phone: {selectedApp.farmer?.phone_number?.replace(/(\d{2})\d{4}(\d{4})/, '$1****$2')}
                </div>
                <div className="text-emerald-700 font-medium">Identity: Verified Document Attached</div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Land Parcel</span>
                <div className="font-bold text-slate-900">
                  Survey No. {selectedApp.property?.survey_number}
                </div>
                <div className="text-slate-500">
                  {selectedApp.property?.village}, {selectedApp.property?.taluk}, {selectedApp.property?.district}
                </div>
                <div className="font-mono text-slate-700">
                  7/12 Doc Ref: {selectedApp.property?.land_document_reference}
                </div>
              </div>
            </div>

            {/* Map Preview of Parcel */}
            <div>
              <span className="block font-bold text-slate-700 mb-1.5">
                Geospatial Land Parcel Demarcation
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
                  onClick={() => setDecisionType('APPROVE')}
                  className={`p-3 rounded-xl border text-center font-semibold transition-all ${
                    decisionType === 'APPROVE'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50 hover:border-emerald-200'
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
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50 hover:border-amber-200'
                  }`}
                >
                  <HelpCircle className="w-4 h-4 mx-auto mb-1 text-current" />
                  <span>Request More Info</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDecisionType('REJECT')}
                  className={`p-3 rounded-xl border text-center font-semibold transition-all ${
                    decisionType === 'REJECT'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-rose-50 hover:border-rose-200'
                  }`}
                >
                  <XCircle className="w-4 h-4 mx-auto mb-1 text-current" />
                  <span>Reject Registration</span>
                </button>
              </div>
            </div>

            {/* Approval Credentials & SMS Dispatch Banner */}
            {decisionType === 'APPROVE' && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl space-y-1.5 text-xs text-emerald-950">
                <div className="flex items-center gap-2 font-bold text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Farmer Account Activation & SMS Credential Dispatch</span>
                </div>
                <p className="text-[11px] leading-relaxed text-emerald-900">
                  Approving this application will activate the farmer's portal account. The system will automatically generate secure login credentials and dispatch them via SMS text message to <strong>+91 {selectedApp.farmer?.phone_number}</strong>:
                </p>
                <div className="bg-white/80 p-2 rounded-lg border border-emerald-200 font-mono text-[11px] flex gap-4 text-emerald-950">
                  <span>Username: <strong>{selectedApp.farmer?.phone_number}</strong></span>
                  <span>Password: <strong>Agri@{selectedApp.farmer?.phone_number?.slice(-4) || '2026'}</strong></span>
                </div>
              </div>
            )}

            {/* Rejection Reason (Mandatory when rejecting) */}
            {decisionType === 'REJECT' && (
              <div className="space-y-1 p-3 bg-rose-50 border border-rose-200 rounded-lg">
                <label className="block font-bold text-rose-900">
                  Mandatory Rejection Justification <span className="text-rose-600">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Specify legal or land record discrepancies justifying rejection..."
                  className="w-full p-2.5 rounded-md border border-rose-300 text-xs bg-white text-slate-900 focus:ring-2 focus:ring-rose-500"
                />
              </div>
            )}

            {/* Additional Information Request (Mandatory when requesting info) */}
            {decisionType === 'REQUEST_INFO' && (
              <div className="space-y-1 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <label className="block font-bold text-amber-900">
                  Information Required from Farmer <span className="text-amber-600">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={additionalInfoMsg}
                  onChange={(e) => setAdditionalInfoMsg(e.target.value)}
                  placeholder="State clearly what documents or boundary clarification is needed..."
                  className="w-full p-2.5 rounded-md border border-amber-300 text-xs bg-white text-slate-900 focus:ring-2 focus:ring-amber-500"
                />
              </div>
            )}

            {/* General Review Notes */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Internal Review Notes / Audit Memo
              </label>
              <textarea
                rows={2}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Optional notes recorded to audit log..."
                className="w-full p-2 rounded-md border border-slate-300 text-xs bg-white text-slate-900"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Button variant="ghost" onClick={() => setReviewModalOpen(false)}>
                Cancel
              </Button>
              <Button
                disabled={!decisionType}
                isLoading={isProcessing}
                onClick={handleExecuteDecision}
              >
                Confirm & Record Decision
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Assign Inspection Modal (Section 12 Requirement) */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Assign Field Drone Inspection"
        description="Dispatch certified drone pilot to capture RTK aerial imagery"
        maxWidth="md"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Select Field Verification Worker
            </label>
            <select
              value={selectedWorkerId}
              onChange={(e) => setSelectedWorkerId(e.target.value)}
              className="w-full p-2 rounded-lg border border-slate-300 bg-white"
            >
              {mockDb.profiles
                .filter((p) => p.role === 'field_worker')
                .map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.full_name} (Drone Operator • Haveli)
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Scheduled Inspection Date
            </label>
            <input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="w-full p-2 rounded-lg border border-slate-300 bg-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Mission Instructions & Flight Notes
            </label>
            <textarea
              rows={3}
              value={fieldNotes}
              onChange={(e) => setFieldNotes(e.target.value)}
              className="w-full p-2 rounded-lg border border-slate-300 bg-white"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="ghost" onClick={() => setAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignInspection} isLoading={isProcessing}>
              Dispatch Inspection
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
};
