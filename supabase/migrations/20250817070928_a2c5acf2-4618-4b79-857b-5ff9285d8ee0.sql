-- First create a profile for the user if it doesn't exist
INSERT INTO public.profiles (user_id, display_name, email, role) 
VALUES ('118f896c-99bc-44a1-a1a0-82c7e9ed02bd', 'Admin User', 'admin@example.com', 'admin')
ON CONFLICT (user_id) DO NOTHING;

-- Now update existing Salesforce contacts to have the proper owner_id
UPDATE public.contacts 
SET owner_id = '118f896c-99bc-44a1-a1a0-82c7e9ed02bd' 
WHERE salesforce_id IS NOT NULL AND owner_id IS NULL;

-- Update existing Salesforce companies to have the proper assigned_user_id
UPDATE public.companies 
SET assigned_user_id = '118f896c-99bc-44a1-a1a0-82c7e9ed02bd' 
WHERE salesforce_id IS NOT NULL AND assigned_user_id IS NULL;

-- Update existing Salesforce deals to have the proper assigned_user_id
UPDATE public.deals 
SET assigned_user_id = '118f896c-99bc-44a1-a1a0-82c7e9ed02bd' 
WHERE salesforce_id IS NOT NULL AND assigned_user_id IS NULL;