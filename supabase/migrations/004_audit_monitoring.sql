-- =====================================================
-- RoK Services Database Audit & Monitoring Enhancement
-- Comprehensive Audit Trail and Performance Monitoring
-- =====================================================

-- =====================================================
-- Enhanced Audit Log Triggers
-- =====================================================

-- Create function to capture detailed audit information
CREATE OR REPLACE FUNCTION public.create_audit_log()
RETURNS TRIGGER AS $$
DECLARE
    audit_user_id TEXT;
    audit_action TEXT;
    old_data JSONB;
    new_data JSONB;
    changed_fields JSONB;
BEGIN
    -- Get the user ID from auth context
    audit_user_id := COALESCE(auth.uid()::text, current_setting('app.current_user_id', true));
    
    -- Determine the action
    audit_action := TG_OP;
    
    -- Capture data based on operation
    IF TG_OP = 'DELETE' THEN
        old_data := to_jsonb(OLD);
        new_data := NULL;
    ELSIF TG_OP = 'UPDATE' THEN
        old_data := to_jsonb(OLD);
        new_data := to_jsonb(NEW);
        -- Calculate changed fields
        SELECT jsonb_object_agg(key, value) INTO changed_fields
        FROM (
            SELECT key, new_data->key as value
            FROM jsonb_each(new_data)
            WHERE new_data->key IS DISTINCT FROM old_data->key
        ) changes;
    ELSE -- INSERT
        old_data := NULL;
        new_data := to_jsonb(NEW);
    END IF;
    
    -- Insert audit log
    INSERT INTO audit_logs (
        user_id,
        action,
        entity_type,
        entity_id,
        old_data,
        new_data,
        changed_fields,
        ip_address,
        user_agent,
        created_at
    ) VALUES (
        audit_user_id,
        audit_action,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id)::TEXT,
        old_data,
        new_data,
        changed_fields,
        current_setting('app.current_ip', true),
        current_setting('app.current_user_agent', true),
        NOW()
    );
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit triggers for critical tables
CREATE TRIGGER audit_users_changes
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_bookings_changes
    AFTER INSERT OR UPDATE OR DELETE ON bookings
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_payments_changes
    AFTER INSERT OR UPDATE OR DELETE ON payments
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_staff_changes
    AFTER INSERT OR UPDATE OR DELETE ON staff
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

-- =====================================================
-- Performance Monitoring Tables
-- =====================================================

-- Query performance tracking
CREATE TABLE IF NOT EXISTS public.query_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_hash TEXT NOT NULL,
    query_text TEXT,
    execution_time_ms NUMERIC NOT NULL,
    rows_returned INTEGER,
    database_name TEXT DEFAULT current_database(),
    user_id TEXT,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for performance queries
CREATE INDEX idx_query_performance_hash ON query_performance(query_hash);
CREATE INDEX idx_query_performance_time ON query_performance(execution_time_ms DESC);
CREATE INDEX idx_query_performance_created ON query_performance(created_at DESC);

-- Database metrics table
CREATE TABLE IF NOT EXISTS public.database_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_type TEXT NOT NULL,
    metric_value NUMERIC NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_database_metrics_type_time ON database_metrics(metric_type, created_at DESC);

-- =====================================================
-- Security Monitoring Functions
-- =====================================================

-- Function to track failed login attempts
CREATE OR REPLACE FUNCTION public.track_failed_login(
    p_email TEXT,
    p_ip_address TEXT,
    p_user_agent TEXT,
    p_reason TEXT
) RETURNS void AS $$
BEGIN
    INSERT INTO security_logs (
        user_id,
        event_type,
        event_description,
        ip_address,
        user_agent,
        severity,
        metadata,
        created_at
    ) VALUES (
        (SELECT id FROM users WHERE email = p_email LIMIT 1),
        'failed_login',
        'Failed login attempt: ' || p_reason,
        p_ip_address,
        p_user_agent,
        'warning',
        jsonb_build_object(
            'email', p_email,
            'reason', p_reason,
            'timestamp', NOW()
        ),
        NOW()
    );
    
    -- Check for brute force attempts
    IF (
        SELECT COUNT(*) 
        FROM security_logs 
        WHERE ip_address = p_ip_address 
        AND event_type = 'failed_login' 
        AND created_at > NOW() - INTERVAL '15 minutes'
    ) >= 5 THEN
        -- Log potential brute force
        INSERT INTO security_logs (
            event_type,
            event_description,
            ip_address,
            severity,
            metadata,
            created_at
        ) VALUES (
            'brute_force_detected',
            'Multiple failed login attempts detected',
            p_ip_address,
            'critical',
            jsonb_build_object(
                'attempts_count', (
                    SELECT COUNT(*) 
                    FROM security_logs 
                    WHERE ip_address = p_ip_address 
                    AND event_type = 'failed_login' 
                    AND created_at > NOW() - INTERVAL '15 minutes'
                )
            ),
            NOW()
        );
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to track successful logins
CREATE OR REPLACE FUNCTION public.track_successful_login(
    p_user_id TEXT,
    p_ip_address TEXT,
    p_user_agent TEXT,
    p_auth_method TEXT
) RETURNS void AS $$
BEGIN
    INSERT INTO security_logs (
        user_id,
        event_type,
        event_description,
        ip_address,
        user_agent,
        severity,
        metadata,
        created_at
    ) VALUES (
        p_user_id,
        'successful_login',
        'User logged in successfully',
        p_ip_address,
        p_user_agent,
        'info',
        jsonb_build_object(
            'auth_method', p_auth_method,
            'timestamp', NOW()
        ),
        NOW()
    );
    
    -- Update user last login
    UPDATE users 
    SET last_login_at = NOW() 
    WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Monitoring Views
