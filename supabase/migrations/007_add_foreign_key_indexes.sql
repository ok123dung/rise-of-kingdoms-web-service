-- Migration 007: Add Indexes on Foreign Keys
-- Fixes 6 INFO warnings about unindexed foreign keys
-- These indexes significantly improve JOIN query performance

-- ============================================
-- ACCOUNTS TABLE
-- ============================================

-- Index on user_id for faster user-account lookups
CREATE INDEX IF NOT EXISTS accounts_user_id_idx
ON public.accounts(user_id);

COMMENT ON INDEX accounts_user_id_idx
IS 'Improves performance of user-account JOIN queries';

-- ============================================
-- BOOKINGS TABLE
-- ============================================

-- Index on service_tier_id for faster service tier lookups
CREATE INDEX IF NOT EXISTS bookings_service_tier_id_idx
ON public.bookings(service_tier_id);

COMMENT ON INDEX bookings_service_tier_id_idx
IS 'Improves performance of booking-service tier JOIN queries';

-- ============================================
-- COMMUNICATIONS TABLE
-- ============================================

-- Index on booking_id for faster booking-communication lookups
CREATE INDEX IF NOT EXISTS communications_booking_id_idx
ON public.communications(booking_id);

-- Index on user_id for faster user-communication lookups
CREATE INDEX IF NOT EXISTS communications_user_id_idx
ON public.communications(user_id);

COMMENT ON INDEX communications_booking_id_idx
IS 'Improves performance of booking-communication JOIN queries';

COMMENT ON INDEX communications_user_id_idx
IS 'Improves performance of user-communication JOIN queries';

-- ============================================
-- PASSWORD RESET TOKENS TABLE
-- ============================================

-- Index on user_id for faster user-token lookups
CREATE INDEX IF NOT EXISTS password_reset_tokens_user_id_idx
ON public.password_reset_tokens(user_id);

COMMENT ON INDEX password_reset_tokens_user_id_idx
IS 'Improves performance of user-password reset token lookups';

-- ============================================
-- SESSIONS TABLE
-- ============================================

-- Index on user_id for faster user-session lookups
CREATE INDEX IF NOT EXISTS sessions_user_id_idx
ON public.sessions(user_id);

COMMENT ON INDEX sessions_user_id_idx
IS 'Improves performance of user-session JOIN queries and session validation';

-- ============================================
-- VERIFICATION
-- ============================================

-- Verify all indexes were created successfully
DO $$
DECLARE
    idx_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO idx_count
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

    IF idx_count = 6 THEN
        RAISE NOTICE '✅ Successfully created all 6 foreign key indexes';
    ELSE
        RAISE WARNING '⚠️ Expected 6 indexes but found %', idx_count;
    END IF;
END $$;
