-- Fix OAuth States Security Vulnerability (Corrected)
-- Remove all existing insecure policies
DROP POLICY IF EXISTS "Allow cleanup of oauth states" ON public.oauth_states;
DROP POLICY IF EXISTS "Allow creating oauth states for authentication" ON public.oauth_states;
DROP POLICY IF EXISTS "Service role can manage oauth states" ON public.oauth_states;
DROP POLICY IF EXISTS "Service role only oauth states access" ON public.oauth_states;

-- Create secure, restrictive policies

-- 1. Allow service role to manage states (for authentication flows only)
CREATE POLICY "Service role auth flow management" 
ON public.oauth_states 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (
  -- Only allow states that expire within 1 hour (prevent long-lived tokens)
  expires_at > now() AND expires_at <= (now() + interval '1 hour')
);

-- 2. Allow cleanup of expired states (automated cleanup only)
CREATE POLICY "Automated expired state cleanup"
ON public.oauth_states
FOR DELETE
TO service_role
USING (expires_at <= now());

-- 3. Block all direct user access (no SELECT, INSERT, UPDATE, DELETE for regular users)
-- OAuth states should only be managed by the authentication system

-- 4. Add additional security constraints to the table structure
-- Ensure state strings are properly random and limited in length
ALTER TABLE public.oauth_states 
ADD CONSTRAINT oauth_state_length_check 
CHECK (char_length(state) >= 32 AND char_length(state) <= 128);

ALTER TABLE public.oauth_states 
ADD CONSTRAINT oauth_code_verifier_length_check 
CHECK (char_length(code_verifier) >= 43 AND char_length(code_verifier) <= 128);

-- 5. Add index for efficient cleanup of expired states
CREATE INDEX IF NOT EXISTS idx_oauth_states_expires_at 
ON public.oauth_states (expires_at) 
WHERE expires_at <= now();

-- 6. Create a secure function for state validation (for edge functions)
CREATE OR REPLACE FUNCTION public.validate_oauth_state(
  p_state text,
  p_code_verifier text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  state_record RECORD;
BEGIN
  -- Find and validate the state
  SELECT * INTO state_record
  FROM public.oauth_states
  WHERE state = p_state
    AND expires_at > now();
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Validate code verifier if provided
  IF p_code_verifier IS NOT NULL AND state_record.code_verifier != p_code_verifier THEN
    RETURN false;
  END IF;
  
  -- Delete the used state (one-time use only)
  DELETE FROM public.oauth_states WHERE state = p_state;
  
  RETURN true;
END;
$$;