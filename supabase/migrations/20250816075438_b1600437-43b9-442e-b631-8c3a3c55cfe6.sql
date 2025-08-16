-- Address remaining security vulnerabilities from the latest scan

-- 1. Secure audit logs from tampering (INSERT/UPDATE/DELETE restrictions)
DROP POLICY IF EXISTS "Admin-only audit log access" ON public.audit_logs;
CREATE POLICY "Admin read-only audit log access" 
ON public.audit_logs 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Prevent any manual modification of audit logs
CREATE POLICY "Prevent manual audit log modification" 
ON public.audit_logs 
FOR INSERT 
WITH CHECK (false);

CREATE POLICY "Prevent audit log updates" 
ON public.audit_logs 
FOR UPDATE 
USING (false);

CREATE POLICY "Prevent audit log deletion" 
ON public.audit_logs 
FOR DELETE 
USING (false);

-- 2. Secure AI system access based on roles
DROP POLICY IF EXISTS "Authenticated users can view their organization's agents" ON public.ai_agents;
CREATE POLICY "Role-based AI agent access" 
ON public.ai_agents 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role) OR
  (has_role(auth.uid(), 'sales_rep'::app_role) AND created_by = auth.uid())
);

DROP POLICY IF EXISTS "Users can view execution logs" ON public.ai_agent_executions;
CREATE POLICY "Role-based AI execution log access" 
ON public.ai_agent_executions 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

-- 3. Secure documents based on privacy and ownership
DROP POLICY IF EXISTS "Users can manage documents" ON public.documents;

CREATE POLICY "Public documents readable by all" 
ON public.documents 
FOR SELECT 
USING (is_public = true);

CREATE POLICY "Private documents readable by owner and admins" 
ON public.documents 
FOR SELECT 
USING (
  (is_public = false AND uploaded_by = auth.uid()) OR
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'manager'::app_role)
);

CREATE POLICY "Users can upload documents" 
ON public.documents 
FOR INSERT 
WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY "Users can update their own documents" 
ON public.documents 
FOR UPDATE 
USING (
  uploaded_by = auth.uid() OR
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Users can delete their own documents" 
ON public.documents 
FOR DELETE 
USING (
  uploaded_by = auth.uid() OR
  has_role(auth.uid(), 'admin'::app_role)
);

-- 4. Enhanced OAuth token security with time-based access
DROP POLICY IF EXISTS "Enhanced salesforce token access - SELECT" ON public.salesforce_tokens;
CREATE POLICY "Ultra-secure salesforce token access" 
ON public.salesforce_tokens 
FOR SELECT 
USING (
  (auth.uid() = user_id) AND 
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'sales_rep'::app_role)) AND
  (expires_at > now()) -- Only allow access to non-expired tokens
);

DROP POLICY IF EXISTS "Enhanced hubspot token access - SELECT" ON public.hubspot_tokens;
CREATE POLICY "Ultra-secure hubspot token access" 
ON public.hubspot_tokens 
FOR SELECT 
USING (
  (auth.uid() = user_id) AND 
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'sales_rep'::app_role)) AND
  (expires_at > now()) -- Only allow access to non-expired tokens
);

-- 5. Add token expiry cleanup function
CREATE OR REPLACE FUNCTION public.cleanup_expired_tokens()
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  -- Log expired token cleanup
  INSERT INTO public.audit_logs (
    table_name,
    operation,
    new_data,
    user_id
  ) VALUES (
    'token_cleanup',
    'EXPIRED_TOKEN_CLEANUP',
    jsonb_build_object('cleanup_time', now()),
    null
  );
  
  -- Delete expired Salesforce tokens
  DELETE FROM public.salesforce_tokens WHERE expires_at <= now();
  
  -- Delete expired HubSpot tokens  
  DELETE FROM public.hubspot_tokens WHERE expires_at <= now();
  
  -- Delete expired OAuth states
  DELETE FROM public.oauth_states WHERE expires_at <= now();
END;
$$;

-- 6. Create secure contact and lead access views
CREATE OR REPLACE VIEW public.secure_contacts_view AS
SELECT 
  c.id,
  c.first_name,
  c.last_name,
  CASE 
    WHEN has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role) THEN c.email
    WHEN has_role(auth.uid(), 'sales_rep'::app_role) AND c.owner_id = auth.uid() THEN c.email
    ELSE mask_sensitive_data(c.email, 'email')
  END as email,
  CASE 
    WHEN has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role) THEN c.phone
    WHEN has_role(auth.uid(), 'sales_rep'::app_role) AND c.owner_id = auth.uid() THEN c.phone
    ELSE mask_sensitive_data(c.phone, 'phone')
  END as phone,
  c.title,
  c.company_id,
  c.owner_id,
  c.created_at,
  c.updated_at
FROM public.contacts c
WHERE 
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'manager'::app_role) OR
  (has_role(auth.uid(), 'sales_rep'::app_role) AND c.owner_id = auth.uid()) OR
  (has_role(auth.uid(), 'viewer'::app_role) AND c.owner_id = auth.uid());

-- 7. Grant appropriate permissions on the view
GRANT SELECT ON public.secure_contacts_view TO authenticated;

-- 8. Add comprehensive data access logging
CREATE OR REPLACE FUNCTION public.log_sensitive_data_access()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  -- Log access to sensitive views and tables
  INSERT INTO public.audit_logs (
    table_name,
    operation,
    new_data,
    user_id,
    ip_address
  ) VALUES (
    TG_TABLE_NAME || '_access',
    'DATA_ACCESS',
    jsonb_build_object(
      'accessed_at', now(),
      'user_role', get_user_role(auth.uid()),
      'record_count', 1
    ),
    auth.uid(),
    inet_client_addr()
  );
  
  RETURN NULL;
END;
$$;