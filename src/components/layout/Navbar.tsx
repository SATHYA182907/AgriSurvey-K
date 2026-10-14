import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Compass,
  Menu,
  X,
  UserCheck,
  ChevronDown,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { authService } from '@/services/auth.service';
import { mockDb } from '@/services/mock-db';
import { UserRole } from '@/types';
import { ROLE_LABELS, ROLE_DEFAULT_ROUTES } from '@/lib/permissions';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(mockDb.currentUser);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setCurrentUser(mockDb.currentUser);
  }, [location.pathname]);

  const handleRoleSwitch = (role: UserRole) => {
    const updated = authService.switchRole(role);
    setCurrentUser(updated);
    setRoleMenuOpen(false);
    navigate(ROLE_DEFAULT_ROUTES[role]);
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'How It Works', href: '/#how-it-works' },
    { name: 'Features', href: '/#features' },
    { name: 'Verification Process', href: '/#verification' },
    { name: 'FAQ', href: '/#faq' },
  ];

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-agri-gradient flex items-center justify-center text-white shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-emerald-800 transition-colors">
                Agri<span className="text-emerald-700">Survey</span>
              </span>
              <span className="hidden sm:block text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                Land Verification Platform
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-slate-600 hover:text-emerald-700 transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Actions & Role Switcher */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Persona Switcher for Evaluation */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 transition-colors"
                title="Switch persona to test all role workflows"
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span className="max-w-[120px] truncate">{currentUser.full_name.split(' ')[0]}</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-semibold uppercase">
                  {currentUser.role.replace('_', ' ')}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {roleMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Quick Persona Switcher (Dev Mode)
                  </div>
                  <div className="divide-y divide-slate-50">
                    {mockDb.profiles.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleRoleSwitch(p.role)}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-emerald-50/70 transition-colors ${
                          currentUser.id === p.id ? 'bg-emerald-50 text-emerald-900 font-semibold' : 'text-slate-700'
                        }`}
                      >
                        <div>
                          <div className="font-medium">{p.full_name}</div>
                          <div className="text-[10px] text-slate-400">{ROLE_LABELS[p.role]}</div>
                        </div>
                        {currentUser.id === p.id && (
                          <span className="w-2 h-2 rounded-full bg-emerald-600" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Dashboard or Sign In Button */}
            <Link
              to={ROLE_DEFAULT_ROUTES[currentUser.role]}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-agri-gradient hover:opacity-95 shadow-xs transition-all"
            >
              <Layers className="w-4 h-4" />
              <span>Go to Dashboard</span>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <div className="flex sm:hidden items-center gap-2">
            <Link
              to={ROLE_DEFAULT_ROUTES[currentUser.role]}
              className="p-2 text-emerald-700 hover:bg-emerald-50 rounded-lg"
              aria-label="Dashboard"
            >
              <Layers className="w-5 h-5" />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-medium text-slate-700 hover:text-emerald-700"
            >
              {link.name}
            </a>
          ))}
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <div className="text-xs font-semibold text-slate-400 uppercase">Current Persona:</div>
            <div className="flex flex-wrap gap-2">
              {mockDb.profiles.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    handleRoleSwitch(p.role);
                    setMobileMenuOpen(false);
                  }}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border ${
                    currentUser.id === p.id
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  {p.full_name.split(' ')[0]} ({p.role})
                </button>
              ))}
            </div>
            <Link
              to={ROLE_DEFAULT_ROUTES[currentUser.role]}
              onClick={() => setMobileMenuOpen(false)}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-white bg-agri-gradient"
            >
              <span>Access Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};
