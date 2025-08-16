-- Fix audit log RLS policy issue - allow service role to insert audit logs

-- Drop existing audit log policies that are causing issues
DROP POLICY IF EXISTS "Prevent manual audit log modification" ON public.audit_logs;

-- Create proper audit log policies
-- Allow service role and database functions to insert audit logs
CREATE POLICY "Service role can insert audit logs"
ON public.audit_logs
FOR INSERT
TO service_role
WITH CHECK (true);

-- Allow database functions to insert audit logs (for triggers)
CREATE POLICY "Functions can insert audit logs"
ON public.audit_logs
FOR INSERT
TO authenticated
WITH CHECK (auth.role() = 'authenticated');

-- Keep other restrictive policies
CREATE POLICY "Prevent manual audit log modification by users"
ON public.audit_logs
FOR INSERT
TO authenticated
WITH CHECK (false);

-- Admin read-only access remains
-- Update and delete prevention remain as before