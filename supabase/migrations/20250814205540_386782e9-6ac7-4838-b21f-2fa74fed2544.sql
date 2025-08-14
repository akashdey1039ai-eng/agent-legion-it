-- Clean up duplicate Salesforce tokens, keeping only the most recent one per user
DELETE FROM salesforce_tokens 
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id) id 
  FROM salesforce_tokens 
  ORDER BY user_id, created_at DESC
);