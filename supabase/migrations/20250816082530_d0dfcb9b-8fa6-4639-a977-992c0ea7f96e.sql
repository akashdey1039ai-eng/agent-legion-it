-- Fix critical security vulnerabilities found in scan

-- 1. CRITICAL: Secure OAuth states table (currently publicly readable!)
DROP POLICY IF EXISTS "OAuth states are readable by everyone" ON public.oauth_states;

-- Only service accounts can access OAuth states
CREATE POLICY "Service accounts only for OAuth states"
ON public.oauth_states
FOR ALL
TO service_role
USING (true);

-- 2. Secure sync log tables (currently publicly readable!)
DROP POLICY IF EXISTS "Sync logs are readable by everyone" ON public.hubspot_sync_log;
DROP POLICY IF EXISTS "Sync logs are readable by everyone" ON public.salesforce_sync_log;

-- HubSpot sync logs - only authenticated users can see their own logs
CREATE POLICY "Users can view their own HubSpot sync logs"
ON public.hubspot_sync_log
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Salesforce sync logs - only authenticated users can see their own logs  
CREATE POLICY "Users can view their own Salesforce sync logs"
ON public.salesforce_sync_log
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Admins can view all sync logs for support purposes
CREATE POLICY "Admins can view all HubSpot sync logs"
ON public.hubspot_sync_log
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all Salesforce sync logs"
ON public.salesforce_sync_log
FOR SELECT
TO authenticated  
USING (public.has_role(auth.uid(), 'admin'));

-- Service accounts can insert sync logs
CREATE POLICY "Service accounts can insert HubSpot sync logs"
ON public.hubspot_sync_log
FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Service accounts can insert Salesforce sync logs"
ON public.salesforce_sync_log
FOR INSERT
TO service_role
WITH CHECK (true);

-- Service accounts can update sync logs  
CREATE POLICY "Service accounts can update HubSpot sync logs"
ON public.hubspot_sync_log
FOR UPDATE
TO service_role
USING (true);

CREATE POLICY "Service accounts can update Salesforce sync logs"
ON public.salesforce_sync_log
FOR UPDATE
TO service_role
USING (true);