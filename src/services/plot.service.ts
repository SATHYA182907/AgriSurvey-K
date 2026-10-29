/**
 * AgriSurvey AI — Farm Plot & Geospatial Boundary Service
 * 
 * Manages agricultural farm plot entities with stable unique identifiers,
 * high-precision WGS84 geodesic area calculations (m², ha, acres), GeoJSON import/export,
 * and seamless connection to all satellite, drone, weather, crop, and disaster records.
 */

import { mockDb } from './mock-db';
import { FarmPlot, Property } from '@/types';
import {
  computeGeodesicMeasurements,
  coordinatesToGeoJsonFeature,
  geoJsonPolygonToCoordinates,
  GeodesicMeasurement,
} from '@/lib/geospatial';

export interface CreatePlotParams {
  propertyId?: string;
  farmerId: string;
  plotName: string;
  surveyNumber: string;
  subdivisionNumber?: string;
  village: string;
  taluk: string;
  district: string;
  state?: string;
  coordinates: [number, number][]; // [lat, lon][]
  cropType?: string;
  sowingDate?: string;
  isCadastralVerified?: boolean;
}

export class PlotService {
  /**
   * List all registered farm plots
   */
  async getPlots(filters?: {
    district?: string;
    taluk?: string;
    farmerId?: string;
    cropType?: string;
  }): Promise<FarmPlot[]> {
    return this.listPlots(filters);
  }

  async listPlots(filters?: {
    district?: string;
    taluk?: string;
    farmerId?: string;
    cropType?: string;
  }): Promise<FarmPlot[]> {
    let plots = [...mockDb.farmPlots];

    if (filters?.district) {
      plots = plots.filter((p) => p.district.toLowerCase() === filters.district!.toLowerCase());
    }
    if (filters?.taluk) {
      plots = plots.filter((p) => p.taluk.toLowerCase() === filters.taluk!.toLowerCase());
    }
    if (filters?.farmerId) {
      plots = plots.filter((p) => p.farmer_id === filters.farmerId);
    }
    if (filters?.cropType) {
      plots = plots.filter((p) => p.crop_type?.toLowerCase() === filters.cropType!.toLowerCase());
    }

    // Attach farmer and monitoring summary
    return plots.map((plot) => {
      const farmer = mockDb.profiles.find((p) => p.id === plot.farmer_id);
      const latestVeg = mockDb.vegetationObservations
        .filter((v) => v.plot_id === plot.id)
        .sort((a, b) => new Date(b.calculation_date).getTime() - new Date(a.calculation_date).getTime())[0];

      return {
        ...plot,
        farmer_name: farmer?.full_name || 'Registered Landholder',
        farmer_phone: farmer?.phone_number || undefined,
        latest_ndvi: latestVeg ? latestVeg.ndvi_mean : undefined,
        verification_status: plot.is_cadastral_verified ? 'CADASTRAL_VERIFIED' : 'SELF_DELINEATED',
      };
    });
  }

  /**
   * Get a single farm plot by unique ID or reference
   */
  async getPlotById(idOrRef: string): Promise<FarmPlot | null> {
    const plot = mockDb.farmPlots.find((p) => p.id === idOrRef || p.plot_reference === idOrRef);
    if (!plot) return null;

    const farmer = mockDb.profiles.find((p) => p.id === plot.farmer_id);
    const latestVeg = mockDb.vegetationObservations
      .filter((v) => v.plot_id === plot.id)
      .sort((a, b) => new Date(b.calculation_date).getTime() - new Date(a.calculation_date).getTime())[0];

    return {
      ...plot,
      farmer_name: farmer?.full_name || 'Registered Landholder',
      farmer_phone: farmer?.phone_number || undefined,
      latest_ndvi: latestVeg ? latestVeg.ndvi_mean : undefined,
    };
  }

