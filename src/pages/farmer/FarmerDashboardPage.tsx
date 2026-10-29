import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  Clock,
  ArrowRight,
  MapPin,
  Camera,
  Layers,
  Sprout,
  AlertCircle,
  FileCheck2,
  Sparkles,
  Activity,
  RefreshCw,
  PlusCircle,
  TrendingUp,
  ShieldCheck,
  ShieldAlert,
  Info,
  Droplets,
  Thermometer,
  Satellite,
  Compass,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { mockDb } from '@/services/mock-db';
import { registrationService } from '@/services/registration.service';
import { plantIntelligenceService } from '@/services/plant-intelligence.service';
import { reportService } from '@/services/report.service';
import {
  RegistrationApplication,
  Property,
  VerificationReport,
  MonitoringUnit,
  SensorReading,
  PlantObservation,
  PlantHealthAssessment,
  PlantHealthAlert,
  SensorDevice,
  MonitoringArea,
  MonitoringPeriodObservation,
} from '@/types';
import { PlantObservationModal } from '@/components/plant-intelligence/PlantObservationModal';
import { CreateMonitoringUnitModal } from '@/components/plant-intelligence/CreateMonitoringUnitModal';
import { PlantUnitDetailModal } from '@/components/plant-intelligence/PlantUnitDetailModal';
import { CoordinateMonitoringModal } from '@/components/satellite/CoordinateMonitoringModal';
import { ContinuousMonitoringTimeline } from '@/components/satellite/ContinuousMonitoringTimeline';
import { satelliteMonitoringService } from '@/services/satellite-monitoring.service';
import { useLanguage } from '@/context/LanguageContext';
import {
  localizePlotOrCropName,
  localizeDataFreshness,
  localizeAlertReason,
  localizeAlertAction,
  getTargetLabel,
  getAgronomicRuleTitle,
} from '@/lib/dashboard-localizer';

const HEALTH_COLORS = {
  Healthy: '#10b981',
  'Needs Attention': '#f59e0b',
  'At Risk': '#f97316',
  Critical: '#ef4444',
  'Insufficient Data': '#94a3b8',
};

