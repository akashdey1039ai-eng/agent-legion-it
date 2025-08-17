-- Remove duplicate rows keeping only the most recent one for each user_id
DELETE FROM public.salesforce_tokens 
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id) id
  FROM public.salesforce_tokens
  ORDER BY user_id, created_at DESC
);

-- Now add the unique constraint
ALTER TABLE public.salesforce_tokens ADD CONSTRAINT salesforce_tokens_user_id_unique UNIQUE (user_id);