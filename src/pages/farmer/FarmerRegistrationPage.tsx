import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  User,
  MapPin,
  UploadCloud,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Lock,
  Layers,
  Sparkles,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PropertyMap } from '@/components/maps/PropertyMap';
import { SUPPORTED_LANGUAGES } from '@/types/language';
import {
  MAHARASHTRA_DISTRICTS,
  PUNE_TALUKS,
  PUNE_SAMPLE_VILLAGES,
  LAND_AREA_UNITS,
  LAND_TYPES,
  FARM_TYPES,
  OWNERSHIP_CATEGORIES,
} from '@/lib/constants';
import { registrationService } from '@/services/registration.service';
import { mockDb } from '@/services/mock-db';

export const FarmerRegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedApp, setSubmittedApp] = useState<{
    application_reference: string;
    property_reference: string;
  } | null>(null);

  // Form State
  const [personalInfo, setPersonalInfo] = useState({
    fullName: mockDb.currentUser.full_name || 'Ramesh Balasaheb Patil',
    mobileNumber: mockDb.currentUser.phone_number || '9822012345',
    email: mockDb.currentUser.email || 'farmer.ramesh@agrisurvey.gov.in',
    preferredLanguage: 'en',
  });

  const [identityInfo, setIdentityInfo] = useState({
    identityMethod: 'VOTER_ID',
    identityDocumentNumber: 'MH/2024/098124',
    address: 'Gat No. 142, Pune-Nagar Road, Wagholi Rural',
    village: 'Wagholi',
    taluk: 'Haveli',
    district: 'Pune',
    state: 'Maharashtra',
    postalCode: '412207',
  });

  const [propertyInfo, setPropertyInfo] = useState({
    propertyName: 'Patil Agro Sugarcane Field',
    landDocumentNumber: 'MH-PUN-7-12-2026-99214',
    surveyNumber: '142/2A',
    subdivisionNumber: '2A',
    landArea: 3.5,
    landAreaUnit: 'Acres' as const,
    landType: 'Agricultural Land',
    farmType: 'Crop Farming',
    ownershipCategory: 'Individual Ownership',
    village: 'Wagholi',
    taluk: 'Haveli',
    district: 'Pune',
    state: 'Maharashtra',
    latitude: 18.5793,
    longitude: 73.9824,
  });

  const [consentGiven, setConsentGiven] = useState(false);
  const [uploadedDoc, setUploadedDoc] = useState<{ name: string; size: string } | null>({
    name: '7-12_Extract_Wagholi_142.pdf',
    size: '1.4 MB',
  });
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleNext = () => {
    setValidationError(null);

    if (currentStep === 1) {
      if (!personalInfo.fullName || personalInfo.fullName.length < 3) {
        setValidationError('Please enter a valid full name (minimum 3 characters)');
        return;
      }
      if (!/^[6-9]\d{9}$/.test(personalInfo.mobileNumber)) {
        setValidationError('Please enter a valid 10-digit Indian mobile number');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!identityInfo.identityDocumentNumber) {
        setValidationError('Please provide the identity document reference');
        return;
      }
      if (!identityInfo.address || !identityInfo.village) {
        setValidationError('Please complete the address and village fields');
        return;
      }
      if (!/^\d{6}$/.test(identityInfo.postalCode)) {
        setValidationError('Please enter a valid 6-digit postal PIN code');
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (!propertyInfo.surveyNumber) {
        setValidationError('Survey number / Gat number is required');
        return;
      }
      if (!propertyInfo.landDocumentNumber) {
        setValidationError('Land document / 7/12 extract reference is required');
        return;
      }
      if (!propertyInfo.landArea || propertyInfo.landArea <= 0) {
        setValidationError('Please enter a valid positive land area');
        return;
      }
      setCurrentStep(4);
    }
  };

  const handleSubmit = async () => {
    if (!consentGiven) {
      setValidationError('You must provide mandatory verification consent to proceed');
      return;
    }

    setValidationError(null);
    setIsSubmitting(true);

    try {
      const res = await registrationService.submitRegistration({
        farmerId: mockDb.currentUser.id,
        identity: identityInfo as any,
        property: propertyInfo as any,
      });

      setIsSubmitting(false);
      setSubmittedApp({
        application_reference: res.application.application_reference,
        property_reference: res.property.property_reference,
      });
    } catch (err: any) {
      setIsSubmitting(false);
      setValidationError(err.message || 'Submission failed. Please check form data.');
    }
  };

  const stepsHeader = [
    { num: 1, label: 'Personal Info' },
    { num: 2, label: 'Identity & Address' },
    { num: 3, label: 'Property Details' },
    { num: 4, label: 'Documents & Consent' },
  ];

  return (
    <DashboardLayout
      title="Land Registration Wizard"
      subtitle="Submit new agricultural property for official verification & Tahsildar approval"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Step Progress Bar */}
        {!submittedApp && (
          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-xs">
            <div className="grid grid-cols-4 gap-2">
              {stepsHeader.map((s) => (
                <div key={s.num} className="text-center">
                  <div
                    className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      currentStep === s.num
                        ? 'bg-agri-gradient text-white ring-4 ring-emerald-100 shadow-xs'
                        : currentStep > s.num
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {currentStep > s.num ? <CheckCircle2 className="w-4 h-4" /> : s.num}
                  </div>
                  <div
                    className={`text-[11px] font-medium mt-1.5 hidden sm:block ${
                      currentStep === s.num ? 'text-slate-900 font-bold' : 'text-slate-400'
                    }`}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
              <div
                className="bg-agri-gradient h-full transition-all duration-300"
                style={{ width: `${(currentStep / 4) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Validation Alert */}
        {validationError && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Submission Confirmation Screen */}
        {submittedApp ? (
          <Card className="text-center py-12 px-6 sm:px-12 space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-xs border border-emerald-200">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>

            <div className="max-w-md mx-auto space-y-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Application Submitted Successfully
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Your land registration application has been submitted successfully. It is awaiting verification by the responsible Tahsildar.
              </p>
            </div>

            {/* Reference Details Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-w-sm mx-auto text-left space-y-2 font-mono text-xs">
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500 font-sans">Application Reference:</span>
                <span className="font-bold text-slate-900">{submittedApp.application_reference}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500 font-sans">Property Reference:</span>
                <span className="font-bold text-slate-900">{submittedApp.property_reference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Initial Status:</span>
                <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  PENDING TAHSILDAR REVIEW
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Button onClick={() => navigate('/farmer/dashboard')}>
                Track in Dashboard
              </Button>
              <Button variant="outline" onClick={() => setSubmittedApp(null)}>
                Register Another Parcel
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="p-6 sm:p-8 space-y-6">
            {/* STEP 1: PERSONAL INFORMATION */}
            {currentStep === 1 && (
              <div className="space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <User className="w-5 h-5 text-emerald-600" />
                    <span>Step 1: Landholder Personal Information</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Enter the primary farmer details as recorded in government land records.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name of Farmer / Khatedar <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={personalInfo.fullName}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white"
                      placeholder="e.g., Ramesh Balasaheb Patil"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Mobile Number (For SMS Alerts) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={personalInfo.mobileNumber}
                      onChange={(e) =>
                        setPersonalInfo({ ...personalInfo, mobileNumber: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white"
                      placeholder="10 digit mobile number"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      value={personalInfo.email}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white"
                      placeholder="name@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Preferred Language
                    </label>
                    <select
                      value={personalInfo.preferredLanguage}
                      onChange={(e) =>
                        setPersonalInfo({ ...personalInfo, preferredLanguage: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white"
                    >
                      {SUPPORTED_LANGUAGES.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.nativeName} ({lang.name} - {lang.region})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: IDENTITY AND ADDRESS */}
            {currentStep === 2 && (
              <div className="space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <span>Step 2: Identity & Residential Address</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Authorized identity document and permanent domicile.
                  </p>
                </div>

                {/* Aadhaar Privacy Shield Notice (Section 7 Requirement) */}
                <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
                  <Lock className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Identity & Aadhaar Privacy Notice:</span> In strict accordance with
                    data security regulations, AgriSurvey uses non-Aadhaar document references or masked identifiers.
                    Full Aadhaar numbers are never stored in plain text or public file metadata.
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Identity Document Type <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={identityInfo.identityMethod}
                      onChange={(e) =>
                        setIdentityInfo({ ...identityInfo, identityMethod: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white"
                    >
                      <option value="VOTER_ID">Voter ID Card (EPIC)</option>
                      <option value="PAN_CARD">Permanent Account Number (PAN)</option>
                      <option value="KISAN_CREDIT_PASSBOOK">Kisan Credit Card / Passbook</option>
                      <option value="RATION_CARD">Agricultural Ration Card</option>
                      <option value="GOVT_PHOTO_ID">State Government Photo Identity</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Document Identification Reference <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={identityInfo.identityDocumentNumber}
                      onChange={(e) =>
                        setIdentityInfo({
                          ...identityInfo,
                          identityDocumentNumber: e.target.value,
                        })
                      }
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white font-mono"
                      placeholder="e.g., MH/2024/098124"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Residential Street Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={identityInfo.address}
                      onChange={(e) =>
                        setIdentityInfo({ ...identityInfo, address: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white"
                      placeholder="House / Plot / Street details"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Village / Gaon <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={identityInfo.village}
                      onChange={(e) =>
                        setIdentityInfo({ ...identityInfo, village: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white"
                      placeholder="Village name"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Taluk / Tehsil <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={identityInfo.taluk}
                      onChange={(e) =>
                        setIdentityInfo({ ...identityInfo, taluk: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white"
                    >
                      {PUNE_TALUKS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      District <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={identityInfo.district}
                      onChange={(e) =>
                        setIdentityInfo({ ...identityInfo, district: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white"
                    >
                      {MAHARASHTRA_DISTRICTS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Postal PIN Code <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={identityInfo.postalCode}
                      onChange={(e) =>
                        setIdentityInfo({ ...identityInfo, postalCode: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white font-mono"
                      placeholder="6 digit PIN code"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: PROPERTY DETAILS */}
            {currentStep === 3 && (
              <div className="space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-emerald-600" />
                    <span>Step 3: Agricultural Land Property Details</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Land revenue extract (7/12) records, survey number, acreage, and farm type.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Property / Farm Designation (Optional)
                    </label>
                    <input
                      type="text"
                      value={propertyInfo.propertyName}
                      onChange={(e) =>
                        setPropertyInfo({ ...propertyInfo, propertyName: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white"
                      placeholder="e.g., Patil Agro Sugarcane Field"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Land Document / 7/12 Extract No. <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={propertyInfo.landDocumentNumber}
                      onChange={(e) =>
                        setPropertyInfo({ ...propertyInfo, landDocumentNumber: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white font-mono"
                      placeholder="e.g., MH-PUN-7-12-884920"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Survey / Gat Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={propertyInfo.surveyNumber}
                      onChange={(e) =>
                        setPropertyInfo({ ...propertyInfo, surveyNumber: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white font-mono"
                      placeholder="e.g., 142/2A"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Subdivision Number (Hissa)
                    </label>
                    <input
                      type="text"
                      value={propertyInfo.subdivisionNumber}
                      onChange={(e) =>
                        setPropertyInfo({ ...propertyInfo, subdivisionNumber: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white"
                      placeholder="e.g., 2A or 1"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Total Land Area <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        required
                        value={propertyInfo.landArea}
                        onChange={(e) =>
                          setPropertyInfo({
                            ...propertyInfo,
                            landArea: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white font-mono"
                      />
                      <select
                        value={propertyInfo.landAreaUnit}
                        onChange={(e) =>
                          setPropertyInfo({
                            ...propertyInfo,
                            landAreaUnit: e.target.value as any,
                          })
                        }
                        className="px-2 py-2.5 text-sm rounded-lg border border-slate-300 bg-slate-50 shrink-0 font-medium"
                      >
                        {LAND_AREA_UNITS.map((u) => (
                          <option key={u} value={u}>
                            {u}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Land Type Classification <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={propertyInfo.landType}
                      onChange={(e) =>
                        setPropertyInfo({ ...propertyInfo, landType: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white"
                    >
                      {LAND_TYPES.map((lt) => (
                        <option key={lt} value={lt}>
                          {lt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Farm Type <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={propertyInfo.farmType}
                      onChange={(e) =>
                        setPropertyInfo({ ...propertyInfo, farmType: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white"
                    >
                      {FARM_TYPES.map((ft) => (
                        <option key={ft} value={ft}>
                          {ft}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Ownership Category <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={propertyInfo.ownershipCategory}
                      onChange={(e) =>
                        setPropertyInfo({ ...propertyInfo, ownershipCategory: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white"
                    >
                      {OWNERSHIP_CATEGORIES.map((oc) => (
                        <option key={oc} value={oc}>
                          {oc}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Location Map Preview */}
                <div className="pt-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Approximate Location Preview & GPS Pin
                  </label>
                  <PropertyMap
                    latitude={propertyInfo.latitude}
                    longitude={propertyInfo.longitude}
                    propertyName={propertyInfo.propertyName}
                    surveyNumber={propertyInfo.surveyNumber}
                    landArea={`${propertyInfo.landArea} ${propertyInfo.landAreaUnit}`}
                    height="240px"
                  />
                </div>
              </div>
            )}

            {/* STEP 4: DOCUMENTS AND CONSENT */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <UploadCloud className="w-5 h-5 text-emerald-600" />
                    <span>Step 4: Land Document Upload & Verification Consent</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Attach revenue document (7/12 extract) and confirm inspection consent.
                  </p>
                </div>

                {/* Document Upload Area */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Upload Official Land Document (7/12 Extract, Ferfar, or Title Deed)
                  </label>
                  <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-6 text-center bg-slate-50/50 hover:bg-emerald-50/20 transition-all cursor-pointer">
                    <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-700">
                      Click to upload or drag & drop document
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      PDF, JPG, or PNG up to 10MB
                    </p>
                  </div>

                  {uploadedDoc && (
                    <div className="mt-3 p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-emerald-600" />
                        <div>
                          <div className="font-semibold text-slate-800">{uploadedDoc.name}</div>
                          <div className="text-[10px] text-slate-400">{uploadedDoc.size} • Encrypted in Private Storage</div>
                        </div>
                      </div>
                      <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                        Attached
                      </span>
                    </div>
                  )}
                </div>

                {/* Review Summary Box */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs space-y-2">
                  <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1.5">
                    Application Review Summary
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-600">
                    <div><span className="text-slate-400">Farmer:</span> {personalInfo.fullName}</div>
                    <div><span className="text-slate-400">Mobile:</span> {personalInfo.mobileNumber}</div>
                    <div><span className="text-slate-400">Location:</span> {propertyInfo.village}, {propertyInfo.taluk}, {propertyInfo.district}</div>
                    <div><span className="text-slate-400">Survey No:</span> {propertyInfo.surveyNumber}</div>
                    <div><span className="text-slate-400">Area:</span> {propertyInfo.landArea} {propertyInfo.landAreaUnit}</div>
                    <div><span className="text-slate-400">Farm Type:</span> {propertyInfo.farmType}</div>
                  </div>
                </div>

                {/* Explicit Consent Box (Section 7 Requirement) */}
                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consentGiven}
                      onChange={(e) => setConsentGiven(e.target.checked)}
                      className="mt-0.5 rounded border-amber-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                    />
                    <span className="leading-relaxed">
                      I hereby give explicit consent for the processing of my agricultural property details and agree to upload 5–6 ground photographs for official field inspection and drone photogrammetry verification under the AgriSurvey platform. I understand this technical verification does not replace formal legal judicial title registration.
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              {currentStep > 1 ? (
                <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
                  <ArrowLeft className="w-4 h-4 mr-1.5" />
                  Previous Step
                </Button>
              ) : (
                <div />
              )}

              {currentStep < 4 ? (
                <Button onClick={handleNext}>
                  Next Step
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} isLoading={isSubmitting}>
                  Submit Application for Review
                </Button>
              )}
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};
