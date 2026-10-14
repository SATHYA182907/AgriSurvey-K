-- ==============================================================================
-- AgriSurvey Database Schema
-- Migration 0002: Row Level Security (RLS), Role Functions, & Storage Setup
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- Enable Row Level Security on all core tables
-- ------------------------------------------------------------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE farmer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE registration_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE land_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE farmer_land_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE drone_imagery ENABLE ROW LEVEL SECURITY;
ALTER TABLE image_comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE comparison_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_regions ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- Role and Security Helper Functions
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS user_role AS $$
BEGIN
    RETURN (SELECT role FROM public.profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (SELECT role = 'admin' FROM public.profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_tahsildar()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (SELECT role = 'tahsildar' FROM public.profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_field_worker()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (SELECT role = 'field_worker' FROM public.profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.can_staff_access_region(p_district TEXT, p_taluk TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    IF public.is_admin() THEN
        RETURN TRUE;
    END IF;
    
    RETURN EXISTS (
        SELECT 1 FROM public.staff_regions 
        WHERE staff_user_id = auth.uid() 
          AND district = p_district 
          AND (taluk IS NULL OR taluk = p_taluk)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- Policies: profiles
-- ------------------------------------------------------------------------------
-- Users can view their own profile; Tahsildars, Field Workers, Admins can view profiles needed for operations
CREATE POLICY "Users view own profile" 
    ON profiles FOR SELECT 
    USING (auth.uid() = id OR public.is_admin() OR public.is_tahsildar() OR public.is_field_worker());

CREATE POLICY "Users update own non-role profile fields" 
    ON profiles FOR UPDATE 
    USING (auth.uid() = id) 
    WITH CHECK (auth.uid() = id AND role = (SELECT role FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Admins full manage profiles" 
    ON profiles FOR ALL 
    USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- Policies: farmer_profiles
-- ------------------------------------------------------------------------------
CREATE POLICY "Farmers view own profile" 
    ON farmer_profiles FOR SELECT 
    USING (user_id = auth.uid() OR public.is_admin() OR public.is_tahsildar());

CREATE POLICY "Farmers update own profile" 
    ON farmer_profiles FOR UPDATE 
    USING (user_id = auth.uid()) 
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Farmers insert own profile" 
    ON farmer_profiles FOR INSERT 
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins manage farmer_profiles" 
    ON farmer_profiles FOR ALL 
    USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- Policies: properties
-- ------------------------------------------------------------------------------
CREATE POLICY "Farmers view own properties" 
    ON properties FOR SELECT 
    USING (farmer_id = auth.uid() OR public.is_admin() OR public.can_staff_access_region(district, taluk));

CREATE POLICY "Farmers insert own properties" 
    ON properties FOR INSERT 
    WITH CHECK (farmer_id = auth.uid());

CREATE POLICY "Farmers update own properties" 
    ON properties FOR UPDATE 
    USING (farmer_id = auth.uid()) 
    WITH CHECK (farmer_id = auth.uid());

CREATE POLICY "Admins manage properties" 
    ON properties FOR ALL 
    USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- Policies: registration_applications
-- ------------------------------------------------------------------------------
CREATE POLICY "Farmers view own applications" 
    ON registration_applications FOR SELECT 
    USING (
        farmer_id = auth.uid() 
        OR public.is_admin() 
        OR (public.is_tahsildar() AND EXISTS (
            SELECT 1 FROM properties p 
            WHERE p.id = registration_applications.property_id 
              AND public.can_staff_access_region(p.district, p.taluk)
        ))
        OR (public.is_field_worker() AND EXISTS (
            SELECT 1 FROM field_inspections fi 
            WHERE fi.application_id = registration_applications.id 
              AND fi.assigned_worker_id = auth.uid()
        ))
    );

CREATE POLICY "Farmers submit new applications" 
    ON registration_applications FOR INSERT 
    WITH CHECK (farmer_id = auth.uid() AND status = 'PENDING_TAHSILDAR_REVIEW');

CREATE POLICY "Tahsildars review applications in jurisdiction" 
    ON registration_applications FOR UPDATE 
    USING (
        public.is_admin() 
        OR (public.is_tahsildar() AND EXISTS (
            SELECT 1 FROM properties p 
            WHERE p.id = registration_applications.property_id 
              AND public.can_staff_access_region(p.district, p.taluk)
        ))
    );

-- ------------------------------------------------------------------------------
-- Policies: land_documents
-- ------------------------------------------------------------------------------
CREATE POLICY "Farmers view own uploaded documents" 
    ON land_documents FOR SELECT 
    USING (
        uploaded_by = auth.uid() 
        OR public.is_admin() 
        OR (public.is_tahsildar() AND EXISTS (
            SELECT 1 FROM properties p 
            WHERE p.id = land_documents.property_id 
              AND public.can_staff_access_region(p.district, p.taluk)
        ))
    );

CREATE POLICY "Farmers insert documents for own properties" 
    ON land_documents FOR INSERT 
    WITH CHECK (uploaded_by = auth.uid());

-- ------------------------------------------------------------------------------
-- Policies: farmer_land_images
-- ------------------------------------------------------------------------------
CREATE POLICY "Farmers and authorized officers view land images" 
    ON farmer_land_images FOR SELECT 
    USING (
        uploaded_by = auth.uid() 
        OR public.is_admin() 
        OR public.is_tahsildar() 
        OR public.is_field_worker()
    );

CREATE POLICY "Farmers upload images only for approved applications" 
    ON farmer_land_images FOR INSERT 
    WITH CHECK (
        uploaded_by = auth.uid() 
        AND EXISTS (
            SELECT 1 FROM registration_applications ra 
            WHERE ra.id = farmer_land_images.application_id 
              AND ra.farmer_id = auth.uid() 
              AND ra.status = 'APPROVED'
        )
    );

-- ------------------------------------------------------------------------------
-- Policies: field_inspections
-- ------------------------------------------------------------------------------
CREATE POLICY "View field inspections" 
    ON field_inspections FOR SELECT 
    USING (
        assigned_worker_id = auth.uid() 
        OR assigned_tahsildar_id = auth.uid() 
        OR public.is_admin() 
        OR EXISTS (
            SELECT 1 FROM registration_applications ra 
            WHERE ra.id = field_inspections.application_id 
              AND ra.farmer_id = auth.uid()
        )
    );

CREATE POLICY "Tahsildar or Admin assign field inspections" 
    ON field_inspections FOR INSERT 
    WITH CHECK (public.is_admin() OR public.is_tahsildar());

CREATE POLICY "Workers update assigned inspection progress" 
    ON field_inspections FOR UPDATE 
    USING (assigned_worker_id = auth.uid() OR public.is_admin() OR public.is_tahsildar());

-- ------------------------------------------------------------------------------
-- Policies: drone_imagery
-- ------------------------------------------------------------------------------
CREATE POLICY "View drone imagery" 
    ON drone_imagery FOR SELECT 
    USING (
        uploaded_by = auth.uid() 
        OR public.is_admin() 
        OR public.is_tahsildar()
        OR EXISTS (
            SELECT 1 FROM registration_applications ra 
            WHERE ra.id = drone_imagery.application_id 
              AND ra.farmer_id = auth.uid()
        )
    );

CREATE POLICY "Field workers upload drone imagery for assigned inspections" 
    ON drone_imagery FOR INSERT 
    WITH CHECK (
        uploaded_by = auth.uid() 
        AND public.is_field_worker() 
        AND EXISTS (
            SELECT 1 FROM field_inspections fi 
            WHERE fi.id = drone_imagery.inspection_id 
              AND fi.assigned_worker_id = auth.uid()
        )
    );

-- ------------------------------------------------------------------------------
-- Policies: image_comparisons & comparison_images
-- ------------------------------------------------------------------------------
CREATE POLICY "View comparisons" 
    ON image_comparisons FOR SELECT 
    USING (public.is_admin() OR public.is_tahsildar());

CREATE POLICY "Tahsildars record comparisons" 
    ON image_comparisons FOR INSERT 
    WITH CHECK (public.is_tahsildar() OR public.is_admin());

CREATE POLICY "View comparison_images" 
    ON comparison_images FOR SELECT 
    USING (public.is_admin() OR public.is_tahsildar());

CREATE POLICY "Insert comparison_images" 
    ON comparison_images FOR INSERT 
    WITH CHECK (public.is_tahsildar() OR public.is_admin());

-- ------------------------------------------------------------------------------
-- Policies: crop_verifications
-- ------------------------------------------------------------------------------
CREATE POLICY "View crop verifications" 
    ON crop_verifications FOR SELECT 
    USING (
        public.is_admin() 
        OR public.is_tahsildar() 
        OR EXISTS (
            SELECT 1 FROM registration_applications ra 
            WHERE ra.id = crop_verifications.application_id 
              AND ra.farmer_id = auth.uid()
        )
    );

CREATE POLICY "Tahsildars submit crop verifications" 
    ON crop_verifications FOR INSERT 
    WITH CHECK (public.is_tahsildar() OR public.is_admin());

-- ------------------------------------------------------------------------------
-- Policies: verification_reports
-- ------------------------------------------------------------------------------
CREATE POLICY "View verification reports" 
    ON verification_reports FOR SELECT 
    USING (
        public.is_admin() 
        OR public.is_tahsildar() 
        OR EXISTS (
            SELECT 1 FROM registration_applications ra 
            WHERE ra.id = verification_reports.application_id 
              AND ra.farmer_id = auth.uid()
        )
    );

CREATE POLICY "Tahsildars generate reports" 
    ON verification_reports FOR INSERT 
    WITH CHECK (public.is_tahsildar() OR public.is_admin());

-- ------------------------------------------------------------------------------
-- Policies: notifications
-- ------------------------------------------------------------------------------
CREATE POLICY "Users view own notifications" 
    ON notifications FOR SELECT 
    USING (recipient_user_id = auth.uid());

CREATE POLICY "Users mark own notifications read" 
    ON notifications FOR UPDATE 
    USING (recipient_user_id = auth.uid());

CREATE POLICY "System/Admins insert notifications" 
    ON notifications FOR INSERT 
    WITH CHECK (TRUE);

-- ------------------------------------------------------------------------------
-- Policies: audit_logs
-- ------------------------------------------------------------------------------
CREATE POLICY "Admins view audit logs" 
    ON audit_logs FOR SELECT 
    USING (public.is_admin());

CREATE POLICY "Insert audit logs" 
    ON audit_logs FOR INSERT 
    WITH CHECK (TRUE);

-- ------------------------------------------------------------------------------
-- Policies: staff_regions
-- ------------------------------------------------------------------------------
CREATE POLICY "View staff regions" 
    ON staff_regions FOR SELECT 
    USING (staff_user_id = auth.uid() OR public.is_admin() OR public.is_tahsildar());

CREATE POLICY "Admins manage staff regions" 
    ON staff_regions FOR ALL 
    USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- Automatic Profile Creation Trigger on Auth Signup
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, role, account_status)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', 'AgriSurvey User'),
        new.email,
        COALESCE((new.raw_user_meta_data->>'role')::user_role, 'farmer'),
        'active'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
