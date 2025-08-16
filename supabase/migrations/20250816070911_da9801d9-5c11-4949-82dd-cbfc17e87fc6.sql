-- Continue securing tables without the encryption function for now

-- 1. SECURE REMAINING CORE BUSINESS TABLES

-- Secure DEALS table
DROP POLICY IF EXISTS "Users can manage deals" ON public.deals;

CREATE POLICY "Role-based deal access - SELECT"
ON public.deals
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'manager') OR 
  public.has_role(auth.uid(), 'sales_rep') OR
  (public.has_role(auth.uid(), 'viewer') AND assigned_user_id = auth.uid())
);

CREATE POLICY "Role-based deal access - INSERT"
ON public.deals
FOR INSERT
TO authenticated
WITH CHECK (
  (public.has_role(auth.uid(), 'admin') OR 
   public.has_role(auth.uid(), 'manager') OR 
   public.has_role(auth.uid(), 'sales_rep')) AND
  assigned_user_id = auth.uid()
);

CREATE POLICY "Role-based deal access - UPDATE"
ON public.deals
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'manager') OR 
  (public.has_role(auth.uid(), 'sales_rep') AND assigned_user_id = auth.uid())
);

CREATE POLICY "Role-based deal access - DELETE"
ON public.deals
FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'manager')
);

-- Secure LEADS table
DROP POLICY IF EXISTS "Users can manage leads" ON public.leads;

CREATE POLICY "Role-based lead access - SELECT"
ON public.leads
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'manager') OR 
  public.has_role(auth.uid(), 'sales_rep') OR
  (public.has_role(auth.uid(), 'viewer') AND assigned_user_id = auth.uid())
);

CREATE POLICY "Role-based lead access - INSERT"
ON public.leads
FOR INSERT
TO authenticated
WITH CHECK (
  (public.has_role(auth.uid(), 'admin') OR 
   public.has_role(auth.uid(), 'manager') OR 
   public.has_role(auth.uid(), 'sales_rep')) AND
  assigned_user_id = auth.uid()
);

CREATE POLICY "Role-based lead access - UPDATE"
ON public.leads
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'manager') OR 
  (public.has_role(auth.uid(), 'sales_rep') AND assigned_user_id = auth.uid())
);

CREATE POLICY "Role-based lead access - DELETE"
ON public.leads
FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'manager')
);

-- Secure CASES table
DROP POLICY IF EXISTS "All authenticated users can modify cases" ON public.cases;
DROP POLICY IF EXISTS "All authenticated users can view cases" ON public.cases;

CREATE POLICY "Role-based case access - SELECT"
ON public.cases
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'manager') OR 
  public.has_role(auth.uid(), 'sales_rep') OR
  (public.has_role(auth.uid(), 'viewer') AND owner_id = auth.uid())
);

CREATE POLICY "Role-based case access - INSERT"
ON public.cases
FOR INSERT
TO authenticated
WITH CHECK (
  (public.has_role(auth.uid(), 'admin') OR 
   public.has_role(auth.uid(), 'manager') OR 
   public.has_role(auth.uid(), 'sales_rep')) AND
  owner_id = auth.uid()
);

CREATE POLICY "Role-based case access - UPDATE"
ON public.cases
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'manager') OR 
  (public.has_role(auth.uid(), 'sales_rep') AND owner_id = auth.uid())
);

CREATE POLICY "Role-based case access - DELETE"
ON public.cases
FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'manager')
);

-- 2. SECURE INTEGRATION SYNC LOGS - Restrict to Admin Only
DROP POLICY IF EXISTS "All authenticated users can view sync log" ON public.hubspot_sync_log;
DROP POLICY IF EXISTS "All authenticated users can modify sync log" ON public.hubspot_sync_log;

CREATE POLICY "Admin-only hubspot sync log access"
ON public.hubspot_sync_log
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "All authenticated users can view sync log" ON public.salesforce_sync_log;
DROP POLICY IF EXISTS "All authenticated users can modify sync log" ON public.salesforce_sync_log;

