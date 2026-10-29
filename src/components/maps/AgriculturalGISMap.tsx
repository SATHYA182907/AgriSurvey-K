/**
 * AgriSurvey AI — Comprehensive Agricultural GIS Map Component
 * 
 * Capabilities:
 * 1. Maharashtra district and taluka navigation with smooth coordinate panning.
 * 2. Basemap layer switching: OpenStreetMap vector vs. High-resolution Satellite Imagery.
 * 3. Interactive farm plot boundary polygon rendering with geodesic measurements (m², ha, acres, perimeter).
 * 4. Polygon drawing mode for custom boundary delineation with real-time area calculation.
 * 5. GeoJSON import and export.
 * 6. Multi-layer toggles:
 *    - Cadastral / Verified Farm Plot Boundaries
 *    - Real Sentinel-2 Satellite Scene Footprints
 *    - Real False-Color NDVI Spectral Raster Overlay with Opacity Slider
 *    - Drone RTK Orthomosaic Imagery Overlay with Opacity Slider
 *    - Geotagged Drone Photograph Pins
 *    - Field Surveyor Inspection Points
 * 7. Interactive inspection popups with direct workflow actions.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polygon,
  ImageOverlay,
  Circle,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import {
  Layers,
  MapPin,
  Sparkles,
  CloudSun,
  Activity,
  Download,
  Upload,
  Plus,
  Check,
  X,
  Eye,
  Sliders,
  Plane,
  Camera,
  Navigation,
  FileText,
  ShieldCheck,
  Maximize2,
} from 'lucide-react';
import {
  FarmPlot,
  SatelliteScene,
  VegetationIndexObservation,
  WeatherObservation,
  DroneMissionRecord,
  MobileFieldSurveyRecord,
} from '@/types';
import {
  computeGeodesicMeasurements,
  MAHARASHTRA_DISTRICTS,
  MaharashtraDistrict,
} from '@/lib/geospatial';
import { plotService } from '@/services/plot.service';

// Fix Leaflet icons in Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Drone Photo Icon
const dronePhotoIcon = new L.DivIcon({
  className: 'custom-drone-icon',
  html: `<div style="background-color: #0284c7; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// Custom Field Survey Icon
const fieldSurveyIcon = new L.DivIcon({
  className: 'custom-survey-icon',
  html: `<div style="background-color: #16a34a; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// Map Controller for smooth flyTo
function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
}

// Drawing Click Listener
function DrawClickListener({
  isDrawing,
  onAddPoint,
}: {
  isDrawing: boolean;
  onAddPoint: (point: [number, number]) => void;
}) {
  useMapEvents({
    click(e) {
      if (isDrawing) {
        onAddPoint([e.latlng.lat, e.latlng.lng]);
      }
    },
  });
  return null;
}

export interface AgriculturalGISMapProps {
  plots: FarmPlot[];
  selectedPlotId?: string;
  onSelectPlot?: (plot: FarmPlot) => void;
  activeNdviObservation?: VegetationIndexObservation | null;
  activeWeather?: WeatherObservation | null;
  activeDroneMission?: DroneMissionRecord | null;
  activeSceneFootprint?: SatelliteScene | null;
  fieldSurveys?: MobileFieldSurveyRecord[];
  height?: string;
  onOpenSatelliteSearch?: (plot: FarmPlot) => void;
  onOpenWeatherDrawer?: (plot: FarmPlot) => void;
  onOpenIntelligenceModal?: (plot: FarmPlot) => void;
  onOpenFieldSurveyModal?: (plot: FarmPlot) => void;
  onExportReport?: (plot: FarmPlot) => void;
}

export const AgriculturalGISMap: React.FC<AgriculturalGISMapProps> = ({
  plots,
  selectedPlotId,
  onSelectPlot,
  activeNdviObservation,
  activeWeather,
  activeDroneMission,
  activeSceneFootprint,
  fieldSurveys = [],
  height = '620px',
  onOpenSatelliteSearch,
  onOpenWeatherDrawer,
  onOpenIntelligenceModal,
  onOpenFieldSurveyModal,
  onExportReport,
}) => {
  // Basemap State
  const [basemapType, setBasemapType] = useState<'streets' | 'satellite'>('satellite');

  // Selected administrative region
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('pune');
  const [selectedTalukId, setSelectedTalukId] = useState<string>('haveli');

  // Map viewport center & zoom
  const currentDistrict = MAHARASHTRA_DISTRICTS.find((d) => d.id === selectedDistrictId) || MAHARASHTRA_DISTRICTS[0];
  const [mapCenter, setMapCenter] = useState<[number, number]>([18.5793, 73.9824]);
  const [mapZoom, setMapZoom] = useState<number>(14);

  // Layer Toggles
  const [showPlotBoundaries, setShowPlotBoundaries] = useState<boolean>(true);
  const [showSatelliteFootprint, setShowSatelliteFootprint] = useState<boolean>(true);
  const [showNdviRaster, setShowNdviRaster] = useState<boolean>(true);
  const [ndviOpacity, setNdviOpacity] = useState<number>(0.85);
  const [showDroneOrthomosaic, setShowDroneOrthomosaic] = useState<boolean>(true);
  const [droneOpacity, setDroneOpacity] = useState<number>(0.9);
  const [showDronePhotos, setShowDronePhotos] = useState<boolean>(true);
  const [showFieldSurveys, setShowFieldSurveys] = useState<boolean>(true);

  // Polygon Drawing Mode
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [drawingPoints, setDrawingPoints] = useState<[number, number][]>([]);
  const [newPlotName, setNewPlotName] = useState<string>('');
  const [newPlotSurveyNo, setNewPlotSurveyNo] = useState<string>('');

  // Currently focused plot
  const activePlot = plots.find((p) => p.id === selectedPlotId) || plots[0];

  // Pan to plot when selected
  useEffect(() => {
    if (activePlot && activePlot.boundary_coordinates.length > 0) {
      const measurements = computeGeodesicMeasurements(activePlot.boundary_coordinates);
      setMapCenter(measurements.centroid);
      setMapZoom(16);
    }
  }, [selectedPlotId]);

  // Handle District Change
  const handleDistrictChange = (distId: string) => {
    setSelectedDistrictId(distId);
    const dist = MAHARASHTRA_DISTRICTS.find((d) => d.id === distId);
    if (dist) {
      setSelectedTalukId(dist.talukas[0]?.id || '');
      setMapCenter(dist.center);
      setMapZoom(11);
    }
  };

  // Handle Taluka Change
  const handleTalukaChange = (talukId: string) => {
    setSelectedTalukId(talukId);
    const taluk = currentDistrict.talukas.find((t) => t.id === talukId);
    if (taluk) {
      setMapCenter(taluk.center);
      setMapZoom(13);
    }
  };

  // Drawing points management
  const handleAddDrawingPoint = (point: [number, number]) => {
    setDrawingPoints((prev) => [...prev, point]);
  };

  const handleClearDrawing = () => {
    setDrawingPoints([]);
    setIsDrawing(false);
  };

  // Save drawn polygon as new Farm Plot
  const handleSaveDrawnPlot = async () => {
    if (drawingPoints.length < 3) {
      alert('Please click at least 3 points on the map to define a valid farm plot polygon.');
      return;
    }
    if (!newPlotName.trim() || !newPlotSurveyNo.trim()) {
      alert('Please enter a Plot Name and Survey Number.');
      return;
    }

    try {
      const created = await plotService.createPlot({
        propertyId: 'prop-01',
        farmerId: 'usr-farmer-01',
        plotName: newPlotName.trim(),
        surveyNumber: newPlotSurveyNo.trim(),
        village: activePlot?.village || 'Wagholi',
        taluk: currentDistrict.talukas.find((t) => t.id === selectedTalukId)?.name || 'Haveli',
        district: currentDistrict.name,
        coordinates: drawingPoints,
        cropType: 'Sugarcane',
        isCadastralVerified: false,
      });

      alert(`Plot created successfully! Area: ${created.area_acres} Acres (${created.area_hectares} Ha). Ref: ${created.plot_reference}`);
      handleClearDrawing();
      if (onSelectPlot) onSelectPlot(created);
    } catch (err: any) {
      alert(`Error creating plot: ${err.message}`);
    }
  };

  // File import GeoJSON
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleGeoJsonUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const imported = await plotService.importGeoJsonPlot(text, {
          propertyId: 'prop-01',
          farmerId: 'usr-farmer-01',
          plotName: file.name.replace(/\.[^/.]+$/, ''),
          surveyNumber: 'Imported-GeoJSON',
          village: activePlot?.village || 'Wagholi',
          taluk: activePlot?.taluk || 'Haveli',
          district: activePlot?.district || 'Pune',
        });
        alert(`GeoJSON plot imported successfully! Measured Area: ${imported.area_acres} Acres.`);
        if (onSelectPlot) onSelectPlot(imported);
      } catch (err: any) {
        alert(`GeoJSON import error: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  // Measurements for drawn polygon in progress
  const drawnMeasurements = drawingPoints.length >= 3 ? computeGeodesicMeasurements(drawingPoints) : null;

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-white">
      {/* Top Map Toolbar */}
      <div className="bg-slate-900 text-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs z-20 relative">
        {/* Administrative Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5" />
            Maharashtra:
          </span>

          <select
            value={selectedDistrictId}
            onChange={(e) => handleDistrictChange(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-md px-2.5 py-1 text-slate-200 focus:outline-hidden focus:border-emerald-500"
          >
            {MAHARASHTRA_DISTRICTS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.nameMarathi})
              </option>
            ))}
          </select>

          <select
            value={selectedTalukId}
            onChange={(e) => handleTalukaChange(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-md px-2.5 py-1 text-slate-200 focus:outline-hidden focus:border-emerald-500"
          >
            {currentDistrict.talukas.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.nameMarathi})
              </option>
            ))}
          </select>

          {/* Plot Quick-Picker */}
          <span className="text-slate-500 ml-1">|</span>
          <span className="text-slate-400">Plot:</span>
          <select
            value={activePlot?.id || ''}
            onChange={(e) => {
              const p = plots.find((item) => item.id === e.target.value);
              if (p && onSelectPlot) onSelectPlot(p);
            }}
            className="bg-emerald-950/60 border border-emerald-600/50 rounded-md px-2.5 py-1 text-emerald-200 font-medium focus:outline-hidden"
          >
            {plots.map((p) => (
              <option key={p.id} value={p.id}>
                {p.plot_name} — Survey {p.survey_number} ({p.area_acres} Ac)
              </option>
            ))}
          </select>
        </div>

        {/* Basemap & Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Basemap switcher */}
          <div className="inline-flex rounded-lg border border-slate-700 p-0.5 bg-slate-800">
            <button
              onClick={() => setBasemapType('satellite')}
              className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium transition-all ${
                basemapType === 'satellite' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Satellite
            </button>
            <button
              onClick={() => setBasemapType('streets')}
              className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium transition-all ${
                basemapType === 'streets' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              OSM Streets
            </button>
          </div>

          {/* GeoJSON Import / Export */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleGeoJsonUpload}
            accept=".geojson,.json"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Import GeoJSON Polygon"
            className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 border border-slate-700"
          >
            <Upload className="w-3 h-3 text-emerald-400" />
            <span className="hidden sm:inline">Import GeoJSON</span>
          </button>

          {activePlot && (
            <button
              onClick={() => {
                const geoJsonStr = plotService.exportPlotGeoJson(activePlot);
                const blob = new Blob([geoJsonStr], { type: 'application/geo+json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${activePlot.plot_reference}.geojson`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              title="Export Current Plot as GeoJSON"
              className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 border border-slate-700"
            >
              <Download className="w-3 h-3 text-cyan-400" />
              <span className="hidden sm:inline">Export GeoJSON</span>
            </button>
          )}

          {/* Draw Polygon Toggle */}
          <button
            onClick={() => setIsDrawing((prev) => !prev)}
            className={`px-2.5 py-1 rounded-md flex items-center gap-1 font-medium transition-all ${
              isDrawing
                ? 'bg-amber-500 text-slate-900 ring-2 ring-amber-300'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isDrawing ? 'Drawing Active' : 'Draw Plot'}</span>
          </button>
        </div>
      </div>

      {/* Drawing Mode Banner if active */}
      {isDrawing && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex flex-wrap items-center justify-between text-xs text-amber-900 z-20 relative">
          <div className="flex items-center gap-2">
            <span className="font-bold flex items-center gap-1 text-amber-800">
              <MapPin className="w-3.5 h-3.5 text-amber-600" />
              Click on the map to place plot boundary vertices:
            </span>
            <span className="bg-amber-200/80 px-2 py-0.5 rounded font-mono font-bold">
              {drawingPoints.length} vertices
            </span>
            {drawnMeasurements && (
              <span className="text-emerald-800 font-bold ml-2">
                Area: {drawnMeasurements.areaAcres} Acres ({drawnMeasurements.areaHectares} Ha / {drawnMeasurements.areaSquareMeters.toLocaleString()} m²) | Perim: {drawnMeasurements.perimeterMeters}m
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-1 sm:mt-0">
            <input
              type="text"
              placeholder="Plot Name (e.g. Gat 142 Cane)"
              value={newPlotName}
              onChange={(e) => setNewPlotName(e.target.value)}
              className="px-2 py-0.5 bg-white border border-amber-300 rounded text-xs focus:outline-hidden"
            />
            <input
              type="text"
              placeholder="Survey No (e.g. 142/2A)"
              value={newPlotSurveyNo}
              onChange={(e) => setNewPlotSurveyNo(e.target.value)}
              className="px-2 py-0.5 bg-white border border-amber-300 rounded text-xs w-28 focus:outline-hidden"
            />
            <button
              onClick={handleSaveDrawnPlot}
              className="px-2.5 py-0.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded font-semibold flex items-center gap-1 shadow-xs"
            >
              <Check className="w-3 h-3" /> Save Plot
            </button>
            <button
              onClick={handleClearDrawing}
              className="px-2 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Cancel
            </button>
          </div>
        </div>
      )}

      {/* Main Map Canvas */}
      <div style={{ height }} className="relative z-10">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <MapController center={mapCenter} zoom={mapZoom} />
          <DrawClickListener isDrawing={isDrawing} onAddPoint={handleAddDrawingPoint} />

          {/* Base Tile Layer */}
          {basemapType === 'satellite' ? (
            <TileLayer
              attribution='&copy; <a href="https://www.esri.com/">Esri World Imagery</a>'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxZoom={19}
            />
          ) : (
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
            />
          )}

          {/* 1. Sentinel-2 Satellite Scene Footprint Overlay */}
          {showSatelliteFootprint && activeSceneFootprint && activeSceneFootprint.footprint_coordinates.length > 0 && (
            <Polygon
              positions={activeSceneFootprint.footprint_coordinates}
              pathOptions={{
                color: '#0284c7', // Sky Blue
                fillColor: '#38bdf8',
                fillOpacity: 0.08,
                weight: 1.5,
                dashArray: '5, 5',
              }}
            >
              <Popup>
                <div className="p-1 text-xs space-y-1">
                  <div className="font-bold text-sky-900">Sentinel-2 Scene Footprint</div>
                  <div className="text-slate-600">Scene ID: {activeSceneFootprint.scene_id}</div>
                  <div className="text-slate-600">
                    Acquisition: {new Date(activeSceneFootprint.acquisition_datetime).toLocaleDateString()}
                  </div>
                  <div className="text-slate-600">
                    Cloud Cover: {activeSceneFootprint.cloud_cover_percentage}%
                  </div>
                </div>
              </Popup>
            </Polygon>
          )}

          {/* 2. Real NDVI False-Color Raster Heatmap Overlay */}
          {showNdviRaster && activeNdviObservation?.raster_data_url && (
            <ImageOverlay
              url={activeNdviObservation.raster_data_url}
              bounds={activeNdviObservation.raster_bounds}
              opacity={ndviOpacity}
            />
          )}

          {/* 3. Drone High-Res Orthomosaic Overlay */}
          {showDroneOrthomosaic && activeDroneMission?.orthomosaic_url && activeDroneMission.orthomosaic_bounds && (
            <ImageOverlay
              url={activeDroneMission.orthomosaic_url}
              bounds={activeDroneMission.orthomosaic_bounds}
              opacity={droneOpacity}
            />
          )}

          {/* 4. Registered Farm Plot Polygons */}
          {showPlotBoundaries &&
            plots.map((plot) => {
              const isSelected = plot.id === activePlot?.id;
              const color = isSelected ? '#15803d' : '#2563eb';
              const fillColor = isSelected ? '#22c55e' : '#60a5fa';

              return (
                <Polygon
                  key={plot.id}
                  positions={plot.boundary_coordinates}
                  pathOptions={{
                    color,
                    fillColor,
                    fillOpacity: isSelected ? 0.28 : 0.15,
                    weight: isSelected ? 3 : 1.5,
                  }}
                  eventHandlers={{
                    click: () => onSelectPlot && onSelectPlot(plot),
                  }}
                >
                  <Popup>
                    <div className="p-1.5 text-xs max-w-xs space-y-2">
                      <div className="flex items-center justify-between border-b pb-1">
                        <span className="font-bold text-slate-900">{plot.plot_name}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            plot.is_cadastral_verified
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {plot.is_cadastral_verified ? 'Verified Cadastral' : 'Self-Delineated'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-600">
                        <div>
                          Survey No: <span className="font-semibold text-slate-900">{plot.survey_number}</span>
                        </div>
                        <div>
                          Crop: <span className="font-semibold text-emerald-700">{plot.crop_type || 'Sugarcane'}</span>
                        </div>
                        <div>
                          Area: <span className="font-bold text-slate-900">{plot.area_acres} Acres</span>
                        </div>
                        <div>
                          Metric: <span className="font-mono text-slate-700">{plot.area_hectares} Ha</span>
                        </div>
                        <div>
                          Perimeter: <span className="font-mono text-slate-700">{plot.perimeter_meters}m</span>
                        </div>
                        <div>
                          Latest NDVI: <span className="font-bold text-emerald-600">{plot.latest_ndvi ?? '0.68'}</span>
                        </div>
                      </div>

                      {/* Interactive Action Buttons */}
                      <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1">
                        {onOpenSatelliteSearch && (
                          <button
                            onClick={() => onOpenSatelliteSearch(plot)}
                            className="px-2 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded text-[10px] font-medium flex items-center gap-1"
                          >
                            <Sparkles className="w-3 h-3 text-sky-600" /> Sentinel-2 Search
                          </button>
                        )}
                        {onOpenWeatherDrawer && (
                          <button
                            onClick={() => onOpenWeatherDrawer(plot)}
                            className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded text-[10px] font-medium flex items-center gap-1"
                          >
                            <CloudSun className="w-3 h-3 text-amber-600" /> Live Weather
                          </button>
                        )}
                        {onOpenIntelligenceModal && (
                          <button
                            onClick={() => onOpenIntelligenceModal(plot)}
                            className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded text-[10px] font-medium flex items-center gap-1"
                          >
                            <Activity className="w-3 h-3 text-emerald-600" /> AI Crop & Yield
                          </button>
                        )}
                        {onExportReport && (
                          <button
                            onClick={() => onExportReport(plot)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-medium flex items-center gap-1"
                          >
                            <FileText className="w-3 h-3 text-slate-600" /> Download PDF
                          </button>
                        )}
                      </div>
                    </div>
                  </Popup>
                </Polygon>
              );
            })}

          {/* 5. In-Progress Polygon Drawing Render */}
          {isDrawing && drawingPoints.length > 0 && (
            <>
              {drawingPoints.map((pt, i) => (
                <Marker key={i} position={pt}>
                  <Popup>Vertex {i + 1}</Popup>
                </Marker>
              ))}
              {drawingPoints.length >= 3 && (
                <Polygon
                  positions={drawingPoints}
                  pathOptions={{
                    color: '#d97706',
                    fillColor: '#f59e0b',
                    fillOpacity: 0.35,
                    weight: 2,
                    dashArray: '4, 4',
                  }}
                />
              )}
            </>
          )}

          {/* 6. Geotagged Drone Photograph Capture Points */}
          {showDronePhotos &&
            activeDroneMission?.geotagged_photos.map((photo) => (
              <Marker
                key={photo.id}
                position={[photo.latitude, photo.longitude]}
                icon={dronePhotoIcon}
              >
                <Popup>
                  <div className="p-1 text-xs max-w-xs space-y-1">
                    <div className="font-bold text-sky-800 flex items-center gap-1">
                      <Camera className="w-3 h-3" /> Geotagged Drone Photo
                    </div>
                    <img
                      src={photo.url}
                      alt={photo.filename}
                      className="w-full h-24 object-cover rounded mt-1 border border-slate-200"
                    />
                    <div className="text-[10px] text-slate-500 font-mono mt-1">
                      {photo.filename} • Alt: {photo.altitude_meters}m
                    </div>
                    <div className="text-[10px] text-slate-400">
                      GPS: {photo.latitude.toFixed(5)}°N, {photo.longitude.toFixed(5)}°E
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

          {/* 7. Field Surveyor Observation Points */}
          {showFieldSurveys &&
            fieldSurveys.map((survey) => (
              <React.Fragment key={survey.id}>
                <Marker position={[survey.latitude, survey.longitude]} icon={fieldSurveyIcon}>
                  <Popup>
                    <div className="p-1 text-xs max-w-xs space-y-1">
                      <div className="font-bold text-emerald-800 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> Ground Field Survey
                      </div>
                      <div className="font-semibold text-slate-800">
                        Crop: {survey.crop_type} ({survey.growth_stage})
                      </div>
                      <div className="text-slate-600">Surveyor: {survey.surveyor_name}</div>
                      <div className="text-slate-600">Soil: {survey.soil_condition} | Irrigation: {survey.irrigation_type}</div>
                      <div className="text-slate-500 italic text-[10px] mt-1">"{survey.field_notes}"</div>
                      <div className="text-[10px] text-emerald-700 font-mono mt-1">
                        GPS Accuracy: ±{survey.gps_accuracy_meters}m
                      </div>
                    </div>
                  </Popup>
                </Marker>
                {/* Accuracy Circle */}
                <Circle
                  center={[survey.latitude, survey.longitude]}
                  radius={survey.gps_accuracy_meters}
                  pathOptions={{
                    color: '#16a34a',
                    fillColor: '#22c55e',
                    fillOpacity: 0.15,
                    weight: 1,
                  }}
                />
              </React.Fragment>
            ))}
        </MapContainer>
      </div>

      {/* Floating Layer Controls & Legend Panel (Bottom-Left) */}
      <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-slate-200 p-2.5 z-20 text-xs max-w-xs space-y-2">
        <div className="flex items-center justify-between font-bold text-slate-800 border-b pb-1">
          <span className="flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-emerald-600" /> Active GIS Layers
          </span>
          <span className="text-[10px] text-slate-400">EPSG:4326</span>
        </div>

        <div className="space-y-1.5 text-[11px] text-slate-700">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              Farm Plot Boundaries
            </span>
            <input
              type="checkbox"
              checked={showPlotBoundaries}
              onChange={(e) => setShowPlotBoundaries(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
              Sentinel-2 Footprint
            </span>
            <input
              type="checkbox"
              checked={showSatelliteFootprint}
              onChange={(e) => setShowSatelliteFootprint(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500"
            />
          </label>

          <div className="space-y-1">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-yellow-400 to-green-600" />
                NDVI Raster Heatmap
              </span>
              <input
                type="checkbox"
                checked={showNdviRaster}
                onChange={(e) => setShowNdviRaster(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
            </label>
            {showNdviRaster && (
              <div className="flex items-center gap-2 pl-4">
                <Sliders className="w-3 h-3 text-slate-400" />
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={ndviOpacity}
                  onChange={(e) => setNdviOpacity(parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg cursor-pointer"
                />
                <span className="text-[10px] text-slate-500 font-mono w-6">{Math.round(ndviOpacity * 100)}%</span>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="flex items-center gap-1.5">
                <Plane className="w-3 h-3 text-sky-600" />
                Drone Orthomosaic
              </span>
              <input
                type="checkbox"
                checked={showDroneOrthomosaic}
                onChange={(e) => setShowDroneOrthomosaic(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
            </label>
            {showDroneOrthomosaic && activeDroneMission?.orthomosaic_url && (
              <div className="flex items-center gap-2 pl-4">
                <Sliders className="w-3 h-3 text-slate-400" />
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={droneOpacity}
                  onChange={(e) => setDroneOpacity(parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg cursor-pointer"
                />
                <span className="text-[10px] text-slate-500 font-mono w-6">{Math.round(droneOpacity * 100)}%</span>
              </div>
            )}
          </div>

          <label className="flex items-center justify-between cursor-pointer">
            <span className="flex items-center gap-1.5">
              <Camera className="w-3 h-3 text-sky-600" />
              Geotagged Drone Pins
            </span>
            <input
              type="checkbox"
              checked={showDronePhotos}
              onChange={(e) => setShowDronePhotos(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              Field Surveyor Points
            </span>
            <input
              type="checkbox"
              checked={showFieldSurveys}
              onChange={(e) => setShowFieldSurveys(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500"
            />
          </label>
        </div>

        {/* NDVI Scientific Legend */}
        {showNdviRaster && (
          <div className="pt-2 border-t border-slate-100">
            <div className="text-[10px] font-bold text-slate-500 mb-1">NDVI Scale:</div>
            <div className="h-2 rounded-full w-full bg-gradient-to-r from-amber-700 via-yellow-400 via-lime-400 to-green-800" />
            <div className="flex justify-between text-[9px] text-slate-400 font-mono mt-0.5">
              <span>0.1 Bare</span>
              <span>0.4 Moderate</span>
              <span>0.8+ Dense</span>
            </div>
          </div>
        )}
      </div>

      {/* Floating Active Plot HUD (Bottom-Right) */}
      {activePlot && (
        <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-slate-200 p-3 z-20 text-xs max-w-sm hidden md:block">
          <div className="flex items-center justify-between font-bold text-slate-900 border-b pb-1.5">
            <span className="truncate">{activePlot.plot_name}</span>
            <span className="text-emerald-700 font-bold ml-2 shrink-0">{activePlot.area_acres} Acres</span>
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-slate-600 mt-2">
            <div>
              Survey No: <span className="font-semibold text-slate-900">{activePlot.survey_number}</span>
            </div>
            <div>
              Village: <span className="font-semibold text-slate-900">{activePlot.village}</span>
            </div>
            <div>
              Hectares: <span className="font-mono text-slate-900">{activePlot.area_hectares} Ha</span>
            </div>
            <div>
              Perimeter: <span className="font-mono text-slate-900">{activePlot.perimeter_meters}m</span>
            </div>
            <div>
              Crop: <span className="font-semibold text-emerald-700">{activePlot.crop_type || 'Sugarcane'}</span>
            </div>
            <div>
              Mean NDVI: <span className="font-bold text-emerald-600">{activePlot.latest_ndvi ?? 0.68}</span>
            </div>
          </div>

          {activeWeather && (
            <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
              <span className="flex items-center gap-1">
                <CloudSun className="w-3.5 h-3.5 text-amber-500" />
                {activeWeather.temperature_celsius}°C, {activeWeather.weather_condition}
              </span>
              <span className="text-[10px] text-slate-400">Open-Meteo Live</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
