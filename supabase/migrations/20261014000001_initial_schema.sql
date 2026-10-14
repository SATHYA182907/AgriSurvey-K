-- ==============================================================================
-- AgriSurvey Database Schema
-- Migration 0001: Core Tables, Indexes, and Constraints
-- ==============================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Custom Enums
CREATE TYPE user_role AS ENUM ('farmer', 'tahsildar', 'field_worker', 'admin');
CREATE TYPE account_status AS ENUM ('active', 'pending_approval', 'suspended', 'deactivated');
CREATE TYPE registration_status AS ENUM ('DRAFT', 'PENDING_TAHSILDAR_REVIEW', 'ADDITIONAL_INFORMATION_REQUIRED', 'APPROVED', 'REJECTED');
CREATE TYPE inspection_status AS ENUM ('NOT_STARTED', 'ASSIGNED', 'SCHEDULED', 'IN_PROGRESS', 'EVIDENCE_UPLOADED', 'SUBMITTED_FOR_REVIEW', 'COMPLETED', 'CANCELLED', 'REINSPECTION_REQUIRED');
CREATE TYPE final_verification_status AS ENUM ('PENDING_REVIEW', 'VERIFIED', 'REJECTED', 'ADDITIONAL_EVIDENCE_REQUIRED', 'REINSPECTION_REQUIRED');
CREATE TYPE comparison_result_type AS ENUM ('CONSISTENT', 'INCONSISTENT', 'INSUFFICIENT_EVIDENCE', 'REQUIRES_REINSPECTION');
CREATE TYPE crop_verification_result_type AS ENUM ('MATCHES', 'PARTIALLY_MATCHES', 'DOES_NOT_MATCH', 'UNABLE_TO_DETERMINE');
CREATE TYPE notification_channel AS ENUM ('in_app', 'sms', 'both');
CREATE TYPE delivery_status_type AS ENUM ('pending', 'queued', 'sent', 'delivered', 'failed', 'provider_unavailable');

-- ------------------------------------------------------------------------------
-- Table 1: profiles
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone_number TEXT,
    role user_role NOT NULL DEFAULT 'farmer',
    account_status account_status NOT NULL DEFAULT 'active',
    preferred_language TEXT NOT NULL DEFAULT 'en',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Table 2: farmer_profiles
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS farmer_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    address TEXT NOT NULL,
    village TEXT NOT NULL,
    taluk TEXT NOT NULL,
    district TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    identity_verification_status TEXT NOT NULL DEFAULT 'PENDING_DOCUMENT_VERIFICATION',
    identity_verification_reference TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_farmer_user UNIQUE (user_id)
);

