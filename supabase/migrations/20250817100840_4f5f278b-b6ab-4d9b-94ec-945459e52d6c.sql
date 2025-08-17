-- Handle sales_stages table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sales_stages' AND table_schema = 'public') THEN
        ALTER TABLE public.sales_stages ENABLE ROW LEVEL SECURITY;
        
        -- Drop existing permissive policies if they exist
        DROP POLICY IF EXISTS "Enable read access for all users" ON public.sales_stages;
        DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.sales_stages;
        DROP POLICY IF EXISTS "Enable update for users based on email" ON public.sales_stages;
        DROP POLICY IF EXISTS "Enable delete for users based on email" ON public.sales_stages;
        
        -- Create proper RLS policies for sales_stages
        CREATE POLICY "Only admins and managers can manage sales stages"
        ON public.sales_stages
        FOR ALL
        USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))
        WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

        CREATE POLICY "All authenticated users can view active sales stages"
        ON public.sales_stages
        FOR SELECT
        USING (auth.uid() IS NOT NULL);
    ELSE
        -- Create sales_stages table if it doesn't exist
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

        CREATE POLICY "All authenticated users can view active sales stages"
        ON public.sales_stages
        FOR SELECT
        USING (auth.uid() IS NOT NULL);

        CREATE TRIGGER update_sales_stages_updated_at
          BEFORE UPDATE ON public.sales_stages
          FOR EACH ROW
          EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;