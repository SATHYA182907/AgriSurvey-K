import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Col 1: Brand & Mission */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-agri-gradient flex items-center justify-center text-white shadow-xs">
                <Compass className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900">
                Agri<span className="text-emerald-700">Survey</span>
              </span>
            </Link>
            <p className="text-xs text-slate-500 leading-relaxed">
              AgriSurvey is a centralized agricultural land administration and verification platform connecting
              farmers, revenue officers, and field surveyors through drone photogrammetry and intelligent crop monitoring.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Evidence-based land verification system</span>
            </div>
          </div>

          {/* Col 2: Platform Links */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <Link to="/farmer/register" className="hover:text-emerald-700 transition-colors">
                  Farmer Registration
                </Link>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-emerald-700 transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-emerald-700 transition-colors">
                  Platform Features
                </a>
              </li>
              <li>
                <a href="#verification" className="hover:text-emerald-700 transition-colors">
                  Drone Inspection Workflow
                </a>
              </li>
              <li>
                <Link to="/auth/login" className="hover:text-emerald-700 transition-colors">
                  Staff & Officer Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal & Governance */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">
              Governance & Policies
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <a href="#privacy" className="hover:text-emerald-700 transition-colors">
                  Privacy Policy & Data Protection
                </a>
              </li>
              <li>
                <a href="#terms" className="hover:text-emerald-700 transition-colors">
                  Terms of Service & Usage Rules
                </a>
              </li>
              <li>
                <a href="#disclaimer" className="hover:text-emerald-700 transition-colors">
                  Statutory Title Disclaimer
                </a>
              </li>
              <li>
                <a href="#accessibility" className="hover:text-emerald-700 transition-colors">
                  Accessibility Standards
                </a>
              </li>
              <li>
                <a href="#audit" className="hover:text-emerald-700 transition-colors">
                  Audit & Security Assurance
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Administrative Contact */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">
              Administrative Helpdesk
            </h4>
            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Central Revenue & Land Survey Bhavan, Pune Division, Maharashtra 411001</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Toll-Free Kisan Support: 1800-233-0242</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>support@agrisurvey.gov.in</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar & Statutory Disclaimer */}
        <div className="pt-8 mt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} AgriSurvey Platform. All rights reserved.
          </div>
          <div className="text-center md:text-right max-w-xl text-slate-400">
            Notice: AgriSurvey verification reports represent evidence-backed field photogrammetry records and do not
            substitute for judicial determination or certified deeds of title.
          </div>
        </div>
      </div>
    </footer>
  );
};
