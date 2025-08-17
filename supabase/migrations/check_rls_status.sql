-- =====================================================
-- RoK Services - Check RLS Status
-- Diagnostic script to check security configuration
-- =====================================================

-- =====================================================
-- 1. Check which tables have RLS enabled
-- =====================================================
SELECT '=== TABLES WITH RLS STATUS ===' as section;

SELECT 
    schemaname,
    tablename,
    CASE 
        WHEN c.relrowsecurity THEN '✅ ENABLED'
        ELSE '❌ DISABLED'
    END as rls_status,
    CASE 
        WHEN c.relforcerowsecurity THEN 'YES'
        ELSE 'NO'
    END as force_rls
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = t.schemaname
WHERE t.schemaname = 'public'
ORDER BY 
    CASE WHEN c.relrowsecurity THEN 0 ELSE 1 END,
    t.tablename;

-- =====================================================
-- 2. List all existing policies
-- =====================================================
SELECT '=== EXISTING POLICIES ===' as section;

SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual IS NOT NULL as has_using,
    with_check IS NOT NULL as has_with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =====================================================
-- 3. Count policies per table
-- =====================================================
SELECT '=== POLICY COUNT PER TABLE ===' as section;

SELECT 
    tablename,
    COUNT(*) as policy_count,
    STRING_AGG(DISTINCT cmd, ', ') as operations_covered
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- =====================================================
-- 4. Tables without any policies (potential security risk)
-- =====================================================
SELECT '=== TABLES WITH RLS BUT NO POLICIES ===' as section;

SELECT 
    t.tablename,
    '⚠️  RLS enabled but no policies defined' as warning
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = t.schemaname
WHERE t.schemaname = 'public'
AND c.relrowsecurity = true
AND NOT EXISTS (
    SELECT 1 FROM pg_policies p 
    WHERE p.schemaname = 'public' 
    AND p.tablename = t.tablename
)
ORDER BY t.tablename;

-- =====================================================
-- 5. Check helper functions
-- =====================================================
SELECT '=== HELPER FUNCTIONS ===' as section;

SELECT 
    proname as function_name,
    pg_get_function_identity_arguments(oid) as arguments,
    CASE 
        WHEN prosecdef THEN '✅ SECURITY DEFINER'
        ELSE '❌ SECURITY INVOKER'
    END as security_type
FROM pg_proc
WHERE pronamespace = 'public'::regnamespace
AND proname IN ('is_staff', 'has_role', 'check_user_role')
ORDER BY proname;

-- =====================================================
-- 6. Check current user and permissions
-- =====================================================
SELECT '=== CURRENT USER INFO ===' as section;

SELECT 
    current_user,
    CASE 
        WHEN auth.uid() IS NOT NULL THEN auth.uid()::text
        ELSE 'Not authenticated'
    END as auth_uid,
    CASE 
        WHEN auth.role() IS NOT NULL THEN auth.role()
        ELSE 'No role'
    END as auth_role;

-- =====================================================
-- 7. Test if current user is staff
-- =====================================================
SELECT '=== STAFF CHECK ===' as section;

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM staff WHERE user_id = auth.uid()::text)
        THEN 'YES - Current user is staff'
        ELSE 'NO - Current user is not staff'
    END as is_staff_member;

-- =====================================================
-- 8. Database size and table sizes
-- =====================================================
SELECT '=== DATABASE SIZE INFO ===' as section;

SELECT 
    pg_size_pretty(pg_database_size(current_database())) as database_size;

SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
    n_live_tup as estimated_rows
FROM pg_tables t
JOIN pg_stat_user_tables s ON t.tablename = s.relname
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 10;

-- =====================================================
-- Summary
-- =====================================================
SELECT '=== SUMMARY ===' as section;

WITH stats AS (
    SELECT 
        COUNT(DISTINCT t.tablename) as total_tables,
        COUNT(DISTINCT CASE WHEN c.relrowsecurity THEN t.tablename END) as rls_enabled_tables,
        COUNT(DISTINCT p.tablename) as tables_with_policies,
        COUNT(DISTINCT p.policyname) as total_policies
    FROM pg_tables t
    LEFT JOIN pg_class c ON c.relname = t.tablename
    LEFT JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = t.schemaname
    LEFT JOIN pg_policies p ON p.tablename = t.tablename AND p.schemaname = 'public'
    WHERE t.schemaname = 'public'
)
SELECT 
    total_tables,
    rls_enabled_tables,
    ROUND(100.0 * rls_enabled_tables / NULLIF(total_tables, 0), 1) || '%' as rls_coverage,
    tables_with_policies,
    total_policies,
    CASE 
        WHEN rls_enabled_tables = total_tables THEN '✅ All tables have RLS enabled'
        ELSE '⚠️  ' || (total_tables - rls_enabled_tables) || ' tables without RLS'
    END as security_status
FROM stats;