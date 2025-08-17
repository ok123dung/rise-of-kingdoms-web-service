-- =====================================================
-- RoK Services Database Performance Optimization
-- Fixed version - matches actual database schema
-- =====================================================

-- =====================================================
-- User Management Indexes
-- =====================================================

-- User lookup and authentication
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_rok_kingdom ON users(rok_kingdom);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- Account linking
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_provider_providerAccountId ON accounts(provider, provider_account_id);

-- Session management
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_session_token ON sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires) WHERE expires > NOW();

-- Two-factor authentication
CREATE INDEX IF NOT EXISTS idx_two_factor_auth_user_id ON two_factor_auth(user_id);

-- Password history
CREATE INDEX IF NOT EXISTS idx_password_history_user_id_created ON password_history(user_id, created_at DESC);

-- =====================================================
-- Service & Booking Indexes
-- =====================================================

-- Service lookup
CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_services_category_active ON services(category, is_active);
CREATE INDEX IF NOT EXISTS idx_services_priority ON services(priority) WHERE is_active = true;

-- Service tier lookup
CREATE INDEX IF NOT EXISTS idx_service_tiers_service_id ON service_tiers(service_id);
CREATE INDEX IF NOT EXISTS idx_service_tiers_service_priority ON service_tiers(service_id, priority);

-- Booking management
CREATE INDEX IF NOT EXISTS idx_bookings_user_id_status ON bookings(user_id, status);
CREATE INDEX IF NOT EXISTS idx_bookings_status_created ON bookings(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_service_tier ON bookings(service_tier_id);
CREATE INDEX IF NOT EXISTS idx_bookings_start_date ON bookings(start_date) WHERE start_date IS NOT NULL;

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_bookings_user_status_created ON bookings(user_id, status, created_at DESC);

-- =====================================================
-- Payment Processing Indexes
-- =====================================================

-- Payment lookup
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_status_created ON payments(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_gateway_status ON payments(payment_gateway, status);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments(gateway_transaction_id) WHERE gateway_transaction_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_payments_payment_number ON payments(payment_number);

-- Composite index for payment reconciliation
CREATE INDEX IF NOT EXISTS idx_payments_booking_status ON payments(booking_id, status);

-- =====================================================
-- Communication & Lead Management Indexes
-- =====================================================

-- Communication lookup
CREATE INDEX IF NOT EXISTS idx_communications_user_id ON communications(user_id);
CREATE INDEX IF NOT EXISTS idx_communications_booking_id ON communications(booking_id) WHERE booking_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_communications_type_created ON communications(type, created_at DESC);

-- Lead management
CREATE INDEX IF NOT EXISTS idx_leads_status_created ON leads(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to) WHERE assigned_to IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source) WHERE source IS NOT NULL;

-- =====================================================
-- File Management Indexes
-- =====================================================

-- File upload lookup
CREATE INDEX IF NOT EXISTS idx_file_uploads_user_id ON file_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_file_uploads_created_at ON file_uploads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_file_uploads_key ON file_uploads(key);

-- =====================================================
-- Audit & Logging Indexes
-- =====================================================

-- Audit log queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_created ON audit_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_created ON audit_logs(action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Security log queries
CREATE INDEX IF NOT EXISTS idx_security_logs_user_created ON security_logs(user_id, created_at DESC) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_security_logs_event_created ON security_logs(event, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_logs_ip ON security_logs(ip) WHERE ip IS NOT NULL;

-- System log queries
CREATE INDEX IF NOT EXISTS idx_system_logs_level_created ON system_logs(level, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_logs_category_created ON system_logs(category, created_at DESC);

-- =====================================================
-- Webhook Processing Indexes
-- =====================================================

-- Webhook event processing
CREATE INDEX IF NOT EXISTS idx_webhook_events_status_next ON webhook_events(status, next_retry_at) 
    WHERE status IN ('pending', 'failed') AND next_retry_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_webhook_events_type_status ON webhook_events(event_type, status);
CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at ON webhook_events(created_at DESC);

-- =====================================================
-- Staff Management Indexes
-- =====================================================

-- Staff lookup
CREATE INDEX IF NOT EXISTS idx_staff_user_id ON staff(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_role_active ON staff(role, is_active) WHERE is_active = true;

-- Service task management
CREATE INDEX IF NOT EXISTS idx_service_tasks_booking_id ON service_tasks(booking_id);
CREATE INDEX IF NOT EXISTS idx_service_tasks_assigned_status ON service_tasks(assigned_to, status) WHERE assigned_to IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_service_tasks_due_date ON service_tasks(due_date) WHERE status != 'completed' AND due_date IS NOT NULL;

-- =====================================================
-- Partial Indexes for Common Queries
-- =====================================================

-- Active bookings for dashboard
CREATE INDEX IF NOT EXISTS idx_bookings_active_user ON bookings(user_id, created_at DESC) 
    WHERE status IN ('pending', 'confirmed', 'in_progress');

-- Pending payments
CREATE INDEX IF NOT EXISTS idx_payments_pending ON payments(created_at DESC) 
    WHERE status = 'pending';

-- Failed webhook events
CREATE INDEX IF NOT EXISTS idx_webhook_events_failed ON webhook_events(next_retry_at) 
    WHERE status = 'failed' AND retry_count < max_retries;

-- =====================================================
-- JSON/JSONB Indexes (Safe)
-- =====================================================

DO $$ 
DECLARE
    col_type TEXT;
BEGIN
    -- Payment metadata
    SELECT data_type INTO col_type FROM information_schema.columns 
    WHERE table_name = 'payments' AND column_name = 'metadata';
    
    IF col_type = 'jsonb' THEN
        CREATE INDEX IF NOT EXISTS idx_payments_metadata ON payments USING gin(metadata);
    END IF;
    
    -- Webhook payload
    SELECT data_type INTO col_type FROM information_schema.columns 
    WHERE table_name = 'webhook_events' AND column_name = 'payload';
    
    IF col_type = 'jsonb' THEN
        CREATE INDEX IF NOT EXISTS idx_webhook_events_payload ON webhook_events USING gin(payload);
    END IF;
    
    -- File metadata
    SELECT data_type INTO col_type FROM information_schema.columns 
    WHERE table_name = 'file_uploads' AND column_name = 'metadata';
    
    IF col_type = 'jsonb' THEN
        CREATE INDEX IF NOT EXISTS idx_file_uploads_metadata ON file_uploads USING gin(metadata);
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error creating GIN indexes: %', SQLERRM;
END $$;

-- =====================================================
-- Analyze Tables
-- =====================================================

DO $$ 
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN 
        SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    LOOP
        EXECUTE 'ANALYZE ' || quote_ident(tbl);
    END LOOP;
    
    RAISE NOTICE 'All tables analyzed successfully';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error analyzing tables: %', SQLERRM;
END $$;

-- =====================================================
-- Summary
-- =====================================================

DO $$
DECLARE
    index_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes
    WHERE schemaname = 'public';
    
    RAISE NOTICE '✅ Index creation completed!';
    RAISE NOTICE '📊 Total indexes: %', index_count;
END $$;