-- Critical Security Fix: Update RLS policies for vulnerable tables

-- Fix notes table RLS - currently allows any authenticated user to access all notes
DROP POLICY IF EXISTS "Users can manage notes" ON public.notes;

CREATE POLICY "Users can view their own notes or notes they created" 
ON public.notes 
FOR SELECT 
USING (
  created_by = auth.uid() OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

CREATE POLICY "Users can create notes" 
ON public.notes 
FOR INSERT 
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own notes" 
ON public.notes 
FOR UPDATE 
USING (
  created_by = auth.uid() OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

CREATE POLICY "Users can delete their own notes" 
ON public.notes 
FOR DELETE 
USING (
  created_by = auth.uid() OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

-- Create secure tables for missing critical entities
CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'pending',
  priority text NOT NULL DEFAULT 'medium',
  assigned_to uuid,
  created_by uuid NOT NULL,
  due_date timestamp with time zone,
  completed_at timestamp with time zone,
  related_to_id uuid,
  related_to_type text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Secure RLS policies for tasks
CREATE POLICY "Role-based task access - SELECT" 
ON public.tasks 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role) OR 
  (has_role(auth.uid(), 'sales_rep'::app_role) AND (assigned_to = auth.uid() OR created_by = auth.uid())) OR
  (has_role(auth.uid(), 'viewer'::app_role) AND (assigned_to = auth.uid() OR created_by = auth.uid()))
);

CREATE POLICY "Role-based task access - INSERT" 
ON public.tasks 
FOR INSERT 
WITH CHECK (
  (has_role(auth.uid(), 'admin'::app_role) OR 
   has_role(auth.uid(), 'manager'::app_role) OR 
   has_role(auth.uid(), 'sales_rep'::app_role)) AND 
  created_by = auth.uid()
);

CREATE POLICY "Role-based task access - UPDATE" 
ON public.tasks 
FOR UPDATE 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role) OR 
  (has_role(auth.uid(), 'sales_rep'::app_role) AND (assigned_to = auth.uid() OR created_by = auth.uid()))
);

CREATE POLICY "Role-based task access - DELETE" 
ON public.tasks 
FOR DELETE 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

-- Create reports table with secure RLS
CREATE TABLE IF NOT EXISTS public.reports (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  report_type text NOT NULL,
  config jsonb DEFAULT '{}',
  created_by uuid NOT NULL,
  is_public boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Secure RLS policies for reports - admin/manager only
CREATE POLICY "Admin-manager report access - SELECT" 
ON public.reports 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role) OR
  (is_public = true AND auth.uid() IS NOT NULL)
);

CREATE POLICY "Admin-manager report access - INSERT" 
ON public.reports 
FOR INSERT 
WITH CHECK (
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role)) AND 
  created_by = auth.uid()
);

CREATE POLICY "Admin-manager report access - UPDATE" 
ON public.reports 
FOR UPDATE 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

CREATE POLICY "Admin-manager report access - DELETE" 
ON public.reports 
FOR DELETE 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

-- Create teams table with secure RLS
CREATE TABLE IF NOT EXISTS public.teams (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  manager_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Create team_members table with secure RLS
CREATE TABLE IF NOT EXISTS public.team_members (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id uuid NOT NULL,
  user_id uuid NOT NULL,
  role text DEFAULT 'member',
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(team_id, user_id)
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Secure RLS policies for teams
CREATE POLICY "Team access based on membership - SELECT" 
ON public.teams 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role) OR
  EXISTS (
    SELECT 1 FROM public.team_members tm 
    WHERE tm.team_id = id AND tm.user_id = auth.uid()
  )
);

CREATE POLICY "Manager-admin team management - INSERT" 
ON public.teams 
FOR INSERT 
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

CREATE POLICY "Manager-admin team management - UPDATE" 
ON public.teams 
FOR UPDATE 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role) OR
  manager_id = auth.uid()
);

CREATE POLICY "Admin-only team deletion" 
ON public.teams 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Secure RLS policies for team_members
CREATE POLICY "Team member access based on membership - SELECT" 
ON public.team_members 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role) OR
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.team_members tm 
    WHERE tm.team_id = team_id AND tm.user_id = auth.uid()
  )
);

CREATE POLICY "Manager-admin team member management - INSERT" 
ON public.team_members 
FOR INSERT 
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

CREATE POLICY "Manager-admin team member management - UPDATE" 
ON public.team_members 
FOR UPDATE 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

CREATE POLICY "Manager-admin team member management - DELETE" 
ON public.team_members 
FOR DELETE 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

-- Create sales_stages table with secure RLS
CREATE TABLE IF NOT EXISTS public.sales_stages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  stage_order integer NOT NULL,
  probability_percent integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.sales_stages ENABLE ROW LEVEL SECURITY;

-- Secure RLS policies for sales_stages - sales roles only
CREATE POLICY "Sales roles can view sales stages" 
ON public.sales_stages 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role) OR 
  has_role(auth.uid(), 'sales_rep'::app_role)
);

CREATE POLICY "Admin-manager sales stage management - INSERT" 
ON public.sales_stages 
FOR INSERT 
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

CREATE POLICY "Admin-manager sales stage management - UPDATE" 
ON public.sales_stages 
FOR UPDATE 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

CREATE POLICY "Admin-manager sales stage management - DELETE" 
ON public.sales_stages 
FOR DELETE 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

-- Add audit triggers for sensitive tables
CREATE TRIGGER audit_notes_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.notes
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_tasks_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_reports_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.reports
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_teams_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_team_members_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.team_members
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- Add updated_at triggers
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();