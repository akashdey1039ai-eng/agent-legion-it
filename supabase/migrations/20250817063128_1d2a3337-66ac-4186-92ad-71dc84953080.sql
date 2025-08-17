-- Fix HubSpot token visibility issue
-- The current policies are too restrictive and prevent users from seeing their own connection status

-- Drop the overly restrictive SELECT policy
DROP POLICY IF EXISTS "Ultra-secure hubspot token access" ON public.hubspot_tokens;

-- Create a more reasonable SELECT policy that allows users to see their own tokens
CREATE POLICY "Users can view their own hubspot tokens" 
ON public.hubspot_tokens 
FOR SELECT 
USING (auth.uid() = user_id);

-- Also fix the DELETE policy to allow users to disconnect themselves
DROP POLICY IF EXISTS "Enhanced hubspot token access - DELETE" ON public.hubspot_tokens;

CREATE POLICY "Users can delete their own hubspot tokens" 
ON public.hubspot_tokens 
FOR DELETE 
USING (auth.uid() = user_id);

-- Keep the INSERT and UPDATE policies but make them less restrictive
DROP POLICY IF EXISTS "Enhanced hubspot token access - INSERT" ON public.hubspot_tokens;
DROP POLICY IF EXISTS "Enhanced hubspot token access - UPDATE" ON public.hubspot_tokens;

CREATE POLICY "Users can insert their own hubspot tokens" 
ON public.hubspot_tokens 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own hubspot tokens" 
ON public.hubspot_tokens 
FOR UPDATE 
USING (auth.uid() = user_id);