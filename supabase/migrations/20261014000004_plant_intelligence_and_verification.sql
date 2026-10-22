-- ==============================================================================
-- AgriSurvey Database Schema
-- Migration 0004: Plant Intelligence, Health Analysis, and Verification Workflow
-- ==============================================================================

-- 1. Create Enums for Plant Intelligence & Sensors
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'plant_health_status') THEN
        CREATE TYPE plant_health_status AS ENUM (
            'Healthy',
            'Needs Attention',
            'At Risk',
            'Critical',
            'Insufficient Data'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'monitoring_unit_type') THEN
        CREATE TYPE monitoring_unit_type AS ENUM (
            'individual_plant',
            'plant_group',
            'plot',
            'crop_zone'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sensor_parameter') THEN
        CREATE TYPE sensor_parameter AS ENUM (
            'soil_moisture',
            'soil_temperature',
            'ambient_temperature',
            'relative_humidity',
            'soil_ph',
            'soil_ec',
            'light_intensity',
            'leaf_wetness',
            'rainfall',
            'water_level'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'alert_severity') THEN
        CREATE TYPE alert_severity AS ENUM (
            'low',
            'medium',
            'high',
            'critical'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'alert_status') THEN
        CREATE TYPE alert_status AS ENUM (
            'active',
            'acknowledged',
            'resolved'
        );
    END IF;
END$$;

-- 2. Crops Reference Table
CREATE TABLE IF NOT EXISTS crops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    scientific_name TEXT,
    category TEXT NOT NULL CHECK (category IN ('Cereal', 'Cash Crop', 'Horticulture', 'Pulse', 'Oilseed', 'Vegetable', 'Other')),
    default_season TEXT NOT NULL CHECK (default_season IN ('Kharif', 'Rabi', 'Zaid', 'Perennial')),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Crop Health Reference Thresholds (Configurable by Agronomists/Admins)
CREATE TABLE IF NOT EXISTS crop_health_thresholds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crop_id UUID REFERENCES crops(id) ON DELETE CASCADE,
    crop_name TEXT NOT NULL,
    parameter sensor_parameter NOT NULL,
    min_optimal NUMERIC(10, 2) NOT NULL,
    max_optimal NUMERIC(10, 2) NOT NULL,
    min_tolerable NUMERIC(10, 2) NOT NULL,
    max_tolerable NUMERIC(10, 2) NOT NULL,
    unit TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_crop_parameter UNIQUE (crop_name, parameter)
);

-- 4. Monitoring Units (Plants, Plots, Zones on Verified Agricultural Properties)
CREATE TABLE IF NOT EXISTS monitoring_units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    unit_name TEXT NOT NULL,
    unit_type monitoring_unit_type NOT NULL DEFAULT 'plot',
    crop_id UUID REFERENCES crops(id) ON DELETE SET NULL,
    crop_variety TEXT NOT NULL,
    planting_date DATE,
    zone_identifier TEXT NOT NULL,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    area_covered NUMERIC(10, 2),
    area_unit TEXT DEFAULT 'Acres',
    current_health_status plant_health_status NOT NULL DEFAULT 'Insufficient Data',
    last_assessed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Plant Observations (Image, Sensor, Manual Field Observations)
