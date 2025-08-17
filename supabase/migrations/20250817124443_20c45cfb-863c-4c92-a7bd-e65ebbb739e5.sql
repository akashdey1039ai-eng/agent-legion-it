-- Drop the insecure view
DROP VIEW IF EXISTS public.secure_contacts_view;

-- Create a secure view that incorporates the same RLS logic as the contacts table
CREATE VIEW public.secure_contacts_view 
WITH (security_invoker = true) AS
SELECT 
    c.id,
    c.first_name,
    c.last_name,
    -- Mask sensitive data based on user role and ownership
    CASE 
        WHEN has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role) THEN c.email
        WHEN has_role(auth.uid(), 'sales_rep'::app_role) AND c.owner_id = auth.uid() THEN c.email
        ELSE mask_sensitive_data(c.email, 'email')
    END as email,
    CASE 
        WHEN has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role) THEN c.phone
        WHEN has_role(auth.uid(), 'sales_rep'::app_role) AND c.owner_id = auth.uid() THEN c.phone
        ELSE mask_sensitive_data(c.phone, 'phone')
    END as phone,
    c.title,
    c.company_id,
    c.owner_id,
    c.created_at,
    c.updated_at
FROM public.contacts c
WHERE 
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'manager'::app_role) OR 
    (has_role(auth.uid(), 'sales_rep'::app_role) AND c.owner_id = auth.uid()) OR 
    (has_role(auth.uid(), 'viewer'::app_role) AND c.owner_id = auth.uid());

-- Log the security fix
INSERT INTO public.audit_logs (
    table_name,
    operation,
    new_data
) VALUES (
    'security_fix',
    'SECURE_VIEW_RECREATED',
    jsonb_build_object(
        'view', 'secure_contacts_view',
        'fix_applied', 'Recreated view with proper security filtering and data masking',
        'timestamp', now(),
        'security_level', 'critical'
    )
);