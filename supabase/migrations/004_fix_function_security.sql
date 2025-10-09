-- Fix Security Warning: Function Search Path Mutable
-- This migration fixes the search_path security issue in functions
-- Reference: https://supabase.com/docs/guides/database/postgres-functions#security-definer-functions

-- Note: Using CREATE OR REPLACE instead of DROP because policies depend on these functions
-- This safely updates the functions without breaking existing RLS policies

-- Update is_staff function with SET search_path
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.staff
        WHERE user_id = auth.uid()::text
        AND is_active = true
    );
END;
$$;

-- Update has_role function with SET search_path
CREATE OR REPLACE FUNCTION public.has_role(required_role text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.staff
        WHERE user_id = auth.uid()::text
        AND role = required_role
        AND is_active = true
    );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.is_staff() TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(text) TO authenticated;

-- Add comments for documentation
COMMENT ON FUNCTION public.is_staff() IS 'Check if current authenticated user is an active staff member. Uses search_path for security.';
COMMENT ON FUNCTION public.has_role(text) IS 'Check if current authenticated user has a specific role. Uses search_path for security.';
