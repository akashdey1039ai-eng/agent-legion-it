-- CRITICAL SECURITY FIX: Fix RLS policies to prevent data exposure

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "All authenticated users can modify contacts" ON public.contacts;
DROP POLICY IF EXISTS "All authenticated users can view contacts" ON public.contacts;
DROP POLICY IF EXISTS "All authenticated users can modify companies" ON public.companies;
DROP POLICY IF EXISTS "All authenticated users can view companies" ON public.companies;
DROP POLICY IF EXISTS "All authenticated users can modify opportunities" ON public.opportunities;
DROP POLICY IF EXISTS "All authenticated users can view opportunities" ON public.opportunities;
DROP POLICY IF EXISTS "All authenticated users can modify activities" ON public.activities;
DROP POLICY IF EXISTS "All authenticated users can view activities" ON public.activities;

-- Create secure RLS policies

-- PROFILES: Only authenticated users can view profiles, users can only modify their own
CREATE POLICY "Authenticated users can view profiles" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- CONTACTS: Only authenticated users can access
CREATE POLICY "Authenticated users can view contacts" 
ON public.contacts 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert contacts" 
ON public.contacts 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update contacts" 
ON public.contacts 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete contacts" 
ON public.contacts 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- COMPANIES: Only authenticated users can access
CREATE POLICY "Authenticated users can view companies" 
ON public.companies 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert companies" 
ON public.companies 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update companies" 
ON public.companies 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete companies" 
ON public.companies 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- OPPORTUNITIES: Only authenticated users can access
CREATE POLICY "Authenticated users can view opportunities" 
ON public.opportunities 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert opportunities" 
ON public.opportunities 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update opportunities" 
ON public.opportunities 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete opportunities" 
ON public.opportunities 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- ACTIVITIES: Only authenticated users can access
CREATE POLICY "Authenticated users can view activities" 
ON public.activities 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert activities" 
ON public.activities 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update activities" 
ON public.activities 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete activities" 
ON public.activities 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Add data classification and audit logging
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name text NOT NULL,
  operation text NOT NULL,
  old_data jsonb,
  new_data jsonb,
  user_id uuid,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on audit logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only authenticated users can view audit logs" 
ON public.audit_logs 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Create audit trigger function
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.audit_logs (
    table_name,
    operation,
    old_data,
    new_data,
    user_id
  ) VALUES (
    TG_TABLE_NAME,
    TG_OP,
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
    auth.uid()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Add audit triggers to sensitive tables
CREATE TRIGGER audit_trigger_contacts
  AFTER INSERT OR UPDATE OR DELETE ON public.contacts
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_trigger_companies
  AFTER INSERT OR UPDATE OR DELETE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_trigger_opportunities
  AFTER INSERT OR UPDATE OR DELETE ON public.opportunities
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_trigger_deals
  AFTER INSERT OR UPDATE OR DELETE ON public.deals
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();