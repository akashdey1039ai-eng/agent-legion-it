-- Assign admin role to the current user so they can see all data
INSERT INTO public.user_roles (user_id, role) 
VALUES ('118f896c-99bc-44a1-a1a0-82c7e9ed02bd', 'admin')
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

-- Create a trigger to automatically assign sales_rep role to new users
CREATE OR REPLACE FUNCTION public.auto_assign_user_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Only assign role if user doesn't already have one
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = NEW.id) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'sales_rep');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users (this will work for new signups)
DROP TRIGGER IF EXISTS auto_assign_role_trigger ON auth.users;
CREATE TRIGGER auto_assign_role_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_assign_user_role();