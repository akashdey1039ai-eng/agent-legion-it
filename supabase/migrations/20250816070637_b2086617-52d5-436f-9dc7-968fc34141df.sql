-- COMPREHENSIVE SECURITY FIX: Implement Role-Based Access Controls and Enhanced Security
-- Fix for existing user_roles table with proper enum handling

-- 1. Create role enum for the application
CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'sales_rep', 'viewer');

-- 2. Handle existing user_roles table properly
-- First, check if we need to update the column
DO $$ 
BEGIN 
    -- Check if role column exists and update it properly
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'user_roles' AND column_name = 'role') THEN
        
        -- Remove default value first
        ALTER TABLE public.user_roles ALTER COLUMN role DROP DEFAULT;
        
        -- Convert existing data and change type
        ALTER TABLE public.user_roles 
        ALTER COLUMN role TYPE public.app_role 
        USING CASE 
            WHEN role::text = 'sales_rep' THEN 'sales_rep'::public.app_role
            WHEN role::text = 'admin' THEN 'admin'::public.app_role
            WHEN role::text = 'manager' THEN 'manager'::public.app_role
            ELSE 'sales_rep'::public.app_role
        END;
        
        -- Set new default
        ALTER TABLE public.user_roles ALTER COLUMN role SET DEFAULT 'sales_rep'::public.app_role;
    END IF;
END $$;

-- 3. Create security definer function to check user roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 4. Create function to get user role (for easier policy writing)
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY 
    CASE 
      WHEN role = 'admin' THEN 1
      WHEN role = 'manager' THEN 2
      WHEN role = 'sales_rep' THEN 3
      WHEN role = 'viewer' THEN 4
    END
  LIMIT 1
$$;

-- 5. Update RLS policies for user_roles table
DROP POLICY IF EXISTS "Users can view their organization data" ON public.user_roles;

CREATE POLICY "Users can view own role"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));