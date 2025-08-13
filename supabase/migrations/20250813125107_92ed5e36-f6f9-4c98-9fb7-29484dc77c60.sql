-- Create CRM data structure with dummy information

-- Companies/Accounts table
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  industry TEXT,
  size TEXT CHECK (size IN ('startup', 'small', 'medium', 'large', 'enterprise')),
  revenue BIGINT,
  website TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'USA',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Contacts table
CREATE TABLE public.contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  title TEXT,
  department TEXT,
  lead_source TEXT,
  lead_score INTEGER DEFAULT 0 CHECK (lead_score >= 0 AND lead_score <= 100),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost')),
  owner_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Opportunities/Deals table
CREATE TABLE public.opportunities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(15,2),
  probability INTEGER DEFAULT 10 CHECK (probability >= 0 AND probability <= 100),
  stage TEXT DEFAULT 'prospecting' CHECK (stage IN ('prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost')),
  expected_close_date DATE,
  owner_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activities table
CREATE TABLE public.activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
  opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('call', 'email', 'meeting', 'demo', 'proposal', 'follow_up', 'note')),
  subject TEXT NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  owner_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allowing all authenticated users to see all data for demo purposes)
CREATE POLICY "All authenticated users can view companies" ON public.companies FOR SELECT USING (true);
CREATE POLICY "All authenticated users can modify companies" ON public.companies FOR ALL USING (true);

CREATE POLICY "All authenticated users can view contacts" ON public.contacts FOR SELECT USING (true);
CREATE POLICY "All authenticated users can modify contacts" ON public.contacts FOR ALL USING (true);

CREATE POLICY "All authenticated users can view opportunities" ON public.opportunities FOR SELECT USING (true);
CREATE POLICY "All authenticated users can modify opportunities" ON public.opportunities FOR ALL USING (true);

CREATE POLICY "All authenticated users can view activities" ON public.activities FOR SELECT USING (true);
CREATE POLICY "All authenticated users can modify activities" ON public.activities FOR ALL USING (true);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON public.contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_opportunities_updated_at
  BEFORE UPDATE ON public.opportunities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_activities_updated_at
  BEFORE UPDATE ON public.activities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert dummy companies
INSERT INTO public.companies (name, industry, size, revenue, website, phone, address, city, state, description) VALUES
('TechCorp Solutions', 'Technology', 'large', 50000000, 'https://techcorp.com', '+1-555-0101', '123 Tech Drive', 'San Francisco', 'CA', 'Leading provider of enterprise software solutions'),
('Global Manufacturing Inc', 'Manufacturing', 'enterprise', 250000000, 'https://globalmanuf.com', '+1-555-0102', '456 Industrial Blvd', 'Detroit', 'MI', 'International manufacturing conglomerate'),
('HealthCare Innovations', 'Healthcare', 'medium', 15000000, 'https://healthinnovate.com', '+1-555-0103', '789 Medical Center Dr', 'Boston', 'MA', 'Medical device and software company'),
('FinTech Dynamics', 'Financial Services', 'medium', 25000000, 'https://fintechdyn.com', '+1-555-0104', '321 Finance St', 'New York', 'NY', 'Innovative financial technology solutions'),
('Green Energy Corp', 'Energy', 'large', 75000000, 'https://greenenergy.com', '+1-555-0105', '654 Solar Ave', 'Austin', 'TX', 'Renewable energy systems and solutions'),
('RetailMax Systems', 'Retail', 'large', 100000000, 'https://retailmax.com', '+1-555-0106', '987 Commerce Way', 'Seattle', 'WA', 'Retail management and POS systems'),
('CloudFirst Technologies', 'Technology', 'startup', 2000000, 'https://cloudfirst.com', '+1-555-0107', '147 Innovation Hub', 'Palo Alto', 'CA', 'Cloud infrastructure and DevOps tools'),
('Educational Solutions Inc', 'Education', 'medium', 12000000, 'https://edusolutions.com', '+1-555-0108', '258 Learning Lane', 'Chicago', 'IL', 'Educational technology and e-learning platforms');

