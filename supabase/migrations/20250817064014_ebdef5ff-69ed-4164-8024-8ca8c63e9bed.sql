-- Fix database constraints and data validation issues

-- First, let's check what values are allowed for activities type
SELECT 
  pg_get_constraintdef(oid) as constraint_definition,
  conname as constraint_name
FROM pg_constraint 
WHERE conrelid = 'public.activities'::regclass 
  AND conname LIKE '%type%';

-- Check contacts status constraint  
SELECT 
  pg_get_constraintdef(oid) as constraint_definition,
  conname as constraint_name
FROM pg_constraint 
WHERE conrelid = 'public.contacts'::regclass 
  AND conname LIKE '%status%';