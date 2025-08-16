-- Fix function search path security warnings

-- Fix search path for all security definer functions
CREATE OR REPLACE FUNCTION public.encrypt_sensitive_data(data TEXT)
RETURNS TEXT 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  -- This is a placeholder for proper encryption implementation
  -- In production, use pgcrypto extension with proper key management
  RETURN encode(digest(data, 'sha256'), 'hex');
END;
$$;

CREATE OR REPLACE FUNCTION public.mask_sensitive_data(
  data TEXT, 
  mask_type TEXT DEFAULT 'email'
)
RETURNS TEXT 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  CASE mask_type
    WHEN 'email' THEN
      RETURN CASE 
        WHEN data IS NULL THEN NULL
        WHEN position('@' in data) > 0 THEN 
          substring(data from 1 for 2) || '***@' || split_part(data, '@', 2)
        ELSE '***'
      END;
    WHEN 'phone' THEN
      RETURN CASE 
        WHEN data IS NULL THEN NULL
        WHEN length(data) > 4 THEN 
          '***-***-' || right(data, 4)
        ELSE '***'
      END;
    WHEN 'partial' THEN
      RETURN CASE 
        WHEN data IS NULL THEN NULL
        WHEN length(data) > 4 THEN 
          left(data, 2) || '***' || right(data, 2)
        ELSE '***'
      END;
    ELSE 
      RETURN '***';
  END CASE;
END;
$$;

CREATE OR REPLACE FUNCTION public.audit_sensitive_access()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  -- Log access to sensitive tables
  INSERT INTO public.audit_logs (
    table_name,
    operation,
    old_data,
    new_data,
    user_id,
    ip_address
  ) VALUES (
    TG_TABLE_NAME,
    TG_OP,
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
    auth.uid(),
    inet_client_addr()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION public.get_filtered_contacts(user_role app_role DEFAULT null)
RETURNS TABLE(
  id uuid,
  first_name text,
  last_name text,
  email text,
  phone text,
  title text,
  company_id uuid,
  owner_id uuid,
  created_at timestamptz
) 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  -- Get current user role if not provided
  IF user_role IS NULL THEN
    SELECT public.get_user_role(auth.uid()) INTO user_role;
  END IF;
  
  RETURN QUERY
  SELECT 
    c.id,
    c.first_name,
    c.last_name,
    CASE 
      WHEN user_role IN ('admin', 'manager') THEN c.email
      WHEN user_role = 'sales_rep' AND c.owner_id = auth.uid() THEN c.email
      ELSE public.mask_sensitive_data(c.email, 'email')
    END as email,
    CASE 
      WHEN user_role IN ('admin', 'manager') THEN c.phone
      WHEN user_role = 'sales_rep' AND c.owner_id = auth.uid() THEN c.phone
      ELSE public.mask_sensitive_data(c.phone, 'phone')
    END as phone,
    c.title,
    c.company_id,
    c.owner_id,
    c.created_at
  FROM public.contacts c
  WHERE 
    user_role = 'admin' OR
    user_role = 'manager' OR
    (user_role = 'sales_rep' AND c.owner_id = auth.uid()) OR
    (user_role = 'viewer' AND c.owner_id = auth.uid());
END;
$$;