-- ------------------------------------------------------------------------------
-- Table 3: properties
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    property_reference TEXT UNIQUE NOT NULL,
    property_name TEXT,
    survey_number TEXT NOT NULL,
    subdivision_number TEXT,
    land_document_reference TEXT NOT NULL,
    land_area NUMERIC(10, 2) NOT NULL CHECK (land_area > 0),
    land_area_unit TEXT NOT NULL CHECK (land_area_unit IN ('Acres', 'Hectares', 'Cents')),
    land_type TEXT NOT NULL,
    farm_type TEXT NOT NULL,
    ownership_category TEXT NOT NULL,
    village TEXT NOT NULL,
    taluk TEXT NOT NULL,
    district TEXT NOT NULL,
    state TEXT NOT NULL,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Table 4: registration_applications
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS registration_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_reference TEXT UNIQUE NOT NULL,
    farmer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    status registration_status NOT NULL DEFAULT 'PENDING_TAHSILDAR_REVIEW',
    assigned_tahsildar_id UUID REFERENCES profiles(id),
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    rejection_reason TEXT,
    additional_information_request TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Table 5: land_documents
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS land_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES profiles(id),
    document_type TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    review_status TEXT NOT NULL DEFAULT 'PENDING_REVIEW',
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Table 6: farmer_land_images
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS farmer_land_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    application_id UUID NOT NULL REFERENCES registration_applications(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES profiles(id),
    storage_path TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    capture_timestamp TIMESTAMPTZ,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    metadata_status TEXT NOT NULL DEFAULT 'METADATA_EXTRACTED',
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Table 7: field_inspections
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS field_inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    application_id UUID NOT NULL REFERENCES registration_applications(id) ON DELETE CASCADE,
    assigned_worker_id UUID REFERENCES profiles(id),
    assigned_tahsildar_id UUID REFERENCES profiles(id),
    inspection_status inspection_status NOT NULL DEFAULT 'ASSIGNED',
    scheduled_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    field_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Table 8: drone_imagery
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS drone_imagery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inspection_id UUID NOT NULL REFERENCES field_inspections(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    application_id UUID NOT NULL REFERENCES registration_applications(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES profiles(id),
    storage_path TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    capture_timestamp TIMESTAMPTZ,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    mission_reference TEXT,
    metadata_status TEXT NOT NULL DEFAULT 'GEO_TAGGED',
    processing_status TEXT NOT NULL DEFAULT 'PROCESSED',
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Table 9: image_comparisons & comparison_images
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS image_comparisons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES registration_applications(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    comparison_result comparison_result_type NOT NULL,
    similarity_score NUMERIC(5, 2),
    similarity_model_version TEXT,
    review_notes TEXT,
    reviewed_by UUID NOT NULL REFERENCES profiles(id),
    reviewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS comparison_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comparison_id UUID NOT NULL REFERENCES image_comparisons(id) ON DELETE CASCADE,
    image_type TEXT NOT NULL CHECK (image_type IN ('farmer', 'drone')),
    image_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Table 10: crop_verifications
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS crop_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    application_id UUID NOT NULL REFERENCES registration_applications(id) ON DELETE CASCADE,
    declared_crop_type TEXT NOT NULL,
    observed_crop_type TEXT NOT NULL,
    crop_category TEXT NOT NULL,
    cultivation_season TEXT NOT NULL,
    approximate_cultivated_area NUMERIC(10, 2),
    irrigation_method TEXT,
    verification_result crop_verification_result_type NOT NULL,
    ai_prediction TEXT,
    ai_confidence NUMERIC(5, 2),
    ai_model_version TEXT,
    reviewer_notes TEXT,
    verified_by UUID NOT NULL REFERENCES profiles(id),
    verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Table 11: verification_reports
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS verification_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_reference TEXT UNIQUE NOT NULL,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    application_id UUID NOT NULL REFERENCES registration_applications(id) ON DELETE CASCADE,
    reviewed_by UUID NOT NULL REFERENCES profiles(id),
    final_status final_verification_status NOT NULL,
    findings JSONB NOT NULL DEFAULT '{}'::jsonb,
    discrepancies TEXT,
    supporting_evidence JSONB NOT NULL DEFAULT '[]'::jsonb,
    report_storage_path TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Table 12: notifications
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    notification_type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    related_application_id UUID REFERENCES registration_applications(id),
    channel notification_channel NOT NULL DEFAULT 'in_app',
    delivery_status delivery_status_type NOT NULL DEFAULT 'delivered',
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Table 13: notification_jobs
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notification_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    delivery_status delivery_status_type NOT NULL DEFAULT 'pending',
    attempt_count INTEGER NOT NULL DEFAULT 0,
    last_attempt_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    provider_message_reference TEXT,
    error_code TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Table 14: audit_logs
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_user_id UUID REFERENCES profiles(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    previous_state JSONB,
    new_state JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Table 15: staff_regions
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS staff_regions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    state TEXT NOT NULL,
    district TEXT NOT NULL,
    taluk TEXT NOT NULL,
    village TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Indexes for Performance & Search
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_properties_farmer ON properties(farmer_id);
CREATE INDEX IF NOT EXISTS idx_properties_district_taluk ON properties(district, taluk);
CREATE INDEX IF NOT EXISTS idx_properties_survey ON properties(survey_number);

CREATE INDEX IF NOT EXISTS idx_applications_farmer ON registration_applications(farmer_id);
CREATE INDEX IF NOT EXISTS idx_applications_property ON registration_applications(property_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON registration_applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_tahsildar ON registration_applications(assigned_tahsildar_id);

CREATE INDEX IF NOT EXISTS idx_inspections_worker ON field_inspections(assigned_worker_id);
CREATE INDEX IF NOT EXISTS idx_inspections_status ON field_inspections(inspection_status);

CREATE INDEX IF NOT EXISTS idx_drone_inspection ON drone_imagery(inspection_id);
CREATE INDEX IF NOT EXISTS idx_drone_property ON drone_imagery(property_id);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_user_id, read_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_staff_regions_staff ON staff_regions(staff_user_id);
