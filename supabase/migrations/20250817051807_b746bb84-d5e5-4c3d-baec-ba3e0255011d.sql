-- Check if the current user has a role assigned
SELECT user_id, role FROM public.user_roles WHERE user_id = auth.uid();

-- If no role is assigned, let's also allow basic authenticated users to insert tokens
-- and update the existing policies to be less restrictive for token management
CREATE POLICY "Authenticated users can manage tokens" 
ON public.salesforce_tokens 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);