-- ==============================================================================
-- AgriSurvey Database Schema
-- Migration 0003: Demonstration Seed Data
-- Regions: Maharashtra -> Pune District -> Taluks: Haveli, Baramati, Shirur
-- ==============================================================================

-- Note: In production Supabase, users are created via Supabase Auth signup.
-- This script provides standard reference data and demo IDs.

-- Demo UUIDs
-- Admin: 11111111-1111-1111-1111-111111111111
-- Tahsildar (Haveli): 22222222-2222-2222-2222-222222222222
-- Field Worker: 33333333-3333-3333-3333-333333333333
-- Farmer (Ramesh Patil): 44444444-4444-4444-4444-444444444444
-- Farmer (Sunita Shinde): 55555555-5555-5555-5555-555555555555

-- Staff Regions Assignment
INSERT INTO staff_regions (id, staff_user_id, state, district, taluk, village)
VALUES
    ('a0000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'Maharashtra', 'Pune', 'Haveli', NULL),
    ('a0000000-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'Maharashtra', 'Pune', 'Baramati', NULL),
    ('a0000000-0000-0000-0000-000000000003', '33333333-3333-3333-3333-333333333333', 'Maharashtra', 'Pune', 'Haveli', NULL)
ON CONFLICT DO NOTHING;
