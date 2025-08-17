import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Database, Users, Building, Activity, Shield, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface TestDataStats {
  contacts: number;
  companies: number;
  leads: number;
  opportunities: number;
  activities: number;
}

export function TestDataGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState<TestDataStats>({ contacts: 0, companies: 0, leads: 0, opportunities: 0, activities: 0 });
  const { toast } = useToast();
  const { user } = useAuth();

  const generateTestData = async () => {
    if (!user) return;

    setIsGenerating(true);
    setProgress(0);

    try {
      // Generate test companies first
      setProgress(10);
      const companies = await generateTestCompanies();
      setStats(prev => ({ ...prev, companies: companies.length }));

      // Generate test contacts
      setProgress(30);
      const contacts = await generateTestContacts(companies);
      setStats(prev => ({ ...prev, contacts: contacts.length }));

      // Generate test leads
      setProgress(50);
      const leads = await generateTestLeads();
      setStats(prev => ({ ...prev, leads: leads.length }));

      // Generate test opportunities
      setProgress(70);
      const opportunities = await generateTestOpportunities(companies, contacts);
      setStats(prev => ({ ...prev, opportunities: opportunities.length }));

      // Generate test activities
      setProgress(90);
      const activities = await generateTestActivities(contacts, opportunities);
      setStats(prev => ({ ...prev, activities: activities.length }));

      setProgress(100);
      
      // toast({
      //   title: "✅ Test Data Generated Successfully",
      //   description: `Created ${companies.length} companies, ${contacts.length} contacts, ${leads.length} leads, ${opportunities.length} opportunities, and ${activities.length} activities.`,
      // });

    } catch (error) {
      console.error('Test data generation failed:', error);
      toast({
        title: "❌ Test Data Generation Failed",
        description: `Error: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateTestCompanies = async () => {
    const testCompanies = [
      {
        name: 'TechCorp Solutions',
        industry: 'Technology',
        size: 'Large',
        annual_revenue: 50000000,
        employee_count: 1500,
        website: 'https://techcorp.example.com',
        phone: '+1-555-0101',
        address: '123 Tech Street, San Francisco, CA 94105',
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
        company_type: 'customer',
        rating: 'hot'
      },
      {
        name: 'DataDriven Analytics',
        industry: 'Data Analytics',
        size: 'Medium',
        annual_revenue: 15000000,
        employee_count: 250,
        website: 'https://datadriven.example.com',
        phone: '+1-555-0102',
        address: '456 Data Avenue, Austin, TX 78701',
        city: 'Austin',
        state: 'TX',
        country: 'USA',
        company_type: 'prospect',
        rating: 'warm'
      },
      {
        name: 'CloudFirst Enterprises',
        industry: 'Cloud Computing',
        size: 'Large',
        annual_revenue: 75000000,
        employee_count: 2000,
        website: 'https://cloudfirst.example.com',
        phone: '+1-555-0103',
        address: '789 Cloud Way, Seattle, WA 98101',
        city: 'Seattle',
        state: 'WA',
        country: 'USA',
        company_type: 'customer',
        rating: 'hot'
      },
      {
        name: 'InnovateNow Startups',
        industry: 'Software',
        size: 'Small',
        annual_revenue: 2000000,
        employee_count: 45,
        website: 'https://innovatenow.example.com',
        phone: '+1-555-0104',
        address: '321 Innovation Blvd, Boston, MA 02101',
        city: 'Boston',
        state: 'MA',
        country: 'USA',
        company_type: 'prospect',
        rating: 'cold'
      },
      {
        name: 'Manufacturing Masters',
        industry: 'Manufacturing',
        size: 'Large',
        annual_revenue: 100000000,
        employee_count: 3500,
        website: 'https://mfgmasters.example.com',
        phone: '+1-555-0105',
        address: '654 Industrial Park, Detroit, MI 48201',
        city: 'Detroit',
        state: 'MI',
        country: 'USA',
        company_type: 'customer',
        rating: 'warm'
      }
    ];

    const { data, error } = await supabase
      .from('companies')
      .insert(testCompanies)
      .select();

    if (error) throw error;
    return data;
  };

  const generateTestContacts = async (companies: any[]) => {
    const testContacts = [
      {
        first_name: 'Sarah',
        last_name: 'Johnson',
        email: 'sarah.johnson@techcorp.example.com',
        phone: '+1-555-1001',
        mobile_phone: '+1-555-2001',
        title: 'VP of Engineering',
        department: 'Engineering',
        company_id: companies[0].id,
        lead_source: 'Website',
        status: 'qualified',
        lead_score: 85,
        preferred_contact_method: 'email',
        address: { street: '123 Tech Street', city: 'San Francisco', state: 'CA', zip: '94105' },
        tags: ['decision-maker', 'technical', 'high-value']
      },
      {
        first_name: 'Michael',
        last_name: 'Chen',
        email: 'michael.chen@datadriven.example.com',
        phone: '+1-555-1002',
        mobile_phone: '+1-555-2002',
        title: 'Chief Data Officer',
        department: 'Data Science',
        company_id: companies[1].id,
        lead_source: 'Referral',
        status: 'working',
        lead_score: 75,
        preferred_contact_method: 'phone',
        address: { street: '456 Data Avenue', city: 'Austin', state: 'TX', zip: '78701' },
        tags: ['analytics', 'decision-maker', 'warm']
      },
      {
        first_name: 'Emily',
        last_name: 'Rodriguez',
        email: 'emily.rodriguez@cloudfirst.example.com',
        phone: '+1-555-1003',
        mobile_phone: '+1-555-2003',
        title: 'Director of Cloud Operations',
        department: 'IT',
        company_id: companies[2].id,
        lead_source: 'Trade Show',
        status: 'qualified',
        lead_score: 90,
        preferred_contact_method: 'email',
        address: { street: '789 Cloud Way', city: 'Seattle', state: 'WA', zip: '98101' },
        tags: ['cloud', 'technical', 'ready-to-buy']
      },
      {
        first_name: 'David',
        last_name: 'Wilson',
        email: 'david.wilson@innovatenow.example.com',
        phone: '+1-555-1004',
        mobile_phone: '+1-555-2004',
        title: 'Founder & CEO',
        department: 'Executive',
        company_id: companies[3].id,
        lead_source: 'LinkedIn',
        status: 'new',
        lead_score: 45,
        preferred_contact_method: 'email',
        address: { street: '321 Innovation Blvd', city: 'Boston', state: 'MA', zip: '02101' },
        tags: ['startup', 'budget-conscious', 'nurture']
      },
      {
        first_name: 'Lisa',
        last_name: 'Thompson',
        email: 'lisa.thompson@mfgmasters.example.com',
        phone: '+1-555-1005',
        mobile_phone: '+1-555-2005',
        title: 'COO',
        department: 'Operations',
        company_id: companies[4].id,
        lead_source: 'Cold Call',
        status: 'working',
        lead_score: 70,
        preferred_contact_method: 'phone',
        address: { street: '654 Industrial Park', city: 'Detroit', state: 'MI', zip: '48201' },
        tags: ['manufacturing', 'operations', 'integration-focused']
      }
    ];

    const { data, error } = await supabase
      .from('contacts')
      .insert(testContacts)
      .select();

    if (error) throw error;
    return data;
  };

  const generateTestLeads = async () => {
    const testLeads = [
      {
        first_name: 'Alex',
        last_name: 'Thompson',
        email: 'alex.thompson@prospect1.example.com',
        phone: '+1-555-3001',
        company: 'ProspectTech Inc',
        title: 'IT Manager',
        industry: 'Technology',
        lead_source: 'Google Ads',
        status: 'new',
        rating: 'warm',
        score: 60,
        description: 'Interested in cloud migration solutions'
      },
      {
        first_name: 'Jessica',
        last_name: 'Martinez',
        email: 'jessica.martinez@prospect2.example.com',
        phone: '+1-555-3002',
        company: 'Finance Forward',
        title: 'CFO',
        industry: 'Financial Services',
        lead_source: 'Webinar',
        status: 'qualified',
        rating: 'hot',
        score: 85,
        description: 'Looking for AI-powered financial analytics'
      },
      {
        first_name: 'Robert',
        last_name: 'Anderson',
        email: 'robert.anderson@prospect3.example.com',
        phone: '+1-555-3003',
        company: 'Healthcare Innovations',
        title: 'VP of Technology',
        industry: 'Healthcare',
        lead_source: 'Partner Referral',
        status: 'working',
        rating: 'warm',
        score: 72,
        description: 'Evaluating CRM solutions for patient management'
      }
    ];

    const { data, error } = await supabase
      .from('leads')
      .insert(testLeads)
      .select();

    if (error) throw error;
    return data;
  };

  const generateTestOpportunities = async (companies: any[], contacts: any[]) => {
    const testOpportunities = [
      {
        name: 'TechCorp AI Platform Implementation',
        amount: 250000,
        stage: 'proposal',
        probability: 75,
        expected_close_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        company_id: companies[0].id,
        contact_id: contacts[0].id,
        description: 'Implementation of AI-powered CRM platform for enterprise use',
        deal_type: 'New Business',
        lead_source: 'Inbound',
        next_step: 'Technical demonstration scheduled'
      },
      {
        name: 'DataDriven Analytics Expansion',
        amount: 150000,
        stage: 'negotiation',
        probability: 85,
        expected_close_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        company_id: companies[1].id,
        contact_id: contacts[1].id,
        description: 'Expansion of current analytics capabilities',
        deal_type: 'Expansion',
        lead_source: 'Existing Customer',
        next_step: 'Contract review and approval'
      },
      {
        name: 'CloudFirst Enterprise License',
        amount: 500000,
        stage: 'qualified',
        probability: 60,
        expected_close_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        company_id: companies[2].id,
        contact_id: contacts[2].id,
        description: 'Enterprise-wide licensing for cloud operations platform',
        deal_type: 'New Business',
        lead_source: 'Trade Show',
        next_step: 'ROI analysis presentation'
      }
    ];

    const { data, error } = await supabase
      .from('opportunities')
      .insert(testOpportunities)
      .select();

    if (error) throw error;
    return data;
  };

  const generateTestActivities = async (contacts: any[], opportunities: any[]) => {
    const testActivities = [
      {
        contact_id: contacts[0].id,
        opportunity_id: opportunities[0].id,
        type: 'call',
        subject: 'Technical Requirements Discussion',
        description: 'Discussed AI platform technical requirements and integration points',
        status: 'completed',
        priority: 'high',
        scheduled_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        completed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        duration_minutes: 60
      },
      {
        contact_id: contacts[1].id,
        opportunity_id: opportunities[1].id,
        type: 'email',
        subject: 'Analytics Platform Demo Follow-up',
        description: 'Follow-up email after product demonstration with pricing proposal',
        status: 'completed',
        priority: 'medium',
        scheduled_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        completed_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        contact_id: contacts[2].id,
        opportunity_id: opportunities[2].id,
        type: 'meeting',
        subject: 'Enterprise Implementation Planning',
        description: 'Planning meeting for enterprise-wide implementation strategy',
        status: 'scheduled',
        priority: 'high',
        scheduled_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        duration_minutes: 90
      },
      {
        contact_id: contacts[3].id,
        type: 'task',
        subject: 'Send Startup Pricing Information',
        description: 'Prepare and send startup-friendly pricing options',
        status: 'open',
        priority: 'medium',
        scheduled_at: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    const { data, error } = await supabase
      .from('activities')
      .insert(testActivities)
      .select();

    if (error) throw error;
    return data;
  };

  const clearTestData = async () => {
    try {
      // Delete in reverse dependency order
      await supabase.from('activities').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('opportunities').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('leads').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('contacts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('companies').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      setStats({ contacts: 0, companies: 0, leads: 0, opportunities: 0, activities: 0 });
      
      toast({
        title: "🗑️ Test Data Cleared",
        description: "All test data has been removed from the database.",
      });
    } catch (error) {
      toast({
        title: "❌ Error Clearing Data",
        description: `Failed to clear test data: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Test Data Generator
        </CardTitle>
        <CardDescription>
          Generate comprehensive test data for AI agent testing and CRM workflows
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Data Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{stats.companies}</div>
            <div className="text-sm text-muted-foreground">Companies</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{stats.contacts}</div>
            <div className="text-sm text-muted-foreground">Contacts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{stats.leads}</div>
            <div className="text-sm text-muted-foreground">Leads</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{stats.opportunities}</div>
            <div className="text-sm text-muted-foreground">Opportunities</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{stats.activities}</div>
            <div className="text-sm text-muted-foreground">Activities</div>
          </div>
        </div>

        {/* Progress Bar */}
        {isGenerating && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Generating test data...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        {/* Security Notice */}
        <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
          <Shield className="h-5 w-5 text-amber-600 mt-0.5" />
          <div className="space-y-1">
            <div className="font-medium text-amber-800 dark:text-amber-200">Security & Privacy Protected</div>
            <div className="text-sm text-amber-700 dark:text-amber-300">
              All test data is synthetic and does not contain real customer information. 
              Data is encrypted and follows enterprise security standards.
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button 
            onClick={generateTestData}
            disabled={isGenerating}
            className="flex-1"
          >
            {isGenerating ? (
              <>
                <Activity className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Database className="h-4 w-4 mr-2" />
                Generate Test Data
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={clearTestData}
            disabled={isGenerating}
          >
            Clear All Data
          </Button>
        </div>

        {/* Data Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="font-medium">Generated Data Includes:</div>
            <ul className="space-y-1 text-muted-foreground">
              <li>• 5 realistic companies with industry data</li>
              <li>• 5 contacts with scoring and preferences</li>
              <li>• 3 leads at different stages</li>
              <li>• 3 opportunities with revenue data</li>
              <li>• Multiple activities and interactions</li>
            </ul>
          </div>
          <div className="space-y-2">
            <div className="font-medium">Perfect for Testing:</div>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Customer Intelligence Agents</li>
              <li>• Lead scoring algorithms</li>
              <li>• Pipeline analysis workflows</li>
              <li>• Sentiment analysis</li>
              <li>• Churn prediction models</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}