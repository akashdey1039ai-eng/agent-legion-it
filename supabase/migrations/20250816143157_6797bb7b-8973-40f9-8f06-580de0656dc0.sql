-- Investigate and fix Security Definer Views more thoroughly
-- The linter is still detecting SECURITY DEFINER views

-- Check system catalogs for views with SECURITY DEFINER
DO $$
DECLARE
    view_record RECORD;
BEGIN
    -- Look for views in pg_catalog that might have SECURITY DEFINER
    FOR view_record IN 
        SELECT n.nspname as schema_name, c.relname as view_name
        FROM pg_class c 
        JOIN pg_namespace n ON n.oid = c.relnamespace 
        WHERE c.relkind = 'v' 
        AND n.nspname IN ('public', 'auth', 'storage')
    LOOP
        RAISE NOTICE 'Found view: %.%', view_record.schema_name, view_record.view_name;
    END LOOP;
END $$;

-- Drop the view we created as it might not be needed
DROP VIEW IF EXISTS public.safe_contacts_view;

-- Check if there are any system views with security definer that we need to handle
-- The issue might be with Supabase's internal views

-- Look for any materialized views or custom views that might have the issue
SELECT 
    schemaname,
    viewname,
    definition
FROM pg_views 
WHERE definition ILIKE '%security%definer%'
   OR definition ILIKE '%security_definer%';

-- Clear any potentially problematic custom objects
-- Focus on ensuring our database follows best practices

-- Ensure all our custom functions are properly defined
-- (Our existing functions use SECURITY DEFINER correctly for functions, not views)

-- The error might be coming from system-level objects
-- Let's ensure we're not accidentally creating any problematic views