-- Insert dummy contacts with realistic lead scores and statuses
INSERT INTO public.contacts (company_id, first_name, last_name, email, phone, title, department, lead_source, lead_score, status) VALUES
((SELECT id FROM public.companies WHERE name = 'TechCorp Solutions'), 'John', 'Anderson', 'j.anderson@techcorp.com', '+1-555-1001', 'CTO', 'Technology', 'Website', 85, 'qualified'),
((SELECT id FROM public.companies WHERE name = 'TechCorp Solutions'), 'Sarah', 'Williams', 's.williams@techcorp.com', '+1-555-1002', 'VP of Sales', 'Sales', 'Referral', 92, 'proposal'),
((SELECT id FROM public.companies WHERE name = 'Global Manufacturing Inc'), 'Michael', 'Johnson', 'm.johnson@globalmanuf.com', '+1-555-1003', 'Operations Director', 'Operations', 'Trade Show', 78, 'negotiation'),
((SELECT id FROM public.companies WHERE name = 'HealthCare Innovations'), 'Emily', 'Brown', 'e.brown@healthinnovate.com', '+1-555-1004', 'Chief Medical Officer', 'Medical', 'Cold Outreach', 65, 'contacted'),
((SELECT id FROM public.companies WHERE name = 'FinTech Dynamics'), 'David', 'Miller', 'd.miller@fintechdyn.com', '+1-555-1005', 'Head of Technology', 'IT', 'LinkedIn', 88, 'qualified'),
((SELECT id FROM public.companies WHERE name = 'Green Energy Corp'), 'Lisa', 'Davis', 'l.davis@greenenergy.com', '+1-555-1006', 'Project Manager', 'Engineering', 'Partner Referral', 72, 'contacted'),
((SELECT id FROM public.companies WHERE name = 'RetailMax Systems'), 'Robert', 'Wilson', 'r.wilson@retailmax.com', '+1-555-1007', 'IT Director', 'Technology', 'Website', 95, 'closed_won'),
((SELECT id FROM public.companies WHERE name = 'CloudFirst Technologies'), 'Jennifer', 'Moore', 'j.moore@cloudfirst.com', '+1-555-1008', 'CEO', 'Executive', 'Conference', 90, 'proposal'),
((SELECT id FROM public.companies WHERE name = 'Educational Solutions Inc'), 'Thomas', 'Taylor', 't.taylor@edusolutions.com', '+1-555-1009', 'CTO', 'Technology', 'Cold Email', 58, 'new'),
((SELECT id FROM public.companies WHERE name = 'TechCorp Solutions'), 'Amanda', 'Garcia', 'a.garcia@techcorp.com', '+1-555-1010', 'Procurement Manager', 'Procurement', 'Webinar', 75, 'contacted');

-- Insert dummy opportunities
INSERT INTO public.opportunities (contact_id, company_id, name, description, amount, probability, stage, expected_close_date) VALUES
((SELECT id FROM public.contacts WHERE email = 's.williams@techcorp.com'), (SELECT id FROM public.companies WHERE name = 'TechCorp Solutions'), 'CRM Implementation Project', 'Complete Salesforce implementation with custom integrations', 125000.00, 80, 'proposal', '2024-03-15'),
((SELECT id FROM public.contacts WHERE email = 'j.anderson@techcorp.com'), (SELECT id FROM public.companies WHERE name = 'TechCorp Solutions'), 'AI Integration Platform', 'AI-powered automation and analytics platform', 85000.00, 70, 'negotiation', '2024-02-28'),
((SELECT id FROM public.contacts WHERE email = 'm.johnson@globalmanuf.com'), (SELECT id FROM public.companies WHERE name = 'Global Manufacturing Inc'), 'Manufacturing Operations Suite', 'End-to-end manufacturing management system', 250000.00, 60, 'qualification', '2024-04-30'),
((SELECT id FROM public.contacts WHERE email = 'e.brown@healthinnovate.com'), (SELECT id FROM public.companies WHERE name = 'HealthCare Innovations'), 'Healthcare Data Analytics', 'Patient data analytics and reporting platform', 95000.00, 45, 'prospecting', '2024-05-15'),
((SELECT id FROM public.contacts WHERE email = 'd.miller@fintechdyn.com'), (SELECT id FROM public.companies WHERE name = 'FinTech Dynamics'), 'Financial Compliance System', 'Automated compliance monitoring and reporting', 180000.00, 75, 'proposal', '2024-03-01'),
((SELECT id FROM public.contacts WHERE email = 'j.moore@cloudfirst.com'), (SELECT id FROM public.companies WHERE name = 'CloudFirst Technologies'), 'Cloud Infrastructure Upgrade', 'Complete cloud migration and optimization', 65000.00, 85, 'negotiation', '2024-02-15'),
((SELECT id FROM public.contacts WHERE email = 'r.wilson@retailmax.com'), (SELECT id FROM public.companies WHERE name = 'RetailMax Systems'), 'Retail Analytics Platform', 'Customer behavior analytics and inventory optimization', 150000.00, 100, 'closed_won', '2024-01-30'),
((SELECT id FROM public.contacts WHERE email = 'l.davis@greenenergy.com'), (SELECT id FROM public.companies WHERE name = 'Green Energy Corp'), 'Energy Management System', 'Smart grid and energy optimization platform', 300000.00, 40, 'prospecting', '2024-06-01');

