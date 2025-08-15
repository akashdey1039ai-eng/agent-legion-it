-- Add new agent types to the ai_agents type check constraint
-- First, let's see what the current constraint looks like
SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint WHERE conname LIKE '%ai_agents%type%';