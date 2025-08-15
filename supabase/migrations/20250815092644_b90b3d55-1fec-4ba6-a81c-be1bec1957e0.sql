-- Enable real-time functionality for CRM tables
-- This allows the frontend to receive live updates when data changes

-- Enable row level security and set replica identity for real-time
ALTER TABLE public.opportunities REPLICA IDENTITY FULL;
ALTER TABLE public.contacts REPLICA IDENTITY FULL;
ALTER TABLE public.companies REPLICA IDENTITY FULL;
ALTER TABLE public.activities REPLICA IDENTITY FULL;

-- Add tables to the supabase_realtime publication for live updates
-- This enables real-time subscriptions on these tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.opportunities;
ALTER PUBLICATION supabase_realtime ADD TABLE public.contacts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.companies;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activities;