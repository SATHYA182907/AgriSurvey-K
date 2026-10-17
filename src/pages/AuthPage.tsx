import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Compass,
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Info,
  MapPin,
  UploadCloud,
  FileText,
  AlertCircle,
  Clock,
  KeyRound,
  ExternalLink,
} from 'lucide-react';
import { authService } from '@/services/auth.service';
import { registrationService } from '@/services/registration.service';
import { Button } from '@/components/ui/Button';
import { PropertyMap } from '@/components/maps/PropertyMap';
import { ROLE_DEFAULT_ROUTES } from '@/lib/permissions';
import { UserRole } from '@/types';
import { mockDb } from '@/services/mock-db';
import { useLanguage } from '@/context/LanguageContext';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { SUPPORTED_LANGUAGES, LanguageCode } from '@/types/language';
import {
  MAHARASHTRA_DISTRICTS,
  PUNE_TALUKS,
  LAND_AREA_UNITS,
  LAND_TYPES,
  FARM_TYPES,
  OWNERSHIP_CATEGORIES,
} from '@/lib/constants';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language, setLanguage } = useLanguage();

  // Active Tab: Detect '/auth/register' vs '/auth/login'
  const isRegisterRoute = location.pathname.includes('/register');
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>(
    isRegisterRoute ? 'signup' : 'signin'
  );

  useEffect(() => {
    if (location.pathname.includes('/register')) {
      setActiveTab('signup');
    } else if (location.pathname.includes('/login')) {
      setActiveTab('signin');
    }
  }, [location.pathname]);

  // Sign In State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);
  const [pendingApprovalNotice, setPendingApprovalNotice] = useState<{
    appRef: string;
    message: string;
  } | null>(null);

  // Multi-step Land Registration Wizard State (Signup)
  const [wizardStep, setWizardStep] = useState(1);
  const [isSubmittingWizard, setIsSubmittingWizard] = useState(false);
  const [wizardValidationError, setWizardValidationError] = useState<string | null>(null);
  const [submittedApp, setSubmittedApp] = useState<{
    application_reference: string;
    property_reference: string;
    farmer_name: string;
    mobile_number: string;
    survey_number: string;
    taluk: string;
  } | null>(null);

  // Step 1: Personal Info
  const [personalInfo, setPersonalInfo] = useState({
    fullName: '',
    mobileNumber: '',
    email: '',
    preferredLanguage: language || 'en',
  });

  useEffect(() => {
    setPersonalInfo((prev) => ({ ...prev, preferredLanguage: language }));
  }, [language]);

  // Step 2: Identity & Address
  const [identityInfo, setIdentityInfo] = useState({
    identityMethod: 'VOTER_ID',
    identityDocumentNumber: '',
    address: '',
    village: 'Wagholi',
    taluk: 'Haveli',
    district: 'Pune',
    state: 'Maharashtra',
    postalCode: '412207',
  });

  // Step 3: Agricultural Property Details
  const [propertyInfo, setPropertyInfo] = useState({
    propertyName: '',
    landDocumentNumber: '',
    surveyNumber: '',
    subdivisionNumber: '',
    landArea: 2.5,
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

  // Step 4: Documents & Consent
  const [uploadedLandDoc, setUploadedLandDoc] = useState<{ name: string; size: string } | null>({
    name: '7-12_Extract_Land_Record.pdf',
    size: '1.4 MB',
  });
  const [uploadedIdDoc, setUploadedIdDoc] = useState<{ name: string; size: string } | null>({
    name: 'Identity_Proof_Document.pdf',
    size: '850 KB',
  });
  const [consentGiven, setConsentGiven] = useState(false);

  // ---------------------------------------------------------------------------
  // Sign In Handler
  // ---------------------------------------------------------------------------
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError(null);
    setPendingApprovalNotice(null);
    setIsSigningIn(true);

    try {
      const { user } = await authService.signIn(loginIdentifier, password);
      setIsSigningIn(false);
      navigate(ROLE_DEFAULT_ROUTES[user.role]);
    } catch (err: any) {
      setIsSigningIn(false);
      const msg = err.message || '';
      if (msg.startsWith('PENDING_APPROVAL:')) {
        const parts = msg.split(':');
        setPendingApprovalNotice({
          appRef: parts[1] || 'AGRI-APP',
          message: parts.slice(2).join(':'),
        });
      } else {
        setSignInError(msg || 'Invalid login details. Please check your username and password.');
      }
    }
  };

  // ---------------------------------------------------------------------------
  // Registration Wizard Step Navigation
  // ---------------------------------------------------------------------------
  const handleWizardNext = () => {
    setWizardValidationError(null);

    if (wizardStep === 1) {
      if (!personalInfo.fullName || personalInfo.fullName.trim().length < 3) {
        setWizardValidationError('Please enter your full legal name as per official revenue records (at least 3 characters).');
        return;
      }
      const cleanPhone = personalInfo.mobileNumber.replace(/\D/g, '');
      if (cleanPhone.length !== 10 || !/^[6-9]/.test(cleanPhone)) {
        setWizardValidationError('Please enter a valid 10-digit Indian mobile number (starting with 6, 7, 8, or 9) to receive SMS login credentials.');
        return;
      }
      setWizardStep(2);
    } else if (wizardStep === 2) {
      if (!identityInfo.identityDocumentNumber || identityInfo.identityDocumentNumber.trim().length < 4) {
        setWizardValidationError('Please enter your official identity document number / reference.');
        return;
      }
      if (!identityInfo.address || identityInfo.address.trim().length < 5) {
        setWizardValidationError('Please enter your complete residential street address.');
        return;
      }
      if (!identityInfo.village || identityInfo.village.trim().length < 2) {
        setWizardValidationError('Please enter your village / Gram Panchayat name.');
        return;
      }
      if (!/^\d{6}$/.test(identityInfo.postalCode)) {
        setWizardValidationError('Please enter a valid 6-digit postal PIN code.');
        return;
      }
      // Sync village/taluk/district to property if not set
      setPropertyInfo((prev) => ({
        ...prev,
        village: identityInfo.village,
        taluk: identityInfo.taluk,
        district: identityInfo.district,
      }));
      setWizardStep(3);
    } else if (wizardStep === 3) {
      if (!propertyInfo.landDocumentNumber || propertyInfo.landDocumentNumber.trim().length < 4) {
        setWizardValidationError('Official 7/12 land extract document number is mandatory.');
        return;
      }
      if (!propertyInfo.surveyNumber || propertyInfo.surveyNumber.trim().length < 1) {
        setWizardValidationError('Survey / Gat number is mandatory.');
        return;
      }
      if (!propertyInfo.landArea || propertyInfo.landArea <= 0) {
        setWizardValidationError('Please enter a valid agricultural land area greater than zero.');
        return;
      }
      setWizardStep(4);
    }
  };

  // ---------------------------------------------------------------------------
  // Wizard Submit: Dispatches to Tahsildar with PENDING_TAHSILDAR_REVIEW
  // ---------------------------------------------------------------------------
  const handleWizardSubmit = async () => {
    if (!consentGiven) {
      setWizardValidationError('You must accept the mandatory legal verification declaration to submit your application.');
      return;
    }

    setWizardValidationError(null);
    setIsSubmittingWizard(true);

    try {
      const res = await registrationService.registerFarmerWithLand({
        personal: personalInfo,
        identity: identityInfo as any,
        property: propertyInfo as any,
        documentNames: {
          landDoc: uploadedLandDoc?.name,
          identityDoc: uploadedIdDoc?.name,
        },
      });

      setIsSubmittingWizard(false);
      setSubmittedApp({
        application_reference: res.application.application_reference,
        property_reference: res.property.property_reference,
        farmer_name: personalInfo.fullName,
        mobile_number: personalInfo.mobileNumber,
        survey_number: propertyInfo.surveyNumber,
        taluk: propertyInfo.taluk,
      });
    } catch (err: any) {
      setIsSubmittingWizard(false);
      setWizardValidationError(err.message || 'Error submitting registration. Please verify your details.');
    }
  };

  // Quick switch for evaluation testing
  const handleQuickDemoLogin = (role: UserRole) => {
    const user = authService.switchRole(role);
    navigate(ROLE_DEFAULT_ROUTES[user.role]);
  };

  const stepsHeader = [
    { num: 1, label: t('auth.step1', '1. Personal Info') },
    { num: 2, label: t('auth.step2', '2. Identity & Address') },
    { num: 3, label: t('auth.step3', '3. Property Details') },
    { num: 4, label: t('auth.step4', '4. Review & Consent') },
  ];

  return (
    <div className="relative min-h-screen flex flex-col justify-center py-2.5 sm:py-6 px-3 sm:px-6 lg:px-8 overflow-x-hidden">
      {/* Top Header Bar with Back Button & Language Switcher */}
      <div className="w-full max-w-md sm:max-w-2xl mx-auto flex items-center justify-between z-20 mb-2 sm:mb-4 px-0.5 sm:px-0">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl bg-black/35 hover:bg-black/55 text-white/90 hover:text-white backdrop-blur-md border border-white/25 text-[11px] sm:text-xs font-semibold shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 group shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform text-emerald-400 shrink-0" />
          <span className="truncate max-w-[120px] sm:max-w-none">{t('auth.backToHome', 'Back to Home')}</span>
        </Link>

        <div className="shrink-0">
          <LanguageSwitcher variant="glass" size="sm" />
        </div>
      </div>

      {/* Background Video Layer with Subtle Vignette */}
      <div className="fixed inset-0 w-full h-full overflow-hidden -z-10 pointer-events-none select-none">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster="/videos/auth-bg-poster.jpg"
          className="w-full h-full object-cover object-center scale-105 transform will-change-transform"
        >
          <source src="/videos/auth-bg.mp4" type="video/mp4" />
        </video>
        {/* Subtle cinematic gradient overlay allowing the vibrant farm video to shine through */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/15 to-black/50 pointer-events-none" />
      </div>

      {/* Top Brand Link with Compact Frosted Glass Badge */}
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center mb-2 sm:mb-3.5 z-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 group px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl bg-black/30 backdrop-blur-md border border-white/25 hover:border-emerald-400/50 shadow-xl transition-all duration-300"
        >
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/30 group-hover:scale-105 transition-transform">
            <Compass className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <span className="text-base sm:text-xl font-bold tracking-tight text-white drop-shadow-md">
            Agri<span className="text-emerald-400">Survey</span>
          </span>
        </Link>
        <p className="text-[10px] sm:text-[11px] text-white/80 font-medium tracking-wide mt-1 drop-shadow-md hidden xs:block">
          {t('auth.gatewayTitle', 'Maharashtra Agricultural Land Administration & Verification Gateway')}
        </p>
      </div>

      {/* Main Transparent Glassmorphism Container */}
      <div
        className={`mx-auto w-full backdrop-blur-xl bg-slate-950/30 sm:bg-slate-900/30 rounded-2xl sm:rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.45)] border border-white/25 overflow-hidden transition-all duration-300 z-10 ${
          activeTab === 'signup' && !submittedApp
            ? 'max-w-[340px] xs:max-w-[370px] sm:max-w-xl md:max-w-2xl'
            : 'max-w-[325px] xs:max-w-[350px] sm:max-w-md'
        }`}
      >
        {/* Top Header Tabs with Transparent Glass Styling */}
        <div className="p-1 sm:p-1.5 border-b border-white/15 bg-black/25 backdrop-blur-md flex gap-1 sm:gap-1.5">
          <button
            onClick={() => {
              setActiveTab('signin');
              setSignInError(null);
              setPendingApprovalNotice(null);
            }}
            className={`flex-1 py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg sm:rounded-xl text-center text-[11px] sm:text-xs font-semibold transition-all flex items-center justify-center gap-1 sm:gap-1.5 min-w-0 ${
              activeTab === 'signin'
                ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 shadow-sm backdrop-blur-sm font-bold'
                : 'text-white/70 hover:text-white hover:bg-white/10 border border-transparent'
            }`}
          >
            <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate max-w-[110px] xs:max-w-none">{t('auth.signInTab', 'Sign In to Portal')}</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('signup');
              setSignInError(null);
              setPendingApprovalNotice(null);
            }}
            className={`flex-1 py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg sm:rounded-xl text-center text-[11px] sm:text-xs font-semibold transition-all flex items-center justify-center gap-1 sm:gap-1.5 min-w-0 ${
              activeTab === 'signup'
                ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 shadow-sm backdrop-blur-sm font-bold'
                : 'text-white/70 hover:text-white hover:bg-white/10 border border-transparent'
            }`}
          >
            <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate max-w-[110px] xs:max-w-none">{t('auth.signUpTab', 'Register Land')}</span>
          </button>
        </div>

        <div className="p-3 sm:p-5">
          {/* ================================================================= */}
          {/* TAB 1: SIGN IN                                                    */}
          {/* ================================================================= */}
          {activeTab === 'signin' && (
            <div className="space-y-2.5 sm:space-y-3.5">
              <div>
                <h2 className="text-sm sm:text-lg font-bold text-white tracking-tight drop-shadow-sm">
                  {t('auth.signInTitle', 'Farmer & Official Portal Sign In')}
                </h2>
                <p className="text-[10px] sm:text-[11px] text-slate-200/80 mt-0.5 leading-snug drop-shadow-xs hidden xs:block">
                  {t('auth.signInSubtitle', 'Enter your registered mobile or username, and the official password sent via SMS text message after Tahsildar approval.')}
                </p>
              </div>

              {/* Pending Approval Notice Banner */}
              {pendingApprovalNotice && (
                <div className="p-2.5 sm:p-3 rounded-xl bg-amber-950/50 border border-amber-500/40 text-amber-200 text-xs space-y-1.5 sm:space-y-2 backdrop-blur-md animate-fadeIn">
                  <div className="flex items-start gap-2">
                    <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-amber-100 block mb-0.5 text-[11px] sm:text-xs">
                        Application Pending Approval ({pendingApprovalNotice.appRef})
                      </span>
                      <p className="leading-relaxed text-[10.5px] sm:text-[11px] text-amber-200/90">
                        {pendingApprovalNotice.message}
                      </p>
                    </div>
                  </div>
                  <div className="pt-1.5 border-t border-amber-500/20 flex items-center justify-between">
                    <span className="text-[9.5px] text-amber-300/80">Evaluation mode?</span>
                    <button
                      type="button"
                      onClick={() => handleQuickDemoLogin('tahsildar')}
                      className="px-2 py-0.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[9.5px] shadow-xs flex items-center gap-1 transition-colors"
                    >
                      <span>Switch to Tahsildar</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}

              {/* Error Alert */}
              {signInError && (
                <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2 backdrop-blur-md">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                  <span className="text-[10.5px] sm:text-[11px]">{signInError}</span>
                </div>
              )}

              <form onSubmit={handleSignIn} className="space-y-2 sm:space-y-3">
                <div>
                  <label className="block text-[10.5px] sm:text-[11px] font-medium text-slate-100 mb-0.5 drop-shadow-xs">
                    {t('auth.mobileOrUser', 'Mobile Number, Username, or Email')} <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-emerald-400 absolute left-2.5 top-2 sm:top-2.5" />
                    <input
                      type="text"
                      required
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="e.g., 9848848484 or farmer.ramesh"
                      className="glass-input w-full pl-7.5 sm:pl-8 pr-3 py-1.5 sm:py-2 text-xs rounded-lg sm:rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-400 transition-all placeholder-white/50"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="block text-[10.5px] sm:text-[11px] font-medium text-slate-100 drop-shadow-xs">
                      {t('auth.password', 'Password (received via SMS)')} <span className="text-rose-400">*</span>
                    </label>
                  </div>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-emerald-400 absolute left-2.5 top-2 sm:top-2.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t('auth.passwordPlaceholder', 'Enter SMS password (e.g. Agri@8484)')}
                      className="glass-input w-full pl-7.5 sm:pl-8 pr-8 py-1.5 sm:py-2 text-xs rounded-lg sm:rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-400 font-mono transition-all placeholder-white/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-300 hover:text-white absolute right-2.5 top-2 sm:top-2.5"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" isLoading={isSigningIn} className="w-full py-1.5 sm:py-2 text-xs font-semibold rounded-lg sm:rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-black/40 border border-emerald-400/30">
                  {t('auth.signInButton', 'Sign In to AgriSurvey')}
                </Button>
              </form>

              <div className="text-center pt-0.5">
                <span className="text-[10px] sm:text-[11px] text-slate-300">{t('auth.newFarmer', 'New farmer?')} </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('signup')}
                  className="text-[10px] sm:text-[11px] font-semibold text-emerald-400 hover:underline"
                >
                  {t('auth.registerPrompt', 'Register your land to apply for portal access →')}
                </button>
              </div>

              {/* Instant Persona Switcher - Compact Transparent Glass */}
              <div className="mt-2 pt-2 border-t border-white/15 bg-black/20 backdrop-blur-md rounded-xl p-2 sm:p-2.5 border border-white/10">
                <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-emerald-300 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    <span>{t('auth.instantLogin', 'Demo Personas (Evaluation)')}</span>
                  </span>
                  <span className="text-[8.5px] text-white/50 font-normal hidden xs:inline">1-Click Auto-Fill</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('farmer')}
                    className="p-1.5 bg-white/10 hover:bg-white/20 border border-white/15 hover:border-emerald-400/40 rounded-lg text-left transition-all backdrop-blur-sm active:scale-95"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-[10.5px]">Farmer</span>
                      <span className="text-[8.5px] text-emerald-300 font-medium">Ramesh</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('tahsildar')}
                    className="p-1.5 bg-white/10 hover:bg-white/20 border border-white/15 hover:border-teal-400/40 rounded-lg text-left transition-all backdrop-blur-sm active:scale-95"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-[10.5px]">Tahsildar</span>
                      <span className="text-[8.5px] text-teal-300 font-medium">Anand</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('field_worker')}
                    className="p-1.5 bg-white/10 hover:bg-white/20 border border-white/15 hover:border-cyan-400/40 rounded-lg text-left transition-all backdrop-blur-sm active:scale-95"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-[10.5px]">Drone Pilot</span>
                      <span className="text-[8.5px] text-cyan-300 font-medium">Prakash</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('admin')}
                    className="p-1.5 bg-white/10 hover:bg-white/20 border border-white/15 hover:border-slate-300/40 rounded-lg text-left transition-all backdrop-blur-sm active:scale-95"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-[10.5px]">Admin</span>
                      <span className="text-[8.5px] text-slate-300 font-medium">Sundaram</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 2: REGISTER LAND & FARMER ACCOUNT (SIGN UP WIZARD)            */}
          {/* ================================================================= */}
          {activeTab === 'signup' && (
            <div className="space-y-4">
              {/* SUBMISSION CONFIRMATION SCREEN */}
              {submittedApp ? (
                <div className="text-center py-4 px-2 space-y-4 max-w-md mx-auto">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center mx-auto shadow-md border border-emerald-400/40">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  </div>

                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-950/60 text-amber-300 text-[10px] font-semibold border border-amber-500/40">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>Pending Tahsildar Review & Approval</span>
                    </span>
                    <h2 className="text-lg font-bold text-white">
                      Registration Application Submitted!
                    </h2>
                    <p className="text-xs text-slate-300 leading-normal">
                      Your agricultural land details have been successfully submitted for official verification.
                    </p>
                  </div>

                  {/* Reference Card */}
                  <div className="bg-slate-900/50 border border-white/10 rounded-xl p-3 text-left space-y-2 font-mono text-xs backdrop-blur-md">
                    <div className="flex justify-between border-b border-white/10 pb-1 text-[11px]">
                      <span className="text-slate-400 font-sans">Application Ref:</span>
                      <span className="font-bold text-white">{submittedApp.application_reference}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/10 pb-1 text-[11px]">
                      <span className="text-slate-400 font-sans">Landholder:</span>
                      <span className="font-bold text-white font-sans">{submittedApp.farmer_name}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/10 pb-1 text-[11px]">
                      <span className="text-slate-400 font-sans">Mobile for SMS:</span>
                      <span className="font-bold text-emerald-400">+91 {submittedApp.mobile_number}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/10 pb-1 text-[11px]">
                      <span className="text-slate-400 font-sans">Survey / Gat:</span>
                      <span className="font-bold text-white">{submittedApp.survey_number} ({submittedApp.taluk} Taluk)</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400 font-sans">Verification Status:</span>
                      <span className="font-bold text-amber-300 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/30">
                        Awaiting Approval
                      </span>
                    </div>
                  </div>

                  {/* SMS Credentials Dispatch Notice */}
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-left text-xs text-emerald-200 space-y-1.5 backdrop-blur-md">
                    <div className="font-bold text-emerald-300 flex items-center gap-1.5 text-xs">
                      <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Next Step: SMS Credentials Delivery</span>
                    </div>
                    <p className="leading-relaxed text-emerald-100/80 text-[10.5px]">
                      Your application has been routed to the Tahsildar revenue portal. Once the Tahsildar verifies your 7/12 extract and clicks <strong>Approve</strong>, your official <strong>Username</strong> and <strong>secure Password</strong> will be automatically dispatched to your mobile number (<strong>+91 {submittedApp.mobile_number}</strong>) as an SMS text message.
                    </p>
                  </div>

                  {/* Interactive Action Buttons */}
                  <div className="space-y-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleQuickDemoLogin('tahsildar')}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-semibold shadow-md shadow-emerald-950/40 hover:opacity-95 transition-all"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Switch to Tahsildar Portal to Review & Approve Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSubmittedApp(null);
                        setActiveTab('signin');
                        setLoginIdentifier(submittedApp.mobile_number);
                      }}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-white/20 text-slate-200 text-xs font-semibold hover:bg-white/10 transition-colors"
                    >
                      <span>Proceed to Sign In Page</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* MULTI-STEP WIZARD */
                <div className="space-y-4">
                  {/* Step Header Indicator - Compact Glass */}
                  <div className="bg-slate-900/50 backdrop-blur-md rounded-xl border border-white/10 p-2.5 shadow-xs">
                    <div className="grid grid-cols-4 gap-1.5">
                      {stepsHeader.map((s) => (
                        <div key={s.num} className="text-center">
                          <div
                            className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                              wizardStep === s.num
                                ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white ring-2 ring-emerald-400/40 shadow-xs'
                                : wizardStep > s.num
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-800 text-slate-400 border border-white/10'
                            }`}
                          >
                            {wizardStep > s.num ? '✓' : s.num}
                          </div>
                          <span
                            className={`text-[9.5px] mt-1 font-medium truncate hidden sm:block ${
                              wizardStep === s.num ? 'text-emerald-400 font-bold' : 'text-slate-400'
                            }`}
                          >
                            {s.label}
                          </span>
                        </div>
                      ))}
                    </div>
                    {/* Active Step Label for Small Mobile Devices */}
                    <p className="text-[10px] text-center text-emerald-300 font-semibold mt-1.5 sm:hidden">
                      {stepsHeader[wizardStep - 1]?.label}
                    </p>
                    {/* Progress Bar */}
                    <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full transition-all duration-300"
                        style={{ width: `${(wizardStep / 4) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Validation Error Alert */}
                  {wizardValidationError && (
                    <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2 backdrop-blur-md">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span className="text-[11px]">{wizardValidationError}</span>
                    </div>
                  )}

                  {/* STEP 1: PERSONAL INFORMATION */}
                  {wizardStep === 1 && (
                    <div className="space-y-3">
                      <div className="border-b border-white/10 pb-2">
                        <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                          <User className="w-4 h-4 text-emerald-400" />
                          <span>Step 1: Landholder Personal Information</span>
                        </h3>
                        <p className="text-[10.5px] text-slate-300 mt-0.5">
                          Enter primary farmer details as recorded in government land records.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-medium text-slate-100 mb-0.5">
                            Full Name of Farmer / Khatedar <span className="text-rose-400">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={personalInfo.fullName}
                            onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
                            className="glass-input w-full px-3 py-1.5 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-400 placeholder-white/50"
                            placeholder="e.g., Satyam Marathe or Ramesh Patil"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-slate-100 mb-0.5">
                            Mobile (For SMS Credentials) <span className="text-rose-400">*</span>
                          </label>
                          <input
                            type="tel"
                            required
                            maxLength={10}
                            value={personalInfo.mobileNumber}
                            onChange={(e) =>
                              setPersonalInfo({ ...personalInfo, mobileNumber: e.target.value.replace(/\D/g, '') })
                            }
                            className="glass-input w-full px-3 py-1.5 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-400 font-mono placeholder-white/50"
                            placeholder="10-digit mobile (e.g. 9848848484)"
                          />
                          <span className="text-[9.5px] text-emerald-400 mt-0.5 block">
                            Login credentials will be sent via SMS to this number.
                          </span>
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-slate-100 mb-0.5">
                            Email Address (Optional)
                          </label>
                          <input
                            type="email"
                            value={personalInfo.email}
                            onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                            className="glass-input w-full px-3 py-1.5 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-400 placeholder-white/50"
                            placeholder="farmer@example.com"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-medium text-slate-100 mb-0.5">
                            {t('auth.prefLanguage', 'Preferred Language')}
                          </label>
                          <select
                            value={personalInfo.preferredLanguage}
                            onChange={(e) => {
                              const newLang = e.target.value as LanguageCode;
                              setPersonalInfo({ ...personalInfo, preferredLanguage: newLang });
                              setLanguage(newLang);
                            }}
                            className="glass-input w-full px-3 py-1.5 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-400"
                          >
                            {SUPPORTED_LANGUAGES.map((lang) => (
                              <option key={lang.code} value={lang.code} className="bg-slate-900 text-white">
                                {lang.nativeName} ({lang.name} - {lang.region})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: IDENTITY AND ADDRESS */}
                  {wizardStep === 2 && (
                    <div className="space-y-3">
                      <div className="border-b border-white/10 pb-2">
                        <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          <span>Step 2: Identity & Residential Address</span>
                        </h3>
                        <p className="text-[10.5px] text-slate-300 mt-0.5">
                          Authorized identity document and permanent domicile.
                        </p>
                      </div>

                      <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-200 flex items-start gap-2 backdrop-blur-md">
                        <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">Identity Protection:</span> Data encrypted according to state governance guidelines.
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-medium text-slate-100 mb-0.5">
                            Identity Document Type <span className="text-rose-400">*</span>
                          </label>
                          <select
                            value={identityInfo.identityMethod}
                            onChange={(e) =>
                              setIdentityInfo({ ...identityInfo, identityMethod: e.target.value })
                            }
                            className="glass-input w-full px-3 py-1.5 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-400"
                          >
                            <option value="VOTER_ID" className="bg-slate-900 text-white">Voter ID Card (EPIC)</option>
                            <option value="PAN_CARD" className="bg-slate-900 text-white">Permanent Account Number (PAN)</option>
                            <option value="KISAN_CREDIT_PASSBOOK" className="bg-slate-900 text-white">Kisan Credit Card / Passbook</option>
                            <option value="RATION_CARD" className="bg-slate-900 text-white">Agricultural Ration Card</option>
                            <option value="GOVT_PHOTO_ID" className="bg-slate-900 text-white">State Government Photo ID</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-slate-100 mb-0.5">
                            Document Identification No. <span className="text-rose-400">*</span>
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
                            className="glass-input w-full px-3 py-1.5 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-400 font-mono placeholder-white/50"
                            placeholder="e.g., MH/2026/098124"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-medium text-slate-100 mb-0.5">
                            Residential Street Address <span className="text-rose-400">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={identityInfo.address}
                            onChange={(e) =>
                              setIdentityInfo({ ...identityInfo, address: e.target.value })
                            }
                            className="glass-input w-full px-3 py-1.5 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-400 placeholder-white/50"
                            placeholder="House / Plot / Village Gat location"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-slate-100 mb-0.5">
                            Village / Gaon <span className="text-rose-400">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={identityInfo.village}
                            onChange={(e) =>
                              setIdentityInfo({ ...identityInfo, village: e.target.value })
                            }
                            className="glass-input w-full px-3 py-1.5 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-400 placeholder-white/50"
                            placeholder="e.g. Wagholi, Loni Kalbhor"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-slate-100 mb-0.5">
                            Taluk / Tehsil <span className="text-rose-400">*</span>
                          </label>
                          <select
                            value={identityInfo.taluk}
                            onChange={(e) =>
                              setIdentityInfo({ ...identityInfo, taluk: e.target.value })
                            }
                            className="glass-input w-full px-3 py-1.5 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-400"
                          >
                            {PUNE_TALUKS.map((t) => (
                              <option key={t} value={t} className="bg-slate-900 text-white">
                                {t}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-slate-100 mb-0.5">
                            District <span className="text-rose-400">*</span>
                          </label>
                          <select
                            value={identityInfo.district}
                            onChange={(e) =>
                              setIdentityInfo({ ...identityInfo, district: e.target.value })
                            }
                            className="glass-input w-full px-3 py-1.5 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-400"
                          >
                            {MAHARASHTRA_DISTRICTS.map((d) => (
                              <option key={d} value={d} className="bg-slate-900 text-white">
                                {d}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-slate-100 mb-0.5">
                            Postal PIN Code <span className="text-rose-400">*</span>
                          </label>
                          <input
                            type="text"
                            maxLength={6}
                            required
                            value={identityInfo.postalCode}
                            onChange={(e) =>
                              setIdentityInfo({ ...identityInfo, postalCode: e.target.value.replace(/\D/g, '') })
                            }
                            className="glass-input w-full px-3 py-1.5 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-400 font-mono placeholder-white/50"
                            placeholder="6-digit PIN (e.g. 412207)"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: AGRICULTURAL PROPERTY DETAILS */}
                  {wizardStep === 3 && (
                    <div className="space-y-3">
                      <div className="border-b border-white/10 pb-2">
                        <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-emerald-400" />
                          <span>Step 3: Agricultural Land Property Details</span>
                        </h3>
                        <p className="text-[10.5px] text-slate-300 mt-0.5">
                          Land revenue extract (7/12) records, survey number, acreage, and farm type.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-medium text-slate-100 mb-0.5">
                            Property / Farm Designation (Optional)
                          </label>
                          <input
                            type="text"
                            value={propertyInfo.propertyName}
                            onChange={(e) =>
                              setPropertyInfo({ ...propertyInfo, propertyName: e.target.value })
                            }
                            className="glass-input w-full px-3 py-1.5 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-400 placeholder-white/50"
                            placeholder="e.g., Marathe Sugarcane Field"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-slate-100 mb-0.5">
                            7/12 Extract Doc No. <span className="text-rose-400">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={propertyInfo.landDocumentNumber}
                            onChange={(e) =>
                              setPropertyInfo({ ...propertyInfo, landDocumentNumber: e.target.value })
                            }
                            className="glass-input w-full px-3 py-1.5 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-400 font-mono placeholder-white/50"
                            placeholder="e.g., MH-PUN-7-12-99214"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-slate-100 mb-0.5">
                            Survey / Gat Number <span className="text-rose-400">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={propertyInfo.surveyNumber}
                            onChange={(e) =>
                              setPropertyInfo({ ...propertyInfo, surveyNumber: e.target.value })
                            }
                            className="glass-input w-full px-3 py-1.5 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-400 font-mono placeholder-white/50"
                            placeholder="e.g., 142/2A or 88"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-slate-100 mb-0.5">
                            Subdivision Number (Hissa)
                          </label>
                          <input
                            type="text"
                            value={propertyInfo.subdivisionNumber}
                            onChange={(e) =>
                              setPropertyInfo({ ...propertyInfo, subdivisionNumber: e.target.value })
                            }
                            className="glass-input w-full px-3 py-1.5 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-400 placeholder-white/50"
                            placeholder="e.g., 2A or 1"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-slate-100 mb-0.5">
                            Total Land Area <span className="text-rose-400">*</span>
                          </label>
                          <div className="flex gap-1.5">
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
                              className="glass-input w-full px-3 py-1.5 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-400 font-mono"
                            />
                            <select
                              value={propertyInfo.landAreaUnit}
                              onChange={(e) =>
                                setPropertyInfo({
                                  ...propertyInfo,
                                  landAreaUnit: e.target.value as any,
                                })
                              }
                              className="glass-input px-2 py-1.5 text-[11px] rounded-xl shrink-0 font-medium"
                            >
                              {LAND_AREA_UNITS.map((u) => (
                                <option key={u} value={u} className="bg-slate-900 text-white">
                                  {u}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-slate-100 mb-0.5">
                            Land Type <span className="text-rose-400">*</span>
                          </label>
                          <select
                            value={propertyInfo.landType}
                            onChange={(e) =>
                              setPropertyInfo({ ...propertyInfo, landType: e.target.value })
                            }
                            className="glass-input w-full px-3 py-1.5 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-400"
                          >
                            {LAND_TYPES.map((lt) => (
                              <option key={lt} value={lt} className="bg-slate-900 text-white">
                                {lt}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-slate-100 mb-0.5">
                            Farm Type <span className="text-rose-400">*</span>
                          </label>
                          <select
                            value={propertyInfo.farmType}
                            onChange={(e) =>
                              setPropertyInfo({ ...propertyInfo, farmType: e.target.value })
                            }
                            className="glass-input w-full px-3 py-1.5 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-400"
                          >
                            {FARM_TYPES.map((ft) => (
                              <option key={ft} value={ft} className="bg-slate-900 text-white">
                                {ft}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-slate-100 mb-0.5">
                            Ownership Category <span className="text-rose-400">*</span>
                          </label>
                          <select
                            value={propertyInfo.ownershipCategory}
                            onChange={(e) =>
                              setPropertyInfo({ ...propertyInfo, ownershipCategory: e.target.value })
                            }
                            className="glass-input w-full px-3 py-1.5 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-400"
                          >
                            {OWNERSHIP_CATEGORIES.map((oc) => (
                              <option key={oc} value={oc} className="bg-slate-900 text-white">
                                {oc}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Map Preview */}
                      <div className="pt-1">
                        <label className="block text-[11px] font-medium text-slate-200 mb-1">
                          Approximate Geospatial Boundary & GPS Demarcation
                        </label>
                        <PropertyMap
                          latitude={propertyInfo.latitude}
                          longitude={propertyInfo.longitude}
                          propertyName={propertyInfo.propertyName || `Survey ${propertyInfo.surveyNumber}`}
                          surveyNumber={propertyInfo.surveyNumber}
                          landArea={`${propertyInfo.landArea} ${propertyInfo.landAreaUnit}`}
                          height="170px"
                        />
                      </div>
                    </div>
                  )}

                  {/* STEP 4: DOCUMENTS AND CONSENT */}
                  {wizardStep === 4 && (
                    <div className="space-y-3">
                      <div className="border-b border-white/10 pb-2">
                        <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                          <UploadCloud className="w-4 h-4 text-emerald-400" />
                          <span>Step 4: Land Document Upload & Verification Consent</span>
                        </h3>
                        <p className="text-[10.5px] text-slate-300 mt-0.5">
                          Attach revenue document (7/12 extract) and confirm inspection consent.
                        </p>
                      </div>

                      {/* Upload Boxes */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div className="border-2 border-dashed border-white/20 rounded-xl p-3 text-center bg-slate-900/40 hover:bg-emerald-950/20 hover:border-emerald-400/50 transition-all cursor-pointer">
                          <UploadCloud className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                          <div className="text-xs font-semibold text-slate-100">
                            7/12 Extract Document
                          </div>
                          <div className="text-[9.5px] text-slate-400 mt-0.5">
                            PDF or Image (Max 10MB)
                          </div>
                          {uploadedLandDoc && (
                            <div className="mt-1.5 text-[9.5px] font-mono text-emerald-300 bg-emerald-950/60 p-1 rounded border border-emerald-500/40">
                              ✓ {uploadedLandDoc.name} ({uploadedLandDoc.size})
                            </div>
                          )}
                        </div>

                        <div className="border-2 border-dashed border-white/20 rounded-xl p-3 text-center bg-slate-900/40 hover:bg-emerald-950/20 hover:border-emerald-400/50 transition-all cursor-pointer">
                          <FileText className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                          <div className="text-xs font-semibold text-slate-100">
                            Identity Proof Document
                          </div>
                          <div className="text-[9.5px] text-slate-400 mt-0.5">
                            Voter ID / PAN / Passbook
                          </div>
                          {uploadedIdDoc && (
                            <div className="mt-1.5 text-[9.5px] font-mono text-emerald-300 bg-emerald-950/60 p-1 rounded border border-emerald-500/40">
                              ✓ {uploadedIdDoc.name} ({uploadedIdDoc.size})
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Review Summary Box */}
                      <div className="bg-slate-900/50 rounded-xl p-3 border border-white/10 text-xs space-y-1.5 backdrop-blur-md">
                        <div className="font-bold text-slate-200 uppercase tracking-wider text-[10px] border-b border-white/10 pb-1 flex items-center justify-between">
                          <span>Application Summary</span>
                          <span className="text-emerald-400 font-mono text-[9.5px]">Tahsildar Jurisdiction: Pune / {propertyInfo.taluk}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5 text-slate-300 text-[11px]">
                          <div><span className="text-slate-400">Khatedar:</span> <strong className="text-white">{personalInfo.fullName}</strong></div>
                          <div><span className="text-slate-400">Mobile (For SMS):</span> <strong className="text-emerald-400">{personalInfo.mobileNumber}</strong></div>
                          <div><span className="text-slate-400">Survey / Gat:</span> <strong className="text-white">{propertyInfo.surveyNumber}</strong></div>
                          <div><span className="text-slate-400">7/12 Extract:</span> <strong className="text-white">{propertyInfo.landDocumentNumber}</strong></div>
                          <div><span className="text-slate-400">Area:</span> <strong className="text-white">{propertyInfo.landArea} {propertyInfo.landAreaUnit}</strong></div>
                          <div><span className="text-slate-400">Location:</span> <strong className="text-white">{propertyInfo.village}, {propertyInfo.taluk}</strong></div>
                        </div>
                      </div>

                      {/* Explicit Consent Declaration */}
                      <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-200 space-y-1 backdrop-blur-md">
                        <label className="flex items-start gap-2.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={consentGiven}
                            onChange={(e) => setConsentGiven(e.target.checked)}
                            className="mt-0.5 rounded border-amber-400/50 text-emerald-500 focus:ring-emerald-400 h-3.5 w-3.5 shrink-0 bg-slate-900"
                          />
                          <span className="leading-snug text-[10.5px] text-amber-200/90">
                            I declare that the land details, Gat/Survey numbers, and documents provided are authentic. I agree to undergo official Tahsildar verification and drone photogrammetry inspection, and to receive my official portal login Username and Password via SMS text message.
                          </span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Wizard Step Navigation Buttons */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/10">
                    {wizardStep > 1 ? (
                      <button
                        type="button"
                        onClick={() => setWizardStep(wizardStep - 1)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-white/20 text-slate-200 text-xs font-semibold hover:bg-white/10 transition-colors"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>{t('auth.prev', 'Previous')}</span>
                      </button>
                    ) : (
                      <div />
                    )}

                    {wizardStep < 4 ? (
                      <Button onClick={handleWizardNext} className="py-1.5 px-4 text-xs font-semibold rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md">
                        {t('auth.next', 'Next Step')}
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    ) : (
                      <Button onClick={handleWizardSubmit} isLoading={isSubmittingWizard} className="py-1.5 px-4 text-xs font-semibold rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md">
                        {t('auth.submit', 'Submit Land Registration')}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
