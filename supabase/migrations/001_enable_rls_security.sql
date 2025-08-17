-- =====================================================
-- RoK Services Database Security Enhancement
-- Row-Level Security (RLS) Policies Implementation
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE two_factor_auth ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- User Management Policies
-- =====================================================

-- Users table: Users can view and update their own profile
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (
        auth.uid()::text = id OR
        EXISTS (SELECT 1 FROM staff WHERE user_id = auth.uid()::text AND role IN ('admin', 'manager'))
    );

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id)
    WITH CHECK (auth.uid()::text = id);

-- Admins can manage all users
CREATE POLICY "Admins can manage users" ON users
    FOR ALL USING (
        EXISTS (SELECT 1 FROM staff WHERE user_id = auth.uid()::text AND role = 'admin')
    );

-- =====================================================
-- Account & Authentication Policies
-- =====================================================

-- Accounts: Users manage their own linked accounts
CREATE POLICY "Users manage own accounts" ON accounts
    FOR ALL USING (user_id = auth.uid()::text);

-- Sessions: Users can only see their own sessions
CREATE POLICY "Users view own sessions" ON sessions
    FOR SELECT USING (user_id = auth.uid()::text);

-- Two-factor auth: Users manage their own 2FA
CREATE POLICY "Users manage own 2FA" ON two_factor_auth
    FOR ALL USING (user_id = auth.uid()::text);

-- Password history: Only accessible by the user
CREATE POLICY "Users view own password history" ON password_history
    FOR SELECT USING (user_id = auth.uid()::text);

-- =====================================================
-- Service & Booking Policies
-- =====================================================

-- Services: Public read, admin write
CREATE POLICY "Public can view active services" ON services
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage services" ON services
    FOR ALL USING (
        EXISTS (SELECT 1 FROM staff WHERE user_id = auth.uid()::text AND role = 'admin')
    );

-- Service tiers: Public read, admin write
CREATE POLICY "Public can view service tiers" ON service_tiers
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM services WHERE id = service_id AND is_active = true)
    );

CREATE POLICY "Admins can manage service tiers" ON service_tiers
    FOR ALL USING (
        EXISTS (SELECT 1 FROM staff WHERE user_id = auth.uid()::text AND role = 'admin')
    );

-- Bookings: Users see own, staff see assigned
CREATE POLICY "Users view own bookings" ON bookings
    FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Staff view assigned bookings" ON bookings
    FOR SELECT USING (
        assigned_staff_id IN (SELECT id FROM staff WHERE user_id = auth.uid()::text) OR
        EXISTS (SELECT 1 FROM staff WHERE user_id = auth.uid()::text AND role IN ('admin', 'manager'))
    );

CREATE POLICY "Users create own bookings" ON bookings
    FOR INSERT WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Staff update assigned bookings" ON bookings
    FOR UPDATE USING (
        assigned_staff_id IN (SELECT id FROM staff WHERE user_id = auth.uid()::text) OR
        EXISTS (SELECT 1 FROM staff WHERE user_id = auth.uid()::text AND role IN ('admin', 'manager'))
    );

-- =====================================================
-- Payment Policies
-- =====================================================

-- Payments: Users see own, staff see related bookings
CREATE POLICY "Users view own payments" ON payments
    FOR SELECT USING (
        booking_id IN (SELECT id FROM bookings WHERE user_id = auth.uid()::text)
    );

CREATE POLICY "Staff view booking payments" ON payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM bookings b
            JOIN staff s ON s.user_id = auth.uid()::text
            WHERE b.id = booking_id AND (
                b.assigned_staff_id = s.id OR
                s.role IN ('admin', 'manager', 'finance')
            )
        )
    );

-- =====================================================
-- Communication Policies
-- =====================================================

-- Communications: Users see own, staff see related
CREATE POLICY "Users view own communications" ON communications
    FOR SELECT USING (
        user_id = auth.uid()::text OR
        booking_id IN (SELECT id FROM bookings WHERE user_id = auth.uid()::text)
    );

CREATE POLICY "Staff view related communications" ON communications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM staff s
            LEFT JOIN bookings b ON b.assigned_staff_id = s.id
            WHERE s.user_id = auth.uid()::text AND (
                s.role IN ('admin', 'manager') OR
                b.id = booking_id
            )
        )
    );

CREATE POLICY "Users create communications" ON communications
    FOR INSERT WITH CHECK (
        user_id = auth.uid()::text OR
        EXISTS (SELECT 1 FROM staff WHERE user_id = auth.uid()::text)
    );