-- =====================================================

-- Active sessions monitoring
CREATE OR REPLACE VIEW public.active_sessions_monitor AS
SELECT 
    s.user_id,
    u.email,
    s.session_token,
    s.expires,
    s.created_at,
    DATE_PART('day', s.expires - NOW()) as days_until_expiry,
    sl.ip_address as last_ip,
    sl.user_agent as last_user_agent
FROM sessions s
JOIN users u ON u.id = s.user_id
LEFT JOIN LATERAL (
    SELECT ip_address, user_agent 
    FROM security_logs 
    WHERE user_id = s.user_id 
    AND event_type = 'successful_login'
    ORDER BY created_at DESC 
    LIMIT 1
) sl ON true
WHERE s.expires > NOW()
ORDER BY s.created_at DESC;

-- Audit activity summary
CREATE OR REPLACE VIEW public.audit_activity_summary AS
SELECT 
    DATE_TRUNC('hour', created_at) as hour,
    entity_type,
    action,
    COUNT(*) as event_count,
    COUNT(DISTINCT user_id) as unique_users
FROM audit_logs
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', created_at), entity_type, action
ORDER BY hour DESC, event_count DESC;

-- Security threats dashboard
CREATE OR REPLACE VIEW public.security_threats_monitor AS
SELECT 
    event_type,
    severity,
    COUNT(*) as event_count,
    COUNT(DISTINCT ip_address) as unique_ips,
    COUNT(DISTINCT user_id) as affected_users,
    MAX(created_at) as last_occurrence
FROM security_logs
WHERE created_at > NOW() - INTERVAL '24 hours'
AND severity IN ('warning', 'critical')
GROUP BY event_type, severity
ORDER BY severity DESC, event_count DESC;

-- Performance bottlenecks view
CREATE OR REPLACE VIEW public.performance_bottlenecks AS
SELECT 
    query_hash,
    LEFT(query_text, 100) || '...' as query_preview,
    COUNT(*) as execution_count,
    AVG(execution_time_ms) as avg_time_ms,
    MAX(execution_time_ms) as max_time_ms,
    MIN(execution_time_ms) as min_time_ms,
    SUM(execution_time_ms) as total_time_ms
FROM query_performance
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY query_hash, query_text
HAVING AVG(execution_time_ms) > 100
ORDER BY avg_time_ms DESC
LIMIT 20;

-- =====================================================
-- Automated Monitoring Procedures
-- =====================================================

-- Function to collect database statistics
CREATE OR REPLACE FUNCTION public.collect_database_metrics()
RETURNS void AS $$
DECLARE
    db_size BIGINT;
    total_connections INTEGER;
    active_connections INTEGER;
    table_sizes JSONB;
BEGIN
    -- Database size
    SELECT pg_database_size(current_database()) INTO db_size;
    INSERT INTO database_metrics (metric_type, metric_value, metadata)
    VALUES ('database_size', db_size, jsonb_build_object('unit', 'bytes'));
    
    -- Connection stats
    SELECT count(*) INTO total_connections FROM pg_stat_activity;
    SELECT count(*) INTO active_connections 
    FROM pg_stat_activity 
    WHERE state = 'active';
    
    INSERT INTO database_metrics (metric_type, metric_value, metadata)
    VALUES 
        ('total_connections', total_connections, NULL),
        ('active_connections', active_connections, NULL);
    
    -- Table sizes
    SELECT jsonb_object_agg(
        schemaname || '.' || tablename,
        pg_total_relation_size(schemaname||'.'||tablename)
    ) INTO table_sizes
    FROM pg_tables
    WHERE schemaname = 'public';
    
    INSERT INTO database_metrics (metric_type, metric_value, metadata)
    VALUES ('table_sizes', 0, table_sizes);
    
    -- Clean old metrics (keep 30 days)
    DELETE FROM database_metrics 
    WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Alert Functions
-- =====================================================

