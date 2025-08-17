-- Fix OAuth code verifier constraint that's blocking HubSpot auth
-- The current constraint is too strict for HubSpot's code verifier format

-- Drop the overly strict constraint
ALTER TABLE public.oauth_states 
DROP CONSTRAINT IF EXISTS oauth_code_verifier_length_check;

-- Add a more lenient constraint that allows HubSpot's format
-- HubSpot uses shorter code verifiers than the 43 character minimum I set
ALTER TABLE public.oauth_states 
ADD CONSTRAINT oauth_code_verifier_length_check 
CHECK (char_length(code_verifier) >= 16 AND char_length(code_verifier) <= 256);