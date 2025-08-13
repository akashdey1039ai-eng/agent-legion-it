-- Add Salesforce sync tracking fields to existing tables
ALTER TABLE public.contacts ADD COLUMN salesforce_id TEXT UNIQUE;
ALTER TABLE public.contacts ADD COLUMN salesforce_type TEXT CHECK (salesforce_type IN ('lead', 'contact')) DEFAULT 'lead';
ALTER TABLE public.contacts ADD COLUMN last_sync_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.companies ADD COLUMN salesforce_id TEXT UNIQUE;
ALTER TABLE public.companies ADD COLUMN last_sync_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.opportunities ADD COLUMN salesforce_id TEXT UNIQUE;
ALTER TABLE public.opportunities ADD COLUMN last_sync_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.activities ADD COLUMN salesforce_id TEXT UNIQUE;
ALTER TABLE public.activities ADD COLUMN last_sync_at TIMESTAMP WITH TIME ZONE;

-- Create Cases table for customer support
CREATE TABLE public.cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salesforce_id TEXT UNIQUE,
  case_number TEXT UNIQUE,
  subject TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  priority TEXT NOT NULL DEFAULT 'medium',
  type TEXT,
  reason TEXT,
  origin TEXT,
  contact_id UUID REFERENCES public.contacts(id),
  company_id UUID REFERENCES public.companies(id),
  owner_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  closed_at TIMESTAMP WITH TIME ZONE,
  last_sync_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS for cases
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;

-- Create policies for cases
CREATE POLICY "All authenticated users can view cases" 
ON public.cases 
FOR SELECT 
USING (true);

CREATE POLICY "All authenticated users can modify cases" 
ON public.cases 
FOR ALL 
USING (true);

-- Create Knowledge Articles table
CREATE TABLE public.knowledge_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salesforce_id TEXT UNIQUE,
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT,
  article_number TEXT UNIQUE,
  article_type TEXT,
  data_category_group TEXT,
  data_category TEXT,
  language TEXT DEFAULT 'en_US',
  validation_status TEXT DEFAULT 'draft',
  publish_status TEXT DEFAULT 'draft',
  is_visible_in_app BOOLEAN DEFAULT false,
  is_visible_in_csp BOOLEAN DEFAULT false,
  is_visible_in_pkb BOOLEAN DEFAULT false,
  url_name TEXT,
  created_by_id UUID,
  last_modified_by_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  published_at TIMESTAMP WITH TIME ZONE,
  last_sync_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS for knowledge articles
ALTER TABLE public.knowledge_articles ENABLE ROW LEVEL SECURITY;

-- Create policies for knowledge articles
CREATE POLICY "All authenticated users can view knowledge articles" 
ON public.knowledge_articles 
FOR SELECT 
USING (true);

CREATE POLICY "All authenticated users can modify knowledge articles" 
ON public.knowledge_articles 
FOR ALL 
USING (true);

-- Create Campaigns table for marketing
CREATE TABLE public.campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salesforce_id TEXT UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT,
  status TEXT DEFAULT 'planned',
  start_date DATE,
  end_date DATE,
  expected_revenue NUMERIC,
  budgeted_cost NUMERIC,
  actual_cost NUMERIC,
  expected_response NUMERIC,
  number_sent NUMERIC,
  owner_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_sync_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS for campaigns
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- Create policies for campaigns
CREATE POLICY "All authenticated users can view campaigns" 
ON public.campaigns 
FOR SELECT 
USING (true);

CREATE POLICY "All authenticated users can modify campaigns" 
ON public.campaigns 
FOR ALL 
USING (true);

-- Create Campaign Members junction table
CREATE TABLE public.campaign_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salesforce_id TEXT UNIQUE,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'sent',
  has_responded BOOLEAN DEFAULT false,
  first_responded_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_sync_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(campaign_id, contact_id)
);

-- Enable RLS for campaign members
ALTER TABLE public.campaign_members ENABLE ROW LEVEL SECURITY;

-- Create policies for campaign members
CREATE POLICY "All authenticated users can view campaign members" 
ON public.campaign_members 
FOR SELECT 
USING (true);

CREATE POLICY "All authenticated users can modify campaign members" 
ON public.campaign_members 
FOR ALL 
USING (true);

-- Create Salesforce Sync Log table for tracking sync operations
CREATE TABLE public.salesforce_sync_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  object_type TEXT NOT NULL,
  operation TEXT NOT NULL, -- 'sync_in', 'sync_out', 'error'
  salesforce_id TEXT,
  local_id UUID,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'success', 'error'
  error_message TEXT,
  sync_direction TEXT NOT NULL, -- 'inbound', 'outbound', 'bidirectional'
  data_payload JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS for sync log
ALTER TABLE public.salesforce_sync_log ENABLE ROW LEVEL SECURITY;

-- Create policies for sync log
CREATE POLICY "All authenticated users can view sync log" 
ON public.salesforce_sync_log 
FOR SELECT 
USING (true);

CREATE POLICY "All authenticated users can modify sync log" 
ON public.salesforce_sync_log 
FOR ALL 
USING (true);

-- Add triggers for updated_at timestamps on new tables
CREATE TRIGGER update_cases_updated_at
BEFORE UPDATE ON public.cases
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_knowledge_articles_updated_at
BEFORE UPDATE ON public.knowledge_articles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at
BEFORE UPDATE ON public.campaigns
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_campaign_members_updated_at
BEFORE UPDATE ON public.campaign_members
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_contacts_salesforce_id ON public.contacts(salesforce_id);
CREATE INDEX idx_companies_salesforce_id ON public.companies(salesforce_id);
CREATE INDEX idx_opportunities_salesforce_id ON public.opportunities(salesforce_id);
CREATE INDEX idx_activities_salesforce_id ON public.activities(salesforce_id);
CREATE INDEX idx_cases_salesforce_id ON public.cases(salesforce_id);
CREATE INDEX idx_cases_status ON public.cases(status);
CREATE INDEX idx_cases_contact_id ON public.cases(contact_id);
CREATE INDEX idx_knowledge_articles_salesforce_id ON public.knowledge_articles(salesforce_id);
CREATE INDEX idx_knowledge_articles_status ON public.knowledge_articles(validation_status, publish_status);
CREATE INDEX idx_campaigns_salesforce_id ON public.campaigns(salesforce_id);
CREATE INDEX idx_campaign_members_salesforce_id ON public.campaign_members(salesforce_id);
CREATE INDEX idx_sync_log_object_type ON public.salesforce_sync_log(object_type);
CREATE INDEX idx_sync_log_status ON public.salesforce_sync_log(status);