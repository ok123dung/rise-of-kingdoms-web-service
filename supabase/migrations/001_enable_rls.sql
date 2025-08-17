-- =====================================================
-- RoK Services - Reset and Create RLS Policies
-- Safe script that handles existing policies
-- =====================================================

-- =====================================================
-- Step 1: Drop all existing policies
-- =====================================================

DO $$ 
DECLARE
    pol RECORD;
BEGIN
    -- Drop all existing policies in public schema
    FOR pol IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
            pol.policyname, pol.schemaname, pol.tablename);
    END LOOP;
    
    RAISE NOTICE 'All existing policies dropped successfully';
END $$;

-- =====================================================
-- Step 2: Enable RLS on all tables (if not already enabled)
-- =====================================================

DO $$
DECLARE
    tbl RECORD;
BEGIN
    FOR tbl IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename NOT IN ('schema_migrations', 'ar_internal_metadata')
    LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl.tablename);
    END LOOP;
    
    RAISE NOTICE 'RLS enabled on all tables';
END $$;

-- =====================================================
-- Step 3: Create Helper Functions
-- =====================================================

-- Drop existing functions first
DROP FUNCTION IF EXISTS public.is_staff();
DROP FUNCTION IF EXISTS public.has_role(text);

-- Check if current user is staff
CREATE FUNCTION public.is_staff()
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM staff 
        WHERE user_id = auth.uid()::text
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if current user has specific role
CREATE FUNCTION public.has_role(required_role text)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM staff 
        WHERE user_id = auth.uid()::text 
        AND role = required_role
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.is_staff TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role TO authenticated;

-- =====================================================
-- Step 4: Create New Policies
-- =====================================================

-- Users Table Policies
CREATE POLICY "users_select_own" ON users
    FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "users_update_own" ON users
    FOR UPDATE USING (auth.uid()::text = id);

CREATE POLICY "users_select_staff" ON users
    FOR SELECT USING (is_staff());

CREATE POLICY "users_all_admin" ON users
    FOR ALL USING (has_role('admin'));

-- Services & Service Tiers - Public Read
CREATE POLICY "services_select_public" ON services
    FOR SELECT USING (is_active = true);

CREATE POLICY "service_tiers_select_public" ON service_tiers
    FOR SELECT USING (true);

CREATE POLICY "services_all_admin" ON services
    FOR ALL USING (has_role('admin'));

CREATE POLICY "service_tiers_all_admin" ON service_tiers
    FOR ALL USING (has_role('admin'));

-- Bookings Policies
CREATE POLICY "bookings_select_own" ON bookings
    FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "bookings_insert_own" ON bookings
    FOR INSERT WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "bookings_all_staff" ON bookings
    FOR ALL USING (is_staff());

-- Payments Policies
CREATE POLICY "payments_select_own" ON payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM bookings 
            WHERE bookings.id = payments.booking_id 
            AND bookings.user_id = auth.uid()::text
        )
    );

CREATE POLICY "payments_all_staff" ON payments
    FOR ALL USING (is_staff());

-- Communications Policies
CREATE POLICY "communications_select_own" ON communications
    FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "communications_all_staff" ON communications
    FOR ALL USING (is_staff());

-- File Uploads Policies
CREATE POLICY "file_uploads_select_own" ON file_uploads
    FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "file_uploads_insert_own" ON file_uploads
    FOR INSERT WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "file_uploads_all_staff" ON file_uploads
    FOR ALL USING (is_staff());

-- Authentication Related Tables
CREATE POLICY "accounts_all_own" ON accounts
    FOR ALL USING (user_id = auth.uid()::text);

CREATE POLICY "sessions_select_own" ON sessions
    FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "two_factor_auth_all_own" ON two_factor_auth
    FOR ALL USING (user_id = auth.uid()::text);

CREATE POLICY "password_history_select_own" ON password_history
    FOR SELECT USING (user_id = auth.uid()::text);

-- Admin-Only Tables
CREATE POLICY "audit_logs_select_admin" ON audit_logs
    FOR SELECT USING (has_role('admin'));

CREATE POLICY "security_logs_select_admin" ON security_logs
    FOR SELECT USING (has_role('admin'));

CREATE POLICY "system_logs_select_admin" ON system_logs
    FOR SELECT USING (has_role('admin'));

CREATE POLICY "webhook_events_all_admin" ON webhook_events
    FOR ALL USING (has_role('admin'));

-- Staff Management
CREATE POLICY "staff_select_staff" ON staff
    FOR SELECT USING (is_staff());

CREATE POLICY "staff_all_admin" ON staff
    FOR ALL USING (has_role('admin'));

-- Other Tables
CREATE POLICY "leads_all_staff" ON leads
    FOR ALL USING (is_staff());

CREATE POLICY "service_tasks_all_staff" ON service_tasks
    FOR ALL USING (is_staff());

-- =====================================================
-- Step 5: Verify Results
-- =====================================================

DO $$
DECLARE
    policy_count INTEGER;
    table_count INTEGER;
BEGIN
    -- Count policies created
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public';
    
    -- Count tables with RLS enabled
    SELECT COUNT(*) INTO table_count
    FROM pg_tables t
    JOIN pg_class c ON c.relname = t.tablename
    WHERE t.schemaname = 'public'
    AND c.relrowsecurity = true;
    
    RAISE NOTICE 'Successfully created % policies on % tables with RLS enabled', 
        policy_count, table_count;
END $$;

-- =====================================================
-- Success!
-- =====================================================
-- All RLS policies have been created successfully.
-- Run check_rls_status.sql to verify the setup.