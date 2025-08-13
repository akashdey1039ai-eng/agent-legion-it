import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  Building2, 
  Target, 
  Activity, 
  TrendingUp, 
  DollarSign,
  Calendar,
  Brain,
  Database
} from "lucide-react";

interface DashboardStats {
  totalCompanies: number;
  totalContacts: number;
  totalOpportunities: number;
  totalActivities: number;
  pipelineValue: number;
  wonDeals: number;
  conversionRate: number;
  avgDealSize: number;
}


interface RecentActivity {
  id: string;
  type: string;
  subject: string;
  status: string;
  created_at: string;
  contact_name?: string;
  company_name?: string;
}

export function CrmDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCompanies: 0,
    totalContacts: 0,
    totalOpportunities: 0,
    totalActivities: 0,
    pipelineValue: 0,
    wonDeals: 0,
    conversionRate: 0,
    avgDealSize: 0
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch basic counts
      const [companiesResult, contactsResult, opportunitiesResult, activitiesResult] = await Promise.all([
        supabase.from('companies').select('*', { count: 'exact' }),
        supabase.from('contacts').select('*', { count: 'exact' }),
        supabase.from('opportunities').select('*'),
        supabase.from('activities').select('*', { count: 'exact' })
      ]);

      const opportunities = opportunitiesResult.data || [];
      const pipelineValue = opportunities.reduce((sum, opp) => sum + (Number(opp.amount) || 0), 0);
      const wonDeals = opportunities.filter(opp => opp.stage === 'closed_won').length;
      const avgDealSize = wonDeals > 0 ? pipelineValue / opportunities.length : 0;
      const conversionRate = opportunities.length > 0 ? (wonDeals / opportunities.length) * 100 : 0;

      setStats({
        totalCompanies: companiesResult.count || 0,
        totalContacts: contactsResult.count || 0,
        totalOpportunities: opportunities.length,
        totalActivities: activitiesResult.count || 0,
        pipelineValue,
        wonDeals,
        conversionRate,
        avgDealSize
      });

      // Fetch recent activities 
      const { data: activities } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      const formattedActivities: RecentActivity[] = (activities || []).map(activity => ({
        id: activity.id,
        type: activity.type,
        subject: activity.subject,
        status: activity.status,
        created_at: activity.created_at
      }));

      setRecentActivities(formattedActivities);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getActivityTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'call': return 'bg-primary/10 text-primary';
      case 'meeting': return 'bg-accent/10 text-accent';
      case 'email': return 'bg-secondary/10 text-secondary-foreground';
      case 'task': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="bg-card/50 border-primary/20">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded mb-2" />
                  <div className="h-8 bg-muted rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Essential Metrics Only */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-primary/20 hover:shadow-command transition-cyber">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.totalCompanies}</p>
                <p className="text-sm text-muted-foreground">Companies</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-primary/20 hover:shadow-command transition-cyber">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <Users className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.totalContacts}</p>
                <p className="text-sm text-muted-foreground">Contacts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-primary/20 hover:shadow-command transition-cyber">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.totalOpportunities}</p>
                <p className="text-sm text-muted-foreground">Opportunities</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-primary/20 hover:shadow-command transition-cyber">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <DollarSign className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.pipelineValue)}</p>
                <p className="text-sm text-muted-foreground">Pipeline Value</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sync Status & Quick Actions */}
      {stats.totalContacts === 0 && stats.totalOpportunities === 0 && (
        <Card className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
          <CardContent className="p-6 text-center">
            <Database className="h-12 w-12 text-amber-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-2">
              No Salesforce Data Found
            </h3>
            <p className="text-amber-700 dark:text-amber-300 mb-4">
              Connect your Salesforce Developer Sandbox and sync data to see insights and enable AI agents.
            </p>
            <Button variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-100">
              <Database className="h-4 w-4 mr-2" />
              Go to Salesforce Integration
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}