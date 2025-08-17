-- Enable RLS on secure_contacts_view
ALTER TABLE public.secure_contacts_view ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for secure_contacts_view that mirror the contacts table policies
CREATE POLICY "Enhanced secure contact access - SELECT" 
ON public.secure_contacts_view 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role) OR 
  (has_role(auth.uid(), 'sales_rep'::app_role) AND (owner_id = auth.uid())) OR 
  (has_role(auth.uid(), 'viewer'::app_role) AND (owner_id = auth.uid()))
);

-- Add security logging for the fix
INSERT INTO public.audit_logs (
  table_name,
  operation,
  new_data
) VALUES (
  'security_fix',
  'RLS_POLICY_ADDED',
  jsonb_build_object(
    'table', 'secure_contacts_view',
    'fix_applied', 'RLS policies enabled to protect sensitive contact data',
    'timestamp', now(),
    'security_level', 'critical'
  )
);