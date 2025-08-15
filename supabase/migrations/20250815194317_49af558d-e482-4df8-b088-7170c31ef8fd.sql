-- Add hubspot_id column to contacts table for HubSpot integration
ALTER TABLE public.contacts 
ADD COLUMN hubspot_id text;