import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Target, Database, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
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
}

export function AIAgentTester() {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  const runLeadIntelligenceTest = async () => {
    if (!user) return;

    setIsRunning(true);
    
    try {
      // First, create a test agent
      const { data: agent, error: agentError } = await supabase
        .from('ai_agents')
        .insert({
          name: 'Lead Intelligence Agent',
          type: 'lead_intelligence',
          status: 'active',
          created_by: user.id,
          max_confidence_threshold: 0.80,
          min_confidence_threshold: 0.60,
          requires_human_approval: false
        })
        .select()
        .single();

      if (agentError) throw agentError;

      // Get some test contacts
      const { data: contacts, error: contactsError } = await supabase
        .from('contacts')
        .select('id')
        .limit(3);

      if (contactsError) throw contactsError;

      if (!contacts || contacts.length === 0) {
        throw new Error('No contacts found for testing. Please sync some data first.');
      }

      // Execute the AI agent
      const { data: result, error: execError } = await supabase.functions.invoke('ai-agent-executor', {
        body: {
          agentId: agent.id,
          inputData: { contactIds: contacts.map(c => c.id) },
          userId: user.id,
          requestSource: 'test'
        }
      });

      if (execError) throw execError;

      setTestResults(prev => [...prev, {
        type: 'Lead Intelligence',
        success: true,
        confidence: result.confidence,
        results: result.result,
        executionTime: result.executionTime
      }]);

      toast({
        title: "Test Successful",
        description: `Lead Intelligence Agent executed with ${(result.confidence * 100).toFixed(1)}% confidence.`,
      });

    } catch (error) {
      console.error('Test failed:', error);
      setTestResults(prev => [...prev, {
        type: 'Lead Intelligence',
        success: false,
        error: error.message
      }]);

      toast({
        title: "Test Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const runPipelineAnalysisTest = async () => {
    if (!user) return;

    setIsRunning(true);
    
    try {
      // Create a test pipeline analysis agent
      const { data: agent, error: agentError } = await supabase
        .from('ai_agents')
        .insert({
          name: 'Pipeline Analysis Agent',
          type: 'pipeline_analysis',
          status: 'active',
          created_by: user.id,
          max_confidence_threshold: 0.80,
          min_confidence_threshold: 0.60,
          requires_human_approval: false
        })
        .select()
        .single();

      if (agentError) throw agentError;

      // Get some test opportunities
      const { data: opportunities, error: oppsError } = await supabase
        .from('opportunities')
        .select('id')
        .limit(3);

      if (oppsError) throw oppsError;

      if (!opportunities || opportunities.length === 0) {
        throw new Error('No opportunities found for testing. Please sync some data first.');
      }

      // Execute the AI agent
      const { data: result, error: execError } = await supabase.functions.invoke('ai-agent-executor', {
        body: {
          agentId: agent.id,
          inputData: { opportunityIds: opportunities.map(o => o.id) },
          userId: user.id,
          requestSource: 'test'
        }
      });

      if (execError) throw execError;

      setTestResults(prev => [...prev, {
        type: 'Pipeline Analysis',
        success: true,
        confidence: result.confidence,
        results: result.result,
        executionTime: result.executionTime
      }]);

      toast({
        title: "Test Successful",
        description: `Pipeline Analysis Agent executed with ${(result.confidence * 100).toFixed(1)}% confidence.`,
      });

    } catch (error) {
      console.error('Test failed:', error);
      setTestResults(prev => [...prev, {
        type: 'Pipeline Analysis',
        success: false,
        error: error.message
      }]);

      toast({
        title: "Test Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <Card className="bg-card/50 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          AI Agent Testing Suite
        </CardTitle>
        <CardDescription>
          Test your production-ready AI agents with real Salesforce data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Test Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            onClick={runLeadIntelligenceTest}
            disabled={isRunning}
            className="flex items-center gap-2 h-20 flex-col"
          >
            {isRunning ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <Brain className="h-6 w-6" />
            )}
            <span>Lead Intelligence</span>
          </Button>

          <Button
            onClick={runPipelineAnalysisTest}
            disabled={isRunning}
            variant="outline"
            className="flex items-center gap-2 h-20 flex-col"
          >
            {isRunning ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <Target className="h-6 w-6" />
            )}
            <span>Pipeline Analysis</span>
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

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Test Results</h4>
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
                  <Badge variant={result.success ? "default" : "destructive"}>
                    {result.success ? "Success" : "Failed"}
                  </Badge>
                </div>

                {result.success ? (
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>
                      <strong>Confidence:</strong> {((result.confidence || 0) * 100).toFixed(1)}%
                    </p>
                    <p>
                      <strong>Execution Time:</strong> {result.executionTime}ms
                    </p>
                    {result.results && (
                      <div>
                        <strong>Results:</strong>
                        <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto max-h-32">
                          {JSON.stringify(result.results, null, 2)}
                        </pre>
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

        {/* Info Box */}
        <div className="bg-gradient-cyber border border-primary/20 rounded-lg p-4">
          <h4 className="font-semibold text-foreground mb-2">🚀 Production-Ready Features</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>✅ Complete audit trail and execution logging</li>
            <li>✅ Security monitoring and threat detection</li>
            <li>✅ Confidence thresholds and human oversight</li>
            <li>✅ Performance metrics and cost tracking</li>
            <li>✅ Rate limiting and input validation</li>
            <li>✅ GDPR/CCPA compliant data handling</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}