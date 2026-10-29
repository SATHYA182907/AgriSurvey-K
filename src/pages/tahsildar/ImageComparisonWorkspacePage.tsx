import React, { useState, useEffect } from 'react';
import {
  Eye,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  CheckSquare,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  FileText,
  Sliders,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cropVerificationService } from '@/services/crop-verification.service';
import { droneService } from '@/services/drone.service';
import { mockDb } from '@/services/mock-db';
import { ComparisonResultType, FarmerLandImage, DroneImagery, RegistrationApplication } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { getTahsildarLabel } from '@/lib/dashboard-localizer';

// Demonstration imagery
const DEMO_FARMER_IMAGES = [
  {
    title: 'Farmer Ground Photo #1 (North Entrance)',
    url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    timestamp: '2026-02-15 08:15 IST',
    coords: '18.5793° N, 73.9823° E',
  },
  {
    title: 'Farmer Ground Photo #2 (Sugarcane Rows)',
    url: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1200&q=80',
    timestamp: '2026-02-15 08:22 IST',
    coords: '18.5795° N, 73.9826° E',
  },
  {
    title: 'Farmer Ground Photo #3 (Drip Pipes)',
    url: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=1200&q=80',
    timestamp: '2026-02-15 08:30 IST',
    coords: '18.5794° N, 73.9824° E',
  },
];

const DEMO_DRONE_IMAGES = [
  {
    title: 'Drone RTK Nadir Orthomosaic (DJI_0142)',
    url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    timestamp: '2026-02-18 10:25 IST',
    coords: '18.5793° N, 73.9824° E (RTK ±1.2cm)',
    mission: 'MISSION-HAV-081',
  },
  {
    title: 'Drone Oblique Canopy Angle (DJI_0143)',
    url: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1200&q=80',
    timestamp: '2026-02-18 10:32 IST',
    coords: '18.5796° N, 73.9822° E',
    mission: 'MISSION-HAV-081',
  },
  {
    title: 'Drone Drip Line Survey (DJI_0144)',
    url: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=1200&q=80',
    timestamp: '2026-02-18 10:40 IST',
    coords: '18.5794° N, 73.9825° E',
    mission: 'MISSION-HAV-081',
  },
];

