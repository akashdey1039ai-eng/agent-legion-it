-- Check if teams table exists and add RLS if missing
DO $$
BEGIN
    -- Enable RLS on teams table if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'teams' AND table_schema = 'public') THEN
        ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
        
        -- Drop existing permissive policies if they exist
        DROP POLICY IF EXISTS "Enable read access for all users" ON public.teams;
        DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.teams;
        DROP POLICY IF EXISTS "Enable update for users based on email" ON public.teams;
        DROP POLICY IF EXISTS "Enable delete for users based on email" ON public.teams;
        
        -- Create proper RLS policies for teams
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
          (EXISTS (SELECT 1 FROM public.team_members WHERE team_id = teams.id AND user_id = auth.uid()))
        );
    END IF;
END $$;

-- Check if team_members table exists and add RLS if missing
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'team_members' AND table_schema = 'public') THEN
        ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
        
        -- Drop existing permissive policies if they exist
        DROP POLICY IF EXISTS "Enable read access for all users" ON public.team_members;
        DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.team_members;
        DROP POLICY IF EXISTS "Enable update for users based on email" ON public.team_members;
        DROP POLICY IF EXISTS "Enable delete for users based on email" ON public.team_members;
        
        -- Create proper RLS policies for team_members
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
          (EXISTS (SELECT 1 FROM public.team_members tm WHERE tm.team_id = team_members.team_id AND tm.user_id = auth.uid()))
        );
    END IF;
END $$;