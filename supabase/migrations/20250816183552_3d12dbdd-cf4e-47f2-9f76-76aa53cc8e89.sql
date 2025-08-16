-- Fix remaining security issues by implementing proper RLS policies

-- 1. Fix knowledge_articles - restrict to authenticated users only
DROP POLICY IF EXISTS "Content team knowledge article access - SELECT" ON public.knowledge_articles;
CREATE POLICY "Authenticated users can view published articles" 
ON public.knowledge_articles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND (publish_status = 'published' OR created_by_id = auth.uid() OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'))
);

-- 2. Create teams table if it doesn't exist and fix access
CREATE TABLE IF NOT EXISTS public.teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- 3. Create team_members table if it doesn't exist and fix access
CREATE TABLE IF NOT EXISTS public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text DEFAULT 'member',
  added_by uuid REFERENCES auth.users(id),
  added_at timestamp with time zone DEFAULT now(),
  UNIQUE(team_id, user_id)
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- 4. Create tasks table if it doesn't exist and fix access
CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  status text DEFAULT 'pending',
  priority text DEFAULT 'medium',
  assigned_to uuid REFERENCES auth.users(id),
  created_by uuid REFERENCES auth.users(id),
  due_date timestamp with time zone,
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- 5. Create sales_stages table if it doesn't exist and fix access
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

-- 6. Create reports table if it doesn't exist and fix access
CREATE TABLE IF NOT EXISTS public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  report_type text,
  config jsonb DEFAULT '{}',
  created_by uuid REFERENCES auth.users(id),
  is_public boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Drop existing overly permissive policies and create secure ones

-- Teams: Only admins/managers can manage, members can view their teams
DROP POLICY IF EXISTS "Enable read access for all users" ON public.teams;
CREATE POLICY "Team members can view their teams"
ON public.teams FOR SELECT 
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'manager') OR
  EXISTS (SELECT 1 FROM public.team_members WHERE team_id = teams.id AND user_id = auth.uid())
);

CREATE POLICY "Admins and managers can manage teams"
ON public.teams FOR ALL
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'))
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

-- Team Members: Role-based access
DROP POLICY IF EXISTS "Enable read access for all users" ON public.team_members;
CREATE POLICY "Team members can view team membership"
ON public.team_members FOR SELECT
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'manager') OR
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.team_members tm WHERE tm.team_id = team_members.team_id AND tm.user_id = auth.uid())
);

CREATE POLICY "Admins and managers can manage team members"
ON public.team_members FOR ALL
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'))
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

-- Tasks: Owner-based access with role escalation
DROP POLICY IF EXISTS "Users can manage tasks" ON public.tasks;
CREATE POLICY "Role-based task access - SELECT"
ON public.tasks FOR SELECT
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'manager') OR
  assigned_to = auth.uid() OR 
  created_by = auth.uid()
);

CREATE POLICY "Role-based task access - INSERT"
ON public.tasks FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'manager') OR 
  has_role(auth.uid(), 'sales_rep') OR
  created_by = auth.uid()
);

CREATE POLICY "Role-based task access - UPDATE"
ON public.tasks FOR UPDATE
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'manager') OR
  assigned_to = auth.uid() OR 
  created_by = auth.uid()
);

CREATE POLICY "Role-based task access - DELETE"
ON public.tasks FOR DELETE
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'manager') OR
  created_by = auth.uid()
);

-- Sales Stages: Admin/Manager only for modifications
CREATE POLICY "All users can view sales stages"
ON public.sales_stages FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin and manager sales stage management"
ON public.sales_stages FOR ALL
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'))
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

-- Reports: Owner-based with role escalation
CREATE POLICY "Role-based report access - SELECT"
ON public.reports FOR SELECT
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'manager') OR
  created_by = auth.uid() OR
  is_public = true
);

CREATE POLICY "Role-based report access - INSERT"
ON public.reports FOR INSERT
WITH CHECK (
  (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager') OR has_role(auth.uid(), 'sales_rep')) 
  AND created_by = auth.uid()
);

CREATE POLICY "Role-based report access - UPDATE"
ON public.reports FOR UPDATE
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'manager') OR
  created_by = auth.uid()
);

CREATE POLICY "Role-based report access - DELETE"
ON public.reports FOR DELETE
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'manager') OR
  created_by = auth.uid()
);

-- Notes: Owner-based access with role escalation (fix existing overly permissive policy)
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

-- Add audit logging for the security fixes
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

SELECT 'Security policy hardening completed for all tables' as status;