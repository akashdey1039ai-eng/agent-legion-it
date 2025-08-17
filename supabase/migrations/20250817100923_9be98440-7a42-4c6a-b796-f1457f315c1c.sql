-- Handle reports table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reports' AND table_schema = 'public') THEN
        ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
        
        -- Drop existing permissive policies if they exist
        DROP POLICY IF EXISTS "Enable read access for all users" ON public.reports;
        DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.reports;
        DROP POLICY IF EXISTS "Enable update for users based on email" ON public.reports;
        DROP POLICY IF EXISTS "Enable delete for users based on email" ON public.reports;
        
        -- Create proper RLS policies for reports
        CREATE POLICY "Users can view public reports or reports they created"
        ON public.reports
        FOR SELECT
        USING (
          has_role(auth.uid(), 'admin'::app_role) OR 
          has_role(auth.uid(), 'manager'::app_role) OR
          (is_public = true) OR
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
    ELSE
        -- Create reports table if it doesn't exist
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

        CREATE TRIGGER update_reports_updated_at
          BEFORE UPDATE ON public.reports
          FOR EACH ROW
          EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;