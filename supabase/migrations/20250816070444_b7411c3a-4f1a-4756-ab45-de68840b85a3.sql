-- COMPREHENSIVE SECURITY FIX: Implement Role-Based Access Controls and Enhanced Security

-- 1. Create role enum for the application
CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'sales_rep', 'viewer');

-- 2. Update existing user_roles table to use the new enum
-- First, drop the existing constraint if any
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;

-- Update the role column to use the new enum
ALTER TABLE public.user_roles ALTER COLUMN role TYPE public.app_role USING role::text::public.app_role;

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

-- 6. SECURE CONTACTS TABLE - Replace overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can view contacts" ON public.contacts;
DROP POLICY IF EXISTS "Authenticated users can insert contacts" ON public.contacts;
DROP POLICY IF EXISTS "Authenticated users can update contacts" ON public.contacts;
DROP POLICY IF EXISTS "Authenticated users can delete contacts" ON public.contacts;

CREATE POLICY "Role-based contact access - SELECT"
ON public.contacts
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'manager') OR 
  public.has_role(auth.uid(), 'sales_rep') OR
  (public.has_role(auth.uid(), 'viewer') AND owner_id = auth.uid())
);

CREATE POLICY "Role-based contact access - INSERT"
ON public.contacts
FOR INSERT
TO authenticated
WITH CHECK (
  (public.has_role(auth.uid(), 'admin') OR 
   public.has_role(auth.uid(), 'manager') OR 
   public.has_role(auth.uid(), 'sales_rep')) AND
  owner_id = auth.uid()
);

CREATE POLICY "Role-based contact access - UPDATE"
ON public.contacts
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'manager') OR 
  (public.has_role(auth.uid(), 'sales_rep') AND owner_id = auth.uid())
);

CREATE POLICY "Role-based contact access - DELETE"
ON public.contacts
FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'manager')
);

-- 7. SECURE COMPANIES TABLE
DROP POLICY IF EXISTS "Authenticated users can view companies" ON public.companies;
DROP POLICY IF EXISTS "Authenticated users can insert companies" ON public.companies;
DROP POLICY IF EXISTS "Authenticated users can update companies" ON public.companies;
DROP POLICY IF EXISTS "Authenticated users can delete companies" ON public.companies;

CREATE POLICY "Role-based company access - SELECT"
ON public.companies
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'manager') OR 
  public.has_role(auth.uid(), 'sales_rep') OR
  (public.has_role(auth.uid(), 'viewer') AND assigned_user_id = auth.uid())
);

CREATE POLICY "Role-based company access - INSERT"
ON public.companies
FOR INSERT
TO authenticated
WITH CHECK (
  (public.has_role(auth.uid(), 'admin') OR 
   public.has_role(auth.uid(), 'manager') OR 
   public.has_role(auth.uid(), 'sales_rep')) AND
  assigned_user_id = auth.uid()
);

CREATE POLICY "Role-based company access - UPDATE"
ON public.companies
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'manager') OR 
  (public.has_role(auth.uid(), 'sales_rep') AND assigned_user_id = auth.uid())
);

CREATE POLICY "Role-based company access - DELETE"
ON public.companies
FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'manager')
);

-- 8. SECURE OPPORTUNITIES TABLE
DROP POLICY IF EXISTS "Authenticated users can view opportunities" ON public.opportunities;
DROP POLICY IF EXISTS "Authenticated users can insert opportunities" ON public.opportunities;
DROP POLICY IF EXISTS "Authenticated users can update opportunities" ON public.opportunities;
DROP POLICY IF EXISTS "Authenticated users can delete opportunities" ON public.opportunities;

CREATE POLICY "Role-based opportunity access - SELECT"
ON public.opportunities
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'manager') OR 
  public.has_role(auth.uid(), 'sales_rep') OR
  (public.has_role(auth.uid(), 'viewer') AND owner_id = auth.uid())
);

CREATE POLICY "Role-based opportunity access - INSERT"
ON public.opportunities
FOR INSERT
TO authenticated
WITH CHECK (
  (public.has_role(auth.uid(), 'admin') OR 
   public.has_role(auth.uid(), 'manager') OR 
   public.has_role(auth.uid(), 'sales_rep')) AND
  owner_id = auth.uid()
);

CREATE POLICY "Role-based opportunity access - UPDATE"
ON public.opportunities
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'manager') OR 
  (public.has_role(auth.uid(), 'sales_rep') AND owner_id = auth.uid())
);

CREATE POLICY "Role-based opportunity access - DELETE"
ON public.opportunities
FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'manager')
);

-- 9. SECURE ACTIVITIES TABLE
DROP POLICY IF EXISTS "Authenticated users can view activities" ON public.activities;
DROP POLICY IF EXISTS "Authenticated users can insert activities" ON public.activities;
DROP POLICY IF EXISTS "Authenticated users can update activities" ON public.activities;
DROP POLICY IF EXISTS "Authenticated users can delete activities" ON public.activities;

CREATE POLICY "Role-based activity access - SELECT"
ON public.activities
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'manager') OR 
  public.has_role(auth.uid(), 'sales_rep') OR
  (public.has_role(auth.uid(), 'viewer') AND owner_id = auth.uid())
);

CREATE POLICY "Role-based activity access - INSERT"
ON public.activities
FOR INSERT
TO authenticated
WITH CHECK (
  (public.has_role(auth.uid(), 'admin') OR 
   public.has_role(auth.uid(), 'manager') OR 
   public.has_role(auth.uid(), 'sales_rep')) AND
  owner_id = auth.uid()
);

CREATE POLICY "Role-based activity access - UPDATE"
ON public.activities
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'manager') OR 
  (public.has_role(auth.uid(), 'sales_rep') AND owner_id = auth.uid())
);

CREATE POLICY "Role-based activity access - DELETE"
ON public.activities
FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'manager')
);