-- Insert dummy activities
INSERT INTO public.activities (contact_id, opportunity_id, type, subject, description, scheduled_at, status) VALUES
((SELECT id FROM public.contacts WHERE email = 's.williams@techcorp.com'), (SELECT id FROM public.opportunities WHERE name = 'CRM Implementation Project'), 'meeting', 'CRM Requirements Review', 'Detailed discussion of CRM requirements and integration needs', '2024-01-25 14:00:00+00', 'scheduled'),
((SELECT id FROM public.contacts WHERE email = 'j.anderson@techcorp.com'), (SELECT id FROM public.opportunities WHERE name = 'AI Integration Platform'), 'demo', 'AI Platform Demo', 'Technical demonstration of AI capabilities and ROI projections', '2024-01-22 16:00:00+00', 'completed'),
((SELECT id FROM public.contacts WHERE email = 'm.johnson@globalmanuf.com'), (SELECT id FROM public.opportunities WHERE name = 'Manufacturing Operations Suite'), 'call', 'Discovery Call', 'Initial discussion about manufacturing challenges and solutions', '2024-01-20 10:00:00+00', 'completed'),
((SELECT id FROM public.contacts WHERE email = 'e.brown@healthinnovate.com'), (SELECT id FROM public.opportunities WHERE name = 'Healthcare Data Analytics'), 'email', 'Follow-up Email', 'Sending additional information about healthcare compliance features', '2024-01-19 09:00:00+00', 'completed'),
((SELECT id FROM public.contacts WHERE email = 'd.miller@fintechdyn.com'), (SELECT id FROM public.opportunities WHERE name = 'Financial Compliance System'), 'proposal', 'Compliance System Proposal', 'Detailed proposal for financial compliance automation', '2024-01-26 11:00:00+00', 'scheduled'),
((SELECT id FROM public.contacts WHERE email = 'j.moore@cloudfirst.com'), (SELECT id FROM public.opportunities WHERE name = 'Cloud Infrastructure Upgrade'), 'meeting', 'Technical Architecture Review', 'Review of current infrastructure and migration strategy', '2024-01-24 15:00:00+00', 'scheduled'),
((SELECT id FROM public.contacts WHERE email = 'r.wilson@retailmax.com'), (SELECT id FROM public.opportunities WHERE name = 'Retail Analytics Platform'), 'note', 'Contract Signed', 'Successfully closed the retail analytics deal', '2024-01-15 12:00:00+00', 'completed'),
((SELECT id FROM public.contacts WHERE email = 'l.davis@greenenergy.com'), (SELECT id FROM public.opportunities WHERE name = 'Energy Management System'), 'call', 'Initial Outreach', 'First contact to discuss energy management challenges', '2024-01-23 13:00:00+00', 'scheduled');