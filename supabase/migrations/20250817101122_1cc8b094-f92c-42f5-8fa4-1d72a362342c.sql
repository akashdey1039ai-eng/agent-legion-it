-- Fix tasks table policies based on actual column structure
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tasks' AND table_schema = 'public') THEN
        ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
        
        -- Drop existing permissive policies if they exist
        DROP POLICY IF EXISTS "Enable read access for all users" ON public.tasks;
        DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.tasks;
        DROP POLICY IF EXISTS "Enable update for users based on email" ON public.tasks;
        DROP POLICY IF EXISTS "Enable delete for users based on email" ON public.tasks;
        
        -- Check if specific columns exist and create appropriate policies
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'owner_id' AND table_schema = 'public') THEN
            -- If owner_id exists, use it for access control
            CREATE POLICY "Users can view tasks they own or admins/managers can view all"
            ON public.tasks
            FOR SELECT
            USING (
              has_role(auth.uid(), 'admin'::app_role) OR 
              has_role(auth.uid(), 'manager'::app_role) OR
              owner_id = auth.uid()
            );

            CREATE POLICY "Users can create tasks"
            ON public.tasks
            FOR INSERT
            WITH CHECK (
              (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'sales_rep'::app_role)) AND
              owner_id = auth.uid()
            );

            CREATE POLICY "Users can update their own tasks or admins/managers can update any"
            ON public.tasks
            FOR UPDATE
            USING (
              has_role(auth.uid(), 'admin'::app_role) OR 
              has_role(auth.uid(), 'manager'::app_role) OR
              owner_id = auth.uid()
            );

            CREATE POLICY "Only admins and managers can delete tasks"
            ON public.tasks
            FOR DELETE
            USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));
        ELSE
            -- If no owner_id, restrict to admin/manager only
            CREATE POLICY "Only admins and managers can manage tasks"
            ON public.tasks
            FOR ALL
            USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))
            WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));
        END IF;
    END IF;
END $$;