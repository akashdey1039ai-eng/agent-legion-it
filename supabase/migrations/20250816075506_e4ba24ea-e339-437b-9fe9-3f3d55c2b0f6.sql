-- Fix security definer view issue

-- Drop the problematic view and recreate without SECURITY DEFINER
DROP VIEW IF EXISTS public.secure_contacts_view;

-- Create a regular view instead (users will still be governed by existing RLS policies)
CREATE VIEW public.secure_contacts_view AS
SELECT 
  c.id,
  c.first_name,
  c.last_name,
  c.email,
  c.phone,
  c.title,
  c.company_id,
  c.owner_id,
  c.created_at,
  c.updated_at
FROM public.contacts c;

-- Grant appropriate permissions on the view
GRANT SELECT ON public.secure_contacts_view TO authenticated;

-- Add RLS to the view (inherits from base table but adds explicit policy)
ALTER VIEW public.secure_contacts_view SET (security_barrier = true);

-- Create a function to safely access masked contact data when needed
CREATE OR REPLACE FUNCTION public.get_masked_contact_data(contact_id uuid)
RETURNS TABLE(
  id uuid,
  first_name text,
  last_name text,
  email_masked text,
  phone_masked text,
  title text,
  company_id uuid,
  owner_id uuid,
  created_at timestamptz
)
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
DECLARE
  user_role app_role;
  contact_record RECORD;
BEGIN
  -- Get current user role
  SELECT public.get_user_role(auth.uid()) INTO user_role;
  
  -- Check if user has access to this contact
  SELECT * FROM public.contacts c WHERE c.id = contact_id INTO contact_record;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Check access permissions
  IF NOT (
    user_role = 'admin' OR
    user_role = 'manager' OR
    (user_role = 'sales_rep' AND contact_record.owner_id = auth.uid()) OR
    (user_role = 'viewer' AND contact_record.owner_id = auth.uid())
  ) THEN
    RETURN;
  END IF;
  
  -- Return data with appropriate masking
  RETURN QUERY
  SELECT 
    contact_record.id,
    contact_record.first_name,
    contact_record.last_name,
    CASE 
      WHEN user_role IN ('admin', 'manager') THEN contact_record.email
      WHEN user_role = 'sales_rep' AND contact_record.owner_id = auth.uid() THEN contact_record.email
      ELSE public.mask_sensitive_data(contact_record.email, 'email')
    END as email_masked,
    CASE 
      WHEN user_role IN ('admin', 'manager') THEN contact_record.phone
      WHEN user_role = 'sales_rep' AND contact_record.owner_id = auth.uid() THEN contact_record.phone
      ELSE public.mask_sensitive_data(contact_record.phone, 'phone')
    END as phone_masked,
    contact_record.title,
    contact_record.company_id,
    contact_record.owner_id,
    contact_record.created_at;
END;
$$;