export const FarmerDashboardPage: React.FC = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const farmer = mockDb.currentUser;

  // Applications & Properties State
  const [applications, setApplications] = useState<RegistrationApplication[]>([]);
  const [selectedApp, setSelectedApp] = useState<RegistrationApplication | null>(null);
  const [report, setReport] = useState<VerificationReport | null>(null);

  // Plant Intelligence State
  const [monitoringUnits, setMonitoringUnits] = useState<MonitoringUnit[]>([]);
  const [alerts, setAlerts] = useState<PlantHealthAlert[]>([]);
  const [sensorReadings, setSensorReadings] = useState<SensorReading[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());

  // Modals State
  const [selectedUnitForDetail, setSelectedUnitForDetail] = useState<MonitoringUnit | null>(null);
  const [unitDetailData, setUnitDetailData] = useState<{
    readings: SensorReading[];
    observations: PlantObservation[];
    assessment: PlantHealthAssessment | null;
    device: SensorDevice | null;
    alerts: PlantHealthAlert[];
  }>({ readings: [], observations: [], assessment: null, device: null, alerts: [] });
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const [observationModalOpen, setObservationModalOpen] = useState(false);
  const [selectedUnitForObservation, setSelectedUnitForObservation] = useState<MonitoringUnit | null>(null);

  const [createUnitModalOpen, setCreateUnitModalOpen] = useState(false);

  // Continuous 15-Day Satellite Monitoring State
  const [monitoringAreas, setMonitoringAreas] = useState<MonitoringArea[]>([]);
  const [selectedMonitoringAreaId, setSelectedMonitoringAreaId] = useState<string | null>(null);
  const [areaObservations, setAreaObservations] = useState<MonitoringPeriodObservation[]>([]);
  const [coordModalOpen, setCoordModalOpen] = useState(false);

  const loadAllDashboardData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // 1. Applications & Properties
      const apps = await registrationService.getMyApplications(farmer.id);
      setApplications(apps);
      if (apps.length > 0) {
        setSelectedApp(apps[0]);
        const rep = await reportService.getReportByApplicationId(apps[0].id);
        setReport(rep);
      }

      // 2. Monitoring Units
      const units = await plantIntelligenceService.getMonitoringUnits({ farmerId: farmer.id });
      setMonitoringUnits(units);

      // 3. Alerts
      const activeAlerts = await plantIntelligenceService.getAlerts({ farmerId: farmer.id });
      setAlerts(activeAlerts);

      // 4. Sensor Readings for Trends
      setSensorReadings([...mockDb.sensorReadings]);
      setLastRefreshedAt(new Date());

      // 5. Continuous Satellite Monitoring Areas & Observations
      const areas = satelliteMonitoringService.getMonitoringAreas(farmer.id);
      setMonitoringAreas(areas);
      if (areas.length > 0) {
        const activeAreaId = selectedMonitoringAreaId || areas[0].id;
        setSelectedMonitoringAreaId(activeAreaId);
        const obs = satelliteMonitoringService.getObservationsForArea(activeAreaId);
        setAreaObservations(obs);
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [farmer.id, selectedMonitoringAreaId]);

  const handleSelectMonitoringArea = (areaId: string) => {
    setSelectedMonitoringAreaId(areaId);
    const obs = satelliteMonitoringService.getObservationsForArea(areaId);
    setAreaObservations(obs);
  };

  const handleRefreshAreaObservations = async () => {
    if (!selectedMonitoringAreaId) return;
    await satelliteMonitoringService.processAreaObservations(selectedMonitoringAreaId, {
      usePythonBackend: true,
    });
    const obs = satelliteMonitoringService.getObservationsForArea(selectedMonitoringAreaId);
    setAreaObservations(obs);
    const areas = satelliteMonitoringService.getMonitoringAreas(farmer.id);
    setMonitoringAreas(areas);
  };

  const handleAreaCreated = (newArea: MonitoringArea) => {
    const areas = satelliteMonitoringService.getMonitoringAreas(farmer.id);
    setMonitoringAreas(areas);
    setSelectedMonitoringAreaId(newArea.id);
    const obs = satelliteMonitoringService.getObservationsForArea(newArea.id);
    setAreaObservations(obs);
  };

  const activeMonitoringArea =
    monitoringAreas.find((a) => a.id === selectedMonitoringAreaId) || monitoringAreas[0];

  useEffect(() => {
    loadAllDashboardData();
  }, [loadAllDashboardData]);

  const handleOpenUnitDetail = async (unit: MonitoringUnit) => {
    setSelectedUnitForDetail(unit);
    const details = await plantIntelligenceService.getMonitoringUnitById(unit.id);
    setUnitDetailData({
      readings: details.readings,
      observations: details.observations,
      assessment: details.assessment,
      device: details.device,
      alerts: details.alerts,
    });
    setDetailModalOpen(true);
  };

  const handleOpenObservation = (unit: MonitoringUnit) => {
    setSelectedUnitForObservation(unit);
    setObservationModalOpen(true);
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    await plantIntelligenceService.acknowledgeAlert(alertId, farmer.id);
    loadAllDashboardData();
  };

  const handleResolveAlert = async (alertId: string) => {
    await plantIntelligenceService.resolveAlert(alertId, farmer.id);
    loadAllDashboardData();
  };

  // Calculations from actual database records
  const totalFarms = applications.length;
  const verifiedFarms = applications.filter((a) => a.status === 'APPROVED').length;
  const totalUnits = monitoringUnits.length;
  const healthyUnits = monitoringUnits.filter((u) => u.current_health_status === 'Healthy').length;
  const attentionUnits = monitoringUnits.filter(
    (u) => u.current_health_status === 'Needs Attention' || u.current_health_status === 'At Risk'
  ).length;
  const criticalUnits = monitoringUnits.filter((u) => u.current_health_status === 'Critical').length;
  const activeAlertsCount = alerts.filter((a) => a.status === 'active').length;

  // Chart Data: Health Distribution (Memoized for scroll performance)
  const healthDistributionData = useMemo(() => [
    { name: 'Healthy', value: healthyUnits, color: HEALTH_COLORS.Healthy },
    { name: 'Needs Attention', value: monitoringUnits.filter((u) => u.current_health_status === 'Needs Attention').length, color: HEALTH_COLORS['Needs Attention'] },
    { name: 'At Risk', value: monitoringUnits.filter((u) => u.current_health_status === 'At Risk').length, color: HEALTH_COLORS['At Risk'] },
    { name: 'Critical', value: criticalUnits, color: HEALTH_COLORS.Critical },
    { name: 'Insufficient Data', value: monitoringUnits.filter((u) => u.current_health_status === 'Insufficient Data').length, color: HEALTH_COLORS['Insufficient Data'] },
  ].filter((d) => d.value > 0), [healthyUnits, monitoringUnits, criticalUnits]);

  // Chart Data: Overall Moisture Readings Trend (Memoized for scroll performance)
  const moistureTrendData = useMemo(() => sensorReadings
    .filter((r) => r.parameter === 'soil_moisture')
    .slice(0, 10)
    .reverse()
    .map((r) => ({
      time: new Date(r.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      value: r.value,
      source: r.source_device,
    })), [sensorReadings]);

  const hasVerifiedFarm = applications.some((a) => a.status === 'APPROVED');

  return (
    <DashboardLayout
      title={t('dashboard.farmerPortalTitle', 'Farmer Intelligence Portal')}
      subtitle={`${t('dashboard.welcomeBack', 'Welcome back')}, ${farmer.full_name} • ${t('dashboard.farmerPortalSubtitle', 'Central Agricultural Land & Crop Intelligence')}`}
    >
      <div className="space-y-6">
        {/* Welcome Section & Dual Action Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span>{t('dashboard.khatedarDomicile', 'Khatedar Domicile: Pune Division (Haveli Taluk)')}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {t('dashboard.welcomeBack', 'Welcome back')}, {farmer.full_name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {hasVerifiedFarm
                ? t('dashboard.verifiedBannerDesc', 'Your land registration is verified by the Tahsildar. Live telemetry, plant observations, and crop health assessments are active.')
                : t('dashboard.pendingBannerDesc', 'Your land registration application is awaiting Tahsildar approval. Once verified, plant intelligence monitoring will unlock.')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto shrink-0">
            <Button
              variant="outline"
              size="sm"
              icon={<RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />}
              onClick={loadAllDashboardData}
            >
              {t('dashboard.liveRefresh', 'Live Refresh')}
            </Button>

            <Button
              size="sm"
              icon={<Camera className="w-3.5 h-3.5" />}
              disabled={monitoringUnits.length === 0}
              onClick={() => {
                if (monitoringUnits.length > 0) {
                  handleOpenObservation(monitoringUnits[0]);
                }
              }}
            >
              {t('dashboard.recordObservation', 'Record Plant Observation')}
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="border-emerald-600 text-emerald-700 hover:bg-emerald-50"
              icon={<Satellite className="w-3.5 h-3.5 text-emerald-600" />}
              onClick={() => setCoordModalOpen(true)}
            >
              Monitor Coordinates
            </Button>
          </div>
        </div>

        {/* 6 Real Database Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>{t('dashboard.myFarms', 'My Farms')}</span>
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{totalFarms}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{verifiedFarms} {t('dashboard.approved', 'Approved')}</div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>{t('dashboard.monitoredUnits', 'Monitored Units')}</span>
              <Sprout className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{totalUnits}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{t('dashboard.plotsAndZones', 'Plots & Zones')}</div>
          </Card>

          <Card className="p-4 bg-emerald-50/50 border-emerald-200">
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-800">
              <span>{t('dashboard.healthyUnits', 'Healthy Units')}</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-950 mt-1">{healthyUnits}</div>
            <div className="text-[10px] text-emerald-700 mt-0.5">{t('dashboard.optimalConditions', 'Optimal conditions')}</div>
          </Card>

          <Card className="p-4 bg-amber-50/50 border-amber-200">
            <div className="flex items-center justify-between text-xs font-semibold text-amber-800">
              <span>{t('dashboard.attentionNeeded', 'Attention Needed')}</span>
              <Clock className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <div className="text-2xl font-extrabold text-amber-950 mt-1">{attentionUnits}</div>
            <div className="text-[10px] text-amber-700 mt-0.5">{t('dashboard.stressCondition', 'Moisture/pH stress')}</div>
          </Card>

          <Card className="p-4 bg-red-50/50 border-red-200">
            <div className="flex items-center justify-between text-xs font-semibold text-red-800">
              <span>{t('dashboard.criticalAlerts', 'Critical Alerts')}</span>
              <AlertCircle className="w-3.5 h-3.5 text-red-600" />
            </div>
            <div className="text-2xl font-extrabold text-red-950 mt-1">{activeAlertsCount}</div>
            <div className="text-[10px] text-red-700 mt-0.5">{t('dashboard.urgentAttention', 'Urgent attention')}</div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>{t('dashboard.dataFreshness', 'Data Freshness')}</span>
              <Activity className="w-3.5 h-3.5 text-teal-600" />
            </div>
            <div className="text-xs font-bold text-slate-900 mt-2 truncate">
              {t('dashboard.updatedJustNow', 'Updated just now')}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {lastRefreshedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </Card>
        </div>

        {/* Continuous 15-Day Satellite Remote Sensing & Phenology Monitoring */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
                  <Satellite className="w-5 h-5" />
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  15-Day Satellite Farm & Crop Monitoring
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Automated satellite passes every 15 days &bull; Crop growth stage, moisture & greenness tracking
              </p>
            </div>

            <div className="flex items-center gap-2">
              {monitoringAreas.length > 1 && (
                <select
                  value={selectedMonitoringAreaId || ''}
                  onChange={(e) => handleSelectMonitoringArea(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                >
                  {monitoringAreas.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              )}

              <Button
                size="sm"
                variant="primary"
                icon={<PlusCircle className="w-3.5 h-3.5" />}
                onClick={() => setCoordModalOpen(true)}
              >
                Add Farm Coordinates to Monitor
              </Button>
            </div>
          </div>

          {activeMonitoringArea ? (
            <ContinuousMonitoringTimeline
              area={activeMonitoringArea}
              observations={areaObservations}
              onRefreshObservations={handleRefreshAreaObservations}
            />
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <Satellite className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">No Satellite Monitoring Areas Active</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Enter your farm plot coordinates or select a cadastral parcel to begin automated 15-day Sentinel-2 L2A satellite monitoring and crop phenology analysis.
              </p>
              <Button
                size="sm"
                icon={<Compass className="w-4 h-4" />}
                onClick={() => setCoordModalOpen(true)}
              >
                Input Coordinates & Start Monitoring
              </Button>
            </div>
          )}
        </div>

        {/* Plant Health Overview: Charts & Telemetry Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Historical Soil Moisture Chart (7 cols) */}
          <Card className="lg:col-span-7 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  {t('dashboard.soilMoistureTrend', 'Soil Moisture Telemetry Trend (%)')}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {t('dashboard.soilMoistureSubtitle', 'Continuous root-zone readings compared with Sugarcane optimal threshold [60% - 80%]')}
                </p>
              </div>
              <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                {t('dashboard.liveSensorFeed', 'Live Sensor Feed')}
              </span>
            </div>

            {moistureTrendData.length > 0 ? (
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={moistureTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#059669"
                      fill="#10b981"
                      fillOpacity={0.2}
                      name="Soil Moisture (%)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-xs text-slate-400">
                {t('dashboard.noSensorReadings', 'No sensor readings recorded yet.')}
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                {t('dashboard.optimalThreshold', 'Optimal Threshold: 60% – 80%')}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                {t('dashboard.wiltingThreshold', 'Permanent Wilting Threshold: < 45%')}
              </span>
            </div>
          </Card>

          {/* Plant Health Distribution Donut (5 cols) */}
          <Card className="lg:col-span-5 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                {t('dashboard.healthDistribution', 'Health Status Distribution')}
              </h3>
              <span className="text-[11px] text-slate-500">{totalUnits} {t('dashboard.unitsLabel', 'units')}</span>
            </div>

            {healthDistributionData.length > 0 ? (
              <div className="flex items-center justify-between gap-4">
                <div className="w-36 h-36 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={healthDistributionData}
                        dataKey="value"
                        innerRadius={36}
                        outerRadius={56}
                        paddingAngle={3}
                      >
                        {healthDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex-1 space-y-2 text-xs">
                  {healthDistributionData.map((d) => {
                    const localizedLabel =
                      d.name === 'Healthy'
                        ? t('dashboard.healthy', 'Healthy')
                        : d.name === 'Needs Attention'
                        ? t('dashboard.needsAttention', 'Needs Attention')
                        : d.name === 'Critical'
                        ? t('dashboard.critical', 'Critical')
                        : d.name === 'Insufficient Data'
                        ? t('dashboard.insufficientData', 'Insufficient Data')
                        : d.name;
                    return (
                      <div key={d.name} className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-slate-700">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                          <span className="truncate">{localizedLabel}</span>
                        </span>
                        <span className="font-bold text-slate-900">{d.value}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="h-36 flex items-center justify-center text-xs text-slate-400">
                {t('dashboard.noActiveUnits', 'No active monitoring units.')}
              </div>
            )}

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed">
              <strong>{getAgronomicRuleTitle(language)}</strong> {t('dashboard.agronomicRuleNotice', 'Plant health is evaluated from crop telemetry and observations. Land verification is strictly determined by Tahsildar revenue examination.')}
            </div>
          </Card>
        </div>

        {/* Monitored Units & Farms Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {t('dashboard.cropMonitoringUnits', 'Crop & Plant Monitoring Units')}
              </h3>
              <p className="text-xs text-slate-500">
                {t('dashboard.cropMonitoringDesc', 'Select any plot to view continuous telemetry, uploaded images, and agronomic recommendations.')}
              </p>
            </div>

            <Button
              size="sm"
              variant="outline"
              icon={<PlusCircle className="w-3.5 h-3.5 text-emerald-600" />}
              disabled={!hasVerifiedFarm}
              onClick={() => setCreateUnitModalOpen(true)}
            >
              {t('dashboard.addMonitoringUnit', 'Add Monitoring Unit')}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {monitoringUnits.map((unit) => {
              const assessment = mockDb.plantHealthAssessments.find(
                (a) => a.monitoring_unit_id === unit.id
              );
              const isCritical = unit.current_health_status === 'Critical';
              const isAttention = unit.current_health_status === 'Needs Attention';
              const localizedStatus =
                unit.current_health_status === 'Healthy'
                  ? t('dashboard.healthy', 'Healthy')
                  : unit.current_health_status === 'Needs Attention'
                  ? t('dashboard.needsAttention', 'Needs Attention')
                  : unit.current_health_status === 'Critical'
                  ? t('dashboard.critical', 'Critical')
                  : unit.current_health_status === 'Insufficient Data'
                  ? t('dashboard.insufficientData', 'Insufficient Data')
                  : unit.current_health_status;

              return (
                <div
                  key={unit.id}
                  onClick={() => handleOpenUnitDetail(unit)}
                  className={`bg-white rounded-2xl border p-4 transition-all cursor-pointer hover:shadow-md ${
                    isCritical
                      ? 'border-red-300 ring-2 ring-red-500/10'
                      : isAttention
                      ? 'border-amber-300 ring-2 ring-amber-500/10'
                      : 'border-slate-200 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        unit.current_health_status === 'Healthy'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : isCritical
                          ? 'bg-red-50 text-red-800 border-red-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {localizedStatus}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {unit.zone_identifier}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 truncate">
                    {localizePlotOrCropName(unit.unit_name, language)}
                  </h4>
                  <div className="text-xs text-emerald-800 font-semibold mb-3">
                    {localizePlotOrCropName(unit.crop_variety, language)}
                  </div>

                  {/* Quick telemetry readings preview */}
                  <div className="grid grid-cols-2 gap-2 p-2 bg-slate-50 rounded-lg text-[11px] mb-3">
                    <div>
                      <span className="text-slate-400 block text-[9px]">{t('dashboard.moisture', 'Moisture')}</span>
                      <span className="font-bold text-slate-800 font-mono">
                        {assessment?.supporting_measurements.soil_moisture?.value !== undefined
                          ? `${assessment.supporting_measurements.soil_moisture.value}%`
                          : t('dashboard.noData', 'No Data')}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px]">{t('dashboard.soilPh', 'Soil pH')}</span>
                      <span className="font-bold text-slate-800 font-mono">
                        {assessment?.supporting_measurements.soil_ph?.value !== undefined
                          ? assessment.supporting_measurements.soil_ph.value.toFixed(1)
                          : t('dashboard.noData', 'No Data')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px]">
                    <span className="text-slate-400 truncate">
                      {localizeDataFreshness(assessment?.data_freshness, language) || t('dashboard.updatedJustNow', 'Updated just now')}
                    </span>
                    <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                      {t('dashboard.inspect', 'Inspect')} <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Alerts Section */}
        {alerts.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-red-500" />
                {t('dashboard.activeAgronomicAlerts', 'Active Agronomic Alerts')} ({alerts.filter((a) => a.status === 'active').length})
              </h3>
              <span className="text-xs text-slate-500">
                {t('dashboard.ruleThresholdsExceeded', 'Rule-based thresholds exceeded')}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {alerts.map((al) => (
                <div
                  key={al.id}
                  className={`p-4 rounded-xl border space-y-2 ${
                    al.severity === 'critical'
                      ? 'bg-red-50/70 border-red-200'
                      : 'bg-amber-50/70 border-amber-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 text-xs">
                    <div>
                      <span className="font-bold text-slate-900 block">
                        {localizeAlertReason(al.reason, language)}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-600">
                        {getTargetLabel(language)} {localizePlotOrCropName(al.unit_name, language)} ({localizePlotOrCropName(al.crop_name, language)})
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 shrink-0 font-mono">
                      {new Date(al.detected_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700">
                    <strong>{t('dashboard.recommendedNextStep', 'Recommended Next Step:')}</strong> {localizeAlertAction(al.recommended_action, language)}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                    <span className="text-[10px] text-slate-500 italic">
                      {t('dashboard.acknowledgingNotice', 'Acknowledging alert does not resolve root stress.')}
                    </span>
                    <div className="flex items-center gap-2">
                      {al.status === 'active' && (
                        <button
                          onClick={() => handleAcknowledgeAlert(al.id)}
                          className="px-2.5 py-1 bg-white text-slate-700 font-semibold rounded border border-slate-300 hover:bg-slate-50 text-xs"
                        >
                          {t('dashboard.acknowledge', 'Acknowledge')}
                        </button>
                      )}
                      {al.status !== 'resolved' && (
                        <button
                          onClick={() => handleResolveAlert(al.id)}
                          className="px-2.5 py-1 bg-emerald-700 text-white font-semibold rounded hover:bg-emerald-800 text-xs"
                        >
                          {t('dashboard.resolve', 'Resolve')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Agricultural Land Properties Table & Cadastral Verification Overview */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {t('dashboard.registeredLandholdings', 'Registered Landholdings & Verification Status')}
              </h3>
              <p className="text-xs text-slate-500">
                {t('dashboard.cadastralDesc', 'Tahsildar verification certifies legal parcel boundaries under Maharashtra Land Revenue Code.')}
              </p>
            </div>
            <Link to="/farmer/properties" className="text-xs font-bold text-emerald-700 hover:text-emerald-900">
              {t('dashboard.manageAllProperties', 'Manage All Properties →')}
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {applications.map((app) => (
              <div key={app.id} className="py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">
                      {app.property?.property_name || `${t('dashboard.surveyLabel', 'Survey')} ${app.property?.survey_number}`}
                    </span>
                    <Badge status={app.status} size="sm" />
                  </div>
                  <span className="text-slate-500">
                    {t('dashboard.surveyLabel', 'Survey')} {app.property?.survey_number} • {app.property?.village}, {app.property?.taluk} ({app.property?.land_area} {t('dashboard.acresLabel', 'Acres')})
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-slate-400 font-mono text-[11px]">
                    {app.application_reference}
                  </span>
                  <Link
                    to="/farmer/properties"
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-bold text-xs"
                  >
                    {t('dashboard.viewStatus', 'View Status')}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Observation Modal */}
      <PlantObservationModal
        isOpen={observationModalOpen}
        onClose={() => setObservationModalOpen(false)}
        unit={selectedUnitForObservation}
        onSuccess={loadAllDashboardData}
      />

      {/* Create Monitoring Unit Modal */}
      <CreateMonitoringUnitModal
        isOpen={createUnitModalOpen}
        onClose={() => setCreateUnitModalOpen(false)}
        properties={applications.map((a) => a.property!).filter(Boolean)}
        applications={applications}
        onSuccess={loadAllDashboardData}
      />

      {/* Unit Detail Modal */}
      <PlantUnitDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        unit={selectedUnitForDetail}
        readings={unitDetailData.readings}
        observations={unitDetailData.observations}
        assessment={unitDetailData.assessment}
        device={unitDetailData.device}
        alerts={unitDetailData.alerts}
        onOpenObservationModal={() => {
          if (selectedUnitForDetail) {
            handleOpenObservation(selectedUnitForDetail);
          }
        }}
        onAlertUpdated={loadAllDashboardData}
      />

      {/* Coordinate-Based Continuous Satellite Monitoring Modal */}
      <CoordinateMonitoringModal
        isOpen={coordModalOpen}
        onClose={() => setCoordModalOpen(false)}
        availablePlots={mockDb.farmPlots.filter((p) => p.farmer_id === farmer.id)}
        onAreaCreated={handleAreaCreated}
      />
    </DashboardLayout>
  );
};
