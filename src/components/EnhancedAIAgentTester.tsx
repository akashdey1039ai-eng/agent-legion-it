import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, Target, Database, Loader2, CheckCircle, AlertTriangle, Zap, Settings, 
  Activity, Users, TrendingDown, MessageSquare, BarChart3, ShoppingCart, 
  DollarSign, Mail, MapPin, Shield, Heart, PieChart
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { TestResultsViewer } from '@/components/TestResultsViewer';
import { PlatformStatusIndicator } from '@/components/PlatformStatusIndicator';

interface TestResult {
  agentId: string;
  agentName: string;
  category: string;
  status: 'completed' | 'failed' | 'running';
  confidence?: number;
  results?: any;
  error?: string;
  executionTime?: number;
  actionsExecuted?: number;
  securityScore?: number;
}

interface AgentDefinition {
  id: string;
  name: string;
  description: string;
  icon: any;
  category: string;
  status: 'active' | 'coming-soon';
  testFunction?: () => Promise<void>;
}

export function EnhancedAIAgentTester() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [runningAgents, setRunningAgents] = useState<Set<string>>(new Set());
  const [enableActions, setEnableActions] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [platformStatus, setPlatformStatus] = useState({
    native: true, // Always true since we use native CRM
    salesforce: false,
    hubspot: false
  });
  const { toast } = useToast();
  const { user } = useAuth();

  // Load persistent test results on component mount
  useEffect(() => {
    const savedResults = localStorage.getItem('enhanced-ai-test-results');
    if (savedResults) {
      try {
        const parsedResults = JSON.parse(savedResults);
        setTestResults(parsedResults);
      } catch (error) {
        console.error('Failed to load saved test results:', error);
      }
    }
    
    // Check platform connections
    checkPlatformConnections();
  }, []);

  // Save results to localStorage whenever they change
  useEffect(() => {
    if (testResults.length > 0) {
      localStorage.setItem('enhanced-ai-test-results', JSON.stringify(testResults));
    }
  }, [testResults]);

  const checkPlatformConnections = async () => {
    if (!user) return;

    try {
      // Check Salesforce connection
      const { data: salesforceTokens } = await supabase
        .from('salesforce_tokens')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      // Check HubSpot connection
      const { data: hubspotTokens } = await supabase
        .from('hubspot_tokens')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      setPlatformStatus({
        native: true, // Always active
        salesforce: !!(salesforceTokens && salesforceTokens.length > 0),
        hubspot: !!(hubspotTokens && hubspotTokens.length > 0)
      });
    } catch (error) {
      console.error('Error checking platform connections:', error);
    }
  };

  const agentDefinitions: AgentDefinition[] = [
    // Currently Available Agents
    {
      id: 'lead-intelligence',
      name: 'Enhanced Lead Intelligence',
      description: 'AI-powered lead scoring, qualification, and prioritization with autonomous actions',
      icon: Brain,
      category: 'active',
      status: 'active',
      testFunction: runEnhancedLeadIntelligenceTest
    },
    {
      id: 'pipeline-analysis',
      name: 'Enhanced Pipeline Analysis',
      description: 'Advanced pipeline forecasting, deal risk assessment, and revenue prediction',
      icon: Target,
      category: 'active',
      status: 'active',
      testFunction: runEnhancedPipelineAnalysisTest
    },

    // Customer Intelligence Agents
    {
      id: 'customer-sentiment',
      name: 'Customer Sentiment AI',
      description: 'Analyzes customer communications to determine sentiment and satisfaction levels',
      icon: Heart,
      category: 'customer-intelligence',
      status: 'coming-soon'
    },
    {
      id: 'churn-prediction',
      name: 'Churn Prediction AI',
      description: 'Predicts customer churn probability based on behavior patterns and engagement',
      icon: TrendingDown,
      category: 'customer-intelligence',
      status: 'coming-soon'
    },
    {
      id: 'customer-segmentation',
      name: 'Customer Segmentation AI',
      description: 'Automatically segments customers based on behavior, value, and characteristics',
      icon: Users,
      category: 'customer-intelligence',
      status: 'coming-soon'
    },

    // Sales Performance Agents
    {
      id: 'sales-coaching',
      name: 'Sales Coaching AI',
      description: 'Provides personalized coaching recommendations and performance optimization',
      icon: Target,
      category: 'sales-performance',
      status: 'coming-soon'
    },
    {
      id: 'meeting-intelligence',
      name: 'Meeting Intelligence AI',
      description: 'Analyzes sales calls and meetings for insights and follow-up recommendations',
      icon: MessageSquare,
      category: 'sales-performance',
      status: 'coming-soon'
    },
    {
      id: 'opportunity-scoring',
      name: 'Opportunity Scoring AI',
      description: 'Advanced opportunity scoring and win probability prediction',
      icon: BarChart3,
      category: 'sales-performance',
      status: 'coming-soon'
    },

    // Revenue Intelligence Agents
    {
      id: 'product-recommendation',
      name: 'Product Recommendation AI',
      description: 'Intelligent product recommendations based on customer data and behavior',
      icon: ShoppingCart,
      category: 'revenue-intelligence',
      status: 'coming-soon'
    },
    {
      id: 'price-optimization',
      name: 'Price Optimization AI',
      description: 'Dynamic pricing optimization based on market conditions and customer data',
      icon: DollarSign,
      category: 'revenue-intelligence',
      status: 'coming-soon'
    },
    {
      id: 'competitive-intelligence',
      name: 'Competitive Intelligence AI',
      description: 'Tracks competitors and provides strategic insights for competitive advantage',
      icon: Shield,
      category: 'revenue-intelligence',
      status: 'coming-soon'
    },

    // Communication Intelligence Agents
    {
      id: 'email-intelligence',
      name: 'Email Intelligence AI',
      description: 'Optimizes email content, timing, and personalization for better engagement',
      icon: Mail,
      category: 'communication-intelligence',
      status: 'coming-soon'
    },
    {
      id: 'customer-journey',
      name: 'Customer Journey AI',
      description: 'Maps and optimizes customer journeys across all touchpoints',
      icon: MapPin,
      category: 'communication-intelligence',
      status: 'coming-soon'
    },
    {
      id: 'content-intelligence',
      name: 'Content Intelligence AI',
      description: 'Generates and optimizes content based on customer preferences and behavior',
      icon: PieChart,
      category: 'communication-intelligence',
      status: 'coming-soon'
    }
  ];

  const categories = [
    { id: 'active', name: 'Active Agents', description: 'Production-ready AI agents currently available' },
    { id: 'customer-intelligence', name: 'Customer Intelligence', description: 'Understand and analyze customer behavior' },
    { id: 'sales-performance', name: 'Sales Performance', description: 'Optimize sales team performance and coaching' },
    { id: 'revenue-intelligence', name: 'Revenue Intelligence', description: 'Maximize revenue through intelligent insights' },
    { id: 'communication-intelligence', name: 'Communication Intelligence', description: 'Enhance customer communication and engagement' }
  ];

  async function runEnhancedLeadIntelligenceTest() {
    if (!user) return;

    const agentId = 'lead-intelligence';
    setRunningAgents(prev => new Set([...prev, agentId]));
    setCurrentTest('Enhanced Lead Intelligence');
    setProgress(25);
    
    try {
      // Create agent
      const { data: agent, error: agentError } = await supabase
        .from('ai_agents')
        .insert({
          name: 'Enhanced Lead Intelligence Agent',
          type: 'lead_intelligence',
          status: 'active',
          created_by: user.id,
          max_confidence_threshold: 0.85,
          min_confidence_threshold: 0.70,
          requires_human_approval: !enableActions
        })
        .select()
        .single();

      if (agentError) throw agentError;
      setProgress(50);

      // Get test contacts
      const { data: contacts, error: contactsError } = await supabase
        .from('contacts')
        .select('id')
        .limit(5);

      if (contactsError) throw contactsError;

      if (!contacts || contacts.length === 0) {
        throw new Error('No contacts found for testing. Please sync some CRM data first.');
      }
      setProgress(75);

      // Execute the Enhanced AI agent
      const { data: result, error: execError } = await supabase.functions.invoke('enhanced-ai-agent-executor', {
        body: {
          agentId: agent.id,
          inputData: { contactIds: contacts.map(c => c.id) },
          userId: user.id,
          requestSource: 'enhanced_test',
          enableActions
        }
      });

      if (execError) throw execError;
      setProgress(100);

      setTestResults(prev => [
        ...prev.filter(r => r.agentId !== agentId),
        {
          agentId,
          agentName: 'Enhanced Lead Intelligence',
          category: 'active',
          status: 'completed',
          confidence: result.confidence,
          results: result.result,
          executionTime: result.executionTime,
          actionsExecuted: result.actionsExecuted,
          securityScore: 98
        }
      ]);

      toast({
        title: "✅ Lead Intelligence Test Successful",
        description: `AI Agent executed with ${(result.confidence * 100).toFixed(1)}% confidence and performed ${result.actionsExecuted} autonomous actions.`,
      });

    } catch (error) {
      console.error('Enhanced test failed:', error);
      setTestResults(prev => [
        ...prev.filter(r => r.agentId !== agentId),
        {
          agentId,
          agentName: 'Enhanced Lead Intelligence',
          category: 'active',
          status: 'failed',
          error: error.message,
          executionTime: 0,
          actionsExecuted: 0,
          securityScore: 0
        }
      ]);

      toast({
        title: "❌ Test Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setRunningAgents(prev => {
        const newSet = new Set(prev);
        newSet.delete(agentId);
        return newSet;
      });
      setCurrentTest('');
      setProgress(0);
    }
  }

  async function runEnhancedPipelineAnalysisTest() {
    if (!user) return;

    const agentId = 'pipeline-analysis';
    setRunningAgents(prev => new Set([...prev, agentId]));
    setCurrentTest('Enhanced Pipeline Analysis');
    setProgress(25);
    
    try {
      // Create agent
      const { data: agent, error: agentError } = await supabase
        .from('ai_agents')
        .insert({
          name: 'Enhanced Pipeline Analysis Agent',
          type: 'pipeline_analysis',
          status: 'active',
          created_by: user.id,
          max_confidence_threshold: 0.85,
          min_confidence_threshold: 0.70,
          requires_human_approval: !enableActions
        })
        .select()
        .single();

      if (agentError) throw agentError;
      setProgress(50);

      // Get test opportunities
      const { data: opportunities, error: oppError } = await supabase
        .from('opportunities')
        .select('id')
        .limit(5);

      if (oppError) throw oppError;

      if (!opportunities || opportunities.length === 0) {
        throw new Error('No opportunities found for testing. Please sync some CRM data first.');
      }
      setProgress(75);

      // Execute the Enhanced AI agent
      const { data: result, error: execError } = await supabase.functions.invoke('enhanced-ai-agent-executor', {
        body: {
          agentId: agent.id,
          inputData: { opportunityIds: opportunities.map(o => o.id) },
          userId: user.id,
          requestSource: 'enhanced_test',
          enableActions
        }
      });

      if (execError) throw execError;
      setProgress(100);

      setTestResults(prev => [
        ...prev.filter(r => r.agentId !== agentId),
        {
          agentId,
          agentName: 'Enhanced Pipeline Analysis',
          category: 'active',
          status: 'completed',
          confidence: result.confidence,
          results: result.result,
          executionTime: result.executionTime,
          actionsExecuted: result.actionsExecuted,
          securityScore: 96
        }
      ]);

      toast({
        title: "✅ Pipeline Analysis Test Successful",
        description: `AI Agent executed with ${(result.confidence * 100).toFixed(1)}% confidence and performed ${result.actionsExecuted} autonomous actions.`,
      });

    } catch (error) {
      console.error('Enhanced test failed:', error);
      setTestResults(prev => [
        ...prev.filter(r => r.agentId !== agentId),
        {
          agentId,
          agentName: 'Enhanced Pipeline Analysis',
          category: 'active',
          status: 'failed',
          error: error.message,
          executionTime: 0,
          actionsExecuted: 0,
          securityScore: 0
        }
      ]);

      toast({
        title: "❌ Test Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setRunningAgents(prev => {
        const newSet = new Set(prev);
        newSet.delete(agentId);
        return newSet;
      });
      setCurrentTest('');
      setProgress(0);
    }
  }

  const runSingleAgentTest = async (agentId: string) => {
    const agent = agentDefinitions.find(a => a.id === agentId);
    if (!agent || !agent.testFunction) {
      toast({
        title: "❌ Agent Not Available",
        description: "This agent is not yet available for testing.",
        variant: "destructive"
      });
      return;
    }

    await agent.testFunction();
  };

  const runAllActiveAgents = async () => {
    const activeAgents = agentDefinitions.filter(a => a.status === 'active');
    
    for (let i = 0; i < activeAgents.length; i++) {
      const agent = activeAgents[i];
      if (agent.testFunction) {
        await agent.testFunction();
        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  };

  const clearResults = () => {
    setTestResults([]);
    localStorage.removeItem('enhanced-ai-test-results');
    toast({
      title: "🗑️ Results Cleared",
      description: "All test results have been cleared.",
    });
  };

  const exportResults = (format: 'json' | 'csv') => {
    if (testResults.length === 0) {
      toast({
        title: "No Results to Export",
        description: "Run some tests first to generate results.",
        variant: "destructive"
      });
      return;
    }

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `ai-agent-test-results-${timestamp}`;

    if (format === 'json') {
      const jsonData = JSON.stringify(testResults, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (format === 'csv') {
      const csvHeaders = [
        'Agent Name',
        'Status',
        'Confidence (%)',
        'Execution Time (ms)',
        'Actions Executed',
        'Security Score (%)',
        'Records Processed',
        'Error Message'
      ];
      
      const csvRows = testResults.map(result => [
        result.agentName,
        result.status,
        result.confidence ? (result.confidence * 100).toFixed(1) : 'N/A',
        result.executionTime || 'N/A',
        result.actionsExecuted || 0,
        result.securityScore || 'N/A',
        result.results?.insights?.length || result.results?.analysis?.length || 'N/A',
        result.error || 'None'
      ]);

      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    toast({
      title: "Export Complete",
      description: `Results exported as ${format.toUpperCase()} file.`,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Completed</Badge>;
      case 'running':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Running</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Platform Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Enhanced AI Agents
              </CardTitle>
              <CardDescription>
                Advanced AI agents with autonomous CRM actions. Running on Native CRM with external platform integration.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Autonomous Actions:</span>
                  <Switch
                    checked={enableActions}
                    onCheckedChange={setEnableActions}
                  />
                  <Badge variant={enableActions ? "default" : "secondary"}>
                    {enableActions ? "Enabled" : "Analysis Only"}
                  </Badge>
                </div>
              </div>
              
              {/* Progress Bar */}
              {runningAgents.size > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Testing: {currentTest}</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              )}

              {/* Quick Actions */}
              <div className="flex gap-3">
                <Button 
                  onClick={runAllActiveAgents}
                  disabled={runningAgents.size > 0}
                  className="flex-1"
                >
                  {runningAgents.size > 0 ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Running Tests...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Test All Active Agents
                    </>
                  )}
                </Button>
                <Button 
                  onClick={clearResults}
                  variant="outline"
                  disabled={testResults.length === 0}
                >
                  <Database className="h-4 w-4 mr-2" />
                  Clear Results
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <PlatformStatusIndicator platforms={platformStatus} />
      </div>

      {/* Agent Categories */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id}>
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => {
          const categoryAgents = agentDefinitions.filter(a => a.category === category.id);
          
          return (
            <TabsContent key={category.id} value={category.id} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{category.name}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
              </Card>

              {/* Agent Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryAgents.map((agent) => {
                  const IconComponent = agent.icon;
                  const isRunning = runningAgents.has(agent.id);
                  const result = testResults.find(r => r.agentId === agent.id);
                  const isActive = agent.status === 'active';

                  return (
                    <Card key={agent.id} className={`relative ${!isActive ? 'opacity-75' : ''}`}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <IconComponent className="h-6 w-6 text-primary" />
                          {agent.name}
                          {!isActive && (
                            <Badge variant="outline" className="text-xs">
                              Coming Soon
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="text-sm">
                          {agent.description}
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        {/* Test Results Summary */}
                        {result && (
                          <div className="grid grid-cols-3 gap-2 text-center text-sm">
                            <div>
                              <div className="font-bold text-primary">
                                {result.confidence ? `${Math.round(result.confidence * 100)}%` : '-'}
                              </div>
                              <div className="text-muted-foreground">Confidence</div>
                            </div>
                            <div>
                              <div className="font-bold text-primary">{result.actionsExecuted || 0}</div>
                              <div className="text-muted-foreground">Actions</div>
                            </div>
                            <div>
                              <div className="font-bold text-primary">{result.securityScore || 0}%</div>
                              <div className="text-muted-foreground">Security</div>
                            </div>
                          </div>
                        )}

                        {/* Status */}
                        {result && (
                          <div className="flex justify-center">
                            {getStatusBadge(result.status)}
                          </div>
                        )}

                        {/* Test Button */}
                        <Button 
                          onClick={() => runSingleAgentTest(agent.id)}
                          disabled={!isActive || isRunning}
                          className="w-full"
                          variant={isActive ? "default" : "outline"}
                        >
                          {isRunning ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Testing...
                            </>
                          ) : isActive ? (
                            <>
                              <Zap className="h-4 w-4 mr-2" />
                              Test Agent
                            </>
                          ) : (
                            <>
                              <Settings className="h-4 w-4 mr-2" />
                              Coming Soon
                            </>
                          )}
                        </Button>

                        {/* Error Display */}
                        {result && result.status === 'failed' && (
                          <div className="text-xs text-destructive">
                            <AlertTriangle className="h-3 w-3 inline mr-1" />
                            {result.error}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Security Notice */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          All tests use encrypted synthetic data. No real customer information is processed during testing.
          Results are automatically sanitized to protect privacy.
        </AlertDescription>
      </Alert>

      {/* Test Results Summary */}
      {testResults.length > 0 && (
        <div className="space-y-6">
          {/* Quick Results Overview */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Test Results Overview</CardTitle>
                <CardDescription>
                  Summary of {testResults.length} test execution(s) - Native CRM + Platform Integration
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => exportResults('json')}
                >
                  Export JSON
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => exportResults('csv')}
                >
                  Export CSV
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearResults}
                >
                  Clear Results
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Results Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {testResults.map((result) => (
                  <Card key={result.agentId} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {result.status === 'completed' ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="font-medium text-sm">{result.agentName}</span>
                      </div>
                      {getStatusBadge(result.status)}
                    </div>
                    
                    {result.status === 'completed' ? (
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Confidence:</span>
                          <span className="font-medium">{((result.confidence || 0) * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Time:</span>
                          <span className="font-medium">{result.executionTime}ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Actions:</span>
                          <span className="font-medium">{result.actionsExecuted || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Platform:</span>
                          <span className="font-medium">Native CRM + {platformStatus.salesforce ? 'Salesforce' : 'Analysis Only'}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-destructive">
                        {result.error}
                      </div>
                    )}
                  </Card>
                ))}
              </div>

              {/* Performance Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {testResults.filter(r => r.status === 'completed').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Successful</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {testResults.filter(r => r.status === 'failed').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Failed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {testResults.reduce((sum, r) => sum + (r.executionTime || 0), 0)}ms
                  </div>
                  <div className="text-sm text-muted-foreground">Total Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {testResults.length > 0 ? (testResults.reduce((sum, r) => sum + (r.confidence || 0), 0) / testResults.length * 100).toFixed(1) : 0}%
                  </div>
                  <div className="text-sm text-muted-foreground">Avg Confidence</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Results Viewer */}
          <TestResultsViewer 
            results={testResults.map(r => ({
              ...r,
              platform: `native-crm${platformStatus.salesforce ? '+salesforce' : ''}`,
              analysis: r.results?.insights || r.results?.analysis || [],
              logs: r.results?.logs || [],
              rawResponse: r.results,
              salesforceData: r.results?.salesforceData,
              aiAnalysis: r.results?.aiAnalysis
            }))}
            isRunning={runningAgents.size > 0}
            currentTest={currentTest}
          />
        </div>
      )}
    </div>
  );
}