import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Download, 
  Filter,
  DollarSign,
  Users,
  Target,
  Calendar,
  Building2
} from "lucide-react";

interface SalesMetrics {
  totalRevenue: number;
  totalDeals: number;
  averageDealSize: number;
  conversionRate: number;
  winRate: number;
  salesCycle: number;
}

interface PipelineData {
  stage: string;
  count: number;
  value: number;
}

interface LeadSourceData {
  source: string;
  count: number;
  percentage: number;
}

interface MonthlyTrend {
  month: string;
  deals: number;
  revenue: number;
}

export function CRMReports() {
  const [salesMetrics, setSalesMetrics] = useState<SalesMetrics>({
    totalRevenue: 0,
    totalDeals: 0,
    averageDealSize: 0,
    conversionRate: 0,
    winRate: 0,
    salesCycle: 0
  });
  const [pipelineData, setPipelineData] = useState<PipelineData[]>([]);
  const [leadSources, setLeadSources] = useState<LeadSourceData[]>([]);
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchReportsData();
  }, []);

  const fetchReportsData = async () => {
    try {
      setLoading(true);

      // Fetch deals data
      const { data: deals } = await supabase
        .from('deals')
        .select('*');

      // Fetch leads data
      const { data: leads } = await supabase
        .from('leads')
        .select('*');

      if (deals) {
        // Calculate sales metrics
        const closedWonDeals = deals.filter(deal => deal.stage === 'Closed Won');
        const totalRevenue = closedWonDeals.reduce((sum, deal) => sum + (Number(deal.amount) || 0), 0);
        const totalDeals = deals.length;
        const averageDealSize = totalDeals > 0 ? totalRevenue / closedWonDeals.length : 0;
        const winRate = totalDeals > 0 ? (closedWonDeals.length / totalDeals) * 100 : 0;
        const conversionRate = leads && totalDeals > 0 ? (totalDeals / leads.length) * 100 : 0;

        setSalesMetrics({
          totalRevenue,
          totalDeals,
          averageDealSize,
          conversionRate,
          winRate,
          salesCycle: 30 // Example: 30 days average
        });

        // Calculate pipeline data
        const stageGroups = deals.reduce((acc, deal) => {
          const stage = deal.stage || 'Unknown';
          if (!acc[stage]) {
            acc[stage] = { count: 0, value: 0 };
          }
          acc[stage].count++;
          acc[stage].value += Number(deal.amount) || 0;
          return acc;
        }, {} as Record<string, { count: number; value: number }>);

        const pipelineArray = Object.entries(stageGroups).map(([stage, data]) => ({
          stage,
          count: data.count,
          value: data.value
        }));

        setPipelineData(pipelineArray);

        // Calculate monthly trends (last 6 months)
        const monthlyData = Array.from({ length: 6 }, (_, i) => {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const monthStr = date.toISOString().slice(0, 7); // YYYY-MM format
          
          const monthDeals = deals.filter(deal => 
            deal.created_at.slice(0, 7) === monthStr
          );
          
          const monthRevenue = monthDeals
            .filter(deal => deal.stage === 'Closed Won')
            .reduce((sum, deal) => sum + (Number(deal.amount) || 0), 0);

          return {
            month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            deals: monthDeals.length,
            revenue: monthRevenue
          };
        }).reverse();

        setMonthlyTrends(monthlyData);
      }

      if (leads) {
        // Calculate lead source data
        const sourceGroups = leads.reduce((acc, lead) => {
          const source = lead.lead_source || 'Unknown';
          acc[source] = (acc[source] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const total = leads.length;
        const sourceArray = Object.entries(sourceGroups).map(([source, count]) => ({
          source,
          count,
          percentage: total > 0 ? (count / total) * 100 : 0
        }));

        setLeadSources(sourceArray);
      }

    } catch (error) {
      console.error('Error fetching reports data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch reports data",
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
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-6 bg-muted rounded mb-4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Reports & Analytics</h2>
          <p className="text-muted-foreground">
            Insights and performance metrics for your sales team
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-muted-foreground">Total Revenue</span>
            </div>
            <div className="text-2xl font-bold">{formatCurrency(salesMetrics.totalRevenue)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-muted-foreground">Total Deals</span>
            </div>
            <div className="text-2xl font-bold">{formatNumber(salesMetrics.totalDeals)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-muted-foreground">Avg Deal Size</span>
            </div>
            <div className="text-2xl font-bold">{formatCurrency(salesMetrics.averageDealSize)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-muted-foreground">Win Rate</span>
            </div>
            <div className="text-2xl font-bold">{salesMetrics.winRate.toFixed(1)}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-cyan-600" />
              <span className="text-sm font-medium text-muted-foreground">Conversion Rate</span>
            </div>
            <div className="text-2xl font-bold">{salesMetrics.conversionRate.toFixed(1)}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-pink-600" />
              <span className="text-sm font-medium text-muted-foreground">Sales Cycle</span>
            </div>
            <div className="text-2xl font-bold">{salesMetrics.salesCycle} days</div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports */}
      <Tabs defaultValue="pipeline" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pipeline">Pipeline Analysis</TabsTrigger>
          <TabsTrigger value="trends">Monthly Trends</TabsTrigger>
          <TabsTrigger value="sources">Lead Sources</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Sales Pipeline by Stage
              </CardTitle>
              <CardDescription>
                Distribution of deals across different pipeline stages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pipelineData.map((stage, index) => {
                  const maxValue = Math.max(...pipelineData.map(s => s.value));
                  const percentage = maxValue > 0 ? (stage.value / maxValue) * 100 : 0;
                  
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{stage.stage}</span>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{stage.count} deals</span>
                          <span>{formatCurrency(stage.value)}</span>
                        </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Monthly Performance Trends
              </CardTitle>
              <CardDescription>
                Deal volume and revenue trends over the last 6 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {monthlyTrends.map((month, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <div className="font-medium">{month.month}</div>
                      <div className="text-sm text-muted-foreground">{month.deals} deals closed</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{formatCurrency(month.revenue)}</div>
                      <div className="text-sm text-muted-foreground">revenue</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sources" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Lead Sources Analysis
              </CardTitle>
              <CardDescription>
                Where your leads are coming from
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leadSources.map((source, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-primary rounded-full" />
                      <span className="font-medium">{source.source}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">{source.count} leads</span>
                      <Badge variant="outline">{source.percentage.toFixed(1)}%</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Team Performance Summary
              </CardTitle>
              <CardDescription>
                Overall CRM performance indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Sales Performance</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Revenue Target</span>
                      <span className="font-medium">$1.2M</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Revenue Achieved</span>
                      <span className="font-medium">{formatCurrency(salesMetrics.totalRevenue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Achievement Rate</span>
                      <span className="font-medium">
                        {((salesMetrics.totalRevenue / 1200000) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">Activity Metrics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Avg Sales Cycle</span>
                      <span className="font-medium">{salesMetrics.salesCycle} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Win Rate</span>
                      <span className="font-medium">{salesMetrics.winRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Lead Conversion</span>
                      <span className="font-medium">{salesMetrics.conversionRate.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}