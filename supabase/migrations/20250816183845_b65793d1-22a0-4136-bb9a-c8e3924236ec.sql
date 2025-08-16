-- Fix the final security issue: knowledge_articles public access

-- Drop all existing policies on knowledge_articles
DROP POLICY IF EXISTS "Content team knowledge article access - MODIFY" ON public.knowledge_articles;
DROP POLICY IF EXISTS "Authenticated users can view published articles" ON public.knowledge_articles;

-- Create a restrictive policy that requires authentication
CREATE POLICY "Authenticated users can view articles based on role"
ON public.knowledge_articles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'manager') OR 
    has_role(auth.uid(), 'sales_rep') OR 
    has_role(auth.uid(), 'viewer')
  )
);

-- Allow admins and managers to manage articles
CREATE POLICY "Admins and managers can manage articles"
ON public.knowledge_articles 
FOR ALL
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'))
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

-- Ensure RLS is enabled
ALTER TABLE public.knowledge_articles ENABLE ROW LEVEL SECURITY;

-- Log the final security fix
INSERT INTO public.audit_logs (
    table_name,
    operation,
    new_data,
    user_id
) VALUES (
    'knowledge_articles',
    'FINAL_SECURITY_FIX',
    jsonb_build_object(
        'fix_type', 'knowledge_articles_access_restriction',
        'timestamp', now(),
        'description', 'Restricted knowledge articles to authenticated users with proper roles only'
    ),
    null
);

SELECT 'Final security fix applied: Knowledge articles now require authentication' as status;