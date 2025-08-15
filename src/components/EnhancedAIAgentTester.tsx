import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Brain, Target, Database, Loader2, CheckCircle, AlertTriangle, Zap, Settings, Activity, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface TestResult {
  type: string;
  success: boolean;
  confidence?: number;
  results?: any;
  error?: string;
  executionTime?: number;
  actionsExecuted?: number;
}

export function EnhancedAIAgentTester() {
  const [isRunningLeadIntelligence, setIsRunningLeadIntelligence] = useState(false);
  const [isRunningPipelineAnalysis, setIsRunningPipelineAnalysis] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [enableActions, setEnableActions] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Clear test results on component mount
  useEffect(() => {
    setTestResults([]);
  }, []);

  const runEnhancedLeadIntelligenceTest = async () => {
    if (!user) return;

    setIsRunningLeadIntelligence(true);
    
    try {
      // First, create a test agent
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

      // Get some test contacts
      const { data: contacts, error: contactsError } = await supabase
        .from('contacts')
        .select('id')
        .limit(5);

      if (contactsError) throw contactsError;

      if (!contacts || contacts.length === 0) {
        throw new Error('No contacts found for testing. Please sync some Salesforce data first.');
      }

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

      setTestResults(prev => [...prev, {
        type: 'Enhanced Lead Intelligence',
        success: true,
        confidence: result.confidence,
        results: result.result,
        executionTime: result.executionTime,
        actionsExecuted: result.actionsExecuted
      }]);

      toast({
        title: "🚀 Enhanced Test Successful",
        description: `AI Agent executed with ${(result.confidence * 100).toFixed(1)}% confidence and performed ${result.actionsExecuted} autonomous actions.`,
      });

    } catch (error) {
      console.error('Enhanced test failed:', error);
      setTestResults(prev => [...prev, {
        type: 'Enhanced Lead Intelligence',
        success: false,
        error: error.message
      }]);

      toast({
        title: "Enhanced Test Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsRunningLeadIntelligence(false);
    }
  };

  const runEnhancedPipelineAnalysisTest = async () => {
    if (!user) return;

    setIsRunningPipelineAnalysis(true);
    
    try {
      // Create a test pipeline analysis agent
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

      // Get some test opportunities
      const { data: opportunities, error: oppsError } = await supabase
        .from('opportunities')
        .select('id')
        .limit(5);

      if (oppsError) throw oppsError;

      if (!opportunities || opportunities.length === 0) {
        throw new Error('No opportunities found for testing. Please sync some Salesforce data first.');
      }

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

      setTestResults(prev => [...prev, {
        type: 'Enhanced Pipeline Analysis',
        success: true,
        confidence: result.confidence,
        results: result.result,
        executionTime: result.executionTime,
        actionsExecuted: result.actionsExecuted
      }]);

      toast({
        title: "🚀 Enhanced Test Successful",
        description: `AI Agent executed with ${(result.confidence * 100).toFixed(1)}% confidence and performed ${result.actionsExecuted} autonomous actions.`,
      });

    } catch (error) {
      console.error('Enhanced test failed:', error);
      setTestResults(prev => [...prev, {
        type: 'Enhanced Pipeline Analysis',
        success: false,
        error: error.message
      }]);

      toast({
        title: "Enhanced Test Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsRunningPipelineAnalysis(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <Card className="bg-card/50 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Enhanced AI Agent Testing Suite
        </CardTitle>
        <CardDescription>
          Test production-ready AI agents with OpenAI-powered intelligence and autonomous actions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Action Toggle */}
        <div className="flex items-center justify-between p-4 bg-gradient-cyber border border-primary/20 rounded-lg">
          <div className="flex items-center gap-3">
            <Settings className="h-5 w-5 text-primary" />
            <div>
              <h4 className="font-semibold text-foreground">Autonomous Actions</h4>
              <p className="text-sm text-muted-foreground">
                Enable agents to automatically update Salesforce records and create tasks
              </p>
            </div>
          </div>
          <Switch
            checked={enableActions}
            onCheckedChange={setEnableActions}
            className="data-[state=checked]:bg-primary"
          />
        </div>

        {/* Test Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            onClick={runEnhancedLeadIntelligenceTest}
            disabled={isRunningLeadIntelligence || isRunningPipelineAnalysis}
            className="flex items-center gap-2 h-20 flex-col"
          >
            {isRunningLeadIntelligence ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <Brain className="h-6 w-6" />
            )}
            <span>Enhanced Lead Intelligence</span>
            <span className="text-xs opacity-80">
              {enableActions ? "With Actions" : "Analysis Only"}
            </span>
          </Button>

          <Button
            onClick={runEnhancedPipelineAnalysisTest}
            disabled={isRunningLeadIntelligence || isRunningPipelineAnalysis}
            variant="outline"
            className="flex items-center gap-2 h-20 flex-col"
          >
            {isRunningPipelineAnalysis ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <Target className="h-6 w-6" />
            )}
            <span>Enhanced Pipeline Analysis</span>
            <span className="text-xs opacity-80">
              {enableActions ? "With Actions" : "Analysis Only"}
            </span>
          </Button>

          <Button
            onClick={clearResults}
            variant="outline"
            className="flex items-center gap-2 h-20 flex-col"
            disabled={testResults.length === 0}
          >
            <Database className="h-6 w-6" />
            <span>Clear Results</span>
          </Button>
        </div>

        {/* Additional AI Agents Showcase */}
        <div className="space-y-6">
          <h4 className="font-semibold text-foreground text-lg">🚀 Complete AI Agent Intelligence Suite</h4>
          
          {/* Currently Available Agents */}
          <div>
            <h5 className="font-medium text-foreground mb-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Currently Available Agents
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <Brain className="h-6 w-6 text-primary" />
                    <div>
                      <CardTitle className="text-base">Enhanced Lead Intelligence</CardTitle>
                      <CardDescription className="text-sm">Active & Ready</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>• AI-powered lead scoring and qualification</p>
                    <p>• Autonomous lead prioritization</p>
                    <p>• Intelligent next action recommendations</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <Target className="h-6 w-6 text-accent" />
                    <div>
                      <CardTitle className="text-base">Enhanced Pipeline Analysis</CardTitle>
                      <CardDescription className="text-sm">Active & Ready</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>• Advanced pipeline forecasting</p>
                    <p>• Deal risk assessment</p>
                    <p>• Revenue prediction algorithms</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Coming Soon - Customer Intelligence */}
          <div>
            <h5 className="font-medium text-foreground mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              Customer Intelligence Agents (Coming Soon)
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-success/5 to-success/10 border-success/20 opacity-75">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <Activity className="h-6 w-6 text-success" />
                    <div>
                      <CardTitle className="text-base">Customer Sentiment AI</CardTitle>
                      <CardDescription className="text-sm">In Development</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>• Email sentiment analysis</p>
                    <p>• Customer satisfaction scoring</p>
                    <p>• Communication tone detection</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-warning/5 to-warning/10 border-warning/20 opacity-75">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-6 w-6 text-warning" />
                    <div>
                      <CardTitle className="text-base">Churn Prediction AI</CardTitle>
                      <CardDescription className="text-sm">In Development</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>• Churn risk identification</p>
                    <p>• Retention strategy recommendations</p>
                    <p>• Customer health monitoring</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-blue-500/20 opacity-75">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <Users className="h-6 w-6 text-blue-500" />
                    <div>
                      <CardTitle className="text-base">Customer Segmentation AI</CardTitle>
                      <CardDescription className="text-sm">In Development</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>• Behavioral segmentation</p>
                    <p>• Predictive customer groups</p>
                    <p>• Personalization insights</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Coming Soon - Sales Performance */}
          <div>
            <h5 className="font-medium text-foreground mb-3 flex items-center gap-2">
              <Settings className="h-4 w-4 text-purple-500" />
              Sales Performance Agents (Coming Soon)
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-purple-500/5 to-purple-500/10 border-purple-500/20 opacity-75">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <Settings className="h-6 w-6 text-purple-500" />
                    <div>
                      <CardTitle className="text-base">Sales Coaching AI</CardTitle>
                      <CardDescription className="text-sm">In Development</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>• Performance analysis</p>
                    <p>• Coaching recommendations</p>
                    <p>• Skill gap identification</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500/5 to-orange-500/10 border-orange-500/20 opacity-75">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <Activity className="h-6 w-6 text-orange-500" />
                    <div>
                      <CardTitle className="text-base">Meeting Intelligence AI</CardTitle>
                      <CardDescription className="text-sm">In Development</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>• Call transcription & summary</p>
                    <p>• Action item extraction</p>
                    <p>• Follow-up recommendations</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-teal-500/5 to-teal-500/10 border-teal-500/20 opacity-75">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <Zap className="h-6 w-6 text-teal-500" />
                    <div>
                      <CardTitle className="text-base">Opportunity Scoring AI</CardTitle>
                      <CardDescription className="text-sm">In Development</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>• Close probability scoring</p>
                    <p>• Optimal timing predictions</p>
                    <p>• Deal progression insights</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Coming Soon - Revenue Intelligence */}
          <div>
            <h5 className="font-medium text-foreground mb-3 flex items-center gap-2">
              <Database className="h-4 w-4 text-emerald-500" />
              Revenue Intelligence Agents (Coming Soon)
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border-emerald-500/20 opacity-75">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <Database className="h-6 w-6 text-emerald-500" />
                    <div>
                      <CardTitle className="text-base">Product Recommendation AI</CardTitle>
                      <CardDescription className="text-sm">In Development</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>• Cross-sell opportunities</p>
                    <p>• Upsell recommendations</p>
                    <p>• Bundle optimization</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-indigo-500/5 to-indigo-500/10 border-indigo-500/20 opacity-75">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <Target className="h-6 w-6 text-indigo-500" />
                    <div>
                      <CardTitle className="text-base">Price Optimization AI</CardTitle>
                      <CardDescription className="text-sm">In Development</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>• Dynamic pricing strategies</p>
                    <p>• Market-based adjustments</p>
                    <p>• Margin optimization</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-500/5 to-red-500/10 border-red-500/20 opacity-75">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-6 w-6 text-red-500" />
                    <div>
                      <CardTitle className="text-base">Competitive Intelligence AI</CardTitle>
                      <CardDescription className="text-sm">In Development</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>• Competitor tracking</p>
                    <p>• Win/loss analysis</p>
                    <p>• Battle card generation</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Coming Soon - Communication Intelligence */}
          <div>
            <h5 className="font-medium text-foreground mb-3 flex items-center gap-2">
              <Brain className="h-4 w-4 text-pink-500" />
              Communication Intelligence Agents (Coming Soon)
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-pink-500/5 to-pink-500/10 border-pink-500/20 opacity-75">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <Brain className="h-6 w-6 text-pink-500" />
                    <div>
                      <CardTitle className="text-base">Email Intelligence AI</CardTitle>
                      <CardDescription className="text-sm">In Development</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>• Auto email generation</p>
                    <p>• Response optimization</p>
                    <p>• Engagement tracking</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-cyan-500/5 to-cyan-500/10 border-cyan-500/20 opacity-75">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <Activity className="h-6 w-6 text-cyan-500" />
                    <div>
                      <CardTitle className="text-base">Customer Journey AI</CardTitle>
                      <CardDescription className="text-sm">In Development</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>• Journey mapping</p>
                    <p>• Touchpoint optimization</p>
                    <p>• Conversion insights</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-violet-500/5 to-violet-500/10 border-violet-500/20 opacity-75">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <Database className="h-6 w-6 text-violet-500" />
                    <div>
                      <CardTitle className="text-base">Content Intelligence AI</CardTitle>
                      <CardDescription className="text-sm">In Development</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>• Document analysis</p>
                    <p>• Content recommendations</p>
                    <p>• Knowledge extraction</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Custom Agent Development */}
          <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">Custom AI Agent Development</CardTitle>
                  <CardDescription>
                    Need specialized AI agents for your unique CRM workflows? We build custom agents tailored to your business.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <Settings className="h-8 w-8 text-primary" />
                  </div>
                  <h6 className="font-medium mb-1">Workflow Automation</h6>
                  <p className="text-sm text-muted-foreground">Custom agents for your specific business processes</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-accent/10 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <Database className="h-8 w-8 text-accent" />
                  </div>
                  <h6 className="font-medium mb-1">Data Integration</h6>
                  <p className="text-sm text-muted-foreground">Connect any data source or third-party system</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-success/10 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <Zap className="h-8 w-8 text-success" />
                  </div>
                  <h6 className="font-medium mb-1">AI Models</h6>
                  <p className="text-sm text-muted-foreground">Fine-tuned models for your industry and use case</p>
                </div>
              </div>
              <div className="flex gap-3 justify-center">
                <Button>
                  <Settings className="mr-2 h-4 w-4" />
                  Request Custom Agent
                </Button>
                <Button variant="outline">
                  <Brain className="mr-2 h-4 w-4" />
                  View Agent Documentation
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Enhanced Test Results</h4>
            {testResults.map((result, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {result.success ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    )}
                    <h5 className="font-medium text-foreground">{result.type}</h5>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={result.success ? "default" : "destructive"}>
                      {result.success ? "Success" : "Failed"}
                    </Badge>
                    {result.actionsExecuted !== undefined && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Activity className="h-3 w-3" />
                        {result.actionsExecuted} Actions
                      </Badge>
                    )}
                  </div>
                </div>

                {result.success ? (
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <strong>Confidence:</strong><br />
                        {((result.confidence || 0) * 100).toFixed(1)}%
                      </div>
                      <div>
                        <strong>Execution Time:</strong><br />
                        {result.executionTime}ms
                      </div>
                      <div>
                        <strong>Actions Executed:</strong><br />
                        {result.actionsExecuted || 0}
                      </div>
                      <div>
                        <strong>Mode:</strong><br />
                        {enableActions ? "Autonomous" : "Analysis Only"}
                      </div>
                    </div>
                    
                    {result.results && (
                      <div className="space-y-4">
                        {/* Actions Executed Details */}
                        {result.results.analysis && result.actionsExecuted > 0 && (
                          <div>
                            <strong>✅ Actions Executed:</strong>
                            <div className="mt-2 space-y-3">
                              {result.results.analysis.map((contact: any, idx: number) => (
                                <div key={idx} className="p-3 bg-muted/50 rounded border border-primary/10">
                                  <div className="flex items-center justify-between mb-2">
                                    <h6 className="font-medium text-foreground">{contact.name}</h6>
                                    <Badge variant="outline" className="text-xs">
                                      Score: {contact.oldScore} → {contact.newScore}
                                    </Badge>
                                  </div>
                                  {contact.actionsExecuted && contact.actionsExecuted.length > 0 && (
                                    <div className="space-y-1">
                                      <div className="text-xs font-medium text-foreground">Actions Taken:</div>
                                      {contact.actionsExecuted.map((action: string, actionIdx: number) => (
                                        <div key={actionIdx} className="text-xs text-muted-foreground flex items-center gap-1">
                                          <CheckCircle className="h-3 w-3 text-green-500" />
                                          {action}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  {contact.emailSubject && (
                                    <div className="mt-2 text-xs">
                                      <span className="font-medium text-foreground">Email Subject: </span>
                                      <span className="text-muted-foreground italic">"{contact.emailSubject}"</span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Summary */}
                        {result.results.summary && (
                          <div>
                            <strong>📊 Summary:</strong>
                            <div className="mt-1 p-3 bg-primary/5 border border-primary/20 rounded text-sm text-foreground">
                              {result.results.summary}
                            </div>
                          </div>
                        )}
                        
                        {/* Raw JSON (Collapsed) */}
                        <details className="cursor-pointer">
                          <summary className="font-medium text-foreground hover:text-primary transition-colors">
                            🔍 View Raw Results (JSON)
                          </summary>
                          <div className="mt-2 p-3 bg-muted rounded text-xs">
                            <pre className="overflow-auto max-h-40 text-xs">
                              {JSON.stringify(result.results, null, 2)}
                            </pre>
                          </div>
                        </details>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-red-600">
                    <strong>Error:</strong> {result.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Enhanced Features Info */}
        <div className="bg-gradient-cyber border border-primary/20 rounded-lg p-4">
          <h4 className="font-semibold text-foreground mb-2">🤖 Enhanced Agentic AI Capabilities</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <h5 className="font-medium text-foreground mb-1">Intelligence Features:</h5>
              <ul className="space-y-1">
                <li>✅ OpenAI GPT-4.1 powered analysis</li>
                <li>✅ Contextual lead and pipeline insights</li>
                <li>✅ Intelligent scoring and recommendations</li>
                <li>✅ Personalized email subject generation</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-foreground mb-1">Autonomous Actions:</h5>
              <ul className="space-y-1">
                <li>⚡ Automatic Salesforce record updates</li>
                <li>⚡ Smart task and meeting creation</li>
                <li>⚡ Dynamic probability adjustments</li>
                <li>⚡ Risk-based alert generation</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}