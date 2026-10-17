import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { LanguageCode } from '@/types/language';

interface LanguageSwitcherProps {
  variant?: 'nav' | 'glass';
  size?: 'sm' | 'md';
  align?: 'left' | 'right';
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'nav',
  size = 'md',
  align = 'right',
  className = '',
}) => {
  const { language, setLanguage, languages, currentLanguageOption } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSelect = (code: LanguageCode) => {
    setLanguage(code);
    setIsOpen(false);
  };

  // Styling variants
  const isGlass = variant === 'glass';

  const buttonBaseClasses = isGlass
    ? 'bg-black/35 hover:bg-black/55 text-white/90 hover:text-white backdrop-blur-md border border-white/25 shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-95'
    : 'bg-white hover:bg-slate-50 text-slate-700 hover:text-emerald-700 border border-slate-200/90 hover:border-emerald-500/40 shadow-xs hover:shadow-sm transition-all duration-200';

  const sizeClasses = size === 'sm'
    ? 'px-2.5 py-1 text-xs gap-1.5 rounded-lg'
    : 'px-3 py-1.5 text-xs sm:text-sm gap-2 rounded-xl';

  return (
    <div className={`relative inline-block text-left shrink-0 ${className}`} ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Change Website Language"
        className={`inline-flex items-center font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400/50 cursor-pointer whitespace-nowrap shrink-0 ${buttonBaseClasses} ${sizeClasses}`}
      >
        <Globe className={`${size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-emerald-400 shrink-0`} />
        
        {/* Language Label */}
        <span className="font-semibold tracking-tight">
          {currentLanguageOption.nativeName}
        </span>

        {/* Small subtle badge on larger screens */}
        <span className={`hidden md:inline-block text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded-md ${
          isGlass ? 'bg-white/15 text-white/80' : 'bg-slate-100 text-slate-500'
        }`}>
          {currentLanguageOption.code.toUpperCase()}
        </span>

        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 opacity-70 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute mt-2 w-72 sm:w-80 max-w-[calc(100vw-1.5rem)] rounded-2xl shadow-2xl z-50 overflow-hidden transform transition-all duration-200 animate-in fade-in zoom-in-95 ${
            align === 'right' ? 'right-0' : 'left-0'
          } ${
            isGlass
              ? 'bg-slate-950/90 backdrop-blur-2xl border border-white/20 text-white shadow-black/60'
              : 'bg-white/98 backdrop-blur-xl border border-slate-200 text-slate-800 shadow-slate-900/15'
          }`}
        >
          {/* Header */}
          <div className={`px-4 py-2.5 border-b flex items-center justify-between ${
            isGlass ? 'border-white/10 bg-white/5' : 'border-slate-100 bg-slate-50/70'
          }`}>
            <div className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-500" />
              <span className={`text-[11px] font-bold uppercase tracking-wider ${
                isGlass ? 'text-slate-300' : 'text-slate-600'
              }`}>
                Select Language / भाषा निवडा
              </span>
            </div>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              isGlass ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-50 text-emerald-700'
            }`}>
              10 States
            </span>
          </div>

          {/* Languages List */}
          <div className="p-1.5 max-h-80 overflow-y-auto space-y-1 divide-y divide-transparent">
            {languages.map((lang) => {
              const isSelected = lang.code === language;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelect(lang.code)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? isGlass
                        ? 'bg-emerald-500/30 text-white font-semibold border border-emerald-400/40 shadow-sm'
                        : 'bg-emerald-50 text-emerald-900 font-semibold border border-emerald-200 shadow-xs'
                      : isGlass
                      ? 'text-slate-200 hover:bg-white/10 hover:text-white'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {lang.nativeName}
                      </span>
                      {lang.nativeName !== lang.name && (
                        <span className={`text-xs ${isGlass ? 'text-slate-400' : 'text-slate-500'}`}>
                          ({lang.name})
                        </span>
                      )}
                    </div>
                    <span className={`text-[10px] ${isGlass ? 'text-slate-400' : 'text-slate-400'}`}>
                      {lang.region}
                    </span>
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-xs">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
