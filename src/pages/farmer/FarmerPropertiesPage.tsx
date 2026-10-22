import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  FileText,
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  UploadCloud,
  ArrowRight,
  Sprout,
  Send,
  Building2,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { PropertyMap } from '@/components/maps/PropertyMap';
import { registrationService } from '@/services/registration.service';
import { plantIntelligenceService } from '@/services/plant-intelligence.service';
import { mockDb } from '@/services/mock-db';
import { RegistrationApplication, Property, MonitoringUnit } from '@/types';
import { CreateMonitoringUnitModal } from '@/components/plant-intelligence/CreateMonitoringUnitModal';

export const FarmerPropertiesPage: React.FC = () => {
  const farmer = mockDb.currentUser;
  const [applications, setApplications] = useState<RegistrationApplication[]>([]);
  const [monitoringUnits, setMonitoringUnits] = useState<MonitoringUnit[]>([]);
  const [selectedApp, setSelectedApp] = useState<RegistrationApplication | null>(null);

  // Resubmit / Additional Info Modal State
  const [resubmitModalOpen, setResubmitModalOpen] = useState(false);
  const [responseNotes, setResponseNotes] = useState('');
  const [supplementalDoc, setSupplementalDoc] = useState('Certified_TILR_Boundary_Sketch_2026.pdf');
  const [isSubmittingResubmit, setIsSubmittingResubmit] = useState(false);

  // Create Monitoring Unit Modal State
  const [createUnitModalOpen, setCreateUnitModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, [farmer.id]);

  const loadData = async () => {
    const apps = await registrationService.getMyApplications(farmer.id);
    setApplications(apps);
    if (apps.length > 0) {
      setSelectedApp(apps[0]);
    }
    const units = await plantIntelligenceService.getMonitoringUnits({ farmerId: farmer.id });
    setMonitoringUnits(units);
  };

  const handleOpenResubmit = (app: RegistrationApplication) => {
    setSelectedApp(app);
    setResponseNotes('');
    setResubmitModalOpen(true);
  };

  const handleExecuteResubmit = async () => {
    if (!selectedApp || !responseNotes.trim()) {
      alert('Please enter your clarification response notes.');
      return;
    }
    setIsSubmittingResubmit(true);
    try {
      await registrationService.respondAndResubmit({
        appId: selectedApp.id,
        responseNotes,
        additionalDocuments: supplementalDoc,
      });
      alert('✅ Application resubmitted successfully. The assigned Tahsildar has been notified for verification.');
      setResubmitModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to resubmit application.');
    } finally {
      setIsSubmittingResubmit(false);
    }
  };

  return (
    <DashboardLayout
      title="My Agricultural Properties"
      subtitle={`Verified Land Registry & Farmland Parcels • ${farmer.full_name}`}
    >
      <div className="space-y-6">
        {/* Top Header & Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Registered Agricultural Land Parcels
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Properties officially recorded under 7/12 Land Revenue Extracts. Multiple landholdings supported.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/farmer/register">
              <Button icon={<PlusCircle className="w-4 h-4" />}>
                Register New Property
              </Button>
            </Link>
          </div>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* List of Properties (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {applications.map((app) => {
              const prop = app.property;
              const isSelected = selectedApp?.id === app.id;
              const isApproved = app.status === 'APPROVED';
              const isActionRequired = app.status === 'ADDITIONAL_INFORMATION_REQUIRED';
              const isRejected = app.status === 'REJECTED';
              const propUnits = monitoringUnits.filter((u) => u.property_id === prop?.id);

              return (
                <div
                  key={app.id}
                  onClick={() => setSelectedApp(app)}
                  className={`bg-white rounded-2xl border p-5 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-emerald-500 ring-2 ring-emerald-500/10 shadow-md'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900">
                          {prop?.property_name || `Survey No. ${prop?.survey_number}`}
                        </h3>
                        <Badge status={app.status} size="sm" />
                      </div>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        Ref: {app.application_reference}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-extrabold text-emerald-800 block">
                        {prop?.land_area} {prop?.land_area_unit}
                      </span>
                      <span className="text-[10px] text-slate-400">{prop?.ownership_category}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl text-xs text-slate-600 mb-4">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Survey Number</span>
                      <span className="font-semibold font-mono">{prop?.survey_number}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Taluk & District</span>
                      <span className="truncate">{prop?.taluk}, {prop?.district}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Farming Type</span>
                      <span>{prop?.farm_type}</span>
                    </div>
                  </div>

                  {/* ADDITIONAL INFORMATION REQUIRED ALERT BANNER */}
                  {isActionRequired && (
                    <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-2">
                      <div className="flex items-center gap-1.5 font-bold text-amber-800">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Action Required: Officer Requested Clarification</span>
                      </div>
                      <p className="italic text-slate-700">
                        "{app.additional_information_request || 'Please submit updated survey boundary clarification.'}"
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenResubmit(app);
                        }}
                        className="w-full py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Response & Resubmit Application</span>
                      </button>
                    </div>
                  )}

                  {/* REJECTED ALERT BANNER WITH APPEAL WORKFLOW */}
                  {isRejected && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 space-y-2">
                      <div className="flex items-center gap-1.5 font-bold text-red-800">
                        <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                        <span>Registration Rejected by Revenue Office</span>
                      </div>
                      <p className="text-slate-700">
                        <strong>Reason:</strong> {app.rejection_reason || 'Application does not conform to revenue land records.'}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenResubmit(app);
                        }}
                        className="w-full py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>File Rectification Appeal & Resubmit</span>
                      </button>
                    </div>
                  )}

                  {/* Bottom Footer Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <span className="text-[11px] text-slate-400">
                      Monitored Units: <strong className="text-slate-700">{propUnits.length}</strong>
                    </span>

                    <div className="flex items-center gap-2">
                      {isApproved ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedApp(app);
                            setCreateUnitModalOpen(true);
                          }}
                          className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                        >
                          <Sprout className="w-3.5 h-3.5" />
                          <span>Add Plant Monitoring Unit</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">
                          Monitoring locked until verification
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Details & Map View for Selected Property (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            {selectedApp?.property && (
              <Card className="p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      Cadastral Boundary Map
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Survey: {selectedApp.property.survey_number} • {selectedApp.property.village}
                    </p>
                  </div>
                  <Badge status={selectedApp.status} size="sm" />
                </div>

                <PropertyMap
                  latitude={selectedApp.property.latitude || 18.5793}
                  longitude={selectedApp.property.longitude || 73.9824}
                  propertyName={selectedApp.property.property_name || 'Agricultural Parcel'}
                  surveyNumber={selectedApp.property.survey_number}
                  landArea={`${selectedApp.property.land_area} ${selectedApp.property.land_area_unit}`}
                  height="260px"
                />

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                  <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                    7/12 Land Document Details
                  </div>
                  <div className="text-slate-600">
                    Document Ref: <span className="font-mono">{selectedApp.property.land_document_reference}</span>
                  </div>
                  <div className="text-slate-600">
                    Assigned Tahsildar Office: Haveli / Pune Division
                  </div>
                </div>

                {selectedApp.status === 'APPROVED' && (
                  <Button
                    variant="outline"
                    className="w-full text-emerald-800 border-emerald-300 hover:bg-emerald-50 font-bold text-xs"
                    icon={<Sprout className="w-3.5 h-3.5 text-emerald-600" />}
                    onClick={() => setCreateUnitModalOpen(true)}
                  >
                    Activate New Plant Monitoring Unit
                  </Button>
                )}
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Resubmit / Clarification Modal */}
      {selectedApp && (
        <Modal
          isOpen={resubmitModalOpen}
          onClose={() => setResubmitModalOpen(false)}
          title={`Respond to Tahsildar — Ref: ${selectedApp.application_reference}`}
          size="md"
        >
          <div className="space-y-4">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
              <span className="font-bold block mb-1">Officer's Request / Objection:</span>
              <p className="italic">
                "{selectedApp.additional_information_request || selectedApp.rejection_reason || 'Please supply updated survey clarification.'}"
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Your Response & Clarification Notes
              </label>
              <textarea
                rows={3}
                placeholder="Explain the boundary clarification, mutation entry details, or joint-holder consent..."
                value={responseNotes}
                onChange={(e) => setResponseNotes(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Attach Supplemental Document
              </label>
              <div className="p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span className="font-mono">{supplementalDoc}</span>
                </div>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                  Attached ✓
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button variant="outline" onClick={() => setResubmitModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleExecuteResubmit} isLoading={isSubmittingResubmit}>
                Resubmit Application
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Create Monitoring Unit Modal */}
      <CreateMonitoringUnitModal
        isOpen={createUnitModalOpen}
        onClose={() => setCreateUnitModalOpen(false)}
        properties={applications.map((a) => a.property!).filter(Boolean)}
        applications={applications}
        onSuccess={loadData}
      />
    </DashboardLayout>
  );
};
