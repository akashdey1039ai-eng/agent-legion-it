-- Fix critical RLS policies - Phase 2: Products, Email Templates, and Email Campaigns
-- These tables currently allow any authenticated user full access to sensitive business data

-- Fix Products table - restrict to sales managers and product teams only
DROP POLICY IF EXISTS "Users can view products" ON public.products;

CREATE POLICY "Product management access - SELECT"
ON public.products
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'manager')
);

CREATE POLICY "Product management access - INSERT"
ON public.products
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'manager')
);

CREATE POLICY "Product management access - UPDATE"
ON public.products
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'manager')
);

CREATE POLICY "Product management access - DELETE"
ON public.products
FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'manager')
);

-- Fix Email Templates table - restrict to marketing team and managers only
DROP POLICY IF EXISTS "Users can manage email templates" ON public.email_templates;

CREATE POLICY "Marketing team email template access - SELECT"
ON public.email_templates
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'manager') OR
  created_by = auth.uid()
);

CREATE POLICY "Marketing team email template access - INSERT"
ON public.email_templates
FOR INSERT
TO authenticated
WITH CHECK (
  (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager')) 
  AND created_by = auth.uid()
);

CREATE POLICY "Marketing team email template access - UPDATE"
ON public.email_templates
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'manager') OR
  created_by = auth.uid()
);

CREATE POLICY "Marketing team email template access - DELETE"
ON public.email_templates
FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'manager') OR
  created_by = auth.uid()
);

-- Fix Email Campaigns table - restrict to marketing team members and managers
DROP POLICY IF EXISTS "Users can manage email campaigns" ON public.email_campaigns;

CREATE POLICY "Marketing team email campaign access - SELECT"
ON public.email_campaigns
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'manager') OR
  created_by = auth.uid()
);

CREATE POLICY "Marketing team email campaign access - INSERT"
ON public.email_campaigns
FOR INSERT
TO authenticated
WITH CHECK (
  (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager')) 
  AND created_by = auth.uid()
);

CREATE POLICY "Marketing team email campaign access - UPDATE"
ON public.email_campaigns
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'manager') OR
  created_by = auth.uid()
);

CREATE POLICY "Marketing team email campaign access - DELETE"
ON public.email_campaigns
FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'manager') OR
  created_by = auth.uid()
);

-- Fix Deal Products table - ensure proper access control
DROP POLICY IF EXISTS "Users can manage deal products" ON public.deal_products;

CREATE POLICY "Sales team deal product access"
ON public.deal_products
FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'manager') OR
  has_role(auth.uid(), 'sales_rep')
)
WITH CHECK (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'manager') OR
  has_role(auth.uid(), 'sales_rep')
);