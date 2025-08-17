-- =====================================================
-- Cleanup All Existing RLS Policies
-- Run this FIRST to remove all existing policies
-- =====================================================

-- Drop specific policies that we know exist
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users manage own accounts" ON accounts;
DROP POLICY IF EXISTS "Users view own sessions" ON sessions;
DROP POLICY IF EXISTS "Users manage own 2FA" ON two_factor_auth;
DROP POLICY IF EXISTS "Users view own password history" ON password_history;
DROP POLICY IF EXISTS "Public can view active services" ON services;
DROP POLICY IF EXISTS "Public can view service tiers" ON service_tiers;
DROP POLICY IF EXISTS "Users view own bookings" ON bookings;
DROP POLICY IF EXISTS "Users create own bookings" ON bookings;
DROP POLICY IF EXISTS "Users view own payments" ON payments;
DROP POLICY IF EXISTS "Users view own communications" ON communications;
DROP POLICY IF EXISTS "Users view own files" ON file_uploads;
DROP POLICY IF EXISTS "Users upload files" ON file_uploads;
DROP POLICY IF EXISTS "Admins view audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Admins view security logs" ON security_logs;
DROP POLICY IF EXISTS "Admins view system logs" ON system_logs;
DROP POLICY IF EXISTS "Admins manage webhook events" ON webhook_events;
DROP POLICY IF EXISTS "Staff view staff directory" ON staff;
DROP POLICY IF EXISTS "Staff manage leads" ON leads;
DROP POLICY IF EXISTS "Staff manage tasks" ON service_tasks;

-- Drop all other policies dynamically
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
            pol.policyname, pol.schemaname, pol.tablename);
    END LOOP;
    
    RAISE NOTICE 'All policies have been dropped successfully';
END $$;