-- =====================================================
-- Lead Management Policies
-- =====================================================

-- Leads: Staff only access
CREATE POLICY "Staff view assigned leads" ON leads
    FOR SELECT USING (
        assigned_staff_id IN (SELECT id FROM staff WHERE user_id = auth.uid()::text) OR
        EXISTS (SELECT 1 FROM staff WHERE user_id = auth.uid()::text AND role IN ('admin', 'manager', 'sales'))
    );

CREATE POLICY "Staff manage assigned leads" ON leads
    FOR UPDATE USING (
        assigned_staff_id IN (SELECT id FROM staff WHERE user_id = auth.uid()::text) OR
        EXISTS (SELECT 1 FROM staff WHERE user_id = auth.uid()::text AND role IN ('admin', 'manager'))
    );

-- =====================================================
-- File Upload Policies
-- =====================================================

-- File uploads: Users see own, staff see related
CREATE POLICY "Users view own files" ON file_uploads
    FOR SELECT USING (uploaded_by = auth.uid()::text);

CREATE POLICY "Staff view related files" ON file_uploads
    FOR SELECT USING (
        entity_type = 'booking' AND entity_id IN (
            SELECT id::text FROM bookings b
            JOIN staff s ON s.user_id = auth.uid()::text
            WHERE b.assigned_staff_id = s.id OR s.role IN ('admin', 'manager')
        ) OR
        EXISTS (SELECT 1 FROM staff WHERE user_id = auth.uid()::text AND role = 'admin')
    );

CREATE POLICY "Users upload files" ON file_uploads
    FOR INSERT WITH CHECK (uploaded_by = auth.uid()::text);

-- =====================================================
-- Audit & Logging Policies
-- =====================================================

-- Audit logs: Admin only
CREATE POLICY "Admins view audit logs" ON audit_logs
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM staff WHERE user_id = auth.uid()::text AND role = 'admin')
    );

-- Security logs: Admin and security staff
CREATE POLICY "Security staff view security logs" ON security_logs
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM staff WHERE user_id = auth.uid()::text AND role IN ('admin', 'security'))
    );

-- System logs: Admin only
CREATE POLICY "Admins view system logs" ON system_logs
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM staff WHERE user_id = auth.uid()::text AND role = 'admin')
    );

-- =====================================================
-- Staff Management Policies
-- =====================================================

-- Staff: Staff can view colleagues, admins manage
CREATE POLICY "Staff view staff directory" ON staff
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM staff WHERE user_id = auth.uid()::text)
    );

CREATE POLICY "Admins manage staff" ON staff
    FOR ALL USING (
        EXISTS (SELECT 1 FROM staff WHERE user_id = auth.uid()::text AND role = 'admin')
    );

-- Service tasks: Staff view assigned tasks
CREATE POLICY "Staff view assigned tasks" ON service_tasks
    FOR SELECT USING (
        assigned_to IN (SELECT id FROM staff WHERE user_id = auth.uid()::text) OR
        EXISTS (SELECT 1 FROM staff WHERE user_id = auth.uid()::text AND role IN ('admin', 'manager'))
    );

CREATE POLICY "Staff update assigned tasks" ON service_tasks
    FOR UPDATE USING (
        assigned_to IN (SELECT id FROM staff WHERE user_id = auth.uid()::text) OR
        EXISTS (SELECT 1 FROM staff WHERE user_id = auth.uid()::text AND role IN ('admin', 'manager'))
    );

-- =====================================================
-- Webhook Events Policies
-- =====================================================

-- Webhook events: Admin only
CREATE POLICY "Admins manage webhook events" ON webhook_events
    FOR ALL USING (
        EXISTS (SELECT 1 FROM staff WHERE user_id = auth.uid()::text AND role = 'admin')
    );

-- =====================================================
-- Verification Tokens: System only (no user access)
-- =====================================================
-- No policies for verification_tokens - system use only

-- =====================================================
-- Create helper function for checking staff roles
-- =====================================================
CREATE OR REPLACE FUNCTION public.check_user_role(required_role text)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM staff 
        WHERE user_id = auth.uid()::text 
        AND role = required_role
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.check_user_role TO authenticated;

-- =====================================================
-- Create function to check if user is staff
-- =====================================================
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM staff 
        WHERE user_id = auth.uid()::text
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.is_staff TO authenticated;