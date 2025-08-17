-- Remove the foreign key constraint temporarily
ALTER TABLE public.contacts DROP CONSTRAINT IF EXISTS contacts_owner_id_fkey;

-- Set owner_id for existing Salesforce contacts
UPDATE public.contacts 
SET owner_id = '118f896c-99bc-44a1-a1a0-82c7e9ed02bd' 
WHERE salesforce_id IS NOT NULL AND owner_id IS NULL;

-- Set assigned_user_id for existing Salesforce companies  
UPDATE public.companies 
SET assigned_user_id = '118f896c-99bc-44a1-a1a0-82c7e9ed02bd' 
WHERE salesforce_id IS NOT NULL AND assigned_user_id IS NULL;

-- Set assigned_user_id for existing Salesforce deals
UPDATE public.deals 
SET assigned_user_id = '118f896c-99bc-44a1-a1a0-82c7e9ed02bd' 
WHERE salesforce_id IS NOT NULL AND assigned_user_id IS NULL;