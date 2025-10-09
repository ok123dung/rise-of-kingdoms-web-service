-- Migration 008: Add Primary Key to verification_tokens
-- Fixes 1 INFO warning about missing primary key
-- Primary keys are essential for efficient row updates/deletes and data integrity

-- ============================================
-- ADD PRIMARY KEY
-- ============================================

-- The verification_tokens table is used by NextAuth
-- It should have a composite primary key on (identifier, token)
-- as per NextAuth schema requirements

ALTER TABLE public.verification_tokens
ADD CONSTRAINT verification_tokens_pkey
PRIMARY KEY (identifier, token);

-- ============================================
-- VERIFICATION
-- ============================================

DO $$
DECLARE
    has_pk BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conrelid = 'public.verification_tokens'::regclass
        AND contype = 'p'
    ) INTO has_pk;

    IF has_pk THEN
        RAISE NOTICE '✅ Primary key successfully added to verification_tokens';
    ELSE
        RAISE WARNING '⚠️ Failed to add primary key to verification_tokens';
    END IF;
END $$;

-- Add helpful comment
COMMENT ON CONSTRAINT verification_tokens_pkey ON public.verification_tokens
IS 'Composite primary key ensures uniqueness and enables efficient row operations';
