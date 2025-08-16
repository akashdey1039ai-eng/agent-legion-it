-- Fix critical security vulnerabilities - correct version

-- 1. CRITICAL: OAuth states table is already secured properly with service role only access

-- 2. Secure sync log tables - they don't have user_id columns, need different approach
DROP POLICY IF EXISTS "Sync logs are readable by everyone" ON public.hubspot_sync_log;
DROP POLICY IF EXISTS "Sync logs are readable by everyone" ON public.salesforce_sync_log;

-- Remove existing admin-only policies to replace with more secure ones
DROP POLICY IF EXISTS "Admin-only hubspot sync log access" ON public.hubspot_sync_log;
DROP POLICY IF EXISTS "Admin-only salesforce sync log access" ON public.salesforce_sync_log;

-- Create secure policies for sync logs
-- Only admins can view sync logs (no user ownership)
CREATE POLICY "Admin read-only hubspot sync logs"
ON public.hubspot_sync_log
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin read-only salesforce sync logs"
ON public.salesforce_sync_log
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Service accounts can insert and update sync logs (for edge functions)
CREATE POLICY "Service accounts manage hubspot sync logs"
ON public.hubspot_sync_log
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Service accounts manage salesforce sync logs"
ON public.salesforce_sync_log
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Prevent manual modification of sync logs
CREATE POLICY "Prevent manual hubspot sync log modification"
ON public.hubspot_sync_log
FOR INSERT
TO authenticated
WITH CHECK (false);

CREATE POLICY "Prevent manual hubspot sync log updates"
ON public.hubspot_sync_log
FOR UPDATE
TO authenticated
USING (false);

CREATE POLICY "Prevent manual hubspot sync log deletion"
ON public.hubspot_sync_log
FOR DELETE
TO authenticated
USING (false);

CREATE POLICY "Prevent manual salesforce sync log modification"
ON public.salesforce_sync_log
FOR INSERT
TO authenticated
WITH CHECK (false);

CREATE POLICY "Prevent manual salesforce sync log updates"
ON public.salesforce_sync_log
FOR UPDATE
TO authenticated
USING (false);

CREATE POLICY "Prevent manual salesforce sync log deletion"
ON public.salesforce_sync_log
FOR DELETE
TO authenticated
USING (false);