-- Migration 006: Add Missing RLS Policies
-- Fixes 2 INFO warnings about tables with RLS enabled but no policies

-- ============================================
-- PASSWORD RESET TOKENS POLICIES
-- ============================================

-- Users can only read their own reset tokens
CREATE POLICY "password_reset_tokens_select_own"
ON public.password_reset_tokens
FOR SELECT
TO authenticated
USING (user_id = (select auth.uid()::text));

-- Users can insert their own reset tokens (for forgot password flow)
CREATE POLICY "password_reset_tokens_insert_own"
ON public.password_reset_tokens
FOR INSERT
TO authenticated
WITH CHECK (user_id = (select auth.uid()::text));

-- Users can delete their own reset tokens
CREATE POLICY "password_reset_tokens_delete_own"
ON public.password_reset_tokens
FOR DELETE
TO authenticated
USING (user_id = (select auth.uid()::text));

-- ============================================
-- VERIFICATION TOKENS POLICIES
-- ============================================

-- Anyone can read verification tokens (needed for email verification links)
CREATE POLICY "verification_tokens_select_all"
ON public.verification_tokens
FOR SELECT
TO anon, authenticated
USING (true);

-- Authenticated users can insert verification tokens
CREATE POLICY "verification_tokens_insert_authenticated"
ON public.verification_tokens
FOR INSERT
TO authenticated
WITH CHECK (true);

-- System can delete used/expired tokens
CREATE POLICY "verification_tokens_delete_all"
ON public.verification_tokens
FOR DELETE
TO authenticated
USING (true);

-- Add helpful comments
COMMENT ON POLICY "password_reset_tokens_select_own" ON public.password_reset_tokens
IS 'Users can only view their own password reset tokens for security';

COMMENT ON POLICY "verification_tokens_select_all" ON public.verification_tokens
IS 'Public read access needed for email verification links to work';
