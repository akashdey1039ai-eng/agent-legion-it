-- Fix critical RLS policies - Phase 1: Activities, Campaigns, and Knowledge Articles
-- These tables currently allow any authenticated user full access to all data

-- Fix Activities table - restrict to owner-based access
DROP POLICY IF EXISTS "Authenticated users can view activities" ON public.activities;
DROP POLICY IF EXISTS "Authenticated users can insert activities" ON public.activities;
DROP POLICY IF EXISTS "Authenticated users can update activities" ON public.activities;
DROP POLICY IF EXISTS "Authenticated users can delete activities" ON public.activities;

-- Create proper role-based policies for activities
CREATE POLICY "Role-based activity access - SELECT"
ON public.activities
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'manager') OR 
  (has_role(auth.uid(), 'sales_rep') AND owner_id = auth.uid()) OR
  (has_role(auth.uid(), 'viewer') AND owner_id = auth.uid())
);

CREATE POLICY "Role-based activity access - INSERT"
ON public.activities
FOR INSERT
TO authenticated
WITH CHECK (
  (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager') OR has_role(auth.uid(), 'sales_rep')) 
  AND owner_id = auth.uid()
);

CREATE POLICY "Role-based activity access - UPDATE"
ON public.activities
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'manager') OR 
  (has_role(auth.uid(), 'sales_rep') AND owner_id = auth.uid())
);

CREATE POLICY "Role-based activity access - DELETE"
ON public.activities
FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'manager')
);

-- Fix Campaigns table - restrict to admin/manager access
DROP POLICY IF EXISTS "All authenticated users can view campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "All authenticated users can modify campaigns" ON public.campaigns;

CREATE POLICY "Marketing team campaign access - SELECT"
ON public.campaigns
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'manager')
);

CREATE POLICY "Marketing team campaign access - INSERT"
ON public.campaigns
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'manager')
);

CREATE POLICY "Marketing team campaign access - UPDATE"
ON public.campaigns
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'manager')
);

CREATE POLICY "Marketing team campaign access - DELETE"
ON public.campaigns
FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'manager')
);

-- Fix Campaign Members table - restrict to admin/manager access
DROP POLICY IF EXISTS "All authenticated users can view campaign members" ON public.campaign_members;
DROP POLICY IF EXISTS "All authenticated users can modify campaign members" ON public.campaign_members;

CREATE POLICY "Marketing team campaign member access"
ON public.campaign_members
FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'manager')
)
WITH CHECK (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'manager')
);

-- Fix Knowledge Articles table - restrict to content creators
DROP POLICY IF EXISTS "All authenticated users can view knowledge articles" ON public.knowledge_articles;
DROP POLICY IF EXISTS "All authenticated users can modify knowledge articles" ON public.knowledge_articles;

CREATE POLICY "Content team knowledge article access - SELECT"
ON public.knowledge_articles
FOR SELECT
TO authenticated
USING (true); -- All can read published articles

CREATE POLICY "Content team knowledge article access - MODIFY"
ON public.knowledge_articles
FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'manager') OR
  created_by_id = auth.uid()
)
WITH CHECK (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'manager')
);