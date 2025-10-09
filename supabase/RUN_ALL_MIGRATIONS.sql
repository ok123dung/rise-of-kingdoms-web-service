-- ============================================
-- MASTER MIGRATION SCRIPT
-- Run all Supabase optimizations in one go
-- ============================================
-- Date: October 6, 2025
-- Project: rok-services
-- Purpose: Fix all critical Supabase warnings
-- ============================================

BEGIN;

-- ============================================
-- MIGRATION 006: Add Missing RLS Policies
-- ============================================

-- PASSWORD RESET TOKENS POLICIES
CREATE POLICY "password_reset_tokens_select_own"
ON public.password_reset_tokens
FOR SELECT
TO authenticated
USING (user_id = (select auth.uid()::text));

CREATE POLICY "password_reset_tokens_insert_own"
ON public.password_reset_tokens
FOR INSERT
TO authenticated
WITH CHECK (user_id = (select auth.uid()::text));

CREATE POLICY "password_reset_tokens_delete_own"
ON public.password_reset_tokens
FOR DELETE
TO authenticated
USING (user_id = (select auth.uid()::text));

-- VERIFICATION TOKENS POLICIES
CREATE POLICY "verification_tokens_select_all"
ON public.verification_tokens
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "verification_tokens_insert_authenticated"
ON public.verification_tokens
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "verification_tokens_delete_all"
ON public.verification_tokens
FOR DELETE
TO authenticated
USING (true);

-- ============================================
-- MIGRATION 007: Add Foreign Key Indexes
-- ============================================

CREATE INDEX IF NOT EXISTS accounts_user_id_idx ON public.accounts(user_id);
CREATE INDEX IF NOT EXISTS bookings_service_tier_id_idx ON public.bookings(service_tier_id);
CREATE INDEX IF NOT EXISTS communications_booking_id_idx ON public.communications(booking_id);
CREATE INDEX IF NOT EXISTS communications_user_id_idx ON public.communications(user_id);
CREATE INDEX IF NOT EXISTS password_reset_tokens_user_id_idx ON public.password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON public.sessions(user_id);

-- ============================================
-- MIGRATION 008: Add Primary Key
-- ============================================

ALTER TABLE public.verification_tokens
ADD CONSTRAINT verification_tokens_pkey
PRIMARY KEY (identifier, token);

-- ============================================
-- MIGRATION 009: Optimize RLS Performance
-- ============================================

-- USERS TABLE
DROP POLICY IF EXISTS users_select_own ON public.users;
CREATE POLICY "users_select_own"
ON public.users FOR SELECT TO authenticated
USING (id = (select auth.uid()::text));

DROP POLICY IF EXISTS users_update_own ON public.users;
CREATE POLICY "users_update_own"
ON public.users FOR UPDATE TO authenticated
USING (id = (select auth.uid()::text));

-- BOOKINGS TABLE
DROP POLICY IF EXISTS bookings_select_own ON public.bookings;
CREATE POLICY "bookings_select_own"
ON public.bookings FOR SELECT TO authenticated
USING (user_id = (select auth.uid()::text));

DROP POLICY IF EXISTS bookings_insert_own ON public.bookings;
CREATE POLICY "bookings_insert_own"
ON public.bookings FOR INSERT TO authenticated
WITH CHECK (user_id = (select auth.uid()::text));

-- PAYMENTS TABLE
DROP POLICY IF EXISTS payments_select_own ON public.payments;
CREATE POLICY "payments_select_own"
ON public.payments FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM bookings
        WHERE bookings.id = payments.booking_id
        AND bookings.user_id = (select auth.uid()::text)
    )
);

-- COMMUNICATIONS TABLE
DROP POLICY IF EXISTS communications_select_own ON public.communications;
CREATE POLICY "communications_select_own"
ON public.communications FOR SELECT TO authenticated
USING (user_id = (select auth.uid()::text));

-- FILE UPLOADS TABLE
DROP POLICY IF EXISTS file_uploads_select_own ON public.file_uploads;
CREATE POLICY "file_uploads_select_own"
ON public.file_uploads FOR SELECT TO authenticated
USING (user_id = (select auth.uid()::text));

DROP POLICY IF EXISTS file_uploads_insert_own ON public.file_uploads;
CREATE POLICY "file_uploads_insert_own"
ON public.file_uploads FOR INSERT TO authenticated
WITH CHECK (user_id = (select auth.uid()::text));

-- ACCOUNTS TABLE
DROP POLICY IF EXISTS accounts_all_own ON public.accounts;
CREATE POLICY "accounts_all_own"
ON public.accounts FOR ALL TO authenticated
USING (user_id = (select auth.uid()::text));

-- SESSIONS TABLE
DROP POLICY IF EXISTS sessions_select_own ON public.sessions;
CREATE POLICY "sessions_select_own"
ON public.sessions FOR SELECT TO authenticated
USING (user_id = (select auth.uid()::text));

-- TWO FACTOR AUTH TABLE
DROP POLICY IF EXISTS two_factor_auth_all_own ON public.two_factor_auth;
CREATE POLICY "two_factor_auth_all_own"
ON public.two_factor_auth FOR ALL TO authenticated
USING (user_id = (select auth.uid()::text));

-- PASSWORD HISTORY TABLE
DROP POLICY IF EXISTS password_history_select_own ON public.password_history;
CREATE POLICY "password_history_select_own"
ON public.password_history FOR SELECT TO authenticated
USING (user_id = (select auth.uid()::text));

-- ============================================
-- VERIFICATION
-- ============================================

DO $$
DECLARE
    policy_count INTEGER;
    index_count INTEGER;
    has_pk BOOLEAN;
BEGIN
    -- Count new policies
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public'
    AND policyname LIKE '%_own' OR policyname LIKE '%_all';

    -- Count new indexes
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes
    WHERE schemaname = 'public'
    AND indexname IN (
        'accounts_user_id_idx',
        'bookings_service_tier_id_idx',
        'communications_booking_id_idx',
        'communications_user_id_idx',
        'password_reset_tokens_user_id_idx',
        'sessions_user_id_idx'
    );

    -- Check primary key
    SELECT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conrelid = 'public.verification_tokens'::regclass
        AND contype = 'p'
    ) INTO has_pk;

    RAISE NOTICE '============================================';
    RAISE NOTICE 'MIGRATION COMPLETED SUCCESSFULLY';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'RLS Policies: % created/updated', policy_count;
    RAISE NOTICE 'Indexes: % created', index_count;
    RAISE NOTICE 'Primary Key: %', CASE WHEN has_pk THEN 'Added ✅' ELSE 'Failed ❌' END;
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Next Steps:';
    RAISE NOTICE '1. Refresh Supabase Dashboard';
    RAISE NOTICE '2. Check warnings (should be reduced significantly)';
    RAISE NOTICE '3. Test application functionality';
    RAISE NOTICE '============================================';
END $$;

COMMIT;

-- Success message
SELECT '✅ All migrations applied successfully! Check SUPABASE-WARNINGS-ANALYSIS.md for details.' AS status;
