import React, { useState } from 'react';
import {
  Sprout,
  ShieldAlert,
  ShieldCheck,
  AlertCircle,
  MapPin,
  Calendar,
  Layers,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { plantIntelligenceService } from '@/services/plant-intelligence.service';
import { Property, RegistrationApplication } from '@/types';

interface CreateMonitoringUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: Property[];
  applications: RegistrationApplication[];
  onSuccess: () => void;
}

export const CreateMonitoringUnitModal: React.FC<CreateMonitoringUnitModalProps> = ({
  isOpen,
  onClose,
  properties,
  applications,
  onSuccess,
}) => {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(
    properties[0]?.id || ''
  );
  const [unitName, setUnitName] = useState('');
  const [unitType, setUnitType] = useState<'plot' | 'crop_zone' | 'plant_group' | 'individual_plant'>('plot');
  const [cropVariety, setCropVariety] = useState('Sugarcane (Co 86032)');
  const [zoneIdentifier, setZoneIdentifier] = useState('ZONE-1');
  const [areaCovered, setAreaCovered] = useState<number>(1.0);
  const [plantingDate, setPlantingDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check if selected property is officially verified/approved by Tahsildar
  const currentApp = applications.find((a) => a.property_id === selectedPropertyId);
  const isVerified = currentApp?.status === 'APPROVED';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!isVerified) {
      setErrorMessage(
        'Cannot activate plant monitoring on an unverified property. Official Tahsildar land verification is required first.'
      );
      return;
    }

    if (!unitName.trim()) {
      setErrorMessage('Please provide a descriptive monitoring unit name.');
      return;
    }

    setIsSubmitting(true);
    try {
      const prop = properties.find((p) => p.id === selectedPropertyId);

      await plantIntelligenceService.createMonitoringUnit({
        propertyId: selectedPropertyId,
        unitName,
        unitType,
        cropVariety,
        zoneIdentifier,
        areaCovered: Number(areaCovered),
        areaUnit: prop?.land_area_unit || 'Acres',
        plantingDate,
        latitude: prop?.latitude,
        longitude: prop?.longitude,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create monitoring unit.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Register Plant Monitoring Unit"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Verification Status Guard Notice */}
        {!isVerified ? (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-800">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Property Verification Required</span>
            </div>
            <p className="leading-relaxed">
              AgriSurvey policy requires agricultural properties to be officially reviewed and approved by the responsible Tahsildar before active plant health monitoring units and IoT sensors can be deployed.
            </p>
            <div className="text-[11px] font-mono text-amber-700 mt-1">
              Current Property Status: <strong>{currentApp?.status || 'PENDING'}</strong>
            </div>
          </div>
        ) : (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Land parcel verified by Tahsildar Office. Monitoring activation authorized.</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Property Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Associated Farmland / Property
          </label>
          <select
            value={selectedPropertyId}
            onChange={(e) => setSelectedPropertyId(e.target.value)}
            className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
          >
            {properties.map((p) => {
              const app = applications.find((a) => a.property_id === p.id);
              const isAppApproved = app?.status === 'APPROVED';
              return (
                <option key={p.id} value={p.id}>
                  {p.property_name || `Survey No. ${p.survey_number}`} ({p.village}, {p.taluk}) —{' '}
                  {isAppApproved ? '✓ Verified' : `⏳ ${app?.status || 'Pending'}`}
                </option>
              );
            })}
          </select>
        </div>

        {/* Unit Name & Type */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Unit / Plot Name
            </label>
            <input
              type="text"
              placeholder="e.g. Plot A - North Cane"
              value={unitName}
              onChange={(e) => setUnitName(e.target.value)}
              disabled={!isVerified}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 disabled:bg-slate-100"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Monitoring Unit Scope
            </label>
            <select
              value={unitType}
              onChange={(e) => setUnitType(e.target.value as any)}
              disabled={!isVerified}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white disabled:bg-slate-100"
            >
              <option value="plot">Cultivated Plot</option>
              <option value="crop_zone">Crop Irrigation Zone</option>
              <option value="plant_group">Plant Group / Row Block</option>
              <option value="individual_plant">Individual Sentinel Plant</option>
            </select>
          </div>
        </div>

        {/* Crop Variety & Zone ID */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Crop & Plant Variety
            </label>
            <select
              value={cropVariety}
              onChange={(e) => setCropVariety(e.target.value)}
              disabled={!isVerified}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white disabled:bg-slate-100"
            >
              <option value="Sugarcane (Co 86032)">Sugarcane (Co 86032)</option>
              <option value="Sugarcane (CoM 0265)">Sugarcane (CoM 0265)</option>
              <option value="Cotton (Bt RCH-2)">Cotton (Bt RCH-2)</option>
              <option value="Soybean (JS 335)">Soybean (JS 335)</option>
              <option value="Onion (Bhima Super)">Onion (Bhima Super)</option>
              <option value="Wheat (Lokwan / HD 2189)">Wheat (Lokwan / HD 2189)</option>
              <option value="Tomato (Abhinav F1)">Tomato (Abhinav F1)</option>
              <option value="Grapes (Thompson Seedless)">Grapes (Thompson Seedless)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Zone Identifier
            </label>
            <input
              type="text"
              placeholder="e.g. ZONE-NORTH-A1"
              value={zoneIdentifier}
              onChange={(e) => setZoneIdentifier(e.target.value)}
              disabled={!isVerified}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 disabled:bg-slate-100 uppercase"
              required
            />
          </div>
        </div>

        {/* Area & Planting Date */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Monitored Area
            </label>
            <input
              type="number"
              step="0.1"
              value={areaCovered}
              onChange={(e) => setAreaCovered(parseFloat(e.target.value) || 0.5)}
              disabled={!isVerified}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 disabled:bg-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Planting / Sowing Date
            </label>
            <input
              type="date"
              value={plantingDate}
              onChange={(e) => setPlantingDate(e.target.value)}
              disabled={!isVerified}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 disabled:bg-slate-100"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={!isVerified} isLoading={isSubmitting}>
            Activate Monitoring Unit
          </Button>
        </div>
      </form>
    </Modal>
  );
};
