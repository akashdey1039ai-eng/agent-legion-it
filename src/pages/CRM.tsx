import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  Building, 
  HandCoins, 
  Calendar, 
  Mail, 
  FileText, 
  BarChart3,
  Plus,
  Filter,
  Search,
  Target,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Phone,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import LeadForm from '@/components/LeadForm';
import ContactForm from '@/components/ContactForm';
import DealForm from '@/components/DealForm';
import TaskForm from '@/components/TaskForm';
import CompanyForm from '@/components/CompanyForm';
import Analytics from '@/components/Analytics';

interface DashboardStats {
  totalLeads: number;
  totalContacts: number;
  totalDeals: number;
  totalRevenue: number;
  openTasks: number;
  closedDealsThisMonth: number;
  conversionRate: number;
  averageDealSize: number;
}

interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company: string;
  status: string;
  rating: string;
  score: number;
  created_at: string;
}

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  title: string;
  department: string;
  status: string;
  created_at: string;
}

interface Deal {
  id: string;
  name: string;
  amount: number;
  currency: string;
  stage: string;
  probability: number;
  expected_close_date: string;
  created_at: string;
}

interface Company {
  id: string;
  name: string;
  industry: string;
  website: string;
  phone: string;
  city: string;
  state: string;
  created_at: string;
}

interface Task {
  id: string;
  subject: string;
  status: string;
  priority: string;
  due_date: string;
  created_at: string;
}

