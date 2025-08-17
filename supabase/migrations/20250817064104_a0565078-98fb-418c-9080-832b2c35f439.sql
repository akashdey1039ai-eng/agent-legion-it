-- Fix existing data that violates constraints, then update constraints

-- Check what activity types currently exist that are causing constraint violations
SELECT DISTINCT type, COUNT(*) as count 
FROM public.activities 
WHERE type NOT IN ('task', 'call', 'meeting', 'email', 'demo', 'follow_up', 'research', 'proposal', 'negotiation', 'closing', 'onboarding')
GROUP BY type;

-- Update invalid activity types to valid ones
UPDATE public.activities 
SET type = 'task' 
WHERE type NOT IN ('task', 'call', 'meeting', 'email', 'demo', 'follow_up', 'research', 'proposal', 'negotiation', 'closing', 'onboarding');

-- Check what contact statuses currently exist that might cause violations
SELECT DISTINCT status, COUNT(*) as count 
FROM public.contacts 
WHERE status NOT IN ('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost', 'unqualified', 'nurturing', 'warm', 'hot', 'cold')
GROUP BY status;

-- Update invalid contact statuses to valid ones
UPDATE public.contacts 
SET status = 'new' 
WHERE status NOT IN ('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost', 'unqualified', 'nurturing', 'warm', 'hot', 'cold');