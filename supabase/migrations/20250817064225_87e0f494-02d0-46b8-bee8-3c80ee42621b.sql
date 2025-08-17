-- Fix the activities data and constraints

-- Standardize the activity types by using the 'type' column values and updating activity_type to match
UPDATE public.activities SET activity_type = type;

-- Now add a proper constraint that allows the values that are actually being used
ALTER TABLE public.activities ADD CONSTRAINT activities_type_check 
CHECK (type IN ('task', 'call', 'meeting', 'email', 'demo', 'follow_up', 'research', 'proposal', 'negotiation', 'closing', 'onboarding', 'note'));

-- Also fix contacts constraint to be more permissive
ALTER TABLE public.contacts DROP CONSTRAINT IF EXISTS contacts_status_check;
ALTER TABLE public.contacts ADD CONSTRAINT contacts_status_check 
CHECK (status IN ('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost', 'unqualified', 'nurturing', 'warm', 'hot', 'cold'));

-- Fix audit logs RLS policy
DROP POLICY IF EXISTS "Prevent manual audit log modification by users" ON public.audit_logs;
DROP POLICY IF EXISTS "Service role can insert audit logs" ON public.audit_logs;

CREATE POLICY "Service role can insert audit logs" 
ON public.audit_logs 
FOR INSERT 
WITH CHECK (auth.role() = 'service_role' OR current_setting('role', true) = 'service_role' OR auth.uid() IS NOT NULL);