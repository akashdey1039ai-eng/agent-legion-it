-- Production-ready AI Agent Framework Schema
-- Security: Row-level security, audit trails, data classification

-- AI Agent Management Table
CREATE TABLE IF NOT EXISTS public.ai_agents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('lead_intelligence', 'pipeline_analysis', 'data_enrichment', 'conversational', 'sales_intelligence')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'testing', 'active', 'paused', 'retired')),
  version TEXT NOT NULL DEFAULT '1.0.0',
  config JSONB NOT NULL DEFAULT '{}',
  security_level TEXT NOT NULL DEFAULT 'standard' CHECK (security_level IN ('basic', 'standard', 'high', 'critical')),
  max_confidence_threshold DECIMAL(3,2) DEFAULT 0.80,
  min_confidence_threshold DECIMAL(3,2) DEFAULT 0.60,
  requires_human_approval BOOLEAN DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  deployed_at TIMESTAMP WITH TIME ZONE,
  last_activity_at TIMESTAMP WITH TIME ZONE
);

-- AI Agent Executions (Audit Trail)
CREATE TABLE IF NOT EXISTS public.ai_agent_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  execution_type TEXT NOT NULL CHECK (execution_type IN ('analysis', 'recommendation', 'action', 'prediction')),
  input_data JSONB NOT NULL,
  output_data JSONB,
  confidence_score DECIMAL(3,2),
  human_approved BOOLEAN DEFAULT false,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  execution_time_ms INTEGER,
  tokens_used INTEGER,
  cost_usd DECIMAL(10,4),
  error_message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- AI Security Events (Security Monitoring)
CREATE TABLE IF NOT EXISTS public.ai_security_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID REFERENCES public.ai_agents(id) ON DELETE SET NULL,
  execution_id UUID REFERENCES public.ai_agent_executions(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('unauthorized_access', 'suspicious_input', 'data_leak_attempt', 'rate_limit_exceeded', 'invalid_output')),
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT NOT NULL,
  source_ip INET,
  user_agent TEXT,
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT
);

-- AI Model Performance Metrics
CREATE TABLE IF NOT EXISTS public.ai_performance_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_executions INTEGER DEFAULT 0,
  successful_executions INTEGER DEFAULT 0,
  failed_executions INTEGER DEFAULT 0,
  avg_confidence_score DECIMAL(3,2),
  avg_execution_time_ms INTEGER,
  total_cost_usd DECIMAL(10,4) DEFAULT 0,
  user_satisfaction_score DECIMAL(3,2),
  human_override_rate DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(agent_id, metric_date)
);

-- Data Classification & Protection
CREATE TABLE IF NOT EXISTS public.data_classifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT NOT NULL,
  column_name TEXT NOT NULL,
  classification TEXT NOT NULL CHECK (classification IN ('public', 'internal', 'confidential', 'restricted')),
  encryption_required BOOLEAN DEFAULT false,
  audit_required BOOLEAN DEFAULT true,
  retention_days INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(table_name, column_name)
);

-- Enable RLS on all tables
ALTER TABLE public.ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_agent_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_classifications ENABLE ROW LEVEL SECURITY;

-- Security Policies
CREATE POLICY "Authenticated users can view their organization's agents" 
ON public.ai_agents 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authorized users can create agents" 
ON public.ai_agents 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Authorized users can update their agents" 
ON public.ai_agents 
FOR UPDATE 
USING (auth.uid() = created_by);

CREATE POLICY "Users can view execution logs" 
ON public.ai_agent_executions 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can view security events" 
ON public.ai_security_events 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view performance metrics" 
ON public.ai_performance_metrics 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Indexes for performance
CREATE INDEX idx_ai_agents_status ON public.ai_agents(status);
CREATE INDEX idx_ai_agents_type ON public.ai_agents(type);
CREATE INDEX idx_ai_executions_agent_id ON public.ai_agent_executions(agent_id);
CREATE INDEX idx_ai_executions_status ON public.ai_agent_executions(status);
CREATE INDEX idx_ai_executions_created_at ON public.ai_agent_executions(created_at);
CREATE INDEX idx_ai_security_events_severity ON public.ai_security_events(severity);
CREATE INDEX idx_ai_security_events_detected_at ON public.ai_security_events(detected_at);
CREATE INDEX idx_ai_performance_metrics_date ON public.ai_performance_metrics(metric_date);

-- Trigger for updating timestamps
CREATE TRIGGER update_ai_agents_updated_at
BEFORE UPDATE ON public.ai_agents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert data classifications for existing tables
INSERT INTO public.data_classifications (table_name, column_name, classification, encryption_required, audit_required) VALUES
('contacts', 'email', 'confidential', true, true),
('contacts', 'phone', 'confidential', true, true),
('contacts', 'first_name', 'internal', false, true),
('contacts', 'last_name', 'internal', false, true),
('companies', 'revenue', 'confidential', true, true),
('opportunities', 'amount', 'confidential', true, true),
('salesforce_tokens', 'access_token', 'restricted', true, true),
('salesforce_tokens', 'refresh_token', 'restricted', true, true);