  /**
   * Create a new farm plot with geodesic area calculation
   */
  async createPlot(params: CreatePlotParams): Promise<FarmPlot> {
    if (!params.coordinates || params.coordinates.length < 3) {
      throw new Error('A valid farm plot polygon must contain at least 3 boundary vertices.');
    }

    const measurements: GeodesicMeasurement = computeGeodesicMeasurements(params.coordinates);
    const talukCode = params.taluk.slice(0, 3).toUpperCase();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const plotRef = `MH-PUN-${talukCode}-PLOT-2026-${randomSuffix}`;

    const newPlot: FarmPlot = {
      id: `plot-${Date.now()}-${randomSuffix}`,
      plot_reference: plotRef,
      property_id: params.propertyId || mockDb.properties[0]?.id || 'prop-default',
      farmer_id: params.farmerId,
      survey_number: params.surveyNumber,
      subdivision_number: params.subdivisionNumber || null,
      plot_name: params.plotName,
      boundary_coordinates: params.coordinates,
      boundary_geojson: coordinatesToGeoJsonFeature(params.coordinates, {
        plot_reference: plotRef,
        survey_number: params.surveyNumber,
        village: params.village,
        area_hectares: measurements.areaHectares,
        area_acres: measurements.areaAcres,
      }),
      area_sqm: measurements.areaSquareMeters,
      area_hectares: measurements.areaHectares,
      area_acres: measurements.areaAcres,
      perimeter_meters: measurements.perimeterMeters,
      village: params.village,
      taluk: params.taluk,
      district: params.district,
      state: params.state || 'Maharashtra',
      is_cadastral_verified: Boolean(params.isCadastralVerified),
      crop_type: params.cropType,
      sowing_date: params.sowingDate,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mockDb.farmPlots.unshift(newPlot);

    // Audit log
    mockDb.addAuditLog(
      'GEOSPATIAL_PLOT_CREATED',
      'farm_plots',
      newPlot.id,
      null,
      {
        plot_reference: newPlot.plot_reference,
        survey_number: newPlot.survey_number,
        area_hectares: newPlot.area_hectares,
        area_acres: newPlot.area_acres,
      }
    );

    mockDb.persistAll();
    return newPlot;
  }

  /**
   * Update plot boundary coordinates and recalculate geodesic measurements
   */
  async updatePlotBoundary(plotId: string, coordinates: [number, number][]): Promise<FarmPlot> {
    const plot = mockDb.farmPlots.find((p) => p.id === plotId);
    if (!plot) throw new Error('Plot not found');

    if (!coordinates || coordinates.length < 3) {
      throw new Error('Updated polygon must contain at least 3 vertices.');
    }

    const prevMeasurements = {
      area_sqm: plot.area_sqm,
      area_hectares: plot.area_hectares,
    };

    const measurements = computeGeodesicMeasurements(coordinates);

    plot.boundary_coordinates = coordinates;
    plot.area_sqm = measurements.areaSquareMeters;
    plot.area_hectares = measurements.areaHectares;
    plot.area_acres = measurements.areaAcres;
    plot.perimeter_meters = measurements.perimeterMeters;
    plot.boundary_geojson = coordinatesToGeoJsonFeature(coordinates, {
      plot_reference: plot.plot_reference,
      survey_number: plot.survey_number,
      village: plot.village,
      area_hectares: measurements.areaHectares,
    });
    plot.updated_at = new Date().toISOString();

    mockDb.addAuditLog(
      'GEOSPATIAL_PLOT_BOUNDARY_UPDATED',
      'farm_plots',
      plot.id,
      prevMeasurements,
      {
        area_sqm: plot.area_sqm,
        area_hectares: plot.area_hectares,
        area_acres: plot.area_acres,
      }
    );

    mockDb.persistAll();
    return plot;
  }

  /**
   * Import GeoJSON file content into a Farm Plot
   */
  async importGeoJsonPlot(
    geoJsonContent: string,
    metadata: {
      propertyId: string;
      farmerId: string;
      plotName: string;
      surveyNumber: string;
      village: string;
      taluk: string;
      district: string;
    }
  ): Promise<FarmPlot> {
    let parsed: any;
    try {
      parsed = typeof geoJsonContent === 'string' ? JSON.parse(geoJsonContent) : geoJsonContent;
    } catch {
      throw new Error('Invalid GeoJSON format: Failed to parse JSON string.');
    }

    const coordinates = geoJsonPolygonToCoordinates(parsed);
    if (coordinates.length < 3) {
      throw new Error('Imported GeoJSON does not contain a valid Polygon geometry with >= 3 coordinates.');
    }

    return this.createPlot({
      ...metadata,
      coordinates,
      isCadastralVerified: false,
    });
  }

  /**
   * Export Farm Plot as standardized GeoJSON FeatureCollection
   */
  exportPlotGeoJson(plot: FarmPlot): string {
    const feature = coordinatesToGeoJsonFeature(plot.boundary_coordinates, {
      id: plot.id,
      plot_reference: plot.plot_reference,
      survey_number: plot.survey_number,
      subdivision_number: plot.subdivision_number,
      plot_name: plot.plot_name,
      farmer_id: plot.farmer_id,
      village: plot.village,
      taluk: plot.taluk,
      district: plot.district,
      state: plot.state,
      area_sqm: plot.area_sqm,
      area_hectares: plot.area_hectares,
      area_acres: plot.area_acres,
      perimeter_meters: plot.perimeter_meters,
      is_cadastral_verified: plot.is_cadastral_verified,
      crop_type: plot.crop_type,
      sowing_date: plot.sowing_date,
      exported_at: new Date().toISOString(),
      crs: 'EPSG:4326 - WGS 84',
    });

    return JSON.stringify(
      {
        type: 'FeatureCollection',
        name: `AgriSurvey_Plot_${plot.plot_reference}`,
        crs: {
          type: 'name',
          properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' },
        },
        features: [feature],
      },
      null,
      2
    );
  }
}

export const plotService = new PlotService();