export const ImageComparisonWorkspacePage: React.FC = () => {
  const { language } = useLanguage();
  const tl = (key: string) => getTahsildarLabel(key, language);

  const [selectedFarmerIndex, setSelectedFarmerIndex] = useState(0);
  const [selectedDroneIndex, setSelectedDroneIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Verification Checklist State
  const [checkLandmarks, setCheckLandmarks] = useState(true);
  const [checkBoundaries, setCheckBoundaries] = useState(true);
  const [checkSeasonality, setCheckSeasonality] = useState(true);
  const [checkIrrigation, setCheckIrrigation] = useState(true);
  const [checkQuality, setCheckQuality] = useState(true);

  // Decision State
  const [comparisonOutcome, setComparisonOutcome] = useState<ComparisonResultType>('CONSISTENT');
  const [reviewNotes, setReviewNotes] = useState(
    'Ground photographs of entrance gate and sugarcane stand correspond directly with RTK aerial orthomosaic DJI_0142. Boundary stones and cart-track match revenue survey map.'
  );
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const activeFarmerImg = DEMO_FARMER_IMAGES[selectedFarmerIndex];
  const activeDroneImg = DEMO_DRONE_IMAGES[selectedDroneIndex];

  const handleSaveComparison = async () => {
    setIsSaving(true);
    try {
      await cropVerificationService.saveImageComparison({
        applicationId: 'app-01',
        propertyId: 'prop-01',
        comparisonResult: comparisonOutcome,
        reviewNotes,
        similarityScore: 93.4,
      });

      setIsSaving(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      setIsSaving(false);
      alert(err.message || 'Error recording comparison');
    }
  };

  return (
    <DashboardLayout
      title={tl('imageComparisonTitle')}
      subtitle={tl('imageComparisonSubtitle')}
    >
      <div className="space-y-6">
        {/* Workspace Controls Header */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-800 flex items-center justify-center font-bold">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">{language === 'mr' ? 'गट क्र.' : 'Survey Gat'} 142/2A • Wagholi</span>
                <Badge status="EVIDENCE_UPLOADED" size="sm" />
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                App Ref: AGRI-APP-2026-849102 • Ramesh Patil • 3.50 {language === 'mr' ? 'एकर' : language === 'hi' ? 'एकड़' : 'Acres'}
              </p>
            </div>
          </div>

          {/* Synchronized Zoom Controls */}
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <span className="text-xs font-semibold text-slate-500 mr-1">{tl('zoomLabel')}</span>
            <button
              onClick={() => setZoomLevel(Math.max(0.8, zoomLevel - 0.2))}
              className="p-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-mono w-10 text-center font-bold text-slate-800">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel(Math.min(2.5, zoomLevel + 0.2))}
              className="p-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 ml-1"
              title="Reset zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Dual-Pane Side-by-Side Viewing Workspace (Section 14 Requirement) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT PANEL: Farmer-Submitted Ground Photos */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  {tl('leftPanelTitle')}
                </h3>
              </div>
              <span className="text-[11px] font-mono text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                {tl('photoPrefix')} {selectedFarmerIndex + 1} {tl('ofConnector')} {DEMO_FARMER_IMAGES.length}
              </span>
            </div>

            {/* Main Interactive Viewer */}
            <div className="relative rounded-xl overflow-hidden bg-slate-950 h-72 sm:h-96 flex items-center justify-center border border-slate-200 group">
              <img
                src={activeFarmerImg.url}
                alt={activeFarmerImg.title}
                style={{ transform: `scale(${zoomLevel})` }}
                className="w-full h-full object-cover transition-transform duration-200"
              />

              {/* In-view Metadata Overlay */}
              <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-xs px-2.5 py-1 rounded text-[10px] text-white font-mono space-y-0.5">
                <div>
                  {language === 'mr'
                    ? selectedFarmerIndex === 0
                      ? 'शेतकऱ्याचा प्रत्यक्ष फोटो #१ (उत्तर प्रवेशद्वार)'
                      : selectedFarmerIndex === 1
                      ? 'शेतकऱ्याचा प्रत्यक्ष फोटो #२ (उसाचे चर)'
                      : 'शेतकऱ्याचा प्रत्यक्ष फोटो #३ (ठिबक नलिका)'
                    : activeFarmerImg.title}
                </div>
                <div className="text-emerald-400">
                  {language === 'mr' ? 'दिनांक/वेळ:' : language === 'hi' ? 'समय:' : 'Captured:'} {activeFarmerImg.timestamp}
                </div>
                <div className="text-slate-300">GPS: {activeFarmerImg.coords}</div>
              </div>
            </div>

            {/* Thumbnail Selector Strip */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {DEMO_FARMER_IMAGES.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedFarmerIndex(idx)}
                  className={`w-20 h-14 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                    selectedFarmerIndex === idx
                      ? 'border-emerald-600 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </Card>

          {/* RIGHT PANEL: Drone Inspection Aerial Imagery */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  {tl('rightPanelTitle')}
                </h3>
              </div>
              <span className="text-[11px] font-mono text-cyan-800 font-semibold bg-cyan-50 px-2 py-0.5 rounded">
                {tl('orthoPrefix')} {selectedDroneIndex + 1} {tl('ofConnector')} {DEMO_DRONE_IMAGES.length}
              </span>
            </div>

            {/* Main Interactive Viewer */}
            <div className="relative rounded-xl overflow-hidden bg-slate-950 h-72 sm:h-96 flex items-center justify-center border border-slate-200 group">
              <img
                src={activeDroneImg.url}
                alt={activeDroneImg.title}
                style={{ transform: `scale(${zoomLevel})` }}
                className="w-full h-full object-cover transition-transform duration-200"
              />

              {/* In-view Metadata Overlay */}
              <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-xs px-2.5 py-1 rounded text-[10px] text-white font-mono space-y-0.5">
                <div>
                  {language === 'mr'
                    ? selectedDroneIndex === 0
                      ? 'ड्रोन RTK नादिर ऑर्थोमोझॅक (DJI_0142)'
                      : selectedDroneIndex === 1
                      ? 'ड्रोन तिरपे दृश्य (DJI_0143)'
                      : 'ड्रोन ठिबक लाईन पाहणी (DJI_0144)'
                    : activeDroneImg.title}
                </div>
                <div className="text-cyan-400">
                  {language === 'mr' ? 'मोहीम:' : language === 'hi' ? 'मिशन:' : 'Mission:'} {activeDroneImg.mission} • {activeDroneImg.timestamp}
                </div>
                <div className="text-slate-300">RTK: {activeDroneImg.coords}</div>
              </div>
            </div>

            {/* Thumbnail Selector Strip */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {DEMO_DRONE_IMAGES.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedDroneIndex(idx)}
                  className={`w-20 h-14 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                    selectedDroneIndex === idx
                      ? 'border-cyan-600 ring-2 ring-cyan-500/20'
                      : 'border-slate-200 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Verification Checklist & Official Findings Module */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Checklist (6 Cols) */}
          <Card className="lg:col-span-6 p-6 space-y-4">
            <div className="border-b border-slate-100 pb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                {tl('officialChecklistTitle')}
              </h4>
              <p className="text-[11px] text-slate-500">
                {tl('officialChecklistDesc')}
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <label className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checkLandmarks}
                  onChange={(e) => setCheckLandmarks(e.target.checked)}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <span className="font-semibold text-slate-800">{tl('chkLandmarksTitle')}</span>
                  <p className="text-[11px] text-slate-500">
                    {tl('chkLandmarksDesc')}
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checkBoundaries}
                  onChange={(e) => setCheckBoundaries(e.target.checked)}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <span className="font-semibold text-slate-800">{tl('chkBoundariesTitle')}</span>
                  <p className="text-[11px] text-slate-500">
                    {tl('chkBoundariesDesc')}
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checkSeasonality}
                  onChange={(e) => setCheckSeasonality(e.target.checked)}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <span className="font-semibold text-slate-800">{tl('chkSeasonalityTitle')}</span>
                  <p className="text-[11px] text-slate-500">
                    {tl('chkSeasonalityDesc')}
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checkIrrigation}
                  onChange={(e) => setCheckIrrigation(e.target.checked)}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <span className="font-semibold text-slate-800">{tl('chkIrrigationTitle')}</span>
                  <p className="text-[11px] text-slate-500">
                    {tl('chkIrrigationDesc')}
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checkQuality}
                  onChange={(e) => setCheckQuality(e.target.checked)}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <span className="font-semibold text-slate-800">{tl('chkQualityTitle')}</span>
                  <p className="text-[11px] text-slate-500">
                    {tl('chkQualityDesc')}
                  </p>
                </div>
              </label>
            </div>
          </Card>

          {/* Decision Outcome & Review Notes (6 Cols) */}
          <Card className="lg:col-span-6 p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  {tl('imageComparisonFindingTitle')}
                </h4>
                <p className="text-[11px] text-slate-500">
                  {tl('imageComparisonFindingDesc')}
                </p>
              </div>

              {/* Outcome Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  {tl('officialComparisonFindingLabel')}
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setComparisonOutcome('CONSISTENT')}
                    className={`p-2.5 rounded-lg border text-left font-semibold transition-all ${
                      comparisonOutcome === 'CONSISTENT'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50'
                    }`}
                  >
                    {tl('btnConsistentWithEvidence')}
                  </button>

                  <button
                    type="button"
                    onClick={() => setComparisonOutcome('INCONSISTENT')}
                    className={`p-2.5 rounded-lg border text-left font-semibold transition-all ${
                      comparisonOutcome === 'INCONSISTENT'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-rose-50'
                    }`}
                  >
                    {tl('btnInconsistentWithEvidence')}
                  </button>

                  <button
                    type="button"
                    onClick={() => setComparisonOutcome('INSUFFICIENT_EVIDENCE')}
                    className={`p-2.5 rounded-lg border text-left font-semibold transition-all ${
                      comparisonOutcome === 'INSUFFICIENT_EVIDENCE'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50'
                    }`}
                  >
                    {tl('btnInsufficientEvidence')}
                  </button>

                  <button
                    type="button"
                    onClick={() => setComparisonOutcome('REQUIRES_REINSPECTION')}
                    className={`p-2.5 rounded-lg border text-left font-semibold transition-all ${
                      comparisonOutcome === 'REQUIRES_REINSPECTION'
                        ? 'bg-cyan-700 text-white border-cyan-700 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-cyan-50'
                    }`}
                  >
                    {tl('btnRequiresReinspection')}
                  </button>
                </div>
              </div>

              {/* Review Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {tl('tahsildarReviewNotesLabel')}
                </label>
                <textarea
                  rows={4}
                  value={
                    language === 'mr' && reviewNotes.includes('Ground photographs of entrance gate')
                      ? 'प्रवेशद्वार आणि उसाच्या शेताचे प्रत्यक्ष फोटो RTK हवाई ऑर्थोमोझॅक DJI_0142 शी थेट जुळतात. हद्दीचे दगड आणि पाणंद रस्ता महसूल नकाशाशी तंतोतंत जुळतात.'
                      : reviewNotes
                  }
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs bg-white text-slate-900"
                  placeholder={tl('tahsildarReviewNotesPlaceholder')}
                />
              </div>

              {/* AI Similarity Note (Section 14 requirement) */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 flex items-start gap-2">
                <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">{tl('algorithmicNoticeTitle')}</span> {tl('algorithmicNoticeDesc')}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              {savedSuccess ? (
                <span className="text-xs text-emerald-700 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {tl('comparisonSavedSuccessMsg')}
                </span>
              ) : (
                <span className="text-[11px] text-slate-400">
                  {tl('reviewerLabel')} Anand S. Kulkarni ({language === 'mr' ? 'तहसीलदार' : language === 'hi' ? 'तहसीलदार' : 'Tahsildar'})
                </span>
              )}

              <Button onClick={handleSaveComparison} isLoading={isSaving}>
                {tl('saveComparisonFindingBtn')}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};
