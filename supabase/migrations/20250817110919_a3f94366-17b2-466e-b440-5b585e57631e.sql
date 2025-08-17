-- Create tables for scalable AI agent testing

-- Main test runs table
CREATE TABLE IF NOT EXISTS public.ai_test_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
  total_platforms INTEGER NOT NULL DEFAULT 3,
  total_agent_types INTEGER NOT NULL DEFAULT 8,
  batch_size INTEGER NOT NULL DEFAULT 100,
  total_records INTEGER DEFAULT 0,
  results JSONB,
  completion_time INTEGER, -- milliseconds
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Progress tracking for individual agent tests
CREATE TABLE IF NOT EXISTS public.ai_test_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_run_id UUID NOT NULL REFERENCES public.ai_test_runs(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('salesforce', 'hubspot', 'native')),
  agent_type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('running', 'completed', 'failed')),
  records_processed INTEGER NOT NULL DEFAULT 0,
  confidence DECIMAL(3,2) DEFAULT 0,
  insights JSONB,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_test_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_test_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_test_runs
CREATE POLICY "Users can view their own test runs" 
ON public.ai_test_runs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own test runs" 
ON public.ai_test_runs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own test runs" 
ON public.ai_test_runs 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for ai_test_progress
CREATE POLICY "Users can view progress for their test runs" 
ON public.ai_test_progress 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.ai_test_runs 
    WHERE id = ai_test_progress.test_run_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Service can insert test progress" 
ON public.ai_test_progress 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Service can update test progress" 
ON public.ai_test_progress 
FOR UPDATE 
USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_test_runs_user_id ON public.ai_test_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_test_runs_status ON public.ai_test_runs(status);
CREATE INDEX IF NOT EXISTS idx_ai_test_progress_test_run_id ON public.ai_test_progress(test_run_id);
CREATE INDEX IF NOT EXISTS idx_ai_test_progress_platform_agent ON public.ai_test_progress(platform, agent_type);

-- Add trigger for updated_at
CREATE TRIGGER update_ai_test_runs_updated_at
BEFORE UPDATE ON public.ai_test_runs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_test_progress_updated_at
BEFORE UPDATE ON public.ai_test_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();