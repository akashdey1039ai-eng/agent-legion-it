-- Handle tasks table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tasks' AND table_schema = 'public') THEN
        ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
        
        -- Drop existing permissive policies if they exist
        DROP POLICY IF EXISTS "Enable read access for all users" ON public.tasks;
        DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.tasks;
        DROP POLICY IF EXISTS "Enable update for users based on email" ON public.tasks;
        DROP POLICY IF EXISTS "Enable delete for users based on email" ON public.tasks;
        
        -- Create proper RLS policies for tasks
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
    ELSE
        -- Create tasks table if it doesn't exist
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

        CREATE TRIGGER update_tasks_updated_at
          BEFORE UPDATE ON public.tasks
          FOR EACH ROW
          EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;