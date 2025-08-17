-- Optimize database for 150,000 record processing

-- Add indexes for better performance on large datasets
CREATE INDEX IF NOT EXISTS idx_contacts_owner_created 
ON public.contacts(owner_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contacts_salesforce_sync 
ON public.contacts(salesforce_id, last_sync_at) 
WHERE salesforce_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_contacts_hubspot_sync 
ON public.contacts(hubspot_id, last_sync_at) 
WHERE hubspot_id IS NOT NULL;

-- Add composite indexes for AI test tracking
CREATE INDEX IF NOT EXISTS idx_ai_test_progress_compound 
ON public.ai_test_progress(test_run_id, platform, agent_type, status);

CREATE INDEX IF NOT EXISTS idx_ai_test_runs_user_status 
ON public.ai_test_runs(user_id, status, started_at DESC);

-- Add partitioning preparation for large result sets
ALTER TABLE public.ai_test_progress 
ADD COLUMN IF NOT EXISTS batch_number INTEGER DEFAULT 0;

-- Create function to efficiently count records by platform
CREATE OR REPLACE FUNCTION public.get_platform_record_count(p_platform text, p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  record_count integer;
BEGIN
  CASE p_platform
    WHEN 'salesforce' THEN
      SELECT COUNT(*)::integer INTO record_count
      FROM public.contacts 
      WHERE salesforce_id IS NOT NULL 
        AND (owner_id = p_user_id OR has_role(p_user_id, 'admin') OR has_role(p_user_id, 'manager'));
        
    WHEN 'hubspot' THEN
      SELECT COUNT(*)::integer INTO record_count
      FROM public.contacts 
      WHERE hubspot_id IS NOT NULL 
        AND (owner_id = p_user_id OR has_role(p_user_id, 'admin') OR has_role(p_user_id, 'manager'));
        
    WHEN 'native' THEN
      SELECT COUNT(*)::integer INTO record_count
      FROM public.contacts 
      WHERE (owner_id = p_user_id OR has_role(p_user_id, 'admin') OR has_role(p_user_id, 'manager'));
        
    ELSE
      record_count := 0;
  END CASE;
  
  -- Cap at 50,000 per platform for performance
  RETURN LEAST(record_count, 50000);
END;
$$;

-- Add table for managing large test batches and resumption
CREATE TABLE IF NOT EXISTS public.ai_test_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_run_id UUID NOT NULL REFERENCES public.ai_test_runs(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  agent_type TEXT NOT NULL,
  batch_number INTEGER NOT NULL,
  offset_start INTEGER NOT NULL,
  offset_end INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  records_processed INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on batch tracking table
ALTER TABLE public.ai_test_batches ENABLE ROW LEVEL SECURITY;

-- RLS policies for batch tracking
CREATE POLICY "Users can view batches for their test runs" 
ON public.ai_test_batches 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.ai_test_runs 
    WHERE id = ai_test_batches.test_run_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Service can manage test batches" 
ON public.ai_test_batches 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Add indexes for batch management
CREATE INDEX IF NOT EXISTS idx_ai_test_batches_test_run 
ON public.ai_test_batches(test_run_id, status);

CREATE INDEX IF NOT EXISTS idx_ai_test_batches_platform_agent 
ON public.ai_test_batches(platform, agent_type, status);

-- Add trigger for batch table updates
CREATE TRIGGER update_ai_test_batches_updated_at
BEFORE UPDATE ON public.ai_test_batches
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();