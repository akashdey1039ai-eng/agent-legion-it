-- Fix critical security vulnerability: secure_contacts_view lacks RLS policies
-- This view currently exposes sensitive customer data to all authenticated users

-- First, enable RLS on the secure_contacts_view
ALTER VIEW public.secure_contacts_view SET (security_invoker = true);

-- Create proper RLS policies for the secure_contacts_view to match the contacts table security
CREATE POLICY "Enhanced secure contact access - SELECT" 
ON public.secure_contacts_view 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role) OR 
  (has_role(auth.uid(), 'sales_rep'::app_role) AND (owner_id = auth.uid())) OR 
  (has_role(auth.uid(), 'viewer'::app_role) AND (owner_id = auth.uid()))
);

-- Ensure the view has the same security as the underlying contacts table
-- Block any unauthorized access attempts
CREATE POLICY "Block unauthorized secure contact access" 
ON public.secure_contacts_view 
FOR ALL 
USING (false) 
WITH CHECK (false);

-- Add audit logging for access to sensitive contact data
CREATE OR REPLACE FUNCTION public.log_contact_access()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.audit_logs (
    table_name,
    operation,
    new_data,
    user_id,
    ip_address
  ) VALUES (
    'secure_contacts_view',
    'SENSITIVE_DATA_ACCESS',
    jsonb_build_object(
      'contact_id', NEW.id,
      'accessed_fields', 'email,phone',
      'access_time', now()
    ),
    auth.uid(),
    inet_client_addr()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;