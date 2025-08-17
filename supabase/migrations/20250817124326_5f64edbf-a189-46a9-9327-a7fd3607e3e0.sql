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

-- Create audit trigger for sensitive data access
CREATE TRIGGER secure_contacts_view_audit_trigger
AFTER SELECT ON public.secure_contacts_view
FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_data_access();

-- Add additional security logging for contact data access
INSERT INTO public.audit_logs (
  table_name,
  operation,
  new_data,
  user_id
) VALUES (
  'security_fix',
  'RLS_POLICY_ADDED',
  jsonb_build_object(
    'table', 'secure_contacts_view',
    'fix_applied', 'RLS policies enabled',
    'timestamp', now()
  ),
  auth.uid()
);