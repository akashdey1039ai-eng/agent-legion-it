-- Create function to get record counts for CRM platforms
CREATE OR REPLACE FUNCTION public.get_record_counts()
RETURNS TABLE(
  salesforce_contacts bigint,
  hubspot_contacts bigint,
  total_contacts bigint
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    COUNT(*) FILTER (WHERE salesforce_id IS NOT NULL) as salesforce_contacts,
    COUNT(*) FILTER (WHERE hubspot_id IS NOT NULL) as hubspot_contacts,
    COUNT(*) as total_contacts
  FROM public.contacts;
$$;