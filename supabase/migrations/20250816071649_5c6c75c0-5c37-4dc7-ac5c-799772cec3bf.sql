-- Fix critical security issues identified in scan

-- 1. Fix contacts table RLS to restrict by ownership/management
DROP POLICY IF EXISTS "Role-based contact access - SELECT" ON public.contacts;
CREATE POLICY "Enhanced contact access - SELECT" 
ON public.contacts 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role) OR 
  (has_role(auth.uid(), 'sales_rep'::app_role) AND owner_id = auth.uid()) OR
  (has_role(auth.uid(), 'viewer'::app_role) AND owner_id = auth.uid())
);

-- 2. Fix leads table RLS to restrict by assignment
DROP POLICY IF EXISTS "Role-based lead access - SELECT" ON public.leads;
CREATE POLICY "Enhanced lead access - SELECT" 
ON public.leads 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role) OR 
  (has_role(auth.uid(), 'sales_rep'::app_role) AND assigned_user_id = auth.uid()) OR
  (has_role(auth.uid(), 'viewer'::app_role) AND assigned_user_id = auth.uid())
);

-- 3. Fix companies table RLS to restrict by assignment
DROP POLICY IF EXISTS "Role-based company access - SELECT" ON public.companies;
CREATE POLICY "Enhanced company access - SELECT" 
ON public.companies 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role) OR 
  (has_role(auth.uid(), 'sales_rep'::app_role) AND assigned_user_id = auth.uid()) OR
  (has_role(auth.uid(), 'viewer'::app_role) AND assigned_user_id = auth.uid())
);

-- 4. Fix deals table RLS to restrict by assignment
DROP POLICY IF EXISTS "Role-based deal access - SELECT" ON public.deals;
CREATE POLICY "Enhanced deal access - SELECT" 
ON public.deals 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role) OR 
  (has_role(auth.uid(), 'sales_rep'::app_role) AND assigned_user_id = auth.uid()) OR
  (has_role(auth.uid(), 'viewer'::app_role) AND assigned_user_id = auth.uid())
);

-- 5. Fix profiles table to restrict personal information access
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
CREATE POLICY "Enhanced profile access - SELECT" 
ON public.profiles 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role) OR 
  user_id = auth.uid()
);

-- 6. Add data classification for sensitive fields
INSERT INTO public.data_classifications (table_name, column_name, classification, encryption_required, audit_required)
VALUES 
  ('contacts', 'email', 'confidential', true, true),
  ('contacts', 'phone', 'confidential', true, true),
  ('contacts', 'mobile_phone', 'confidential', true, true),
  ('leads', 'email', 'confidential', true, true),
  ('leads', 'phone', 'confidential', true, true),
  ('companies', 'revenue', 'confidential', true, true),
  ('companies', 'annual_revenue', 'confidential', true, true),
  ('deals', 'amount', 'confidential', true, true),
  ('profiles', 'email', 'internal', true, true)
ON CONFLICT (table_name, column_name) DO UPDATE SET
  classification = EXCLUDED.classification,
  encryption_required = EXCLUDED.encryption_required,
  audit_required = EXCLUDED.audit_required;