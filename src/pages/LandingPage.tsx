import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Compass,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Camera,
  Layers,
  Sprout,
  Bell,
  BarChart3,
  Search,
  Users,
  MapPin,
  ChevronDown,
  ChevronUp,
  FileCheck2,
  Building2,
  Eye,
  Sparkles,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { analyticsService, DashboardStats } from '@/services/analytics.service';
import { mockDb } from '@/services/mock-db';
import { useLanguage } from '@/context/LanguageContext';

export const LandingPage: React.FC = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    analyticsService.getDashboardStats().then(setStats);
  }, []);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const steps = [
    {
      num: '01',
      title: t('howItWorks.step1Title', 'Farmer Registration'),
      desc: t('howItWorks.step1Desc', 'Submit personal identity, land survey numbers, 7/12 extract reference, and property boundaries through a guided digital form.'),
      icon: FileText,
      color: 'from-emerald-600 to-teal-700',
    },
    {
      num: '02',
      title: t('howItWorks.step2Title', 'Tahsildar Review'),
      desc: t('howItWorks.step2Desc', 'Authorized revenue officers examine land records within their jurisdiction, approving applications or requesting additional survey clarification.'),
      icon: Building2,
      color: 'from-teal-600 to-cyan-700',
    },
    {
      num: '03',
      title: t('howItWorks.step3Title', 'Drone-Based Inspection'),
      desc: t('howItWorks.step3Desc', 'Approved landholders upload ground photos; certified field workers execute RTK drone photogrammetry to record high-resolution aerial evidence.'),
      icon: Camera,
      color: 'from-cyan-600 to-sky-700',
    },
    {
      num: '04',
      title: t('howItWorks.step4Title', 'Verification Report'),
      desc: t('howItWorks.step4Desc', 'Side-by-side image comparison and crop verification compile an official evidence report with downloadable certified PDF output.'),
      icon: FileCheck2,
      color: 'from-emerald-700 to-teal-800',
    },
  ];

  const features = [
    {
      icon: FileText,
      title: t('featuresSection.feat1Title', 'Digital Landholder Onboarding'),
      desc: t('featuresSection.feat1Desc', 'Streamlined multi-step property declarations with Aadhaar-compliant privacy and automated taluk jurisdiction routing.'),
    },
    {
      icon: Camera,
      title: t('featuresSection.feat2Title', 'Ground & Drone Evidence'),
      desc: t('featuresSection.feat2Desc', 'Secure private storage for 5-6 farmer ground photographs paired with certified drone orthomosaics and flight telemetry.'),
    },
    {
      icon: Eye,
      title: t('featuresSection.feat3Title', 'Image Comparison Workspace'),
      desc: t('featuresSection.feat3Desc', 'Dual-pane synchronized viewer with zoom, pan, and structured landmark checklists for revenue officers.'),
    },
    {
      icon: Sprout,
      title: t('featuresSection.feat4Title', 'Crop Identification System'),
      desc: t('featuresSection.feat4Desc', 'Cross-reference declared crops with observed stands, seasonality, irrigation modes, and modular AI vision analysis.'),
    },
    {
      icon: Bell,
      title: t('featuresSection.feat5Title', 'Event-Driven SMS Notifications'),
      desc: t('featuresSection.feat5Desc', 'Automated SMS updates at every milestone with idempotent delivery queues and transparent provider status logging.'),
    },
    {
      icon: BarChart3,
      title: t('featuresSection.feat6Title', 'Administrative Analytics'),
      desc: t('featuresSection.feat6Desc', 'Complete operational visibility for senior administrators with jurisdiction assignments, turnaround metrics, and audit trails.'),
    },
  ];

  const faqs = [
    {
      q: t('faqSection.q1', 'How can a farmer register agricultural land on AgriSurvey?'),
      a: t('faqSection.a1', 'Farmers can create a free account, complete the 4-step registration wizard by providing their contact details, land revenue document number (7/12 extract), survey number, acreage, and upload supporting ownership documentation.'),
    },
    {
      q: t('faqSection.q2', 'Why are 5 to 6 farmer ground photographs required?'),
      a: t('faqSection.a2', 'Once preliminary registration is approved by the Tahsildar, ground photos capture entrance points, boundaries, crop rows, and irrigation infrastructure to provide clear baseline evidence before drone flights.'),
    },
    {
      q: t('faqSection.q3', 'How does drone-based aerial inspection operate?'),
      a: t('faqSection.a3', 'An authorized field worker is assigned to the land parcel. The worker schedules a field visit, flies an RTK-enabled drone to capture high-resolution imagery at 45m AGL, and submits the aerial photography directly to the revenue officer.'),
    },
    {
      q: t('faqSection.q4', 'Does AgriSurvey verification certify legal land ownership?'),
      a: t('faqSection.a4', 'No. AgriSurvey is an evidence-backed technical verification platform that cross-references physical agricultural ground reality with drone imagery. It does not replace court judgments, title registries, or conveyancing deeds.'),
    },
    {
      q: t('faqSection.q5', 'How does the Tahsildar review and decide on applications?'),
      a: t('faqSection.a5', 'Tahsildars access an authorized portal filtered to their geographic jurisdiction. They can approve, reject (with mandatory reasons), request clarifications, compare images side-by-side, verify crops, and issue final reports.'),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-emerald-100 selection:text-emerald-900">
      <Navbar />

      {/* Hero Section with Full-Screen Background Video */}
      <section className="relative overflow-hidden bg-slate-900 text-white min-h-screen min-h-[100dvh] flex flex-col justify-between pt-20 sm:pt-24 pb-6 sm:pb-8">
        {/* Background Video Layer */}
        <div className="absolute inset-0 -bottom-1 w-full h-[calc(100%+4px)] overflow-hidden pointer-events-none">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="w-full h-full object-cover"
          >
            <source src="/videos/hero-bg.mp4" type="video/mp4" />
            <source src="/Untitled_Scene_10-14_10_02_11_20261014153619.mp4" type="video/mp4" />
          </video>
          {/* Soft, luminous natural overlay: farmland video remains bright and vivid while maintaining crisp typography */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/50" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 my-auto w-full py-6">
          <div className="max-w-4xl mx-auto text-center space-y-7">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6 sm:space-y-7"
            >
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/92 border border-slate-200/90 text-xs font-semibold text-emerald-800 backdrop-blur-md shadow-lg shadow-black/10">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{t('hero.badge', 'Maharashtra Revenue & Agriculture Modernization')}</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.12] drop-shadow-lg">
                {t('hero.titlePart1', 'Next-Gen Drone & Ground')} <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300 bg-clip-text text-transparent">{t('hero.titlePart2', 'Land Verification')}</span>
              </h1>

              {/* Supporting Text */}
              <p className="text-base sm:text-lg sm:leading-relaxed text-white/95 max-w-2xl mx-auto drop-shadow-md font-medium">
                {t('hero.subtitle', 'Connecting farmers and revenue officers with cutting-edge drone surveying, high-resolution imagery comparison, and crop verification.')}
              </p>

              {/* Call to Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                <Link to="/auth/register" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto shadow-xl shadow-emerald-950/40 border border-emerald-400/40" icon={<ArrowRight className="w-4 h-4" />}>
                    {t('hero.registerLand', 'Register Land Now')}
                  </Button>
                </Link>
                <Link to="/auth/login" className="w-full sm:w-auto">
                  <Button
                    variant="glass"
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    {t('hero.portalLogin', 'Portal Sign In')}
                  </Button>
                </Link>
              </div>

              {/* Trust-oriented supporting statement */}
              <div className="pt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-white/90 border-t border-white/20 max-w-xl mx-auto drop-shadow-sm">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  {t('hero.digitalRegistration', 'Digital Registration')}
                </span>
                <span className="text-white/40">•</span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  {t('hero.transparentReview', 'Transparent Review')}
                </span>
                <span className="text-white/40">•</span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  {t('hero.evidenceBased', 'Evidence-Based Verification')}
                </span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Hero Bottom Bar: Scroll Indicator */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex items-center justify-center pt-4">
          <a
            href="#operations"
            className="inline-flex flex-col items-center gap-1 text-white/80 hover:text-emerald-300 transition-colors text-xs font-medium group cursor-pointer drop-shadow-md"
          >
            <span className="tracking-wide uppercase text-[10px] font-semibold text-white/90 group-hover:text-emerald-300">
              {t('hero.explorePlatform', 'Explore Platform')}
            </span>
            <ChevronDown className="w-4 h-4 animate-bounce text-emerald-300" />
          </a>
        </div>
      </section>

      {/* Statistics Section (Section 5 Requirement) */}
      <section id="operations" className="scroll-mt-24 sm:scroll-mt-28 bg-slate-50 py-10 sm:py-12 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1">
              {t('operations.badge', 'Live Platform Operations')}
            </h2>
            <p className="text-xs text-slate-500">
              {t('operations.subtitle', 'Validated metrics retrieved directly from database records')} ({mockDb.staffRegions[0]?.district} {t('operations.district', 'District')})
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            <Card className="text-center py-6 hover:border-emerald-200 transition-colors">
              <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {stats?.totalFarmers ?? 2}
              </div>
              <div className="text-xs font-semibold text-slate-600 mt-1">{t('operations.registeredFarmers', 'Registered Farmers')}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{t('operations.activeVerified', 'Active verified accounts')}</div>
            </Card>

            <Card className="text-center py-6 hover:border-emerald-200 transition-colors">
              <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {stats?.totalProperties ?? 3}
              </div>
              <div className="text-xs font-semibold text-slate-600 mt-1">{t('operations.landApplications', 'Land Applications')}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{t('operations.submittedRevenue', 'Submitted for revenue review')}</div>
            </Card>

            <Card className="text-center py-6 hover:border-emerald-200 transition-colors">
              <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {stats?.completedVerifications ?? 1}
              </div>
              <div className="text-xs font-semibold text-slate-600 mt-1">{t('operations.verifiedProperties', 'Verified Properties')}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{t('operations.finalReportIssued', 'Final evidence report issued')}</div>
            </Card>

            <Card className="text-center py-6 hover:border-emerald-200 transition-colors">
              <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {stats?.pendingRegistrations ?? 2}
              </div>
              <div className="text-xs font-semibold text-slate-600 mt-1">{t('operations.pendingInspections', 'Pending Inspections')}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{t('operations.inQueue', 'In Tahsildar / drone queue')}</div>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works (Section 5 Requirement: 4 Connected Steps) */}
      <section id="how-it-works" className="scroll-mt-24 sm:scroll-mt-28 py-12 sm:py-16 lg:py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              {t('howItWorks.badge', 'End-To-End Architecture')}
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-3 tracking-tight">
              {t('howItWorks.title', 'How AgriSurvey Verifies Agricultural Land')}
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              {t('howItWorks.subtitle', 'A transparent, 4-stage verification workflow connecting landholders with revenue administration.')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {steps.map((s, idx) => {
              const Icon = s.icon;
              return (
                <div key={s.num} className="relative group">
                  <div className="h-full bg-slate-50/70 hover:bg-white rounded-2xl border border-slate-200 p-6 transition-all duration-300 hover:shadow-lg hover:border-emerald-200 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-2xl font-black text-slate-300 group-hover:text-emerald-700 transition-colors">
                          {s.num}
                        </span>
                        <div className="w-10 h-10 rounded-xl bg-agri-gradient text-white flex items-center justify-center shadow-xs">
                          <Icon className="w-5 h-5" />
                        </div>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mb-2">{s.title}</h3>
                      <p className="text-xs text-slate-600 leading-relaxed">{s.desc}</p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-semibold text-emerald-700">
                      <span>{t('howItWorks.phaseWorkflow', 'Phase {num} Workflow').replace('{num}', String(idx + 1))}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="scroll-mt-24 sm:scroll-mt-28 py-12 sm:py-16 lg:py-24 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2">
              {t('featuresSection.badge', 'Advanced Capabilities')}
            </h2>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {t('featuresSection.title', 'Enterprise Technology Built for Revenue Administration')}
            </h3>
            <p className="text-sm text-slate-600 mt-2">
              {t('featuresSection.subtitle', 'From farmer onboarding to high-resolution RTK photogrammetry and crop machine learning.')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <Card key={f.title} hoverEffect className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-100">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900">{f.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{f.desc}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits by Stakeholder (Farmers, Tahsildars, Field Workers, Admin) */}
      <section id="verification" className="scroll-mt-24 sm:scroll-mt-28 py-12 sm:py-16 lg:py-24 bg-white border-b border-slate-200 relative">
        <span id="roles-section" className="absolute -top-24 sm:-top-28 left-0 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              {t('roles.badge', 'Role-Specific Value')}
            </span>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-3 tracking-tight">
              {t('roles.title', 'Tailored for Every Agricultural Stakeholder')}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Farmer Card */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50 space-y-4">
              <div className="text-emerald-700 font-bold text-sm uppercase tracking-wider">
                {t('roles.forFarmers', 'For Farmers')}
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{t('roles.farmerP1', 'Effortless digital submission of 7/12 extract details')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{t('roles.farmerP2', 'Real-time SMS & in-app stage tracking')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{t('roles.farmerP3', 'Direct upload of 5-6 land photographs')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{t('roles.farmerP4', 'Certified PDF report download upon completion')}</span>
                </li>
              </ul>
            </div>

            {/* Tahsildar Card */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50 space-y-4">
              <div className="text-teal-700 font-bold text-sm uppercase tracking-wider">
                {t('roles.forTahsildars', 'For Tahsildars')}
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>{t('roles.tahsildarP1', 'Geographic review queue for assigned taluk')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>{t('roles.tahsildarP2', 'Side-by-side ground vs drone comparison workspace')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>{t('roles.tahsildarP3', 'Crop declaration cross-matching with AI aid')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>{t('roles.tahsildarP4', 'Mandatory audit trails on decisions')}</span>
                </li>
              </ul>
            </div>

            {/* Field Worker Card */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50 space-y-4">
              <div className="text-cyan-700 font-bold text-sm uppercase tracking-wider">
                {t('roles.forFieldWorkers', 'For Field Workers')}
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                  <span>{t('roles.fieldWorkerP1', 'Clear dispatch list of scheduled inspections')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                  <span>{t('roles.fieldWorkerP2', 'GPS mission logging & drone photo uploads')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                  <span>{t('roles.fieldWorkerP3', 'Field notes and anomaly documentation')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                  <span>{t('roles.fieldWorkerP4', 'Mobile-friendly field data collection')}</span>
                </li>
              </ul>
            </div>

            {/* Admin Card */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50 space-y-4">
              <div className="text-slate-800 font-bold text-sm uppercase tracking-wider">
                {t('roles.forAdmins', 'For Administrators')}
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
                  <span>{t('roles.adminP1', 'Role provisioning & staff region allocations')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
                  <span>{t('roles.adminP2', 'Recharts visualization across districts')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
                  <span>{t('roles.adminP3', 'Verification turnaround monitoring')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
                  <span>{t('roles.adminP4', 'Immutable security audit event logging')}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="scroll-mt-24 sm:scroll-mt-28 py-12 sm:py-16 lg:py-24 bg-slate-50 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2">
              {t('faqSection.badge', 'Common Questions')}
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {t('faqSection.title', 'Frequently Asked Questions')}
            </h3>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between text-sm font-semibold text-slate-800 hover:text-emerald-700"
                >
                  <span>{faq.q}</span>
                  {activeFaq === idx ? (
                    <ChevronUp className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                  )}
                </button>
                {activeFaq === idx && (
                  <div className="px-5 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-50 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pre-Footer Call to Action */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t('cta.title', 'Ready to Begin Digital Agricultural Land Verification?')}
          </h2>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            {t('cta.subtitle', 'Join registered landholders across Maharashtra taking advantage of transparent, evidence-backed drone field verification.')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link to="/auth/register">
              <Button size="lg" icon={<ArrowRight className="w-4 h-4" />}>
                {t('cta.registerBtn', 'Register Your Land Today')}
              </Button>
            </Link>
            <Link to="/auth/login">
              <Button variant="outline" size="lg">
                {t('cta.officerBtn', 'Revenue Officer Portal')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