const CRM = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [showDealForm, setShowDealForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalLeads: 0,
    totalContacts: 0,
    totalDeals: 0,
    totalRevenue: 0,
    openTasks: 0,
    closedDealsThisMonth: 0,
    conversionRate: 0,
    averageDealSize: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }
    
    if (user) {
      fetchDashboardStats();
      fetchAllData();
    }
  }, [user, authLoading, navigate]);

  const fetchDashboardStats = async () => {
    try {
      // Fetch leads count
      const { count: leadsCount } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true });

      // Fetch contacts count
      const { count: contactsCount } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true });

      // Fetch deals data
      const { data: deals } = await supabase
        .from('deals')
        .select('amount, stage, created_at');

      // Fetch tasks count
      const { count: tasksCount } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open');

      const totalDeals = deals?.length || 0;
      const totalRevenue = deals?.reduce((sum, deal) => sum + (Number(deal.amount) || 0), 0) || 0;
      
      // Calculate closed deals this month
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const closedDealsThisMonth = deals?.filter(deal => {
        const dealDate = new Date(deal.created_at);
        return dealDate.getMonth() === currentMonth && 
               dealDate.getFullYear() === currentYear &&
               (deal.stage === 'Closed Won' || deal.stage === 'closed_won');
      }).length || 0;

      const conversionRate = leadsCount && contactsCount ? 
        ((contactsCount / leadsCount) * 100) : 0;
      
      const averageDealSize = totalDeals > 0 ? (totalRevenue / totalDeals) : 0;

      setStats({
        totalLeads: leadsCount || 0,
        totalContacts: contactsCount || 0,
        totalDeals,
        totalRevenue,
        openTasks: tasksCount || 0,
        closedDealsThisMonth,
        conversionRate,
        averageDealSize
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard statistics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAllData = async () => {
    try {
      // Fetch all CRM data
      const [leadsData, contactsData, dealsData, companiesData, tasksData] = await Promise.all([
        supabase.from('leads').select('*').order('created_at', { ascending: false }).limit(100),
        supabase.from('contacts').select('*').order('created_at', { ascending: false }).limit(100),
        supabase.from('deals').select('*').order('created_at', { ascending: false }).limit(100),
        supabase.from('companies').select('*').order('created_at', { ascending: false }).limit(100),
        supabase.from('tasks').select('*').order('created_at', { ascending: false }).limit(100)
      ]);

      setLeads(leadsData.data || []);
      setContacts(contactsData.data || []);
      setDeals(dealsData.data || []);
      setCompanies(companiesData.data || []);
      setTasks(tasksData.data || []);
    } catch (error) {
      console.error('Error fetching CRM data:', error);
      toast({
        title: "Error",
        description: "Failed to load CRM data",
        variant: "destructive"
      });
    }
  };

  const handleFormSave = () => {
    fetchDashboardStats();
    fetchAllData();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new': return 'default';
      case 'qualified': case 'active': case 'open': return 'secondary';
      case 'contacted': case 'in_progress': return 'outline';
      case 'converted': case 'customer': case 'completed': return 'default';
      case 'hot': return 'destructive';
      case 'warm': return 'secondary';
      case 'cold': return 'outline';
      default: return 'outline';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const filteredLeads = leads.filter(lead => 
    lead.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (lead.company && lead.company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredContacts = contacts.filter(contact => 
    contact.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDeals = deals.filter(deal => 
    deal.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCompanies = companies.filter(company => 
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (company.industry && company.industry.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredTasks = tasks.filter(task => 
    task.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {authLoading ? 'Authenticating...' : 'Loading CRM...'}
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Enterprise CRM</h1>
              <p className="text-muted-foreground">Comprehensive customer relationship management</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Button size="sm" className="bg-gradient-primary">
                <Plus className="h-4 w-4 mr-2" />
                Quick Add
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-7 mb-8">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="leads" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Leads
            </TabsTrigger>
            <TabsTrigger value="contacts" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Contacts
            </TabsTrigger>
            <TabsTrigger value="deals" className="flex items-center gap-2">
              <HandCoins className="h-4 w-4" />
              Deals
            </TabsTrigger>
            <TabsTrigger value="companies" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Companies
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalLeads}</div>
                  <p className="text-xs text-muted-foreground">Active prospects</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalContacts}</div>
                  <p className="text-xs text-muted-foreground">Qualified contacts</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Deals</CardTitle>
                  <HandCoins className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalDeals}</div>
                  <p className="text-xs text-muted-foreground">In pipeline</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
                  <p className="text-xs text-muted-foreground">Pipeline value</p>
                </CardContent>
              </Card>
            </div>

            {/* Secondary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Open Tasks</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.openTasks}</div>
                  <p className="text-xs text-muted-foreground">Pending actions</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Closed This Month</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.closedDealsThisMonth}</div>
                  <p className="text-xs text-muted-foreground">Successful deals</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.conversionRate.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">Lead to contact</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Deal Size</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(stats.averageDealSize)}</div>
                  <p className="text-xs text-muted-foreground">Per deal</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and workflows</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col items-center gap-2"
                    onClick={() => setShowLeadForm(true)}
                  >
                    <Plus className="h-5 w-5" />
                    Add Lead
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col items-center gap-2"
                    onClick={() => setShowContactForm(true)}
                  >
                    <Users className="h-5 w-5" />
                    Add Contact
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col items-center gap-2"
                    onClick={() => setShowDealForm(true)}
                  >
                    <HandCoins className="h-5 w-5" />
                    Create Deal
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col items-center gap-2"
                    onClick={() => setShowTaskForm(true)}
                  >
                    <Calendar className="h-5 w-5" />
                    Schedule Task
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leads Tab */}
          <TabsContent value="leads" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Leads</h2>
                <p className="text-muted-foreground">Manage your sales prospects</p>
              </div>
              <Button 
                className="bg-gradient-primary"
                onClick={() => setShowLeadForm(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Lead
              </Button>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Lead Pipeline</CardTitle>
                  <div className="flex items-center gap-2">
                    <Input 
                      placeholder="Search leads..." 
                      className="w-64"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredLeads.length > 0 ? (
                  <div className="space-y-4">
                    {filteredLeads.map((lead) => (
                      <div key={lead.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{lead.first_name} {lead.last_name}</h4>
                              <Badge variant={getStatusBadgeVariant(lead.status)}>{lead.status}</Badge>
                              <Badge variant={getStatusBadgeVariant(lead.rating)}>{lead.rating}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{lead.email}</p>
                            <p className="text-sm text-muted-foreground">{lead.company} • Score: {lead.score}</p>
                            <p className="text-xs text-muted-foreground">Created: {formatDate(lead.created_at)}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>{searchTerm ? 'No leads found matching your search.' : 'No leads found. Start by adding your first lead.'}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contacts Tab */}
          <TabsContent value="contacts" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Contacts</h2>
                <p className="text-muted-foreground">Manage your customer relationships</p>
              </div>
              <Button 
                className="bg-gradient-primary"
                onClick={() => setShowContactForm(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Contact
              </Button>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Contact Directory</CardTitle>
                  <div className="flex items-center gap-2">
                    <Input 
                      placeholder="Search contacts..." 
                      className="w-64"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredContacts.length > 0 ? (
                  <div className="space-y-4">
                    {filteredContacts.map((contact) => (
                      <div key={contact.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{contact.first_name} {contact.last_name}</h4>
                              <Badge variant={getStatusBadgeVariant(contact.status)}>{contact.status}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{contact.email}</p>
                            <p className="text-sm text-muted-foreground">{contact.title} • {contact.department}</p>
                            <p className="text-xs text-muted-foreground">Created: {formatDate(contact.created_at)}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Phone className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Mail className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>{searchTerm ? 'No contacts found matching your search.' : 'No contacts found. Start by adding your first contact.'}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Deals Tab */}
          <TabsContent value="deals" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Deals</h2>
                <p className="text-muted-foreground">Track your sales opportunities</p>
              </div>
              <Button 
                className="bg-gradient-primary"
                onClick={() => setShowDealForm(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Deal
              </Button>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Sales Pipeline</CardTitle>
                  <div className="flex items-center gap-2">
                    <Input 
                      placeholder="Search deals..." 
                      className="w-64"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredDeals.length > 0 ? (
                  <div className="space-y-4">
                    {filteredDeals.map((deal) => (
                      <div key={deal.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{deal.name}</h4>
                              <Badge variant="outline">{deal.stage}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {formatCurrency(deal.amount)} • {deal.probability}% probability
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Expected close: {deal.expected_close_date ? formatDate(deal.expected_close_date) : 'Not set'}
                            </p>
                            <p className="text-xs text-muted-foreground">Created: {formatDate(deal.created_at)}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <HandCoins className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <HandCoins className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>{searchTerm ? 'No deals found matching your search.' : 'No deals found. Start by creating your first deal.'}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Companies Tab */}
          <TabsContent value="companies" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Companies</h2>
                <p className="text-muted-foreground">Manage your business accounts</p>
              </div>
              <Button 
                className="bg-gradient-primary"
                onClick={() => setShowCompanyForm(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Company
              </Button>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Account Management</CardTitle>
                  <div className="flex items-center gap-2">
                    <Input 
                      placeholder="Search companies..." 
                      className="w-64"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredCompanies.length > 0 ? (
                  <div className="space-y-4">
                    {filteredCompanies.map((company) => (
                      <div key={company.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{company.name}</h4>
                              {company.industry && <Badge variant="outline">{company.industry}</Badge>}
                            </div>
                            <p className="text-sm text-muted-foreground">{company.website}</p>
                            <p className="text-sm text-muted-foreground">
                              {company.city}, {company.state} • {company.phone}
                            </p>
                            <p className="text-xs text-muted-foreground">Added: {formatDate(company.created_at)}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Building className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>{searchTerm ? 'No companies found matching your search.' : 'No companies found. Start by adding your first company.'}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Tasks</h2>
                <p className="text-muted-foreground">Stay organized with your to-dos</p>
              </div>
              <Button 
                className="bg-gradient-primary"
                onClick={() => setShowTaskForm(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Task Management</CardTitle>
                  <div className="flex items-center gap-2">
                    <Input 
                      placeholder="Search tasks..." 
                      className="w-64"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredTasks.length > 0 ? (
                  <div className="space-y-4">
                    {filteredTasks.map((task) => (
                      <div key={task.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{task.subject}</h4>
                              <Badge variant={getStatusBadgeVariant(task.status)}>{task.status}</Badge>
                              <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority).replace('text-', 'bg-')}`} />
                              <span className={`text-xs ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Due: {task.due_date ? formatDate(task.due_date) : 'No due date'}
                            </p>
                            <p className="text-xs text-muted-foreground">Created: {formatDate(task.created_at)}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Calendar className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>{searchTerm ? 'No tasks found matching your search.' : 'No tasks found. Start by creating your first task.'}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Analytics</h2>
                <p className="text-muted-foreground">Insights and performance metrics</p>
              </div>
            </div>
            <Analytics />
          </TabsContent>
        </Tabs>
      </div>

      {/* Form Modals */}
      {showLeadForm && (
        <LeadForm 
          onClose={() => setShowLeadForm(false)} 
          onSave={handleFormSave}
        />
      )}
      
      {showContactForm && (
        <ContactForm 
          onClose={() => setShowContactForm(false)} 
          onSave={handleFormSave}
        />
      )}
      
      {showDealForm && (
        <DealForm 
          onClose={() => setShowDealForm(false)} 
          onSave={handleFormSave}
        />
      )}
      
      {showTaskForm && (
        <TaskForm 
          onClose={() => setShowTaskForm(false)} 
          onSave={handleFormSave}
        />
      )}
      
      {showCompanyForm && (
        <CompanyForm 
          onClose={() => setShowCompanyForm(false)} 
          onSave={handleFormSave}
        />
      )}
    </div>
  );
};

export default CRM;