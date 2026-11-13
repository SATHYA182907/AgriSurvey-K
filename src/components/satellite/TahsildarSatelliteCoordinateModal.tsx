/**
 * AgriSurvey AI — Tahsildar Satellite Imagery Coordinate Search Modal
 *
 * Allows Tahsildars (Revenue Officers) to enter any geographic coordinates (lat, lon),
 * find Copernicus Sentinel-2 L2A passes over that exact point (Earth Search STAC, AWS
 * Open Data) and inspect the native 10 m bands clipped to the search radius:
 * true colour, false colour (NIR) and NDVI with SCL cloud/shadow masking.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Satellite,
  Compass,
  Calendar,
  Search,
  ExternalLink,
  Layers,
  AlertTriangle,
  Loader2,
  Activity,
  PlusCircle,
  Download,
  Maximize2,
  Info,
  ArrowUp,
  Camera,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { CircleMarker } from 'react-leaflet';
import { HighResFieldMap } from './HighResFieldMap';
import { fieldOutline } from '@/services/field-surveillance.service';
import { SatelliteScene } from '@/types';
import { stacSatelliteService, StacSearchResult } from '@/services/stac.service';
import { satelliteMonitoringService } from '@/services/satellite-monitoring.service';
import { useLanguage } from '@/context/LanguageContext';
import {
  getTahsildarLabel,
  localizeNdviDensityClass,
  localizeAgronomicFinding,
  localizeSkyCondition,
  localizeJurisdictionPreset,
} from '@/lib/dashboard-localizer';
import { loadSceneClip, SceneClip, NDVI_CLASSES, NDVI_MASKED_COLOR } from '@/lib/sentinel-cog';

export interface TahsildarSatelliteCoordinateModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onRegisterMonitoringArea?: (newAreaId: string) => void;
  initialLat?: number;
  initialLon?: number;
  onSelectScene?: (scene: SatelliteScene) => void;
  embedded?: boolean;
  autoSearch?: boolean;
}

const MAHARASHTRA_JURISDICTIONS = [
  { name: 'Haveli, Pune (Wagholi Sugarcane)', lat: 18.5793, lon: 73.9812, taluk: 'Haveli' },
  { name: 'Baramati, Pune (Supae Soybean)', lat: 18.1519, lon: 74.5772, taluk: 'Baramati' },
  { name: 'Shirur, Pune (Koregaon Bhima Onion)', lat: 18.8277, lon: 74.3792, taluk: 'Shirur' },
  { name: 'Junnar, Pune (Otur Grapes & Gram)', lat: 19.2083, lon: 73.8769, taluk: 'Junnar' },
  { name: 'Indapur, Pune (Bhigwan Sugarcane)', lat: 18.1158, lon: 75.0342, taluk: 'Indapur' },
  { name: 'Daund, Pune (Patas Kharif)', lat: 18.4633, lon: 74.5804, taluk: 'Daund' },
  { name: 'Khed, Pune (Chakan Green Belts)', lat: 18.8475, lon: 73.9042, taluk: 'Khed' },
];

type ImageryMode = 'visual' | 'ndvi' | 'false_color';

const isoDate = (d: Date) => d.toISOString().split('T')[0];

const formatCoord = (lat: number, lon: number) =>
  `${Math.abs(lat).toFixed(5)}° ${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lon).toFixed(5)}° ${lon >= 0 ? 'E' : 'W'}`;

const rgb = (c: [number, number, number]) => `rgb(${c[0]}, ${c[1]}, ${c[2]})`;

const classifyNdvi = (mean: number) =>
  mean > 0.6
    ? 'Very High Density'
    : mean > 0.35
    ? 'Moderate Density'
    : mean > 0.2
    ? 'Sparse / Stressed'
    : mean > 0
    ? 'Bare Soil / Tilled'
    : 'Non-Vegetated / Water';

const clipUrlForMode = (clip: SceneClip, mode: ImageryMode) =>
  mode === 'ndvi' ? clip.ndviUrl : mode === 'false_color' ? clip.falseColorUrl : clip.trueColorUrl;

const TahsildarSatelliteCoordinateModalContent: React.FC<TahsildarSatelliteCoordinateModalProps> = ({
  onClose,
  onRegisterMonitoringArea,
  initialLat,
  initialLon,
  onSelectScene,
  embedded = false,
  autoSearch = false,
}) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const tl = (key: string) => getTahsildarLabel(key, language);

  // Coordinate Inputs
  const [rawCoordInput, setRawCoordInput] = useState<string>(
    initialLat !== undefined && initialLon !== undefined
      ? `${initialLat.toFixed(5)}, ${initialLon.toFixed(5)}`
      : '18.5793, 73.9812'
  );
  const [latitude, setLatitude] = useState<string>(
    initialLat !== undefined ? initialLat.toFixed(5) : '18.5793'
  );
  const [longitude, setLongitude] = useState<string>(
    initialLon !== undefined ? initialLon.toFixed(5) : '73.9812'
  );
  const [radiusKm, setRadiusKm] = useState<number>(1.5);

  // Search Dates & Filters (default: last 120 days up to today)
  const [startDate, setStartDate] = useState<string>(() => isoDate(new Date(Date.now() - 120 * 24 * 3600 * 1000)));
  const [endDate, setEndDate] = useState<string>(() => isoDate(new Date()));
  const [maxCloudCover, setMaxCloudCover] = useState<number>(35);

  // State
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<StacSearchResult | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchNotice, setSearchNotice] = useState<string | null>(null);
  // Location/radius the current results were searched for (inputs may change afterwards)
  const [searchedArea, setSearchedArea] = useState<{ lat: number; lon: number; radiusKm: number } | null>(null);

  // Coordinate update effect
  useEffect(() => {
    if (initialLat !== undefined && initialLon !== undefined) {
      const latStr = initialLat.toFixed(5);
      const lonStr = initialLon.toFixed(5);
      setLatitude(latStr);
      setLongitude(lonStr);
      setRawCoordInput(`${latStr}, ${lonStr}`);

      // If embedded, query new coordinates immediately
      if (embedded) {
        setIsSearching(true);
        stacSatelliteService
          .searchScenes({
            latitude: initialLat,
            longitude: initialLon,
            radiusKm,
            startDate,
            endDate,
            maxCloudCover,
            limit: 12,
          })
          .then((res) => {
            setSearchResults(res);
            setSearchedArea({ lat: initialLat, lon: initialLon, radiusKm });
            setClip(null);
            setClipSceneId(null);
            setSelectedScene(res.scenes[0] ?? null);
            setSearchError(null);
          })
          .catch((err: any) => {
            setSearchError(err.message || 'Failed to query Sentinel-2 scenes');
          })
          .finally(() => {
            setIsSearching(false);
          });
      }
    }
  }, [initialLat, initialLon]);

  // Initial Auto-Search on mount (e.g. for embedded in-page inspector)
  useEffect(() => {
    if (autoSearch && !searchResults && !isSearching) {
      const latNum = parseFloat(latitude);
      const lonNum = parseFloat(longitude);
      if (!isNaN(latNum) && !isNaN(lonNum)) {
        setIsSearching(true);
        stacSatelliteService
          .searchScenes({
            latitude: latNum,
            longitude: lonNum,
            radiusKm,
            startDate,
            endDate,
            maxCloudCover,
            limit: 12,
          })
          .then((res) => {
            setSearchResults(res);
            setSearchedArea({ lat: latNum, lon: lonNum, radiusKm });
            setClip(null);
            setClipSceneId(null);
            setSelectedScene(res.scenes[0] ?? null);
            setSearchError(null);
          })
          .catch((err: any) => {
            setSearchError(err.message || 'Failed to query Sentinel-2 scenes');
          })
          .finally(() => {
            setIsSearching(false);
          });
      }
    }
  }, [autoSearch]);

  // Active Scene Detail & Image View Mode
  const [selectedScene, setSelectedScene] = useState<SatelliteScene | null>(null);
  const [imageryMode, setImageryMode] = useState<ImageryMode>('visual');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [showCenterPin, setShowCenterPin] = useState<boolean>(false);

  // Clipped 10 m imagery for the selected scene
  const [clip, setClip] = useState<SceneClip | null>(null);
  const [clipSceneId, setClipSceneId] = useState<string | null>(null);
  const [clipError, setClipError] = useState<string | null>(null);
  const clipLoading = !!selectedScene && !!searchedArea && clipSceneId !== selectedScene.scene_id;

  useEffect(() => {
    if (!selectedScene || !searchedArea) return;
    const controller = new AbortController();
    loadSceneClip(selectedScene, { lat: searchedArea.lat, lon: searchedArea.lon }, searchedArea.radiusKm, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;
        setClip(result);
        setClipError(null);
        setClipSceneId(selectedScene.scene_id);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        console.warn('Sentinel-2 COG read failed:', err);
        const message = err instanceof Error ? err.message : String(err);
        setClip(null);
        setClipError(
          /fetch|network|cors/i.test(message)
            ? 'Could not download the 10 m band files from AWS Open Data (network or browser restriction). Showing the full-tile preview instead.'
            : message
        );
        setClipSceneId(selectedScene.scene_id);
      });
    return () => controller.abort();
  }, [selectedScene, searchedArea]);

  const handleCoordInputChange = (val: string) => {
    setRawCoordInput(val);
    const parsed = satelliteMonitoringService.parseCoordinates(val);
    if (parsed.isValid) {
      setLatitude(parsed.latitude.toString());
      setLongitude(parsed.longitude.toString());
      setSearchError(null);
    }
  };

  const handleLatChange = (latVal: string) => {
    setLatitude(latVal);
    setRawCoordInput(`${latVal}, ${longitude}`);
  };

  const handleLonChange = (lonVal: string) => {
    setLongitude(lonVal);
    setRawCoordInput(`${latitude}, ${lonVal}`);
  };

  const handlePresetSelect = (preset: typeof MAHARASHTRA_JURISDICTIONS[0]) => {
    setLatitude(preset.lat.toString());
    setLongitude(preset.lon.toString());
    setRawCoordInput(`${preset.lat}, ${preset.lon}`);
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSearchError(null);
    setSearchNotice(null);

    const latNum = parseFloat(latitude);
    const lonNum = parseFloat(longitude);

    if (isNaN(latNum) || isNaN(lonNum) || latNum < -90 || latNum > 90 || lonNum < -180 || lonNum > 180) {
      setSearchError('Please provide valid coordinates: latitude between -90 and 90, longitude between -180 and 180.');
      return;
    }
    if (startDate && endDate && startDate > endDate) {
      setSearchError('The "from" date must be on or before the "to" date.');
      return;
    }

    if (latNum < 15.0 || latNum > 22.5 || lonNum < 72.0 || lonNum > 81.0) {
      setSearchNotice(
        'Notice: Target coordinates fall outside Maharashtra State boundaries (15.0° - 22.5° N, 72.0° - 81.0° E).'
      );
    }

    setIsSearching(true);
    try {
      const res = await stacSatelliteService.searchScenes({
        latitude: latNum,
        longitude: lonNum,
        radiusKm,
        startDate,
        endDate,
        maxCloudCover,
        limit: 12,
      });

      setSearchResults(res);
      setSearchedArea({ lat: latNum, lon: lonNum, radiusKm });
      setClip(null);
      setClipSceneId(null);
      setSelectedScene(res.scenes[0] ?? null);
    } catch (err: any) {
      setSearchError(err.message || 'Failed to query Sentinel-2 scenes from STAC API');
    } finally {
      setIsSearching(false);
    }
  };

  const handleRegisterMonitoring = async () => {
    const area = searchedArea ?? { lat: parseFloat(latitude), lon: parseFloat(longitude), radiusKm };
    try {
      const created = await satelliteMonitoringService.registerMonitoringArea({
        name: `Tahsildar Investigation Area (${area.lat.toFixed(4)}, ${area.lon.toFixed(4)})`,
        latitude: area.lat,
        longitude: area.lon,
        radius_km: area.radiusKm,
        start_date: startDate,
        end_date: endDate,
        interval_days: 15,
        preferred_crop: 'Sugarcane',
      });
      if (onRegisterMonitoringArea) {
        onRegisterMonitoringArea(created.id);
      }
      alert(`✅ Monitoring Area registered successfully! Area ID: ${created.id}. Now active in 15-day satellite queue.`);
      if (!embedded && onClose) {
        onClose();
      }
    } catch (err: any) {
      alert(`Registration error: ${err.message}`);
    }
  };

  const activeClip = clip && selectedScene && clipSceneId === selectedScene.scene_id ? clip : null;
  const activeImageUrl = activeClip ? clipUrlForMode(activeClip, imageryMode) : null;
  const modeLabel =
    imageryMode === 'ndvi' ? 'NDVI' : imageryMode === 'false_color' ? 'False colour (B08-B04-B03)' : 'True colour (B04-B03-B02)';

  const handleDownloadClip = () => {
    if (!activeImageUrl || !selectedScene || !searchedArea) return;
    const a = document.createElement('a');
    a.href = activeImageUrl;
    a.download = `${selectedScene.scene_id}_${imageryMode}_${searchedArea.lat.toFixed(5)}_${searchedArea.lon.toFixed(5)}_${searchedArea.radiusKm}km.png`;
    a.click();
  };

  const modalInnerContent = (
    <div className={`bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col ${embedded ? 'w-full my-0' : 'shadow-2xl max-w-5xl w-full my-6 max-h-[92vh]'}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white px-6 py-4 flex items-center justify-between border-b border-slate-700 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
            <Satellite className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold">{tl('modalInspectorTitle')}</h2>
              {embedded && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Copernicus Sentinel-2 STAC Live Inspector
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300">
              {tl('modalInspectorSubtitle')}
            </p>
          </div>
        </div>
        {embedded ? (
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs font-semibold transition-colors cursor-pointer"
            title="Scroll up to the main GIS Map"
          >
            <ArrowUp className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Back to GIS Map</span>
          </button>
        ) : (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Scrollable / Flow Body */}
      <div className={`p-6 space-y-6 ${embedded ? '' : 'overflow-y-auto flex-1'}`}>
          {/* Coordinate & Search Parameters Panel */}
          <form onSubmit={handleSearch} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-emerald-600" />
                {tl('targetCoordinates')}
              </span>
              <span className="text-[11px] text-emerald-700 font-medium bg-emerald-100/70 px-2 py-0.5 rounded-full border border-emerald-200">
                {tl('directPasteHelp')}
              </span>
            </div>

            {/* Quick Paste Field */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                {tl('enterOrPasteCoords')}
              </label>
              <input
                type="text"
                value={rawCoordInput}
                onChange={(e) => handleCoordInputChange(e.target.value)}
                placeholder="18.5793, 73.9812"
                className="w-full px-3.5 py-2 text-sm font-mono rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-800"
              />
            </div>

            {/* Separated Numeric Lat & Lon */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">{tl('latitudeLabel')}</label>
                <input
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) => handleLatChange(e.target.value)}
                  placeholder="18.5793"
                  required
                  className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">{tl('longitudeLabel')}</label>
                <input
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(e) => handleLonChange(e.target.value)}
                  placeholder="73.9812"
                  required
                  className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-800"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-semibold text-slate-600">{tl('radiusLabel')}</label>
                  <span className="text-[11px] font-bold text-emerald-700">{radiusKm} km</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="5.0"
                  step="0.5"
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(parseFloat(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer mt-1"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-semibold text-slate-600">{tl('maxCloudLabel')}</label>
                  <span className="text-[11px] font-bold text-slate-700">{maxCloudCover}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="80"
                  step="5"
                  value={maxCloudCover}
                  onChange={(e) => setMaxCloudCover(parseInt(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer mt-1"
                />
              </div>
            </div>

            {/* Quick Location Presets in Pune Division */}
            <div>
              <span className="block text-[11px] font-semibold text-slate-500 mb-1.5">
                {tl('quickLocationsLabel')}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {MAHARASHTRA_JURISDICTIONS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => handlePresetSelect(p)}
                    className="text-[11px] px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 hover:border-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                  >
                    {localizeJurisdictionPreset(p.name, language)}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range & Fetch Button */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pt-2 border-t border-slate-200">
              <div className="flex items-center gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">{tl('fromDateLabel')}</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">{tl('toDateLabel')}</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-800"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSearching}
                className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-60"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{tl('searchingArchiveBtn')}</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>{tl('fetchImagesBtn')}</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Search Error Message */}
          {searchError && (
            <div role="alert" className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
              <span>{searchError}</span>
            </div>
          )}
          {searchNotice && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2.5">
              <Info className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <span>{searchNotice}</span>
            </div>
          )}

          {/* Satellite Imagery Results Container */}
          {searchResults && searchedArea && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Satellite className="w-5 h-5 text-emerald-600" />
                    <span>{tl('passesFoundTitle')} ({searchResults.scenes.length})</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {formatCoord(searchedArea.lat, searchedArea.lon)} · {tl('radiusLabel')}: {searchedArea.radiusKm} km
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      navigate(`/tahsildar/field-surveillance?lat=${searchedArea.lat}&lon=${searchedArea.lon}&r=${searchedArea.radiusKm}&auto=true`);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                    title="Open full 15-day crop growth timeline and phenology analysis for these coordinates"
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>{tl('open15dSurveillanceBtn')}</span>
                  </button>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{tl('liveStacStream')}</span>
                  </span>
                </div>
              </div>

              {searchResults.dataSource === 'LOCAL_INDEX' && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    The live satellite catalogue could not be reached. Only previously retrieved scenes whose footprint
                    covers this point are listed; newer passes may exist.
                  </span>
                </div>
              )}

              {searchResults.scenes.length === 0 && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs">
                  No Sentinel-2 passes with tile cloud cover below {maxCloudCover}% were found for this point between{' '}
                  {startDate} and {endDate}. Try widening the date range or raising the cloud limit (monsoon months are
                  often fully clouded).
                </div>
              )}

              {/* Main Imagery Viewer: Selected Scene & Cards */}
              {selectedScene ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* Clean High-Resolution Satellite View (7 cols) */}
                  <div className="lg:col-span-7 bg-slate-950 text-white rounded-2xl p-4 space-y-3 shadow-md border border-slate-800 flex flex-col justify-between">
                    {/* Top Mode Selector Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-1 border-b border-slate-800/80">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                          {new Date(selectedScene.acquisition_datetime).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(selectedScene.acquisition_datetime).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })} IST
                        </span>
                      </div>

                      {/* Image Mode Switcher */}
                      <div className="inline-flex rounded-xl bg-slate-900 border border-slate-800 p-1" role="group">
                        <button
                          type="button"
                          onClick={() => setImageryMode('visual')}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                            imageryMode === 'visual'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>{tl('naturalPhoto')}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setImageryMode('ndvi')}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                            imageryMode === 'ndvi'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <Activity className="w-3.5 h-3.5" />
                          <span>{tl('cropGreennessNdvi')}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setImageryMode('false_color')}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                            imageryMode === 'false_color'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{tl('plantHealthInfrared')}</span>
                        </button>
                      </div>
                    </div>

                    {/* Satellite Imagery Render Canvas */}
                    <div className="relative rounded-xl overflow-hidden aspect-square bg-slate-900 flex items-center justify-center border border-slate-800/80 shadow-inner">
                      {clipLoading && (
                        <div className="flex flex-col items-center gap-2.5 text-slate-300 text-xs p-6 text-center">
                          <Loader2 className="w-7 h-7 animate-spin text-emerald-400" />
                          <span>{tl('fetchingBands')}</span>
                        </div>
                      )}

                      {!clipLoading && activeImageUrl && (
                        <>
                          <img
                            src={activeImageUrl}
                            alt={`Sentinel-2 ${modeLabel} around ${formatCoord(searchedArea.lat, searchedArea.lon)}`}
                            className="w-full h-full object-contain"
                          />

                          {/* Optional Target Pin (only shown if user clicks "Show Target Pin") */}
                          {showCenterPin && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="flex flex-col items-center">
                                <MapPin className="w-6 h-6 text-emerald-400 drop-shadow-md animate-bounce" />
                                <span className="bg-slate-900/90 text-emerald-300 text-[10px] font-mono px-2 py-0.5 rounded-md border border-emerald-500/40 shadow-sm mt-0.5">
                                  {searchedArea.lat.toFixed(4)}°, {searchedArea.lon.toFixed(4)}°
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Zoom Fullscreen Button */}
                          <button
                            type="button"
                            onClick={() => setIsExpanded(true)}
                            className="absolute top-2.5 right-2.5 p-2 rounded-lg bg-black/60 hover:bg-black/90 text-white backdrop-blur-xs transition-colors cursor-pointer border border-white/10"
                            title="Expand full screen"
                            aria-label="Expand satellite image"
                          >
                            <Maximize2 className="w-4 h-4" />
                          </button>

                          {/* Simple bottom-left resolution pill */}
                          <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-md bg-black/70 text-[10px] font-medium text-slate-200 border border-white/10 backdrop-blur-xs">
                            {tl('tenMeterRes')} &bull; {(searchedArea.radiusKm * 2).toFixed(1)} km {tl('areaWord')}
                          </div>
                        </>
                      )}

                      {!clipLoading && !activeImageUrl && (
                        <div className="relative w-full h-full">
                          {selectedScene.thumbnail_url && (
                            <img
                              src={selectedScene.thumbnail_url}
                              alt="Sentinel-2 full tile preview"
                              className="w-full h-full object-contain opacity-80"
                            />
                          )}
                          <div className="absolute inset-x-3 bottom-3 p-2.5 rounded-lg bg-black/80 text-xs text-amber-300 flex items-start gap-2 border border-amber-500/30">
                            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                            <span>
                              {tl('bandClipUnavailable')}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* NDVI Compact Color Guide (Only shown in NDVI mode) */}
                    {imageryMode === 'ndvi' && activeClip && (
                      <div className="flex flex-wrap items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300">
                        <span className="font-semibold text-slate-400">{tl('greennessScale')}</span>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> {tl('denseCrop')}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-lime-500" /> {tl('developing')}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> {tl('sparse')}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-800" /> {tl('soilTilled')}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Image Footer Controls & Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                          selectedScene.cloud_cover_percentage <= 20
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : selectedScene.cloud_cover_percentage <= 45
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}>
                          <span>☁️ {selectedScene.cloud_cover_percentage}% {tl('clouds')}</span>
                        </span>

                        <button
                          type="button"
                          onClick={() => setShowCenterPin(!showCenterPin)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                            showCenterPin
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
                          }`}
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{showCenterPin ? tl('targetPinOn') : tl('targetPinOff')}</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        {onSelectScene && (
                          <button
                            type="button"
                            onClick={() => {
                              onSelectScene(selectedScene);
                              if (embedded) {
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              } else {
                                onClose?.();
                              }
                            }}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer transition-colors"
                            title="Overlay this satellite scene footprint onto the GIS Crop Survey map"
                          >
                            <Layers className="w-3.5 h-3.5" />
                            <span>{tl('overlayGisMap')}</span>
                          </button>
                        )}

                        {activeImageUrl && (
                          <button
                            type="button"
                            onClick={handleDownloadClip}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-medium border border-slate-800 inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>{tl('savePhoto')}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Scene Inspection & Crop Intelligence (5 cols) */}
                  <div className="lg:col-span-5 space-y-4">
                    {/* Card 1: Pass Summary */}
                    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3.5">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                            <Satellite className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm">{tl('passSummaryTitle')}</h4>
                            <span className="text-[11px] text-slate-500">Copernicus Sentinel-2</span>
                          </div>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {tl('directStacBadge')}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5 text-xs">
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                          <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">{tl('passDate')}</span>
                          <span className="font-bold text-slate-900 text-sm block">
                            {new Date(selectedScene.acquisition_datetime).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {new Date(selectedScene.acquisition_datetime).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })} IST
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                          <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">{tl('skyCondition')}</span>
                          <span className="font-bold text-slate-900 text-sm block">
                            {localizeSkyCondition(
                              selectedScene.cloud_cover_percentage <= 15
                                ? 'Clear Sky'
                                : selectedScene.cloud_cover_percentage <= 40
                                ? 'Partly Cloudy'
                                : 'High Cloud Cover',
                              language
                            )}
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium">
                            {selectedScene.cloud_cover_percentage}% {tl('maxCloudLabel')}
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                          <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">{tl('areaSurveyed')}</span>
                          <span className="font-bold text-slate-900 text-sm block">
                            {(searchedArea.radiusKm * 2).toFixed(1)} km {tl('perimeter')}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {tl('radiusAroundCenter')}: {searchedArea.radiusKm} km
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                          <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">{tl('groundResolution')}</span>
                          <span className="font-bold text-slate-900 text-sm block">
                            {tl('tenMeters')}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {tl('highPrecisionMultispectral')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card 2: Crop Health & Greenness */}
                    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3.5">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                            <Activity className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm">{tl('cropGreennessHealth')}</h4>
                            <span className="text-[11px] text-slate-500">Normalized Difference Vegetation Index (NDVI)</span>
                          </div>
                        </div>
                      </div>

                      {clipLoading && (
                        <div className="p-6 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                          <span>{tl('analyzingBands')}</span>
                        </div>
                      )}

                      {!clipLoading && activeClip && activeClip.stats.ndviMean !== null && (
                        <div className="space-y-3">
                          {/* Big Score Display */}
                          <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
                            <div>
                              <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider block">
                                {tl('greennessScore')}
                              </span>
                              <div className="text-2xl font-extrabold text-emerald-950 font-mono mt-0.5">
                                {activeClip.stats.ndviMean.toFixed(2)}
                              </div>
                            </div>
                            <div className="text-right">
                              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                                activeClip.stats.ndviMean > 0.5
                                  ? 'bg-emerald-600 text-white'
                                  : activeClip.stats.ndviMean > 0.35
                                  ? 'bg-green-600 text-white'
                                  : activeClip.stats.ndviMean > 0.2
                                  ? 'bg-amber-500 text-slate-950'
                                  : 'bg-slate-600 text-white'
                              }`}>
                                {localizeNdviDensityClass(classifyNdvi(activeClip.stats.ndviMean), language)}
                              </span>
                              <span className="text-[10px] text-slate-500 block mt-1">
                                {tl('scaleZeroToOne')}
                              </span>
                            </div>
                          </div>

                          {/* Visual Spectrum Bar */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] font-semibold text-slate-500">
                              <span>{tl('soilLabel')}</span>
                              <span>{tl('emergingLabel')}</span>
                              <span>{tl('denseCropLabel')}</span>
                            </div>
                            <div className="h-2 rounded-full bg-gradient-to-r from-amber-700 via-yellow-400 to-emerald-600 relative overflow-hidden">
                              <div
                                className="absolute top-0 bottom-0 w-2.5 bg-white ring-2 ring-slate-900 rounded-full"
                                style={{
                                  left: `${Math.min(98, Math.max(2, ((activeClip.stats.ndviMean + 0.05) / 0.85) * 100))}%`,
                                }}
                              />
                            </div>
                          </div>

                          {/* Plain Language Agronomic Interpretation */}
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 leading-relaxed">
                            <span className="font-bold text-slate-900 block mb-0.5">{tl('agronomicFinding')}</span>
                            <p className="text-[11px] text-slate-600">
                              {localizeAgronomicFinding(
                                activeClip.stats.ndviMean > 0.5
                                  ? 'Vigorous crop canopy with dense foliage detected across this parcel zone.'
                                  : activeClip.stats.ndviMean > 0.35
                                  ? 'Active vegetative development with healthy crop ground cover.'
                                  : activeClip.stats.ndviMean > 0.2
                                  ? 'Early vegetative emergence, sparse cover, or light moisture stress.'
                                  : 'Predominantly bare ground, harvested fields, or tilled soil.',
                                language
                              )}
                            </p>
                          </div>
                        </div>
                      )}

                      {!clipLoading && (!activeClip || activeClip.stats.ndviMean === null) && (
                        <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-500">
                          {tl('clearIndexUnavailable') || 'Clear vegetation index unavailable for this pass date. Please choose a clearer pass below.'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Gallery of all scenes found in date range */}
              {searchResults.scenes.length > 0 && (
                <div className="pt-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{tl('selectOtherPassDates')}</span>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
                    {searchResults.scenes.map((scene) => {
                      const isSelected = scene.scene_id === selectedScene?.scene_id;
                      return (
                        <button
                          type="button"
                          key={scene.id}
                          onClick={() => setSelectedScene(scene)}
                          aria-pressed={isSelected}
                          className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-600/30 shadow-xs'
                              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <div className="aspect-square rounded-lg overflow-hidden bg-slate-100 mb-1.5 relative">
                            {scene.thumbnail_url ? (
                              <img src={scene.thumbnail_url} alt={`Tile preview ${scene.scene_id}`} className="w-full h-full object-cover" loading="lazy" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">{tl('noPreview')}</div>
                            )}
                            <span className="absolute bottom-1 right-1 text-[9px] bg-black/70 text-white font-mono px-1 rounded">
                              {scene.cloud_cover_percentage}% {tl('maxCloudLabel')}
                            </span>
                          </div>
                          <div className="text-[11px] font-bold text-slate-900 truncate">
                            {new Date(scene.acquisition_datetime).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {isSelected ? tl('activePassBadge') : tl('clickToView')}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Section / Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>
            {searchedArea
              ? `${formatCoord(searchedArea.lat, searchedArea.lon)} · ${tl('radiusLabel')}: ${searchedArea.radiusKm} km`
              : tl('targetCoordinates')}
          </span>
          {embedded ? (
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span>{tl('backToGisMap')}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-semibold transition-colors cursor-pointer"
            >
              {tl('closeModal')}
            </button>
          )}
        </div>
      </div>
  );

  return (
    <>
      {embedded ? (
        modalInnerContent
      ) : (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          {modalInnerContent}
        </div>
      )}

      {/* Expanded Satellite Image */}
      {isExpanded && activeImageUrl && (
        <div
          className="fixed inset-0 z-60 bg-black/85 flex items-center justify-center p-4"
          onClick={() => setIsExpanded(false)}
        >
          <div className="relative max-w-[90vmin] w-full bg-black rounded-2xl overflow-hidden shadow-2xl p-2 border border-slate-700">
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/60 rounded-full text-white hover:bg-black cursor-pointer"
              aria-label="Close expanded image"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={activeImageUrl} alt={`Expanded Sentinel-2 ${modeLabel}`} className="w-full h-auto rounded-xl" />
            <p className="text-[11px] text-slate-300 px-2 py-1.5 font-mono">
              {selectedScene?.scene_id} · {modeLabel} · acquired {selectedScene?.acquisition_datetime.slice(0, 10)}
            </p>
          </div>
        </div>
      )}
    </>
  );
};

// Embedded In-Page Inspector for GIS Crop Survey Page
export const SatelliteCoordinateInspector: React.FC<TahsildarSatelliteCoordinateModalProps> = (props) => (
  <TahsildarSatelliteCoordinateModalContent {...props} embedded={props.embedded ?? true} />
);

// Mount the modal content only while open
export const TahsildarSatelliteCoordinateModal: React.FC<TahsildarSatelliteCoordinateModalProps> = (props) =>
  props.isOpen ? <TahsildarSatelliteCoordinateModalContent {...props} embedded={false} /> : null;

export const SatelliteCoordinateModal = TahsildarSatelliteCoordinateModal;
