-- Check current RLS policies on salesforce_tokens table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'salesforce_tokens';

-- Drop existing restrictive policies and create proper ones
DROP POLICY IF EXISTS "Enhanced salesforce token access - INSERT" ON public.salesforce_tokens;
DROP POLICY IF EXISTS "Enhanced salesforce token access - UPDATE" ON public.salesforce_tokens;
DROP POLICY IF EXISTS "Enhanced salesforce token access - SELECT" ON public.salesforce_tokens;
DROP POLICY IF EXISTS "Enhanced salesforce token access - DELETE" ON public.salesforce_tokens;

-- Create new policies that allow users to manage their own tokens
CREATE POLICY "Users can insert their own tokens" 
ON public.salesforce_tokens 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tokens" 
ON public.salesforce_tokens 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can select their own tokens" 
ON public.salesforce_tokens 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tokens" 
ON public.salesforce_tokens 
FOR DELETE 
USING (auth.uid() = user_id);