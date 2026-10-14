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
import { Badge } from '@/components/ui/Badge';
import { analyticsService, DashboardStats } from '@/services/analytics.service';
import { mockDb } from '@/services/mock-db';

export const LandingPage: React.FC = () => {
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
      title: 'Farmer Registration',
      desc: 'Submit personal identity, land survey numbers, 7/12 extract reference, and property boundaries through a guided digital form.',
      icon: FileText,
      color: 'from-emerald-600 to-teal-700',
    },
    {
      num: '02',
      title: 'Tahsildar Review',
      desc: 'Authorized revenue officers examine land records within their jurisdiction, approving applications or requesting additional survey clarification.',
      icon: Building2,
      color: 'from-teal-600 to-cyan-700',
    },
    {
      num: '03',
      title: 'Drone-Based Inspection',
      desc: 'Approved landholders upload ground photos; certified field workers execute RTK drone photogrammetry to record high-resolution aerial evidence.',
      icon: Camera,
      color: 'from-cyan-600 to-sky-700',
    },
    {
      num: '04',
      title: 'Verification Report',
      desc: 'Side-by-side image comparison and crop verification compile an official evidence report with downloadable certified PDF output.',
      icon: FileCheck2,
      color: 'from-emerald-700 to-teal-800',
    },
  ];

  const features = [
    {
      icon: FileText,
      title: 'Digital Landholder Onboarding',
      desc: 'Streamlined multi-step property declarations with Aadhaar-compliant privacy and automated taluk jurisdiction routing.',
    },
    {
      icon: Camera,
      title: 'Ground & Drone Evidence',
      desc: 'Secure private storage for 5-6 farmer ground photographs paired with certified drone orthomosaics and flight telemetry.',
    },
    {
      icon: Eye,
      title: 'Image Comparison Workspace',
      desc: 'Dual-pane synchronized viewer with zoom, pan, and structured landmark checklists for revenue officers.',
    },
    {
      icon: Sprout,
      title: 'Crop Identification System',
      desc: 'Cross-reference declared crops with observed stands, seasonality, irrigation modes, and modular AI vision analysis.',
    },
    {
      icon: Bell,
      title: 'Event-Driven SMS Notifications',
      desc: 'Automated SMS updates at every milestone with idempotent delivery queues and transparent provider status logging.',
    },
    {
      icon: BarChart3,
      title: 'Administrative Analytics',
      desc: 'Complete operational visibility for senior administrators with jurisdiction assignments, turnaround metrics, and audit trails.',
    },
  ];

  const faqs = [
    {
      q: 'How can a farmer register agricultural land on AgriSurvey?',
      a: 'Farmers can create a free account, complete the 4-step registration wizard by providing their contact details, land revenue document number (7/12 extract), survey number, acreage, and upload supporting ownership documentation.',
    },
    {
      q: 'Why are 5 to 6 farmer ground photographs required?',
      a: 'Once preliminary registration is approved by the Tahsildar, ground photos capture entrance points, boundaries, crop rows, and irrigation infrastructure to provide clear baseline evidence before drone flights.',
    },
    {
      q: 'How does drone-based aerial inspection operate?',
      a: 'An authorized field worker is assigned to the land parcel. The worker schedules a field visit, flies an RTK-enabled drone to capture high-resolution imagery at 45m AGL, and submits the aerial photography directly to the revenue officer.',
    },
    {
      q: 'Does AgriSurvey verification certify legal land ownership?',
      a: 'No. AgriSurvey is an evidence-backed technical verification platform that cross-references physical agricultural ground reality with drone imagery. It does not replace court judgments, title registries, or conveyancing deeds.',
    },
    {
      q: 'How does the Tahsildar review and decide on applications?',
      a: 'Tahsildars access an authorized portal filtered to their geographic jurisdiction. They can approve, reject (with mandatory reasons), request clarifications, compare images side-by-side, verify crops, and issue final reports.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-emerald-100 selection:text-emerald-900">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200 pt-12 pb-20 lg:pt-20 lg:pb-28">
        {/* Subtle decorative background gradient */}
        <div className="absolute top-0 right-0 -mr-40 -mt-40 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-96 h-96 bg-cyan-100/40 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Hero Left Content (7 Cols) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-7 space-y-6 text-center lg:text-left"
            >
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 shadow-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Maharashtra Revenue & Agriculture Modernization</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
                Bringing <span className="text-agri-gradient">Transparency</span> to Agricultural Land Verification
              </h1>

              {/* Supporting Text */}
              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                AgriSurvey connects farmers and authorized revenue officials through secure digital registration,
                centimeter-accurate drone inspections, and intelligent crop monitoring.
              </p>

              {/* Call to Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link to="/farmer/register" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto" icon={<ArrowRight className="w-4 h-4" />}>
                    Register Your Land
                  </Button>
                </Link>
                <a href="#how-it-works" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Explore How It Works
                  </Button>
                </a>
              </div>

              {/* Trust-oriented supporting statement */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-medium text-slate-500 border-t border-slate-100">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Digital Registration
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Transparent Review
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Evidence-Based Verification
                </span>
              </div>
            </motion.div>

            {/* Hero Right Visual (5 Cols) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="lg:col-span-5 relative"
            >
              {/* Main Visual Box */}
              <div className="relative rounded-2xl bg-white border border-slate-200/90 shadow-2xl p-4 sm:p-5 overflow-hidden">
                {/* Simulated Aerial Farmland Imagery */}
                <div className="relative h-64 sm:h-80 rounded-xl overflow-hidden bg-slate-900 shadow-inner group">
                  <img
                    src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=80"
                    alt="Farmland Aerial View"
                    className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
                  />
                  {/* Drone scanning grid overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-emerald-950/20" />
                  <div className="absolute inset-4 border-2 border-dashed border-emerald-400/80 rounded-lg pointer-events-none flex items-center justify-center">
                    <span className="bg-emerald-950/80 backdrop-blur-xs text-emerald-300 text-[10px] font-mono px-2 py-0.5 rounded border border-emerald-500/40">
                      SURVEY BOUNDARY: 142/2A • 3.50 ACRES
                    </span>
                  </div>

                  {/* Drone GPS Pill */}
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-semibold text-slate-800 shadow-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>RTK Drone Flight: 45m AGL</span>
                  </div>
                </div>

                {/* Floating Card 1: Registration Status */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="absolute -bottom-4 -left-4 sm:left-2 bg-white rounded-xl shadow-xl border border-slate-200 p-3.5 max-w-[210px] agri-glass"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <Badge status="APPROVED" size="sm" />
                    <span className="text-[10px] text-slate-400 font-mono">APP-849102</span>
                  </div>
                  <div className="text-xs font-bold text-slate-900">Ramesh Patil</div>
                  <div className="text-[10px] text-slate-500 truncate">Wagholi, Haveli, Pune</div>
                </motion.div>

                {/* Floating Card 2: Crop Verification */}
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="absolute -top-3 -right-3 bg-white rounded-xl shadow-xl border border-slate-200 p-3 max-w-[190px] agri-glass"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 mb-1">
                    <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Crop Confirmed</span>
                  </div>
                  <div className="text-[11px] font-medium text-slate-700">Sugarcane (ऊस)</div>
                  <div className="text-[10px] text-emerald-600 font-semibold">94.8% AI Match</div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Statistics Section (Section 5 Requirement) */}
      <section className="bg-slate-50 py-12 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1">
              Live Platform Operations
            </h2>
            <p className="text-xs text-slate-500">
              Validated metrics retrieved directly from database records ({mockDb.staffRegions[0]?.district} District)
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Card className="text-center py-6 hover:border-emerald-200 transition-colors">
              <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {stats?.totalFarmers ?? 2}
              </div>
              <div className="text-xs font-semibold text-slate-600 mt-1">Registered Farmers</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Active verified accounts</div>
            </Card>

            <Card className="text-center py-6 hover:border-emerald-200 transition-colors">
              <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {stats?.totalProperties ?? 3}
              </div>
              <div className="text-xs font-semibold text-slate-600 mt-1">Land Applications</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Submitted for revenue review</div>
            </Card>

            <Card className="text-center py-6 hover:border-emerald-200 transition-colors">
              <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {stats?.completedVerifications ?? 1}
              </div>
              <div className="text-xs font-semibold text-slate-600 mt-1">Verified Properties</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Final evidence report issued</div>
            </Card>

            <Card className="text-center py-6 hover:border-emerald-200 transition-colors">
              <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {stats?.pendingRegistrations ?? 2}
              </div>
              <div className="text-xs font-semibold text-slate-600 mt-1">Pending Inspections</div>
              <div className="text-[10px] text-slate-400 mt-0.5">In Tahsildar / drone queue</div>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works (Section 5 Requirement: 4 Connected Steps) */}
      <section id="how-it-works" className="py-16 lg:py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              End-To-End Architecture
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-3 tracking-tight">
              How AgriSurvey Verifies Agricultural Land
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              A transparent, 4-stage verification workflow connecting landholders with revenue administration.
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
                      <span>Phase {idx + 1} Workflow</span>
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
      <section id="features" className="py-16 lg:py-24 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2">
              Advanced Capabilities
            </h2>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Enterprise Technology Built for Revenue Administration
            </h3>
            <p className="text-sm text-slate-600 mt-2">
              From farmer onboarding to high-resolution RTK photogrammetry and crop machine learning.
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
      <section className="py-16 lg:py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Role-Specific Value
            </span>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-3 tracking-tight">
              Tailored for Every Agricultural Stakeholder
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Farmer Card */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50 space-y-4">
              <div className="text-emerald-700 font-bold text-sm uppercase tracking-wider">
                For Farmers
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Effortless digital submission of 7/12 extract details</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Real-time SMS & in-app stage tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Direct upload of 5-6 land photographs</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Certified PDF report download upon completion</span>
                </li>
              </ul>
            </div>

            {/* Tahsildar Card */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50 space-y-4">
              <div className="text-teal-700 font-bold text-sm uppercase tracking-wider">
                For Tahsildars
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>Geographic review queue for assigned taluk</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>Side-by-side ground vs drone comparison workspace</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>Crop declaration cross-matching with AI aid</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>Mandatory audit trails on decisions</span>
                </li>
              </ul>
            </div>

            {/* Field Worker Card */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50 space-y-4">
              <div className="text-cyan-700 font-bold text-sm uppercase tracking-wider">
                For Field Workers
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                  <span>Clear dispatch list of scheduled inspections</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                  <span>GPS mission logging & drone photo uploads</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                  <span>Field notes and anomaly documentation</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                  <span>Mobile-friendly field data collection</span>
                </li>
              </ul>
            </div>

            {/* Admin Card */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50 space-y-4">
              <div className="text-slate-800 font-bold text-sm uppercase tracking-wider">
                For Administrators
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
                  <span>Role provisioning & staff region allocations</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
                  <span>Recharts visualization across districts</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
                  <span>Verification turnaround monitoring</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
                  <span>Immutable security audit event logging</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 lg:py-24 bg-slate-50 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2">
              Common Questions
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Frequently Asked Questions
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
            Ready to Begin Digital Agricultural Land Verification?
          </h2>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            Join registered landholders across Maharashtra taking advantage of transparent, evidence-backed
            drone field verification.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link to="/farmer/register">
              <Button size="lg" icon={<ArrowRight className="w-4 h-4" />}>
                Register Your Land Today
              </Button>
            </Link>
            <Link to="/auth/login">
              <Button variant="outline" size="lg">
                Revenue Officer Portal
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
