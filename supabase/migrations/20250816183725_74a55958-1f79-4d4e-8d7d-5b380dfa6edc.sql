-- Fix existing security issues by implementing proper RLS policies

-- 1. Fix knowledge_articles - restrict to authenticated users only
DROP POLICY IF EXISTS "Content team knowledge article access - SELECT" ON public.knowledge_articles;
CREATE POLICY "Authenticated users can view published articles" 
ON public.knowledge_articles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND (publish_status = 'published' OR created_by_id = auth.uid() OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'))
);

-- 2. Fix notes table - replace overly permissive policy with owner-based access
DROP POLICY IF EXISTS "Users can manage notes" ON public.notes;

CREATE POLICY "Role-based note access - SELECT"
ON public.notes FOR SELECT
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'manager') OR
  created_by = auth.uid() OR
  (is_private = false AND auth.uid() IS NOT NULL)
);

CREATE POLICY "Role-based note access - INSERT"
ON public.notes FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND created_by = auth.uid()
);

CREATE POLICY "Role-based note access - UPDATE"
ON public.notes FOR UPDATE
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'manager') OR
  created_by = auth.uid()
);

CREATE POLICY "Role-based note access - DELETE"
ON public.notes FOR DELETE
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'manager') OR
  created_by = auth.uid()
);

-- Create missing tables with secure RLS policies

-- Teams table
CREATE TABLE IF NOT EXISTS public.teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and managers can manage teams"
ON public.teams FOR ALL
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'))
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

-- Team Members table
CREATE TABLE IF NOT EXISTS public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id uuid,
  role text DEFAULT 'member',
  added_at timestamp with time zone DEFAULT now(),
  UNIQUE(team_id, user_id)
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and managers can manage team members"
ON public.team_members FOR ALL
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'))
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

-- Tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  status text DEFAULT 'pending',
  priority text DEFAULT 'medium',
  owner_id uuid,
  due_date timestamp with time zone,
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Role-based task access - SELECT"
ON public.tasks FOR SELECT
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'manager') OR
  owner_id = auth.uid()
);

CREATE POLICY "Role-based task access - INSERT"
ON public.tasks FOR INSERT
WITH CHECK (
  (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager') OR has_role(auth.uid(), 'sales_rep')) 
  AND owner_id = auth.uid()
);

CREATE POLICY "Role-based task access - UPDATE"
ON public.tasks FOR UPDATE
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'manager') OR
  owner_id = auth.uid()
);

CREATE POLICY "Role-based task access - DELETE"
ON public.tasks FOR DELETE
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'manager') OR
  owner_id = auth.uid()
);

-- Sales Stages table
CREATE TABLE IF NOT EXISTS public.sales_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  probability integer DEFAULT 0,
  stage_order integer,
  is_closed boolean DEFAULT false,
  is_won boolean DEFAULT false,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.sales_stages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All users can view sales stages"
ON public.sales_stages FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin and manager sales stage management"
ON public.sales_stages FOR ALL
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'))
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

-- Reports table
CREATE TABLE IF NOT EXISTS public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  report_type text,
  config jsonb DEFAULT '{}',
  owner_id uuid,
  is_public boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Role-based report access - SELECT"
ON public.reports FOR SELECT
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'manager') OR
  owner_id = auth.uid() OR
  is_public = true
);

CREATE POLICY "Role-based report access - INSERT"
ON public.reports FOR INSERT
WITH CHECK (
  (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager') OR has_role(auth.uid(), 'sales_rep')) 
  AND owner_id = auth.uid()
);

CREATE POLICY "Role-based report access - UPDATE"
ON public.reports FOR UPDATE
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'manager') OR
  owner_id = auth.uid()
);

CREATE POLICY "Role-based report access - DELETE"
ON public.reports FOR DELETE
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'manager') OR
  owner_id = auth.uid()
);

-- Log the security fix
INSERT INTO public.audit_logs (
    table_name,
    operation,
    new_data,
    user_id
) VALUES (
    'security_policies',
    'SECURITY_FIX',
    jsonb_build_object(
        'fix_type', 'rls_policy_hardening',
        'timestamp', now(),
        'tables_fixed', ARRAY['knowledge_articles', 'teams', 'team_members', 'tasks', 'sales_stages', 'reports', 'notes'],
        'description', 'Implemented role-based access controls to fix overly permissive table access'
    ),
    null
);

SELECT 'Security policy hardening completed successfully' as status;