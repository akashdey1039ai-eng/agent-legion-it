-- Create admin user and set up proper default role assignment (fixed)

-- 1. Create a function to assign default user role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Assign default role of 'sales_rep' to new users
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'sales_rep'::app_role);
  
  RETURN NEW;
END;
$$;

-- 2. Create trigger to automatically assign roles to new users
DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- 3. Add a notification comment for manual admin setup
COMMENT ON FUNCTION public.handle_new_user_role() IS 
'Auto-assigns sales_rep role to new users. Admins must manually promote users to admin/manager roles via user_roles table.';

-- 4. Create a function for admins to manage user roles
CREATE OR REPLACE FUNCTION public.assign_user_role(target_user_id uuid, new_role app_role)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins can assign roles
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RETURN false;
  END IF;
  
  -- Update or insert the user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, new_role)
  ON CONFLICT (user_id) 
  DO UPDATE SET role = new_role, updated_at = now();
  
  RETURN true;
END;
$$;