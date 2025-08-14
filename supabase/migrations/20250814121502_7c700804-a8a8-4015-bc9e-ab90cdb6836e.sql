-- Create HubSpot tokens table
CREATE TABLE public.hubspot_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  token_type TEXT DEFAULT 'Bearer',
  instance_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.hubspot_tokens ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own tokens" 
ON public.hubspot_tokens 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tokens" 
ON public.hubspot_tokens 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tokens" 
ON public.hubspot_tokens 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tokens" 
ON public.hubspot_tokens 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_hubspot_tokens_updated_at
BEFORE UPDATE ON public.hubspot_tokens
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create HubSpot sync log table
CREATE TABLE public.hubspot_sync_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  object_type TEXT NOT NULL,
  operation TEXT NOT NULL,
  sync_direction TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  local_id UUID,
  hubspot_id TEXT,
  data_payload JSONB,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS for sync log
ALTER TABLE public.hubspot_sync_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view sync log" 
ON public.hubspot_sync_log 
FOR SELECT 
USING (true);

CREATE POLICY "All authenticated users can modify sync log" 
ON public.hubspot_sync_log 
FOR ALL 
USING (true);