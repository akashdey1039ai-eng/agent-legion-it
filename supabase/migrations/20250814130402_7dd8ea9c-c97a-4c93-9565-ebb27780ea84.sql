-- Add unique constraint to user_id column in hubspot_tokens table
ALTER TABLE public.hubspot_tokens 
ADD CONSTRAINT hubspot_tokens_user_id_unique UNIQUE (user_id);