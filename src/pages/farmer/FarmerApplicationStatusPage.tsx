import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  Search,
  FileText,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  Compass,
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
  HelpCircle,
  UploadCloud,
  Send,
  ExternalLink,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { registrationService } from '@/services/registration.service';
import { RegistrationApplication, Property, RegistrationStatus, NotificationJob } from '@/types';

export const FarmerApplicationStatusPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const refParam = searchParams.get('ref') || '';
  const phoneParam = searchParams.get('phone') || '';

  const [applicationRef, setApplicationRef] = useState(refParam);
  const [mobileNumber, setMobileNumber] = useState(phoneParam);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Result state
  const [lookupResult, setLookupResult] = useState<{
    application: RegistrationApplication;
    property: Property | null;
    status: RegistrationStatus;
    rejectionReason: string | null;
    additionalInfoRequest: string | null;
    username?: string;
    activationToken?: string;
    smsJob?: NotificationJob | null;
  } | null>(null);

  // Additional Information Resubmission State
  const [additionalResponse, setAdditionalResponse] = useState('');
  const [supplementalDoc, setSupplementalDoc] = useState('Certified_TILR_Boundary_Map_2026.pdf');
  const [isResubmitting, setIsResubmitting] = useState(false);
  const [resubmitSuccess, setResubmitSuccess] = useState(false);

  useEffect(() => {
    if (refParam && phoneParam) {
      handleLookup(refParam, phoneParam);
    }
  }, [refParam, phoneParam]);

  const handleLookup = async (ref: string, phone: string) => {
    if (!ref.trim() || !phone.trim()) {
      setSearchError('Please provide both Application Reference and Registered Mobile Number.');
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setResubmitSuccess(false);

    try {
      const res = await registrationService.lookupApplicationStatus(ref, phone);
      setLookupResult(res);
    } catch (err: any) {
      setLookupResult(null);
      setSearchError(err.message || 'Unable to find application. Please verify details.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLookup(applicationRef, mobileNumber);
  };

  const handleResubmitAdditionalInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupResult) return;
    if (!additionalResponse.trim()) {
      alert('Please enter your response to the Tahsildar inquiry.');
      return;
    }

    setIsResubmitting(true);
    try {
      await registrationService.respondAndResubmit({
        appId: lookupResult.application.id,
        responseNotes: additionalResponse,
        additionalDocuments: supplementalDoc || undefined,
      });
      setIsResubmitting(false);
      setResubmitSuccess(true);
      // Refresh lookup
      handleLookup(applicationRef, mobileNumber);
    } catch (err: any) {
      setIsResubmitting(false);
      alert(err.message || 'Failed to submit additional information.');
    }
  };

  const getStatusIcon = (status: RegistrationStatus) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle2 className="w-6 h-6 text-emerald-600" />;
      case 'REJECTED':
        return <XCircle className="w-6 h-6 text-rose-600" />;
      case 'ADDITIONAL_INFORMATION_REQUIRED':
        return <AlertCircle className="w-6 h-6 text-cyan-600" />;
      case 'UNDER_REVIEW':
        return <Clock className="w-6 h-6 text-amber-600" />;
      default:
        return <Clock className="w-6 h-6 text-blue-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white shadow-xs">
              <Compass className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm text-slate-900 tracking-tight">
                AGRI<span className="text-emerald-600">SURVEY</span>
              </span>
              <span className="text-[10px] text-slate-500 font-medium">Maharashtra Land Intelligence</span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link to="/auth/login">
              <Button variant="outline" size="sm">
                Farmer Login
              </Button>
            </Link>
            <Link to="/farmer/register">
              <Button size="sm">New Registration</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full space-y-8">
        {/* Banner */}
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Official Revenue Status Tracker</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Check Registration Status
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Track your 7/12 land registration application through Tahsildar review, account activation, and credential delivery.
          </p>
        </div>

        {/* 2-Factor Search Card */}
        <Card className="p-6 sm:p-8 bg-white border border-slate-200 shadow-xs">
          <form onSubmit={handleSearchSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Application Reference Number *
                </label>
                <input
                  type="text"
                  required
                  value={applicationRef}
                  onChange={(e) => setApplicationRef(e.target.value)}
                  placeholder="e.g. AGRI-APP-2026-849102"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Registered Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="10-digit registered mobile number"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>
            </div>

            {searchError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{searchError}</span>
              </div>
            )}

            <Button
              type="submit"
              size="md"
              className="w-full sm:w-auto"
              disabled={isSearching}
              icon={<Search className="w-4 h-4" />}
            >
              {isSearching ? 'Searching Revenue Records...' : 'Check Status'}
            </Button>
          </form>
        </Card>

        {/* Results Card */}
        {lookupResult && (
          <Card className="p-6 sm:p-8 bg-white border border-slate-200 shadow-sm space-y-6">
            {/* Header Details */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                    {lookupResult.application.application_reference}
                  </span>
                  <Badge status={lookupResult.status} />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  {lookupResult.property?.property_name || 'Primary Land Parcel'}
                </h3>
                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    Survey No. {lookupResult.property?.survey_number}, {lookupResult.property?.village},{' '}
                    Taluk {lookupResult.property?.taluk}, {lookupResult.property?.district}
                  </span>
                </p>
              </div>

              <div className="text-right text-xs text-slate-500 space-y-0.5">
                <div>
                  Submitted:{' '}
                  <span className="font-semibold text-slate-800">
                    {new Date(lookupResult.application.submitted_at || lookupResult.application.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  Last Updated:{' '}
                  <span className="font-semibold text-slate-800">
                    {new Date(lookupResult.application.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Status-Specific Action Banners */}
            {lookupResult.status === 'APPROVED' ? (
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-extrabold text-emerald-950">
                      Application Approved by Tahsildar!
                    </h4>
                    <p className="text-xs text-emerald-800 leading-relaxed">
                      Your 7/12 land registration has been officially approved. An SMS notification has been dispatched to your mobile number with your activation link.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-emerald-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Official Username</span>
                    <span className="font-mono font-bold text-emerald-900 text-sm">
                      {lookupResult.username || 'Issued upon verification'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">SMS Dispatch Status</span>
                    <span className="font-semibold text-slate-800 flex items-center gap-1">
                      <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                      {lookupResult.smsJob?.delivery_status || 'Delivered via MSG91 Gateway'}
                    </span>
                  </div>
                </div>

                {lookupResult.activationToken ? (
                  <div className="pt-1">
                    <Link to={`/auth/activate?token=${lookupResult.activationToken}`}>
                      <Button size="md" icon={<ArrowRight className="w-4 h-4" />}>
                        Activate Account & Set Password
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="pt-1">
                    <Link to="/auth/login">
                      <Button size="md" icon={<ArrowRight className="w-4 h-4" />}>
                        Proceed to Farmer Login
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            ) : lookupResult.status === 'ADDITIONAL_INFORMATION_REQUIRED' ? (
              <div className="p-5 rounded-2xl bg-cyan-50 border border-cyan-200 space-y-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-cyan-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-extrabold text-cyan-950">
                      Action Required: Additional Information Requested
                    </h4>
                    <p className="text-xs text-cyan-800 leading-relaxed">
                      Tahsildar Remark:{' '}
                      <span className="font-semibold text-slate-900">
                        "{lookupResult.additionalInfoRequest || 'Please upload certified boundary sketch from TILR.'}"
                      </span>
                    </p>
                  </div>
                </div>

                {resubmitSuccess ? (
                  <div className="p-3 bg-emerald-100 text-emerald-900 rounded-xl text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>Your response has been submitted! Application returned to Tahsildar queue.</span>
                  </div>
                ) : (
                  <form onSubmit={handleResubmitAdditionalInfo} className="space-y-3 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Your Clarification / Response Notes
                      </label>
                      <textarea
                        rows={2}
                        required
                        value={additionalResponse}
                        onChange={(e) => setAdditionalResponse(e.target.value)}
                        placeholder="Explain the boundary markers or updated survey information..."
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-cyan-500 bg-white"
                      />
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <UploadCloud className="w-4 h-4 text-slate-400" />
                        <span className="font-mono text-slate-700">{supplementalDoc}</span>
                      </div>
                      <span className="text-[10px] text-emerald-600 font-bold">Attached</span>
                    </div>

                    <Button
                      type="submit"
                      size="sm"
                      disabled={isResubmitting}
                      icon={<Send className="w-3.5 h-3.5" />}
                    >
                      {isResubmitting ? 'Submitting Clarification...' : 'Submit Response & Documents'}
                    </Button>
                  </form>
                )}
              </div>
            ) : lookupResult.status === 'REJECTED' ? (
              <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 space-y-3">
                <div className="flex items-start gap-3">
                  <XCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-extrabold text-rose-950">Application Rejected</h4>
                    <p className="text-xs text-rose-800 leading-relaxed">
                      Reason: <span className="font-semibold">{lookupResult.rejectionReason}</span>
                    </p>
                  </div>
                </div>
                <div className="text-xs text-slate-600">
                  If this was rejected due to incorrect documentation, you may register again with updated 7/12 records.
                </div>
                <Link to="/farmer/register">
                  <Button variant="outline" size="sm">
                    Submit New Registration
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                <div className="flex items-start gap-3">
                  <Clock className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-extrabold text-amber-950">
                      Application Awaiting Tahsildar Verification
                    </h4>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      Your application has been received and assigned to the Tehsil Revenue Office for Haveli Taluk.
                      Once the officer verifies your 7/12 extract and survey boundaries, your official login credentials
                      will be sent via MSG91 SMS.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Land & Survey Summary Table */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Submitted Application Summary
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">SURVEY / GAT NO.</span>
                  <span className="font-bold text-slate-800">{lookupResult.property?.survey_number}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">SUBDIVISION NO.</span>
                  <span className="font-bold text-slate-800">{lookupResult.property?.subdivision_number || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">DECLARED AREA</span>
                  <span className="font-bold text-slate-800">
                    {lookupResult.property?.land_area} {lookupResult.property?.land_area_unit}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">7/12 EXTRACT REF</span>
                  <span className="font-mono font-semibold text-slate-800 truncate block">
                    {lookupResult.property?.land_document_reference}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        AgriSurvey • Government of Maharashtra Land Revenue & Agricultural Verification Platform
      </footer>
    </div>
  );
};
