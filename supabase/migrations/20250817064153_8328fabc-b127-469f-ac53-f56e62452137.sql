-- First, let's understand the current activities table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'activities' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Remove the redundant type constraint first 
ALTER TABLE public.activities DROP CONSTRAINT IF EXISTS activities_type_check;

-- Check what actual values exist in both type and activity_type columns
SELECT DISTINCT type, activity_type, COUNT(*) as count
FROM public.activities
GROUP BY type, activity_type
ORDER BY count DESC;