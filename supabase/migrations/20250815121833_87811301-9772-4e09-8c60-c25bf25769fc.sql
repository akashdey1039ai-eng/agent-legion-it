-- Create comprehensive enterprise CRM schema

-- User Roles and Permissions
CREATE TYPE public.user_role AS ENUM ('admin', 'sales_manager', 'sales_rep', 'marketing_manager', 'customer_support', 'viewer');

CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'sales_rep',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, role)
);

-- Teams and Territories
CREATE TABLE public.teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    manager_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(team_id, user_id)
);

-- Enhanced Companies table with additional enterprise fields
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS parent_company_id UUID REFERENCES public.companies(id);
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS annual_revenue BIGINT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS employee_count INTEGER;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS company_type TEXT DEFAULT 'prospect';
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS rating TEXT DEFAULT 'warm';
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS primary_contact_id UUID;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS assigned_user_id UUID REFERENCES auth.users(id);
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS social_media JSONB DEFAULT '{}';
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}';

-- Enhanced Contacts table 
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS mobile_phone TEXT;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS preferred_contact_method TEXT DEFAULT 'email';
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS social_media JSONB DEFAULT '{}';
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}';
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS birthday DATE;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS address JSONB DEFAULT '{}';

-- Deals (Enhanced Opportunities)
CREATE TABLE public.deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    company_id UUID REFERENCES public.companies(id),
    contact_id UUID REFERENCES public.contacts(id),
    amount DECIMAL(15,2),
    currency TEXT DEFAULT 'USD',
    stage TEXT NOT NULL DEFAULT 'prospecting',
    probability INTEGER DEFAULT 10 CHECK (probability >= 0 AND probability <= 100),
    expected_close_date DATE,
    actual_close_date DATE,
    lead_source TEXT,
    description TEXT,
    next_step TEXT,
    assigned_user_id UUID REFERENCES auth.users(id),
    deal_type TEXT,
    competitors TEXT[],
    tags TEXT[],
    custom_fields JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    salesforce_id TEXT,
    hubspot_id TEXT,
    last_sync_at TIMESTAMP WITH TIME ZONE
);

-- Products and Pricing
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT UNIQUE,
    description TEXT,
    category TEXT,
    price DECIMAL(15,2),
    cost DECIMAL(15,2),
    currency TEXT DEFAULT 'USD',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Deal Products (Line Items)
CREATE TABLE public.deal_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(15,2) NOT NULL,
    discount_percent DECIMAL(5,2) DEFAULT 0,
    total_price DECIMAL(15,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enhanced Activities
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS activity_type TEXT NOT NULL DEFAULT 'task';
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium';
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS duration_minutes INTEGER;
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS outcome TEXT;
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS attendees JSONB DEFAULT '[]';
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS deal_id UUID REFERENCES public.deals(id);

-- Email Integration
CREATE TABLE public.email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    template_type TEXT NOT NULL DEFAULT 'email',
    is_active BOOLEAN DEFAULT true,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.email_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    template_id UUID REFERENCES public.email_templates(id),
    status TEXT DEFAULT 'draft',
    scheduled_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    total_recipients INTEGER DEFAULT 0,
    total_sent INTEGER DEFAULT 0,
    total_opened INTEGER DEFAULT 0,
    total_clicked INTEGER DEFAULT 0,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Lead Management
CREATE TABLE public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    company TEXT,
    title TEXT,
    industry TEXT,
    lead_source TEXT,
    status TEXT DEFAULT 'new',
    rating TEXT DEFAULT 'unqualified',
    score INTEGER DEFAULT 0,
    assigned_user_id UUID REFERENCES auth.users(id),
    converted_contact_id UUID REFERENCES public.contacts(id),
    converted_company_id UUID REFERENCES public.companies(id),
    converted_deal_id UUID REFERENCES public.deals(id),
    converted_at TIMESTAMP WITH TIME ZONE,
    description TEXT,
    tags TEXT[],
    custom_fields JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    salesforce_id TEXT,
    hubspot_id TEXT,
    last_sync_at TIMESTAMP WITH TIME ZONE
);

-- Tasks and Follow-ups
CREATE TABLE public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'open',
    priority TEXT DEFAULT 'medium',
    due_date TIMESTAMP WITH TIME ZONE,
    assigned_user_id UUID REFERENCES auth.users(id),
    created_by UUID REFERENCES auth.users(id),
    related_to_type TEXT, -- 'lead', 'contact', 'company', 'deal'
    related_to_id UUID,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Documents and Files
CREATE TABLE public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT,
    content_type TEXT,
    related_to_type TEXT, -- 'lead', 'contact', 'company', 'deal'
    related_to_id UUID,
    uploaded_by UUID REFERENCES auth.users(id),
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Sales Stages and Pipeline Configuration
CREATE TABLE public.sales_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    probability INTEGER DEFAULT 10 CHECK (probability >= 0 AND probability <= 100),
    stage_order INTEGER NOT NULL,
    is_closed_won BOOLEAN DEFAULT false,
    is_closed_lost BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default sales stages
INSERT INTO public.sales_stages (name, probability, stage_order, is_closed_won, is_closed_lost) VALUES
('Prospecting', 10, 1, false, false),
('Qualification', 25, 2, false, false),
('Needs Analysis', 40, 3, false, false),
('Proposal', 60, 4, false, false),
('Negotiation', 80, 5, false, false),
('Closed Won', 100, 6, true, false),
('Closed Lost', 0, 7, false, true);

-- Reports and Analytics
CREATE TABLE public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    report_type TEXT NOT NULL,
    configuration JSONB NOT NULL DEFAULT '{}',
    created_by UUID REFERENCES auth.users(id),
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Notes and Comments
CREATE TABLE public.notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    related_to_type TEXT NOT NULL, -- 'lead', 'contact', 'company', 'deal', 'activity'
    related_to_id UUID NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    is_private BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for secure access
CREATE POLICY "Users can view their organization data" ON public.user_roles FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can view teams" ON public.teams FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can view team members" ON public.team_members FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can manage deals" ON public.deals FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can view products" ON public.products FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can manage deal products" ON public.deal_products FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can manage email templates" ON public.email_templates FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can manage email campaigns" ON public.email_campaigns FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can manage leads" ON public.leads FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can manage tasks" ON public.tasks FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can manage documents" ON public.documents FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can view sales stages" ON public.sales_stages FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can manage reports" ON public.reports FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can manage notes" ON public.notes FOR ALL USING (auth.uid() IS NOT NULL);

-- Create update triggers for timestamp columns
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON public.teams FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON public.deals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON public.email_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_email_campaigns_updated_at BEFORE UPDATE ON public.email_campaigns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON public.reports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON public.notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON public.user_roles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();