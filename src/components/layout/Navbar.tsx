import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Menu,
  X,
  LogIn,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useLanguage();

  const navLinks = [
    { name: t('nav.home', 'Home'), href: '/' },
    { name: t('nav.howItWorks', 'How It Works'), href: '/#how-it-works' },
    { name: t('nav.features', 'Features'), href: '/#features' },
    { name: t('nav.verification', 'Verification Process'), href: '/#verification' },
    { name: t('nav.faq', 'FAQ'), href: '/#faq' },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden pointer-events-auto"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <header className="fixed top-2 sm:top-3.5 inset-x-0 z-50 flex justify-center px-3 sm:px-6 pointer-events-none">
        <nav
          aria-label="Main Navigation"
          className={`pointer-events-auto w-full max-w-6xl xl:max-w-7xl 2xl:max-w-[1400px] border border-slate-200/90 shadow-xl shadow-slate-900/10 transition-all duration-300 relative ${
            mobileMenuOpen
              ? 'rounded-3xl bg-white shadow-2xl shadow-black/20'
              : 'rounded-full bg-white/95 backdrop-blur-xl'
          }`}
        >
          <div className="px-3.5 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-3 lg:gap-4 xl:gap-6">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group shrink-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-agri-gradient flex items-center justify-center text-white shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform shrink-0">
                <Compass className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="shrink-0">
                <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 group-hover:text-emerald-800 transition-colors whitespace-nowrap block">
                  Agri<span className="text-emerald-700">Survey</span>
                </span>
                <span className="hidden xl:block text-[9px] uppercase tracking-wider font-semibold text-slate-500 -mt-0.5 whitespace-nowrap">
                  {t('nav.tagline', 'Land Verification Platform')}
                </span>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center justify-center gap-2.5 lg:gap-3.5 xl:gap-5 2xl:gap-6 flex-1 min-w-0 px-1 xl:px-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-xs xl:text-sm font-semibold text-slate-700 hover:text-emerald-700 transition-colors whitespace-nowrap py-1 px-1.5 rounded-lg hover:bg-slate-50/80 shrink-0"
                >
                  {link.name}
                </a>
              ))}
            </div>

            {/* Desktop Actions: Language Switcher + Sign In / Sign Up */}
            <div className="hidden sm:flex items-center gap-2 xl:gap-2.5 shrink-0">
              <LanguageSwitcher variant="nav" size="sm" />
              <Link
                to="/auth/login"
                className="inline-flex items-center gap-1.5 xl:gap-2 px-3 xl:px-4 py-1.5 rounded-full text-xs xl:text-sm font-semibold text-white bg-agri-gradient hover:opacity-95 shadow-md shadow-emerald-700/25 hover:shadow-emerald-700/35 transition-all shrink-0 whitespace-nowrap"
              >
                <LogIn className="w-3.5 h-3.5 shrink-0" />
                <span>{t('nav.signInSignUp', 'Sign In / Sign Up')}</span>
              </Link>
            </div>

            {/* Mobile hamburger + quick language */}
            <div className="flex sm:hidden items-center gap-1.5 shrink-0">
              <LanguageSwitcher variant="nav" size="sm" />
              <Link
                to="/auth/login"
                className="p-2 text-slate-700 hover:text-emerald-700 hover:bg-slate-100 rounded-full shrink-0"
                aria-label="Sign In / Sign Up"
              >
                <LogIn className="w-4 h-4" />
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-full focus:outline-none shrink-0"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Drawer */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-slate-100 px-4 pt-3 pb-5 space-y-1.5 bg-white rounded-b-3xl">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center py-2.5 px-3 rounded-xl text-sm font-semibold text-slate-700 hover:text-emerald-700 hover:bg-emerald-50/80 transition-colors"
                >
                  {link.name}
                </a>
              ))}
              <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                <Link
                  to="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white bg-agri-gradient shadow-md active:scale-98 transition-transform"
                >
                  <LogIn className="w-4 h-4 shrink-0" />
                  <span>{t('nav.signInSignUp', 'Sign In / Sign Up')}</span>
                </Link>
              </div>
            </div>
          )}
        </nav>
      </header>
    </>
  );
};
