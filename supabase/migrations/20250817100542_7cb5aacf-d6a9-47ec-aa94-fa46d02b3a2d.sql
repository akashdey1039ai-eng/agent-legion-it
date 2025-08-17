-- Fix the overly permissive notes table policy
DROP POLICY IF EXISTS "Users can manage notes" ON public.notes;

-- Create proper RLS policies for notes table
CREATE POLICY "Users can view notes they created or are related to"
ON public.notes
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role) OR
  created_by = auth.uid() OR
  (
    -- Allow viewing notes related to records the user owns
    has_role(auth.uid(), 'sales_rep'::app_role) AND (
      (related_to_type = 'contact' AND related_to_id IN (
        SELECT id FROM public.contacts WHERE owner_id = auth.uid()
      )) OR
      (related_to_type = 'deal' AND related_to_id IN (
        SELECT id FROM public.deals WHERE assigned_user_id = auth.uid()
      )) OR
      (related_to_type = 'lead' AND related_to_id IN (
        SELECT id FROM public.leads WHERE assigned_user_id = auth.uid()
      )) OR
      (related_to_type = 'company' AND related_to_id IN (
        SELECT id FROM public.companies WHERE assigned_user_id = auth.uid()
      ))
    )
  )
);

CREATE POLICY "Users can create notes for records they own"
ON public.notes
FOR INSERT
WITH CHECK (
  (created_by = auth.uid()) AND (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'manager'::app_role) OR
    has_role(auth.uid(), 'sales_rep'::app_role) OR
    (
      -- Sales reps can only create notes for records they own
      has_role(auth.uid(), 'sales_rep'::app_role) AND (
        (related_to_type = 'contact' AND related_to_id IN (
          SELECT id FROM public.contacts WHERE owner_id = auth.uid()
        )) OR
        (related_to_type = 'deal' AND related_to_id IN (
          SELECT id FROM public.deals WHERE assigned_user_id = auth.uid()
        )) OR
        (related_to_type = 'lead' AND related_to_id IN (
          SELECT id FROM public.leads WHERE assigned_user_id = auth.uid()
        )) OR
        (related_to_type = 'company' AND related_to_id IN (
          SELECT id FROM public.companies WHERE assigned_user_id = auth.uid()
        ))
      )
    )
  )
);

CREATE POLICY "Users can update their own notes or admins/managers can update any"
ON public.notes
FOR UPDATE
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role) OR
  created_by = auth.uid()
);

CREATE POLICY "Users can delete their own notes or admins/managers can delete any"
ON public.notes
FOR DELETE
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role) OR
  created_by = auth.uid()
);

-- Create the missing tables with proper RLS policies

-- Teams table
CREATE TABLE public.teams (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  manager_id uuid REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  is_active boolean DEFAULT true
);

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and managers can manage teams"
ON public.teams
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "Sales reps can view teams they belong to"
ON public.teams
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role) OR
  id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
);

-- Team members table
CREATE TABLE public.team_members (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text DEFAULT 'member',
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(team_id, user_id)
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and managers can manage team members"
ON public.team_members
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "Team members can view their own team memberships"
ON public.team_members
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role) OR
  user_id = auth.uid() OR
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
);

-- Tasks table
CREATE TABLE public.tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  status text DEFAULT 'pending',
  priority text DEFAULT 'medium',
  assigned_to uuid REFERENCES auth.users(id),
  created_by uuid REFERENCES auth.users(id),
  due_date timestamp with time zone,
  completed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  related_to_type text,
  related_to_id uuid
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tasks assigned to them or created by them"
ON public.tasks
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role) OR
  assigned_to = auth.uid() OR
  created_by = auth.uid()
);

CREATE POLICY "Users can create tasks"
ON public.tasks
FOR INSERT
WITH CHECK (
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'sales_rep'::app_role)) AND
  created_by = auth.uid()
);

CREATE POLICY "Users can update tasks assigned to them or admins/managers can update any"
ON public.tasks
FOR UPDATE
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role) OR
  assigned_to = auth.uid() OR
  created_by = auth.uid()
);

CREATE POLICY "Only admins and managers can delete tasks"
ON public.tasks
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

-- Sales stages table
CREATE TABLE public.sales_stages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  probability integer DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  is_closed_won boolean DEFAULT false,
  is_closed_lost boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.sales_stages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins and managers can manage sales stages"
ON public.sales_stages
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "All authenticated users can view sales stages"
ON public.sales_stages
FOR SELECT
USING (auth.uid() IS NOT NULL AND is_active = true);

-- Reports table
CREATE TABLE public.reports (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  report_type text NOT NULL,
  query_config jsonb DEFAULT '{}',
  created_by uuid REFERENCES auth.users(id),
  is_public boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  last_run_at timestamp with time zone
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view public reports or reports they created"
ON public.reports
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role) OR
  is_public = true OR
  created_by = auth.uid()
);

CREATE POLICY "Users can create reports"
ON public.reports
FOR INSERT
WITH CHECK (
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'sales_rep'::app_role)) AND
  created_by = auth.uid()
);

CREATE POLICY "Users can update their own reports or admins/managers can update any"
ON public.reports
FOR UPDATE
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role) OR
  created_by = auth.uid()
);

CREATE POLICY "Users can delete their own reports or admins/managers can delete any"
ON public.reports
FOR DELETE
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role) OR
  created_by = auth.uid()
);

-- Add triggers for updated_at columns
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sales_stages_updated_at
  BEFORE UPDATE ON public.sales_stages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();