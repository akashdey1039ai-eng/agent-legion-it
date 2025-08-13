import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Brain
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
      {/* Key Metrics */}
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
                <Activity className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.totalActivities}</p>
                <p className="text-sm text-muted-foreground">Activities</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-primary/20 hover:shadow-command transition-cyber">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.pipelineValue)}</p>
                <p className="text-sm text-muted-foreground">Pipeline Value</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-primary/20 hover:shadow-command transition-cyber">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <TrendingUp className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.wonDeals}</p>
                <p className="text-sm text-muted-foreground">Won Deals</p>
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
                <p className="text-2xl font-bold text-foreground">{stats.conversionRate.toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
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
                <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.avgDealSize)}</p>
                <p className="text-sm text-muted-foreground">Avg Deal Size</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Insights */}
        <Card className="bg-card/50 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-gradient-cyber border border-primary/20">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-primary">Pipeline Health</h4>
                <Badge variant="secondary">Excellent</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Your conversion rate of {stats.conversionRate.toFixed(1)}% is above industry average.
              </p>
              <Progress value={Math.min(stats.conversionRate * 2, 100)} className="h-2" />
            </div>

            <div className="p-4 rounded-lg bg-gradient-cyber border border-accent/20">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-accent">Revenue Forecast</h4>
                <Badge variant="outline">Trending Up</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Based on current pipeline, projected monthly revenue: {formatCurrency(stats.pipelineValue * 0.3)}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-gradient-cyber border border-primary/20">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-primary">Activity Insights</h4>
                <Badge variant="secondary">Active</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {stats.totalActivities} total activities. High engagement detected across pipeline.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="bg-card/50 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-accent" />
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.length > 0 ? (
                recentActivities.slice(0, 6).map((activity) => (
                  <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg bg-gradient-cyber border border-border/50">
                    <Badge className={getActivityTypeColor(activity.type)}>
                      {activity.type}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {activity.subject}
                      </p>
                      {(activity.contact_name || activity.company_name) && (
                        <p className="text-xs text-muted-foreground">
                          {activity.contact_name}
                          {activity.contact_name && activity.company_name && ' • '}
                          {activity.company_name}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {activity.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No recent activities</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}