CREATE TABLE IF NOT EXISTS plant_observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    monitoring_unit_id UUID NOT NULL REFERENCES monitoring_units(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    recorded_by UUID NOT NULL REFERENCES profiles(id),
    observation_type TEXT NOT NULL CHECK (observation_type IN ('image', 'manual', 'sensor', 'field_inspection')),
    collection_method TEXT NOT NULL,
    data_source TEXT NOT NULL CHECK (data_source IN ('farmer_mobile', 'field_worker_tablet', 'iot_gateway', 'agronomist')),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    photographs JSONB NOT NULL DEFAULT '[]'::jsonb,
    growth_stage TEXT,
    irrigation_condition TEXT,
    wilting_observed BOOLEAN DEFAULT FALSE,
    leaf_discoloration TEXT DEFAULT 'None',
    pest_observed BOOLEAN DEFAULT FALSE,
    pest_details TEXT,
    visible_disease_symptoms TEXT,
    general_notes TEXT,
    ai_prediction JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Sensor Devices
CREATE TABLE IF NOT EXISTS sensor_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    monitoring_unit_id UUID REFERENCES monitoring_units(id) ON DELETE SET NULL,
    device_serial TEXT UNIQUE NOT NULL,
    device_name TEXT NOT NULL,
    device_type TEXT NOT NULL,
    model_number TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'offline', 'calibrating', 'disconnected')),
    last_heartbeat TIMESTAMPTZ,
    battery_level INTEGER CHECK (battery_level BETWEEN 0 AND 100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Sensor Readings (Telemetry Ingestion)
CREATE TABLE IF NOT EXISTS sensor_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID REFERENCES sensor_devices(id) ON DELETE SET NULL,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    monitoring_unit_id UUID NOT NULL REFERENCES monitoring_units(id) ON DELETE CASCADE,
    parameter sensor_parameter NOT NULL,
    value NUMERIC(10, 2) NOT NULL,
    unit TEXT NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    source_device TEXT NOT NULL DEFAULT 'IoT-Edge-Sensor',
    data_quality TEXT NOT NULL DEFAULT 'validated' CHECK (data_quality IN ('validated', 'suspect', 'raw')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Plant Health Assessments (Generated by Health Analysis Engine)
CREATE TABLE IF NOT EXISTS plant_health_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    monitoring_unit_id UUID NOT NULL REFERENCES monitoring_units(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    overall_status plant_health_status NOT NULL,
    assessment_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    supporting_measurements JSONB NOT NULL DEFAULT '{}'::jsonb,
    detected_anomalies JSONB NOT NULL DEFAULT '[]'::jsonb,
    possible_concerns JSONB NOT NULL DEFAULT '[]'::jsonb,
    suggested_next_steps JSONB NOT NULL DEFAULT '[]'::jsonb,
    data_freshness TEXT NOT NULL,
    confidence NUMERIC(5, 2),
    assessment_method TEXT NOT NULL,
    model_version TEXT NOT NULL,
    is_preliminary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Plant Health Alerts
CREATE TABLE IF NOT EXISTS plant_health_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    monitoring_unit_id UUID NOT NULL REFERENCES monitoring_units(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    crop_name TEXT NOT NULL,
    severity alert_severity NOT NULL,
    reason TEXT NOT NULL,
    supporting_measurement TEXT NOT NULL,
    recommended_action TEXT NOT NULL,
    status alert_status NOT NULL DEFAULT 'active',
    detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    acknowledged_at TIMESTAMPTZ,
    acknowledged_by UUID REFERENCES profiles(id),
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES profiles(id)
);

-- 10. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_monitoring_property ON monitoring_units(property_id);
CREATE INDEX IF NOT EXISTS idx_monitoring_status ON monitoring_units(current_health_status);
CREATE INDEX IF NOT EXISTS idx_obs_unit_timestamp ON plant_observations(monitoring_unit_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_readings_unit_param ON sensor_readings(monitoring_unit_id, parameter, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_readings_property ON sensor_readings(property_id);
CREATE INDEX IF NOT EXISTS idx_assessments_unit ON plant_health_assessments(monitoring_unit_id, assessment_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_unit_status ON plant_health_alerts(monitoring_unit_id, status);
CREATE INDEX IF NOT EXISTS idx_alerts_property_status ON plant_health_alerts(property_id, status);

-- 11. Row Level Security Policies
ALTER TABLE crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_health_thresholds ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE plant_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE plant_health_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE plant_health_alerts ENABLE ROW LEVEL SECURITY;

-- Read policy: Anyone authenticated can view crops and thresholds
CREATE POLICY crops_read_policy ON crops FOR SELECT TO authenticated USING (true);
CREATE POLICY crop_thresholds_read_policy ON crop_health_thresholds FOR SELECT TO authenticated USING (true);

-- Farmers can view/edit their own property's monitoring units and readings
CREATE POLICY monitoring_farmer_policy ON monitoring_units FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM properties
        WHERE properties.id = monitoring_units.property_id
        AND properties.farmer_id = auth.uid()
    )
    OR
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('tahsildar', 'field_worker', 'admin')
    )
);

CREATE POLICY sensor_readings_policy ON sensor_readings FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM properties
        WHERE properties.id = sensor_readings.property_id
        AND properties.farmer_id = auth.uid()
    )
    OR
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('tahsildar', 'field_worker', 'admin')
    )
);

CREATE POLICY plant_alerts_policy ON plant_health_alerts FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM properties
        WHERE properties.id = plant_health_alerts.property_id
        AND properties.farmer_id = auth.uid()
    )
    OR
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('tahsildar', 'field_worker', 'admin')
    )
);
