import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plane,
  Camera,
  Layers,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  MapPin,
  Sliders,
  Download,
  Plus,
  Search,
  Filter,
  Calendar,
  ArrowRight,
  ShieldCheck,
  Check,
  Sparkles,
  FileText,
  X,
  UploadCloud,
  Trash2,
  RefreshCw,
  Building2,
  ExternalLink,
} from 'lucide-react';
import { MapContainer, TileLayer, Polygon, ImageOverlay, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { droneSurveyService, CreateDroneMissionParams } from '@/services/drone-survey.service';
import { mockDb } from '@/services/mock-db';
import { DroneMissionRecord, GeotaggedPhoto, FarmPlot } from '@/types';
import { computeGeodesicMeasurements } from '@/lib/geospatial';
import { useLanguage } from '@/context/LanguageContext';
import { getDroneSurveyLabel, getTahsildarLabel } from '@/lib/dashboard-localizer';

// Fix Leaflet icons in Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Clean Drone Photo Pin Marker Icon
const dronePinIcon = new L.DivIcon({
  className: 'custom-drone-pin',
  html: `<div style="background-color: #0284c7; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2.5px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); cursor: pointer;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle></svg></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

// Map helper to smoothly pan and invalidate size
function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 0.8 });
    const timer = setTimeout(() => map.invalidateSize(), 250);
    return () => clearTimeout(timer);
  }, [center, zoom, map]);
  return null;
}

export const TahsildarDroneSurveyPage: React.FC = () => {
  const { t, language } = useLanguage();
  const tl = (key: string) => getDroneSurveyLabel(key, language);
  const navigate = useNavigate();
  const currentUser = mockDb.currentUser;

  // State
  const [missions, setMissions] = useState<DroneMissionRecord[]>([]);
  const [selectedMissionId, setSelectedMissionId] = useState<string>('');
  const [plots, setPlots] = useState<FarmPlot[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [talukFilter, setTalukFilter] = useState<string>('ALL');

  // Active view tab: map, photos, verification
  const [activeTab, setActiveTab] = useState<'map' | 'photos' | 'verification'>('map');

  // Map controls
  const [orthoOpacity, setOrthoOpacity] = useState<number>(0.85);
  const [baseMapType, setBaseMapType] = useState<'satellite' | 'streets'>('satellite');
  const [showPlotBoundary, setShowPlotBoundary] = useState<boolean>(true);
  const [showOrthomosaic, setShowOrthomosaic] = useState<boolean>(true);
  const [showPhotoPins, setShowPhotoPins] = useState<boolean>(true);

  // Modals
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [uploadPhotoModalOpen, setUploadPhotoModalOpen] = useState(false);
  const [certifyModalOpen, setCertifyModalOpen] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<GeotaggedPhoto | null>(null);

  // Schedule Modal Form
  const [schedulePlotId, setSchedulePlotId] = useState('');
  const [scheduleTitle, setScheduleTitle] = useState('');
  const [schedulePilot, setSchedulePilot] = useState('Prakash Mahadev Jadhav');
  const [scheduleDate, setScheduleDate] = useState('2026-11-05');
  const [scheduleAltitude, setScheduleAltitude] = useState(65);
  const [scheduleSensor, setScheduleSensor] = useState('DJI Zenmuse P1 45MP Full-Frame RGB');
  const [scheduleNotes, setScheduleNotes] = useState('Verify sugarcane canopy density and boundary stones along village road.');

  // Upload Photo Form
  const [uploadPhotoUrl, setUploadPhotoUrl] = useState(
    'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80'
  );
  const [uploadPhotoName, setUploadPhotoName] = useState('DJI_20261102_0201.JPG');

  // Certify Remarks
  const [certifyRemarks, setCertifyRemarks] = useState(
    'Centimeter-level drone photogrammetry verified: Crop stand matches 7/12 declaration. Zero unauthorized encroachment.'
  );

  // Load Missions & Plots
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const missionList = await droneSurveyService.listMissions();
      const plotList = [...mockDb.farmPlots];
      setMissions(missionList);
      setPlots(plotList);

      if (missionList.length > 0 && !selectedMissionId) {
        setSelectedMissionId(missionList[0].id);
      }

      if (plotList.length > 0 && !schedulePlotId) {
        setSchedulePlotId(plotList[0].id);
        setScheduleTitle(`Drone Survey — ${plotList[0].plot_name}`);
      }
    } finally {
      setIsLoading(false);
    }
  }, [selectedMissionId, schedulePlotId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Selected Mission & Plot
  const selectedMission = useMemo(() => {
    return missions.find((m) => m.id === selectedMissionId) || missions[0] || null;
  }, [missions, selectedMissionId]);

  const selectedPlot = useMemo(() => {
    if (!selectedMission) return null;
    return plots.find((p) => p.id === selectedMission.plot_id) || plots[0] || null;
  }, [selectedMission, plots]);

  // Filtered Missions
  const filteredMissions = useMemo(() => {
    const plotMap = new Map(plots.map((p) => [p.id, p]));
    return missions.filter((m) => {
      const plot = plotMap.get(m.plot_id);
      if (statusFilter !== 'ALL' && m.status !== statusFilter) return false;
      if (talukFilter !== 'ALL' && plot && plot.taluk.toLowerCase() !== talukFilter.toLowerCase()) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesRef = m.mission_reference.toLowerCase().includes(q);
        const matchesTitle = m.title.toLowerCase().includes(q);
        const matchesPilot = m.pilot_name.toLowerCase().includes(q);
        const matchesPlot = plot && (
          plot.plot_name.toLowerCase().includes(q) ||
          plot.survey_number.toLowerCase().includes(q) ||
          plot.village.toLowerCase().includes(q)
        );
        if (!matchesRef && !matchesTitle && !matchesPilot && !matchesPlot) return false;
      }
      return true;
    });
  }, [missions, plots, statusFilter, talukFilter, searchQuery]);

  // Derived KPI Stats
  const kpis = useMemo(() => {
    const total = missions.length;
    const verified = missions.filter((m) => m.status === 'PROCESSED').length;
    const inFlight = missions.filter((m) => m.status === 'IN_FLIGHT').length;
    const scheduled = missions.filter((m) => m.status === 'SCHEDULED').length;
    const totalPhotos = missions.reduce((acc, m) => acc + (m.photos_count || m.geotagged_photos?.length || 0), 0);
    return { total, verified, inFlight, scheduled, totalPhotos };
  }, [missions]);

  // Map Coordinates & Measurements
  const mapCenterZoom = useMemo(() => {
    if (!selectedPlot || !selectedPlot.boundary_coordinates?.length) {
      return { center: [18.5793, 73.9824] as [number, number], zoom: 16 };
    }
    const measurements = computeGeodesicMeasurements(selectedPlot.boundary_coordinates);
    return {
      center: measurements.centroid as [number, number],
      zoom: 17,
      measurements,
    };
  }, [selectedPlot]);

  // Schedule Submit
  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedulePlotId) return;

    try {
      const newMission = await droneSurveyService.createMission({
        plotId: schedulePlotId,
        title: scheduleTitle || 'Drone Photogrammetry Cadastral Survey',
        pilotName: schedulePilot,
        flightDate: scheduleDate,
        flightAltitudeMeters: Number(scheduleAltitude),
        cameraSensor: scheduleSensor,
        notes: scheduleNotes,
      });

      setScheduleModalOpen(false);
      await loadData();
      setSelectedMissionId(newMission.id);
      alert(`Success: Drone survey ${newMission.mission_reference} scheduled for ${schedulePilot}!`);
    } catch (err: any) {
      alert(`Failed to schedule mission: ${err.message}`);
    }
  };

  // Upload Photo Submit
  const handleUploadPhotoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMission) return;

    try {
      await droneSurveyService.uploadDronePhotos(selectedMission.id, [
        {
          name: uploadPhotoName || `DJI_${Date.now()}.JPG`,
          url: uploadPhotoUrl,
        },
      ]);

      setUploadPhotoModalOpen(false);
      await loadData();
      alert(`Success: Photograph added to mission ${selectedMission.mission_reference}!`);
    } catch (err: any) {
      alert(`Upload failed: ${err.message}`);
    }
  };

  // Certify Submit
  const handleCertifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMission) return;

    try {
      await droneSurveyService.verifyMissionDossier(selectedMission.id, certifyRemarks);
      setCertifyModalOpen(false);
      await loadData();
      alert(`Certified: Mission ${selectedMission.mission_reference} officially authenticated by Tahsildar ${currentUser.full_name}!`);
    } catch (err: any) {
      alert(`Certification failed: ${err.message}`);
    }
  };

  // Delete Mission
  const handleDeleteMission = async (missionId: string) => {
    if (!confirm('Are you sure you want to remove this drone survey record?')) return;
    try {
      await droneSurveyService.deleteMission(missionId);
      await loadData();
      alert('Drone mission removed.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Export PDF
  const handleDownloadPdf = () => {
    if (!selectedMission) return;
    const doc = droneSurveyService.generateDroneSurveyPdf(selectedMission, selectedPlot || undefined);
    doc.save(`Drone_Survey_${selectedMission.mission_reference}.pdf`);
  };

  return (
    <DashboardLayout
      title={t('droneSurveys.title', 'Drone Survey & Inspection Hub')}
      subtitle={`${t('dashboard.jurisdiction', 'Pune Division')} • ${currentUser.full_name} (Tahsildar)`}
    >
      <div className="space-y-5 pb-8 max-w-7xl mx-auto">
        {/* Desk Header Card (Matching TahsildarRegistrationsPage style) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
              <Plane className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  Drone Survey & Photogrammetry Desk
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {tl('rtkPrecision')}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {tl('droneMissionSubtitle')}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setScheduleModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{tl('scheduleDroneSurvey')}</span>
            </button>

            <button
              onClick={() => setUploadPhotoModalOpen(true)}
              disabled={!selectedMission}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Camera className="w-4 h-4 text-slate-500" />
              <span>{tl('uploadDronePhotos')}</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={!selectedMission}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs transition-colors disabled:opacity-50 cursor-pointer"
              title="Download Official PDF Dossier"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>{tl('exportDossier')}</span>
            </button>

            <button
              onClick={loadData}
              className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-500 border border-slate-200 shadow-2xs transition-colors cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* 4 Clean Summary Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          <Card className="p-4 bg-white border-slate-200 hover:border-emerald-300 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>{tl('totalMissions')}</span>
                <Plane className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">{kpis.total}</div>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Across Haveli & Baramati beats</div>
          </Card>

          <Card className="p-4 bg-emerald-50/50 border-emerald-200 hover:border-emerald-300 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-emerald-800">
                <span>{tl('verifiedCertified')}</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-extrabold text-emerald-950 mt-1">{kpis.verified}</div>
            </div>
            <div className="text-[11px] text-emerald-700 mt-1">Dossier legally authenticated</div>
          </Card>

          <Card className="p-4 bg-amber-50/50 border-amber-200 hover:border-amber-300 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-amber-800">
                <span>{tl('inFlightScheduled')}</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-extrabold text-amber-950 mt-1">{kpis.inFlight + kpis.scheduled}</div>
            </div>
            <div className="text-[11px] text-amber-700 mt-1">{kpis.inFlight} airborne · {kpis.scheduled} queued</div>
          </Card>

          <Card className="p-4 bg-sky-50/50 border-sky-200 hover:border-sky-300 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-sky-800">
                <span>{tl('aerialPhotographs')}</span>
                <Camera className="w-4 h-4 text-sky-600" />
              </div>
              <div className="text-2xl font-extrabold text-sky-950 mt-1">{kpis.totalPhotos}</div>
            </div>
            <div className="text-[11px] text-sky-700 mt-1">EXIF GPS tagged images</div>
          </Card>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Mission Reference (DRN-...), Plot Name, Survey No, Farmer, or Pilot..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-hidden"
            >
              <option value="ALL">All Statuses</option>
              <option value="PROCESSED">Verified / Completed</option>
              <option value="IN_FLIGHT">In Flight</option>
              <option value="SCHEDULED">Scheduled</option>
            </select>

            <select
              value={talukFilter}
              onChange={(e) => setTalukFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-hidden"
            >
              <option value="ALL">All Taluks</option>
              <option value="Haveli">Haveli</option>
              <option value="Baramati">Baramati</option>
              <option value="Shirur">Shirur</option>
            </select>
          </div>
        </div>

        {/* Main 2-Column Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: Mission Roster (4 Cols) */}
          <div className="lg:col-span-4 space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Missions List ({filteredMissions.length})
              </span>
              {(searchQuery || statusFilter !== 'ALL' || talukFilter !== 'ALL') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('ALL');
                    setTalukFilter('ALL');
                  }}
                  className="text-xs text-emerald-600 hover:underline font-medium"
                >
                  Clear filters
                </button>
              )}
            </div>

            <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
              {filteredMissions.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500">
                  <Plane className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-medium">No missions match your filter</p>
                  <button
                    onClick={() => setScheduleModalOpen(true)}
                    className="mt-2 text-xs font-semibold text-emerald-600 hover:underline"
                  >
                    + Schedule New Survey
                  </button>
                </div>
              ) : (
                filteredMissions.map((m) => {
                  const isSelected = m.id === selectedMissionId;
                  const plot = plots.find((p) => p.id === m.plot_id);
                  const isVerified = m.status === 'PROCESSED';
                  const isInFlight = m.status === 'IN_FLIGHT';

                  return (
                    <div
                      key={m.id}
                      onClick={() => setSelectedMissionId(m.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer bg-white text-left ${
                        isSelected
                          ? 'border-emerald-500 ring-2 ring-emerald-500/10 shadow-sm bg-emerald-50/20'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className="font-mono text-[11px] font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">
                          {m.mission_reference}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isVerified
                              ? 'bg-emerald-100 text-emerald-800'
                              : isInFlight
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {isVerified ? 'VERIFIED' : isInFlight ? 'IN FLIGHT' : 'SCHEDULED'}
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-900 text-xs line-clamp-1">
                        {m.title}
                      </h4>

                      <div className="mt-1.5 text-[11px] text-slate-600 space-y-0.5">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Parcel:</span>
                          <span className="font-medium text-slate-800 truncate max-w-[190px]">
                            {plot?.plot_name || 'Agricultural Plot'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Gat / Village:</span>
                          <span className="text-slate-700">
                            Gat {plot?.survey_number || 'N/A'} · {plot?.village || 'Pune'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Pilot:</span>
                          <span className="text-slate-700">{m.pilot_name}</span>
                        </div>
                      </div>

                      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                        <span>{m.flight_date}</span>
                        <span>{m.photos_count || m.geotagged_photos?.length || 0} photos</span>
                        <span>{m.flight_altitude_meters}m AGL</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Detailed Working Panel (8 Cols) */}
          <div className="lg:col-span-8 space-y-3.5">
            {selectedMission && selectedPlot ? (
              <div className="space-y-3.5">
                {/* Active Mission Header Box */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {selectedMission.mission_reference}
                        </span>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            selectedMission.status === 'PROCESSED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : selectedMission.status === 'IN_FLIGHT'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {selectedMission.status === 'PROCESSED'
                            ? 'VERIFIED & CERTIFIED'
                            : selectedMission.status === 'IN_FLIGHT'
                            ? 'AIRBORNE'
                            : 'SCHEDULED'}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900">
                        {selectedMission.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {selectedPlot.plot_name} · Gat {selectedPlot.survey_number} · {selectedPlot.village}, Taluk {selectedPlot.taluk} ({selectedPlot.area_acres} Acres)
                      </p>
                    </div>

                    {/* Officer Decision Buttons */}
                    <div className="flex items-center gap-2">
                      {selectedMission.status !== 'PROCESSED' ? (
                        <button
                          onClick={() => setCertifyModalOpen(true)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>Approve & Certify</span>
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Officially Certified</span>
                        </span>
                      )}

                      <button
                        onClick={handleDownloadPdf}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs transition-colors cursor-pointer"
                        title="Download Official Dossier"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Dossier</span>
                      </button>

                      <button
                        onClick={() => handleDeleteMission(selectedMission.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Mission"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* 3 Simple Tabs */}
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActiveTab('map')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          activeTab === 'map'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Aerial Map & Orthomosaic</span>
                      </button>

                      <button
                        onClick={() => setActiveTab('photos')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          activeTab === 'photos'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Photographs ({selectedMission.geotagged_photos?.length || 0})</span>
                      </button>

                      <button
                        onClick={() => setActiveTab('verification')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          activeTab === 'verification'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Crop & Boundary Verification</span>
                      </button>
                    </div>

                    <button
                      onClick={() => navigate(`/tahsildar/image-comparison?plotId=${selectedPlot.id}`)}
                      className="text-xs font-medium text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Dual-Pane Workspace</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* TAB 1: Aerial Map & Orthomosaic Overlay */}
                {activeTab === 'map' && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
                    {/* Controls Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
                      <div className="flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-slate-500" />
                        <span className="font-semibold text-slate-700">Drone Overlay Opacity:</span>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={orthoOpacity}
                          onChange={(e) => setOrthoOpacity(parseFloat(e.target.value))}
                          className="w-24 accent-emerald-600 cursor-pointer"
                        />
                        <span className="font-mono font-bold text-emerald-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                          {Math.round(orthoOpacity * 100)}%
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1.5 font-medium text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={showOrthomosaic}
                            onChange={(e) => setShowOrthomosaic(e.target.checked)}
                            className="rounded accent-emerald-600"
                          />
                          <span>Orthomosaic</span>
                        </label>

                        <label className="flex items-center gap-1.5 font-medium text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={showPlotBoundary}
                            onChange={(e) => setShowPlotBoundary(e.target.checked)}
                            className="rounded accent-emerald-600"
                          />
                          <span>Boundary</span>
                        </label>

                        <label className="flex items-center gap-1.5 font-medium text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={showPhotoPins}
                            onChange={(e) => setShowPhotoPins(e.target.checked)}
                            className="rounded accent-sky-600"
                          />
                          <span>Photo Pins</span>
                        </label>

                        <select
                          value={baseMapType}
                          onChange={(e) => setBaseMapType(e.target.value as any)}
                          className="px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-700"
                        >
                          <option value="satellite">Satellite View</option>
                          <option value="streets">OpenStreetMap</option>
                        </select>
                      </div>
                    </div>

                    {/* Interactive Leaflet Map */}
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 h-[440px] bg-slate-900">
                      <MapContainer
                        center={mapCenterZoom.center}
                        zoom={mapCenterZoom.zoom}
                        scrollWheelZoom={false}
                        style={{ height: '100%', width: '100%' }}
                      >
                        <MapController center={mapCenterZoom.center} zoom={mapCenterZoom.zoom} />

                        {baseMapType === 'satellite' ? (
                          <TileLayer
                            attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
                            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                            maxZoom={19}
                          />
                        ) : (
                          <TileLayer
                            attribution='&copy; OpenStreetMap'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            maxZoom={19}
                          />
                        )}

                        {/* Drone Orthomosaic Overlay */}
                        {showOrthomosaic && selectedMission.orthomosaic_url && selectedMission.orthomosaic_bounds && (
                          <ImageOverlay
                            url={selectedMission.orthomosaic_url}
                            bounds={selectedMission.orthomosaic_bounds}
                            opacity={orthoOpacity}
                          />
                        )}

                        {/* Cadastral Parcel Polygon */}
                        {showPlotBoundary && selectedPlot.boundary_coordinates && (
                          <Polygon
                            positions={selectedPlot.boundary_coordinates}
                            pathOptions={{
                              color: '#10b981',
                              fillColor: '#34d399',
                              fillOpacity: 0.18,
                              weight: 2.5,
                              dashArray: '4, 4',
                            }}
                          >
                            <Popup>
                              <div className="p-1 space-y-1 text-xs">
                                <div className="font-bold text-emerald-800">{selectedPlot.plot_name}</div>
                                <div>Gat No: <strong>{selectedPlot.survey_number}</strong></div>
                                <div>Area: <strong>{selectedPlot.area_acres} Acres</strong></div>
                                <div>Crop: <strong>{selectedPlot.crop_type}</strong></div>
                              </div>
                            </Popup>
                          </Polygon>
                        )}

                        {/* Geotagged Drone Photo Markers */}
                        {showPhotoPins &&
                          selectedMission.geotagged_photos?.map((photo) => (
                            <Marker
                              key={photo.id}
                              position={[photo.latitude, photo.longitude]}
                              icon={dronePinIcon}
                            >
                              <Popup>
                                <div className="p-1 text-xs max-w-xs space-y-1.5">
                                  <div className="font-bold text-sky-800 flex items-center gap-1">
                                    <Camera className="w-3.5 h-3.5" />
                                    <span>Geotagged Drone Photo</span>
                                  </div>
                                  <img
                                    src={photo.url}
                                    alt={photo.filename}
                                    className="w-full h-24 object-cover rounded border border-slate-200"
                                  />
                                  <div className="font-mono text-[10px] text-slate-700 font-semibold truncate">
                                    {photo.filename}
                                  </div>
                                  <div className="text-[10px] text-slate-500">
                                    Altitude: <strong>{photo.altitude_meters}m</strong> · RTK FIXED
                                  </div>
                                  <button
                                    onClick={() => setPreviewPhoto(photo)}
                                    className="w-full mt-1 px-2 py-1 bg-sky-600 text-white rounded text-[10px] font-semibold hover:bg-sky-700 cursor-pointer"
                                  >
                                    View Full Photo
                                  </button>
                                </div>
                              </Popup>
                            </Marker>
                          ))}
                      </MapContainer>

                      {/* Map Bottom Legend HUD */}
                      <div className="absolute bottom-3 left-3 z-[1000] bg-slate-900/85 backdrop-blur-xs text-white px-3 py-2 rounded-xl text-xs flex items-center gap-4 border border-slate-700/60 shadow-md">
                        <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                          Cadastral Boundary
                        </span>
                        <span className="flex items-center gap-1.5 text-sky-300 font-semibold">
                          <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
                          Drone Photo Point
                        </span>
                        <span className="text-slate-400 font-mono text-[11px]">
                          Altitude: {selectedMission.flight_altitude_meters}m
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: Photographs Gallery */}
                {activeTab === 'photos' && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">
                          Geotagged Drone Imagery ({selectedMission.geotagged_photos?.length || 0})
                        </h4>
                        <p className="text-xs text-slate-500">
                          Centimeter-accurate photographs recorded during the flight. Click any photo to inspect.
                        </p>
                      </div>

                      <button
                        onClick={() => setUploadPhotoModalOpen(true)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Photo</span>
                      </button>
                    </div>

                    {!selectedMission.geotagged_photos?.length ? (
                      <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500">
                        <Camera className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs font-medium">No photographs uploaded for this mission yet.</p>
                        <button
                          onClick={() => setUploadPhotoModalOpen(true)}
                          className="mt-2 text-xs font-semibold text-emerald-600 hover:underline"
                        >
                          + Upload First Photo
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {selectedMission.geotagged_photos.map((photo) => (
                          <div
                            key={photo.id}
                            onClick={() => setPreviewPhoto(photo)}
                            className="group bg-slate-50 rounded-xl border border-slate-200 overflow-hidden hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                          >
                            <div className="relative aspect-4/3 overflow-hidden bg-slate-900">
                              <img
                                src={photo.url}
                                alt={photo.filename}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              />
                              <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-slate-900/80 text-[10px] font-mono text-emerald-400 font-bold">
                                RTK FIXED
                              </div>
                              <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-slate-900/80 text-[10px] font-mono text-white">
                                {photo.altitude_meters}m
                              </div>
                            </div>

                            <div className="p-2.5 space-y-1 text-xs">
                              <div className="font-mono font-bold text-slate-800 truncate" title={photo.filename}>
                                {photo.filename}
                              </div>
                              <div className="text-[10px] text-slate-500 font-mono">
                                {photo.latitude.toFixed(5)}°N, {photo.longitude.toFixed(5)}°E
                              </div>
                              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200">
                                <span>{photo.captured_at?.slice(0, 10)}</span>
                                <span className="text-emerald-700 font-semibold group-hover:underline flex items-center gap-0.5">
                                  Preview <Eye className="w-3 h-3" />
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: Crop & Boundary Verification */}
                {activeTab === 'verification' && (
                  <div className="space-y-3.5">
                    {/* Verification Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                        <span className="text-xs font-semibold text-slate-500 block">Declared vs Observed Crop</span>
                        <div className="mt-1 flex items-baseline gap-2">
                          <span className="text-base font-bold text-slate-900">{selectedPlot.crop_type || 'Sugarcane'}</span>
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                            94% Match
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] text-slate-500">
                          Aerial spectral reflectance matches 7/12 declaration.
                        </p>
                      </div>

                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                        <span className="text-xs font-semibold text-slate-500 block">Acreage Comparison</span>
                        <div className="mt-1 flex items-baseline gap-2">
                          <span className="text-base font-bold text-slate-900">{selectedPlot.area_acres} Acres</span>
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                            -0.5% Variance
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] text-slate-500">
                          Drone photogrammetry area matches cadastral boundary within legal tolerance.
                        </p>
                      </div>

                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                        <span className="text-xs font-semibold text-slate-500 block">Boundary Encroachment</span>
                        <div className="mt-1 flex items-baseline gap-2">
                          <span className="text-base font-bold text-emerald-700">None Detected</span>
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                            4/4 Stones
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] text-slate-500">
                          All 4 boundary markers confirmed. Zero encroachment on state canal or roads.
                        </p>
                      </div>
                    </div>

                    {/* Official Endorsement Section */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">
                            Tahsildar Verification & Administrative Sign-Off
                          </h4>
                          <p className="text-xs text-slate-500">
                            Section 103 Maharashtra Land Revenue Code 1966.
                          </p>
                        </div>

                        {selectedMission.status === 'PROCESSED' ? (
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Signed & Authenticated</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => setCertifyModalOpen(true)}
                            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer"
                          >
                            Sign & Approve Dossier
                          </button>
                        )}
                      </div>

                      <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1 text-slate-700">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Authorized Pilot:</span>
                          <span className="font-medium text-slate-900">{selectedMission.pilot_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Camera Sensor:</span>
                          <span className="font-medium text-slate-900">{selectedMission.camera_sensor}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Flight Altitude:</span>
                          <span className="font-medium text-slate-900">{selectedMission.flight_altitude_meters} meters AGL</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Officer Notes:</span>
                          <span className="font-medium text-slate-900">{selectedMission.notes || 'Routine cadastral drone inspection.'}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <button
                          onClick={() => navigate('/tahsildar/crop-verification')}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:underline cursor-pointer"
                        >
                          <span>Proceed to Official Crop Verification</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={handleDownloadPdf}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:underline cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download Signed PDF</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
                <Plane className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h4 className="font-bold text-slate-800 text-sm">Select a Drone Survey Mission</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Pick a mission from the list to review the aerial map, photographs, and crop verification.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL 1: Schedule Drone Survey */}
      <Modal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        title="Schedule Drone Survey Mission"
        maxWidth="md"
      >
        <form onSubmit={handleScheduleSubmit} className="space-y-3.5 text-xs text-slate-700">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Select Cadastral Farm Plot *
            </label>
            <select
              value={schedulePlotId}
              onChange={(e) => {
                setSchedulePlotId(e.target.value);
                const pl = plots.find((p) => p.id === e.target.value);
                if (pl) setScheduleTitle(`Drone Survey — ${pl.plot_name} (Gat ${pl.survey_number})`);
              }}
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500"
            >
              {plots.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.plot_name} · Gat {p.survey_number} · {p.village}, {p.taluk} ({p.area_acres} Acres)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Mission Title / Reference *
            </label>
            <input
              type="text"
              value={scheduleTitle}
              onChange={(e) => setScheduleTitle(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Authorized Pilot *
              </label>
              <select
                value={schedulePilot}
                onChange={(e) => setSchedulePilot(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Prakash Mahadev Jadhav">Prakash Mahadev Jadhav (DGCA-MH-8419)</option>
                <option value="Sunil Dattatray Gaikwad">Sunil Dattatray Gaikwad (DGCA-MH-9102)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Flight Date *
              </label>
              <input
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Flight Altitude (AGL)
              </label>
              <select
                value={scheduleAltitude}
                onChange={(e) => setScheduleAltitude(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500"
              >
                <option value={50}>50 meters (1.0 cm/px GSD)</option>
                <option value={65}>65 meters (1.2 cm/px standard)</option>
                <option value={80}>80 meters (1.5 cm/px overview)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Camera Sensor
              </label>
              <select
                value={scheduleSensor}
                onChange={(e) => setScheduleSensor(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500"
              >
                <option value="DJI Zenmuse P1 45MP Full-Frame RGB">DJI Zenmuse P1 (45MP RGB)</option>
                <option value="MicaSense RedEdge-P Multispectral">MicaSense RedEdge-P Multispectral</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Field Directives / Notes
            </label>
            <textarea
              rows={2}
              value={scheduleNotes}
              onChange={(e) => setScheduleNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500"
              placeholder="Instructions for pilot..."
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setScheduleModalOpen(false)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs cursor-pointer"
            >
              Dispatch Survey
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Upload Drone Photos */}
      <Modal
        isOpen={uploadPhotoModalOpen}
        onClose={() => setUploadPhotoModalOpen(false)}
        title="Upload Drone Photographs"
        maxWidth="md"
      >
        <form onSubmit={handleUploadPhotoSubmit} className="space-y-3.5 text-xs text-slate-700">
          <p className="text-slate-500">
            Add high-resolution aerial photograph to mission{' '}
            <strong className="text-slate-800">{selectedMission?.mission_reference}</strong>.
          </p>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Photograph Image URL *
            </label>
            <input
              type="url"
              value={uploadPhotoUrl}
              onChange={(e) => setUploadPhotoUrl(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Filename (DJI Format)
            </label>
            <input
              type="text"
              value={uploadPhotoName}
              onChange={(e) => setUploadPhotoName(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 font-mono"
            />
          </div>

          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <span className="font-semibold text-slate-700">Auto-Tagged GPS Telemetry:</span>
            <div className="font-mono text-[11px] text-slate-600">
              Coordinates will be georeferenced directly within the plot boundaries with RTK Fixed precision.
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setUploadPhotoModalOpen(false)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs cursor-pointer"
            >
              Add Photo
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: Certify Survey Dossier */}
      <Modal
        isOpen={certifyModalOpen}
        onClose={() => setCertifyModalOpen(false)}
        title="Approve & Certify Drone Survey"
        maxWidth="md"
      >
        <form onSubmit={handleCertifySubmit} className="space-y-3.5 text-xs text-slate-700">
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1">
            <div className="font-bold text-emerald-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Magisterial Certification & Endorsement</span>
            </div>
            <p className="text-emerald-800 text-[11px] leading-relaxed">
              Authenticate this drone survey under Section 103 MLRC 1966. This attaches the orthomosaic and photos to the official revenue record.
            </p>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Tahsildar Findings & Remarks *
            </label>
            <textarea
              rows={3}
              value={certifyRemarks}
              onChange={(e) => setCertifyRemarks(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>Signing Officer:</span>
            <strong className="text-slate-800">{currentUser.full_name} (Tahsildar)</strong>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setCertifyModalOpen(false)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs cursor-pointer"
            >
              Sign & Certify
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 4: Full-Size Photo Preview */}
      {previewPhoto && (
        <Modal
          isOpen={!!previewPhoto}
          onClose={() => setPreviewPhoto(null)}
          title={`Drone Photograph: ${previewPhoto.filename}`}
          maxWidth="2xl"
        >
          <div className="space-y-3 text-xs">
            <div className="rounded-xl overflow-hidden bg-slate-900 max-h-[400px] flex items-center justify-center">
              <img
                src={previewPhoto.url}
                alt={previewPhoto.filename}
                className="max-h-[400px] w-auto object-contain mx-auto"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 block">Latitude</span>
                <span className="font-mono font-bold text-slate-800">{previewPhoto.latitude.toFixed(6)}°N</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 block">Longitude</span>
                <span className="font-mono font-bold text-slate-800">{previewPhoto.longitude.toFixed(6)}°E</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 block">Altitude</span>
                <span className="font-bold text-slate-800">{previewPhoto.altitude_meters}m AGL</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 block">GPS Fix</span>
                <span className="font-bold text-emerald-700">RTK FIXED</span>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => setPreviewPhoto(null)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
};

export default TahsildarDroneSurveyPage;
