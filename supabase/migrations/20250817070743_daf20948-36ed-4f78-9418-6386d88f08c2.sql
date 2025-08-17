-- First, let's check the current user_roles table structure and fix it
-- Add a unique constraint on user_id since each user should only have one role
ALTER TABLE public.user_roles 
ADD CONSTRAINT unique_user_role UNIQUE (user_id);

-- Now assign admin role to the current user
INSERT INTO public.user_roles (user_id, role) 
VALUES ('118f896c-99bc-44a1-a1a0-82c7e9ed02bd', 'admin')
ON CONFLICT (user_id) DO UPDATE SET 
  role = 'admin', 
  updated_at = now();