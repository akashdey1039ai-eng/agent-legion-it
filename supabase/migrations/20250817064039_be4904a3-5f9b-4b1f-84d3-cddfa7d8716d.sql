-- Fix database constraints that are causing sync failures

-- First, let's check the current activities type constraint
SELECT 
  pg_get_constraintdef(oid) as constraint_definition,
  conname as constraint_name
FROM pg_constraint 
WHERE conrelid = 'public.activities'::regclass 
  AND conname LIKE '%type%';

-- Update activities type constraint to allow more values that AI agents try to insert
ALTER TABLE public.activities DROP CONSTRAINT IF EXISTS activities_type_check;
ALTER TABLE public.activities ADD CONSTRAINT activities_type_check 
CHECK (type IN ('task', 'call', 'meeting', 'email', 'demo', 'follow_up', 'research', 'proposal', 'negotiation', 'closing', 'onboarding'));

-- Update contacts status constraint to allow AI-generated status values
ALTER TABLE public.contacts DROP CONSTRAINT IF EXISTS contacts_status_check;
ALTER TABLE public.contacts ADD CONSTRAINT contacts_status_check 
CHECK (status IN ('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost', 'unqualified', 'nurturing', 'warm', 'hot', 'cold'));

-- Fix audit logs RLS policy to allow service role inserts
DROP POLICY IF EXISTS "Prevent manual audit log modification by users" ON public.audit_logs;

-- Update the service role policy to be more permissive
DROP POLICY IF EXISTS "Service role can insert audit logs" ON public.audit_logs;
CREATE POLICY "Service role can insert audit logs" 
ON public.audit_logs 
FOR INSERT 
WITH CHECK (auth.role() = 'service_role' OR current_setting('role', true) = 'service_role');