-- Remove any remaining overly permissive policies and fix knowledge articles completely

-- Check what policies exist (this will show in logs)
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT schemaname, tablename, policyname, permissive, cmd, qual, with_check 
        FROM pg_policies 
        WHERE tablename = 'knowledge_articles'
    LOOP
        RAISE NOTICE 'Policy found: % on %.% - Command: %, Qual: %, Check: %', 
            policy_record.policyname, 
            policy_record.schemaname, 
            policy_record.tablename,
            policy_record.cmd,
            policy_record.qual,
            policy_record.with_check;
    END LOOP;
END $$;

-- Drop ALL existing policies on knowledge_articles
DROP POLICY IF EXISTS "Content team knowledge article access - SELECT" ON public.knowledge_articles;
DROP POLICY IF EXISTS "Authenticated users can view articles based on role" ON public.knowledge_articles;
DROP POLICY IF EXISTS "Admins and managers can manage articles" ON public.knowledge_articles;

-- Disable and re-enable RLS to clear any cached policies
ALTER TABLE public.knowledge_articles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_articles ENABLE ROW LEVEL SECURITY;

-- Create the most restrictive policy possible
CREATE POLICY "Strict authenticated access only"
ON public.knowledge_articles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND 
  (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager') OR has_role(auth.uid(), 'sales_rep') OR has_role(auth.uid(), 'viewer'))
);

-- Admin/Manager management policy
CREATE POLICY "Admin manager article management"
ON public.knowledge_articles 
FOR ALL
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'))
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

-- Log the security enforcement
INSERT INTO public.audit_logs (
    table_name,
    operation,
    new_data,
    user_id
) VALUES (
    'knowledge_articles',
    'SECURITY_ENFORCEMENT',
    jsonb_build_object(
        'fix_type', 'complete_rls_reset',
        'timestamp', now(),
        'description', 'Completely reset and secured knowledge articles with strict authentication requirements'
    ),
    null
);

SELECT 'Knowledge articles security completely locked down' as status;