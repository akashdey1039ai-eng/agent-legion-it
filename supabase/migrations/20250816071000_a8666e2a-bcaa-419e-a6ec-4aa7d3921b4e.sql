-- Create admin user and set up proper default role assignment

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

-- 3. Create a sample admin user role (this will need to be manually assigned to an actual user)
-- Note: This is a placeholder - users will need to manually assign admin role to their account

-- 4. Add a notification comment for manual admin setup
COMMENT ON FUNCTION public.handle_new_user_role() IS 
'Auto-assigns sales_rep role to new users. Admins must manually promote users to admin/manager roles via user_roles table.';

-- 5. Add helpful view for role management
CREATE OR REPLACE VIEW public.user_role_summary AS
SELECT 
  ur.user_id,
  ur.role,
  p.email,
  p.display_name,
  ur.created_at as role_assigned_at
FROM public.user_roles ur
LEFT JOIN public.profiles p ON ur.user_id = p.user_id
ORDER BY ur.created_at DESC;

-- Grant access to this view for admins only
GRANT SELECT ON public.user_role_summary TO authenticated;

CREATE POLICY "Admin can view user role summary"
ON public.user_role_summary
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));