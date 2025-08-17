-- Create the missing profile first
INSERT INTO public.profiles (user_id, display_name, email, role) 
VALUES ('118f896c-99bc-44a1-a1a0-82c7e9ed02bd', 'Admin User', 'admin@example.com', 'admin');

-- Temporarily drop the foreign key constraint to fix existing data
ALTER TABLE public.contacts DROP CONSTRAINT IF EXISTS contacts_owner_id_fkey;
ALTER TABLE public.companies DROP CONSTRAINT IF EXISTS companies_assigned_user_id_fkey;
ALTER TABLE public.deals DROP CONSTRAINT IF EXISTS deals_assigned_user_id_fkey;

-- Update existing records to have proper ownership
UPDATE public.contacts 
SET owner_id = '118f896c-99bc-44a1-a1a0-82c7e9ed02bd' 
WHERE salesforce_id IS NOT NULL AND owner_id IS NULL;

UPDATE public.companies 
SET assigned_user_id = '118f896c-99bc-44a1-a1a0-82c7e9ed02bd' 
WHERE salesforce_id IS NOT NULL AND assigned_user_id IS NULL;

UPDATE public.deals 
SET assigned_user_id = '118f896c-99bc-44a1-a1a0-82c7e9ed02bd' 
WHERE salesforce_id IS NOT NULL AND assigned_user_id IS NULL;

-- Re-add the foreign key constraints
ALTER TABLE public.contacts 
ADD CONSTRAINT contacts_owner_id_fkey 
FOREIGN KEY (owner_id) REFERENCES public.profiles(user_id) ON DELETE SET NULL;

ALTER TABLE public.companies 
ADD CONSTRAINT companies_assigned_user_id_fkey 
FOREIGN KEY (assigned_user_id) REFERENCES public.profiles(user_id) ON DELETE SET NULL;

ALTER TABLE public.deals 
ADD CONSTRAINT deals_assigned_user_id_fkey 
FOREIGN KEY (assigned_user_id) REFERENCES public.profiles(user_id) ON DELETE SET NULL;