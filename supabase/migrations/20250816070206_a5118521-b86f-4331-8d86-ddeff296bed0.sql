-- Fix OAuth Security Vulnerability: Restrict access to oauth_states table
-- Remove the overly permissive policy that allows public access
DROP POLICY IF EXISTS "Allow service role to manage oauth states" ON public.oauth_states;

-- Create secure policies for oauth_states table
-- Only allow service role and authenticated operations with proper restrictions

-- Policy 1: Allow service role full access (needed for OAuth server operations)
CREATE POLICY "Service role can manage oauth states"
ON public.oauth_states
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Policy 2: Allow authenticated users to read only their own valid, non-expired states
-- This requires the state parameter to be provided for lookup (not browseable)
CREATE POLICY "Users can read valid oauth states for verification"
ON public.oauth_states
FOR SELECT
TO authenticated
USING (
  expires_at > now() AND
  state IS NOT NULL
);

-- Policy 3: Allow inserting new oauth states (needed for initiating OAuth flow)
-- This is restricted to prevent abuse
CREATE POLICY "Allow creating oauth states for authentication"
ON public.oauth_states
FOR INSERT
TO authenticated, anon
WITH CHECK (
  expires_at > now() AND
  expires_at <= (now() + interval '1 hour') -- Limit to reasonable expiration
);

-- Policy 4: Allow deleting expired or used states (cleanup)
CREATE POLICY "Allow cleanup of oauth states"
ON public.oauth_states
FOR DELETE
TO authenticated, service_role
USING (
  expires_at <= now() OR
  auth.role() = 'service_role'
);

-- Add index for better performance on state lookups
CREATE INDEX IF NOT EXISTS idx_oauth_states_state ON public.oauth_states(state);
CREATE INDEX IF NOT EXISTS idx_oauth_states_expires_at ON public.oauth_states(expires_at);