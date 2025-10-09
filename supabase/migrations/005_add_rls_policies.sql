-- Fix INFO: RLS Enabled No Policy
-- Add RLS policies for tables that have RLS enabled but no policies

-- ============================================
-- PASSWORD RESET TOKENS POLICIES
-- ============================================

-- Users can only read their own reset tokens
CREATE POLICY "Users can read own reset tokens"
ON public.password_reset_tokens
FOR SELECT
TO authenticated
USING (user_id = auth.uid()::text);

-- System can insert reset tokens (for password reset flow)
CREATE POLICY "System can insert reset tokens"
ON public.password_reset_tokens
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid()::text);

-- System can delete expired tokens
CREATE POLICY "System can delete own reset tokens"
ON public.password_reset_tokens
FOR DELETE
TO authenticated
USING (user_id = auth.uid()::text);

-- ============================================
-- VERIFICATION TOKENS POLICIES
-- ============================================

-- Allow anonymous users to read verification tokens (for email verification)
CREATE POLICY "Anyone can read verification tokens"
ON public.verification_tokens
FOR SELECT
TO anon, authenticated
USING (true);

-- Only system/authenticated users can insert verification tokens
CREATE POLICY "Authenticated can insert verification tokens"
ON public.verification_tokens
FOR INSERT
TO authenticated
WITH CHECK (true);

-- System can delete used/expired tokens
CREATE POLICY "Authenticated can delete verification tokens"
ON public.verification_tokens
FOR DELETE
TO authenticated
USING (true);

-- Add comments
COMMENT ON POLICY "Users can read own reset tokens" ON public.password_reset_tokens IS 'Users can only view their own password reset tokens';
COMMENT ON POLICY "System can insert reset tokens" ON public.password_reset_tokens IS 'Allow creating password reset tokens for authenticated users';
COMMENT ON POLICY "System can delete own reset tokens" ON public.password_reset_tokens IS 'Users can delete their own expired reset tokens';

COMMENT ON POLICY "Anyone can read verification tokens" ON public.verification_tokens IS 'Public access to verification tokens for email confirmation';
COMMENT ON POLICY "Authenticated can insert verification tokens" ON public.verification_tokens IS 'System can create email verification tokens';
COMMENT ON POLICY "Authenticated can delete verification tokens" ON public.verification_tokens IS 'System can cleanup used/expired verification tokens';
