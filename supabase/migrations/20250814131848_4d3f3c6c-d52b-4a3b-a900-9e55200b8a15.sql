-- Add unique constraint on salesforce_id for contacts table (for HubSpot sync)
ALTER TABLE public.contacts 
ADD CONSTRAINT contacts_salesforce_id_unique UNIQUE (salesforce_id);

-- Add unique constraint on salesforce_id for companies table
ALTER TABLE public.companies 
ADD CONSTRAINT companies_salesforce_id_unique UNIQUE (salesforce_id);

-- Add unique constraint on salesforce_id for opportunities table
ALTER TABLE public.opportunities 
ADD CONSTRAINT opportunities_salesforce_id_unique UNIQUE (salesforce_id);