CREATE POLICY "Admin-only salesforce sync log access"
ON public.salesforce_sync_log
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 3. ENHANCE OAUTH TOKEN SECURITY
-- Update HubSpot tokens policies for enhanced security
DROP POLICY IF EXISTS "Users can view their own tokens" ON public.hubspot_tokens;
DROP POLICY IF EXISTS "Users can create their own tokens" ON public.hubspot_tokens;
DROP POLICY IF EXISTS "Users can update their own tokens" ON public.hubspot_tokens;
DROP POLICY IF EXISTS "Users can delete their own tokens" ON public.hubspot_tokens;

CREATE POLICY "Enhanced hubspot token access - SELECT"
ON public.hubspot_tokens
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id AND
  (public.has_role(auth.uid(), 'admin') OR 
   public.has_role(auth.uid(), 'manager') OR 
   public.has_role(auth.uid(), 'sales_rep'))
);

CREATE POLICY "Enhanced hubspot token access - INSERT"
ON public.hubspot_tokens
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id AND
  (public.has_role(auth.uid(), 'admin') OR 
   public.has_role(auth.uid(), 'manager') OR 
   public.has_role(auth.uid(), 'sales_rep'))
);

CREATE POLICY "Enhanced hubspot token access - UPDATE"
ON public.hubspot_tokens
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id AND
  (public.has_role(auth.uid(), 'admin') OR 
   public.has_role(auth.uid(), 'manager') OR 
   public.has_role(auth.uid(), 'sales_rep'))
);

CREATE POLICY "Enhanced hubspot token access - DELETE"
ON public.hubspot_tokens
FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id AND
  (public.has_role(auth.uid(), 'admin') OR 
   public.has_role(auth.uid(), 'manager'))
);

-- Update Salesforce tokens policies for enhanced security
DROP POLICY IF EXISTS "Users can view their own tokens" ON public.salesforce_tokens;
DROP POLICY IF EXISTS "Users can create their own tokens" ON public.salesforce_tokens;
DROP POLICY IF EXISTS "Users can update their own tokens" ON public.salesforce_tokens;
DROP POLICY IF EXISTS "Users can delete their own tokens" ON public.salesforce_tokens;

CREATE POLICY "Enhanced salesforce token access - SELECT"
ON public.salesforce_tokens
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id AND
  (public.has_role(auth.uid(), 'admin') OR 
   public.has_role(auth.uid(), 'manager') OR 
   public.has_role(auth.uid(), 'sales_rep'))
);

CREATE POLICY "Enhanced salesforce token access - INSERT"
ON public.salesforce_tokens
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id AND
  (public.has_role(auth.uid(), 'admin') OR 
   public.has_role(auth.uid(), 'manager') OR 
   public.has_role(auth.uid(), 'sales_rep'))
);

CREATE POLICY "Enhanced salesforce token access - UPDATE"
ON public.salesforce_tokens
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id AND
  (public.has_role(auth.uid(), 'admin') OR 
   public.has_role(auth.uid(), 'manager') OR 
   public.has_role(auth.uid(), 'sales_rep'))
);

CREATE POLICY "Enhanced salesforce token access - DELETE"
ON public.salesforce_tokens
FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id AND
  (public.has_role(auth.uid(), 'admin') OR 
   public.has_role(auth.uid(), 'manager'))
);

-- 4. SECURE ADDITIONAL SENSITIVE TABLES

-- Secure AUDIT LOGS - Admin only
DROP POLICY IF EXISTS "Only authenticated users can view audit logs" ON public.audit_logs;

CREATE POLICY "Admin-only audit log access"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Secure AI SECURITY EVENTS - Admin only  
DROP POLICY IF EXISTS "Admins can view security events" ON public.ai_security_events;

CREATE POLICY "Admin-only security events access"
ON public.ai_security_events
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Secure DATA CLASSIFICATIONS - Admin management, all can view
DROP POLICY IF EXISTS "Admins can manage data classifications" ON public.data_classifications;
DROP POLICY IF EXISTS "Authenticated users can view data classifications" ON public.data_classifications;

CREATE POLICY "Admin-only data classification management"
ON public.data_classifications
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "All roles can view data classifications"
ON public.data_classifications
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'manager') OR 
  public.has_role(auth.uid(), 'sales_rep') OR
  public.has_role(auth.uid(), 'viewer')
);