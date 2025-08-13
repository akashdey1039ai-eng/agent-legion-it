import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Bot, Brain, Database, Shield, TrendingUp, Zap, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface AIAgent {
  id: string;
  name: string;
  type: string;
  status: string;
  version: string;
  security_level: string;
  max_confidence_threshold: number;
  min_confidence_threshold: number;
  requires_human_approval: boolean;
  created_at: string;
  last_activity_at?: string;
}

interface SecurityEvent {
  id: string;
  event_type: string;
  severity: string;
  description: string;
  detected_at: string;
}

interface PerformanceMetrics {
  total_executions: number;
  successful_executions: number;
  failed_executions: number;
  avg_confidence_score: number;
  avg_execution_time_ms: number;
}

export function AIAgentDashboard() {
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [executionResults, setExecutionResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      // Load AI agents
      const { data: agentsData, error: agentsError } = await supabase
        .from('ai_agents')
        .select('*')
        .order('created_at', { ascending: false });

      if (agentsError) throw agentsError;
      setAgents(agentsData || []);

      // Load security events (last 10)
      const { data: securityData, error: securityError } = await supabase
        .from('ai_security_events')
        .select('*')
        .order('detected_at', { ascending: false })
        .limit(10);

      if (securityError) throw securityError;
      setSecurityEvents(securityData || []);

      // Load performance metrics
      const { data: metricsData, error: metricsError } = await supabase
        .from('ai_performance_metrics')
        .select('*')
        .gte('metric_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

      if (metricsError) throw metricsError;
      
      if (metricsData && metricsData.length > 0) {
        const aggregated = metricsData.reduce((acc, metric) => ({
          total_executions: acc.total_executions + metric.total_executions,
          successful_executions: acc.successful_executions + metric.successful_executions,
          failed_executions: acc.failed_executions + metric.failed_executions,
          avg_confidence_score: (acc.avg_confidence_score + metric.avg_confidence_score) / 2,
          avg_execution_time_ms: (acc.avg_execution_time_ms + metric.avg_execution_time_ms) / 2,
        }), {
          total_executions: 0,
          successful_executions: 0,
          failed_executions: 0,
          avg_confidence_score: 0,
          avg_execution_time_ms: 0,
        });
        setMetrics(aggregated);
      }

      // Load recent execution results
      const { data: executions, error: execError } = await supabase
        .from('ai_agent_executions')
        .select(`
          id, 
          agent_id, 
          output_data, 
          confidence_score, 
          execution_time_ms, 
          completed_at,
          ai_agents!inner(name, type)
        `)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(10);

      if (!execError && executions) {
        setExecutionResults(executions);
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error Loading Data",
        description: "Failed to load AI agent dashboard data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createAgent = async (type: string, name: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('ai_agents')
        .insert({
          name,
          type,
          created_by: user.id,
          config: getDefaultConfig(type)
        })
        .select()
        .single();

      if (error) throw error;

      setAgents(prev => [data, ...prev]);
      toast({
        title: "Agent Created",
        description: `${name} has been created successfully.`,
      });
    } catch (error) {
      console.error('Error creating agent:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create AI agent.",
        variant: "destructive",
      });
    }
  };

  const executeAgent = async (agentId: string, inputData: any) => {
    if (!user) return;

    try {
      // Get real data based on agent type
      const { data: agent } = await supabase
        .from('ai_agents')
        .select('type')
        .eq('id', agentId)
        .single();

      let realInputData;
      
      if (agent?.type === 'lead_intelligence') {
        // Get real contact IDs
        const { data: contacts } = await supabase
          .from('contacts')
          .select('id')
          .limit(3);
        
        if (!contacts || contacts.length === 0) {
          throw new Error('No contacts found. Please sync some Salesforce data first.');
        }
        
        realInputData = { contactIds: contacts.map(c => c.id) };
      } else if (agent?.type === 'pipeline_analysis') {
        // Get real opportunity IDs
        const { data: opportunities } = await supabase
          .from('opportunities')
          .select('id')
          .limit(3);
        
        if (!opportunities || opportunities.length === 0) {
          throw new Error('No opportunities found. Please sync some Salesforce data first.');
        }
        
        realInputData = { opportunityIds: opportunities.map(o => o.id) };
      } else {
        throw new Error('Unknown agent type');
      }

      const { data, error } = await supabase.functions.invoke('ai-agent-executor', {
        body: {
          agentId,
          inputData: realInputData,
          userId: user.id,
          requestSource: 'dashboard'
        }
      });

      if (error) throw error;

      toast({
        title: "Agent Executed",
        description: `Execution completed with ${(data.confidence * 100).toFixed(1)}% confidence.`,
      });

      // Reload dashboard data to show new results
      loadDashboardData();
    } catch (error) {
      console.error('Error executing agent:', error);
      toast({
        title: "Execution Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getDefaultConfig = (type: string) => {
    switch (type) {
      case 'lead_intelligence':
        return {
          scoring_factors: ['title', 'department', 'lead_source', 'completeness'],
          weights: { title: 0.3, department: 0.25, lead_source: 0.25, completeness: 0.2 }
        };
      case 'pipeline_analysis':
        return {
          risk_factors: ['age', 'close_date', 'stage_probability_mismatch'],
          thresholds: { high_risk: 60, medium_risk: 30 }
        };
      default:
        return {};
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'testing': return 'secondary';
      case 'paused': return 'outline';
      case 'draft': return 'secondary';
      default: return 'outline';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">AI Agent Control Center</h2>
          <p className="text-muted-foreground">Production-ready AI agents for your CRM</p>
        </div>
        <Button 
          onClick={() => createAgent('lead_intelligence', 'Lead Intelligence Agent')}
          className="flex items-center gap-2"
        >
          <Bot className="h-4 w-4" />
          Create Agent
        </Button>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{agents.length}</p>
                <p className="text-sm text-muted-foreground">Active Agents</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <TrendingUp className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{metrics?.total_executions || 0}</p>
                <p className="text-sm text-muted-foreground">Total Executions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {metrics?.avg_confidence_score ? (metrics.avg_confidence_score * 100).toFixed(1) : 0}%
                </p>
                <p className="text-sm text-muted-foreground">Avg Confidence</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <Shield className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {securityEvents.filter(e => e.severity === 'high' || e.severity === 'critical').length}
                </p>
                <p className="text-sm text-muted-foreground">Security Alerts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Agents */}
      <Card className="bg-card/50 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            AI Agents
          </CardTitle>
          <CardDescription>
            Manage and monitor your production AI agents
          </CardDescription>
        </CardHeader>
        <CardContent>
          {agents.length === 0 ? (
            <div className="text-center py-8">
              <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No AI agents created yet.</p>
              <Button 
                onClick={() => createAgent('lead_intelligence', 'Lead Intelligence Agent')}
                className="mt-4"
              >
                Create Your First Agent
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {agents.map((agent) => (
                <div key={agent.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      {agent.type === 'lead_intelligence' && <Brain className="h-5 w-5 text-primary" />}
                      {agent.type === 'pipeline_analysis' && <TrendingUp className="h-5 w-5 text-primary" />}
                      {agent.type === 'data_enrichment' && <Database className="h-5 w-5 text-primary" />}
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{agent.name}</h4>
                      <p className="text-sm text-muted-foreground capitalize">
                        {agent.type.replace('_', ' ')} • Version {agent.version}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={getStatusColor(agent.status)}>
                      {agent.status}
                    </Badge>
                    <Button
                      size="sm"
                      onClick={() => executeAgent(agent.id, {})}
                      disabled={agent.status !== 'active'}
                    >
                      Execute
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Events */}
      {securityEvents.length > 0 && (
        <Card className="bg-card/50 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Security Events
            </CardTitle>
            <CardDescription>
              Recent security events and alerts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {securityEvents.slice(0, 5).map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className={`h-4 w-4 ${getSeverityColor(event.severity)}`} />
                    <div>
                      <p className="font-medium text-foreground">{event.event_type.replace('_', ' ')}</p>
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className={getSeverityColor(event.severity)}>
                      {event.severity}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(event.detected_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Execution Results */}
      {executionResults.length > 0 && (
        <Card className="bg-card/50 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              Recent Execution Results
            </CardTitle>
            <CardDescription>
              Latest AI agent analysis results and insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {executionResults.map((execution) => (
                <div key={execution.id} className="border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-foreground">
                        {execution.ai_agents.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {execution.ai_agents.type.replace('_', ' ')} • 
                        Confidence: {((execution.confidence_score || 0) * 100).toFixed(1)}% • 
                        {execution.execution_time_ms}ms
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(execution.completed_at).toLocaleString()}
                    </div>
                  </div>

                  {execution.output_data && (
                    <div className="space-y-4">
                      {execution.output_data.summary && (
                        <div>
                          <h5 className="font-medium text-foreground mb-2">Summary</h5>
                          <p className="text-sm text-muted-foreground">{execution.output_data.summary}</p>
                        </div>
                      )}

                      {execution.output_data.analysis && Array.isArray(execution.output_data.analysis) && (
                        <div>
                          <h5 className="font-medium text-foreground mb-3">Analysis Results</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {execution.output_data.analysis.slice(0, 6).map((item: any, index: number) => (
                              <div key={index} className="bg-muted/50 rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <h6 className="font-medium text-sm">
                                    {item.name || `Item ${index + 1}`}
                                  </h6>
                                  {item.newScore && (
                                    <Badge variant="outline">
                                      Score: {item.newScore}
                                    </Badge>
                                  )}
                                  {item.riskScore && (
                                    <Badge variant={item.riskLevel === 'High' ? 'destructive' : 
                                                 item.riskLevel === 'Medium' ? 'secondary' : 'default'}>
                                      {item.riskLevel} Risk
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground mb-2">
                                  {item.recommendation}
                                </p>
                                {item.factors && item.factors.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {item.factors.map((factor: string, i: number) => (
                                      <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                        {factor}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                          {execution.output_data.analysis.length > 6 && (
                            <p className="text-sm text-muted-foreground mt-2">
                              And {execution.output_data.analysis.length - 6} more results...
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}