-- Function to check for anomalies
CREATE OR REPLACE FUNCTION public.check_security_anomalies()
RETURNS TABLE (
    alert_type TEXT,
    severity TEXT,
    description TEXT,
    details JSONB
) AS $$
BEGIN
    -- Check for multiple failed logins
    RETURN QUERY
    SELECT 
        'multiple_failed_logins'::TEXT,
        'warning'::TEXT,
        'Multiple failed login attempts detected'::TEXT,
        jsonb_build_object(
            'ip_address', ip_address,
            'attempts', COUNT(*),
            'emails', array_agg(DISTINCT metadata->>'email')
        )
    FROM security_logs
    WHERE event_type = 'failed_login'
    AND created_at > NOW() - INTERVAL '1 hour'
    GROUP BY ip_address
    HAVING COUNT(*) >= 10;
    
    -- Check for unusual activity patterns
    RETURN QUERY
    SELECT 
        'unusual_activity'::TEXT,
        'warning'::TEXT,
        'Unusual user activity detected'::TEXT,
        jsonb_build_object(
            'user_id', user_id,
            'actions_count', COUNT(*),
            'entity_types', array_agg(DISTINCT entity_type)
        )
    FROM audit_logs
    WHERE created_at > NOW() - INTERVAL '1 hour'
    GROUP BY user_id
    HAVING COUNT(*) > 100;
    
    -- Check for performance degradation
    RETURN QUERY
    SELECT 
        'slow_queries'::TEXT,
        'warning'::TEXT,
        'Slow queries detected'::TEXT,
        jsonb_build_object(
            'slow_query_count', COUNT(*),
            'avg_execution_time', AVG(execution_time_ms)
        )
    FROM query_performance
    WHERE created_at > NOW() - INTERVAL '10 minutes'
    AND execution_time_ms > 1000
    GROUP BY true
    HAVING COUNT(*) > 5;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Data Retention Policies
-- =====================================================

-- Function to clean old logs
CREATE OR REPLACE FUNCTION public.cleanup_old_logs()
RETURNS void AS $$
BEGIN
    -- Clean audit logs older than 90 days (keep critical actions longer)
    DELETE FROM audit_logs 
    WHERE created_at < NOW() - INTERVAL '90 days'
    AND action NOT IN ('DELETE', 'payment_completed', 'user_deleted');
    
    -- Clean security logs older than 30 days (keep critical events)
    DELETE FROM security_logs 
    WHERE created_at < NOW() - INTERVAL '30 days'
    AND severity NOT IN ('critical', 'error');
    
    -- Clean system logs older than 7 days
    DELETE FROM system_logs 
    WHERE created_at < NOW() - INTERVAL '7 days'
    AND level NOT IN ('error', 'critical');
    
    -- Clean query performance older than 7 days
    DELETE FROM query_performance 
    WHERE created_at < NOW() - INTERVAL '7 days';
    
    -- Archive old webhook events
    DELETE FROM webhook_events 
    WHERE created_at < NOW() - INTERVAL '30 days'
    AND status = 'completed';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Scheduled Jobs (using pg_cron or similar)
-- =====================================================

-- Note: These need to be set up in Supabase dashboard or using pg_cron
-- Example cron jobs:
-- SELECT cron.schedule('collect-metrics', '*/5 * * * *', 'SELECT public.collect_database_metrics()');
-- SELECT cron.schedule('cleanup-logs', '0 2 * * *', 'SELECT public.cleanup_old_logs()');
-- SELECT cron.schedule('check-anomalies', '*/15 * * * *', 'SELECT * FROM public.check_security_anomalies()');

-- =====================================================
-- Monitoring Dashboard Functions
-- =====================================================

-- Function to get system health status
CREATE OR REPLACE FUNCTION public.get_system_health()
RETURNS JSONB AS $$
DECLARE
    health_status JSONB;
BEGIN
    health_status := jsonb_build_object(
        'database_size', (
            SELECT pg_size_pretty(pg_database_size(current_database()))
        ),
        'active_users_24h', (
            SELECT COUNT(DISTINCT user_id) 
            FROM audit_logs 
            WHERE created_at > NOW() - INTERVAL '24 hours'
        ),
        'total_bookings_24h', (
            SELECT COUNT(*) 
            FROM bookings 
            WHERE created_at > NOW() - INTERVAL '24 hours'
        ),
        'failed_logins_1h', (
            SELECT COUNT(*) 
            FROM security_logs 
            WHERE event_type = 'failed_login' 
            AND created_at > NOW() - INTERVAL '1 hour'
        ),
        'slow_queries_10m', (
            SELECT COUNT(*) 
            FROM query_performance 
            WHERE execution_time_ms > 1000 
            AND created_at > NOW() - INTERVAL '10 minutes'
        ),
        'error_count_1h', (
            SELECT COUNT(*) 
            FROM system_logs 
            WHERE level IN ('error', 'critical') 
            AND created_at > NOW() - INTERVAL '1 hour'
        )
    );
    
    RETURN health_status;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_system_health TO authenticated;