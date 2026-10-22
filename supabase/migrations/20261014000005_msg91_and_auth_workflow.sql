-- ==============================================================================
-- AgriSurvey Migration: 20261014000005_msg91_and_auth_workflow.sql
-- Description: Supports Tahsildar approval, single-use 48h account activation tokens,
--              MSG91 SMS notification jobs with idempotency, and pending activation state.
-- ==============================================================================

-- 1. Add 'pending_activation' to account_status enum safely
DO $$
BEGIN
  ALTER TYPE account_status ADD VALUE IF NOT EXISTS 'pending_activation';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 2. Extend profiles with username and activation tracking
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS activation_token TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS activation_expires_at TIMESTAMPTZ;

-- 3. Dedicated single-use activation tokens table
CREATE TABLE IF NOT EXISTS activation_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  application_id UUID REFERENCES registration_applications(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activation_tokens_token ON activation_tokens(token);
CREATE INDEX IF NOT EXISTS idx_activation_tokens_user_id ON activation_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_activation_tokens_app_id ON activation_tokens(application_id);

-- 4. Enable RLS on activation_tokens
ALTER TABLE activation_tokens ENABLE ROW LEVEL SECURITY;

-- Allow public verification of active tokens during account activation flow
CREATE POLICY "Public can read activation tokens by token lookup"
  ON activation_tokens FOR SELECT
  USING (used_at IS NULL AND expires_at > NOW());

-- Allow Tahsildars, Admins, and service_role to manage activation tokens
CREATE POLICY "Staff can manage activation tokens"
  ON activation_tokens FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('tahsildar', 'admin')
    )
  );

-- 5. Extend notification_jobs for MSG91 integration & idempotent retries
ALTER TABLE notification_jobs
  ADD COLUMN IF NOT EXISTS application_id UUID REFERENCES registration_applications(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS recipient_phone TEXT,
  ADD COLUMN IF NOT EXISTS template_id TEXT,
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS error_details TEXT;

CREATE INDEX IF NOT EXISTS idx_notif_jobs_app_id ON notification_jobs(application_id);
CREATE INDEX IF NOT EXISTS idx_notif_jobs_idempotency ON notification_jobs(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_notif_jobs_delivery_status ON notification_jobs(delivery_status);

-- 6. Environment variable documentation for MSG91:
-- MSG91_AUTH_KEY: Master auth key from MSG91 dashboard
-- MSG91_SENDER_ID: 6-character sender ID approved on DLT (e.g., AGRSRV / PUNREV)
-- MSG91_APPROVAL_TEMPLATE_ID: DLT approved flow/template ID for farmer approval
-- APP_LOGIN_URL: Public URL of the AgriSurvey portal (e.g. https://agrisurvey.gov.in/auth/login)
