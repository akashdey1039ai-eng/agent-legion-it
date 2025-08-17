-- Add unique constraint on user_id for salesforce_tokens table
ALTER TABLE public.salesforce_tokens ADD CONSTRAINT salesforce_tokens_user_id_unique UNIQUE (user_id);