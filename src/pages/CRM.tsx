import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
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
  Phone
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';

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

const CRM = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
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
    if (user) {
      fetchDashboardStats();
    }
  }, [user]);

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading CRM...</p>
        </div>
      </div>
    );
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
          <TabsList className="grid w-full grid-cols-6 mb-8">
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
                  <Button variant="outline" className="h-20 flex flex-col items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Add Lead
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center gap-2">
                    <Users className="h-5 w-5" />
                    Add Contact
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center gap-2">
                    <HandCoins className="h-5 w-5" />
                    Create Deal
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center gap-2">
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
              <Button className="bg-gradient-primary">
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
                    />
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No leads found. Start by adding your first lead.</p>
                </div>
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
              <Button className="bg-gradient-primary">
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
                    />
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No contacts found. Start by adding your first contact.</p>
                </div>
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
              <Button className="bg-gradient-primary">
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
                    />
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <HandCoins className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No deals found. Start by creating your first deal.</p>
                </div>
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
              <Button className="bg-gradient-primary">
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
                    />
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No companies found. Start by adding your first company.</p>
                </div>
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
              <Button className="bg-gradient-primary">
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
                    />
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No tasks found. Start by creating your first task.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CRM;