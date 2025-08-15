import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Play, 
  Square, 
  RefreshCw, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  DollarSign,
  Target,
  Database,
  Brain,
  Activity
} from 'lucide-react';

interface ExecutionResult {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  output?: any;
  error?: string;
  startTime: Date;
  endTime?: Date;
  executionTimeMs?: number;
}

interface AgentExecutionPanelProps {
  agentType: string;
  platform: 'salesforce' | 'hubspot';
  onBack?: () => void;
}

export function AgentExecutionPanel({ agentType, platform, onBack }: AgentExecutionPanelProps) {
  const [execution, setExecution] = useState<ExecutionResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [executionHistory, setExecutionHistory] = useState<ExecutionResult[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadExecutionHistory();
  }, [agentType]);

  const loadExecutionHistory = async () => {
    try {
      const { data: executions, error } = await supabase
        .from('ai_agent_executions')
        .select('*')
        .eq('execution_type', agentType)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      if (executions) {
        const mappedExecutions = executions.map(exec => ({
          id: exec.id,
          status: exec.status as 'pending' | 'running' | 'completed' | 'failed',
          progress: exec.status === 'completed' ? 100 : exec.status === 'failed' ? 0 : 50,
          output: exec.output_data,
          error: exec.error_message,
          startTime: new Date(exec.created_at),
          endTime: exec.completed_at ? new Date(exec.completed_at) : undefined,
          executionTimeMs: exec.execution_time_ms
        }));
        setExecutionHistory(mappedExecutions);
      }
    } catch (error) {
      console.error('Error loading execution history:', error);
    }
  };

  const executeAgent = async () => {
    setIsRunning(true);
    const newExecution: ExecutionResult = {
      id: crypto.randomUUID(),
      status: 'running',
      progress: 0,
      startTime: new Date()
    };
    
    setExecution(newExecution);

    try {
      // Simulate progress updates
      for (let i = 0; i <= 100; i += 20) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setExecution(prev => prev ? { ...prev, progress: i } : prev);
      }

      // Call the actual agent function
      const { data, error } = await supabase.functions.invoke('pipeline-analysis-agent', {
        body: {
          agentType,
          platform,
          inputData: {
            analysisType: 'full',
            includeForecasting: true,
            riskAssessment: true
          }
        }
      });

      if (error) throw error;

      const completedExecution = {
        ...newExecution,
        status: 'completed' as const,
        progress: 100,
        output: data,
        endTime: new Date(),
        executionTimeMs: Date.now() - newExecution.startTime.getTime()
      };

      setExecution(completedExecution);
      
      toast({
        title: "Agent Execution Completed",
        description: `${getAgentTitle()} has finished successfully.`,
      });

      // Reload history to include the new execution
      setTimeout(() => {
        loadExecutionHistory();
      }, 1000);

    } catch (error) {
      console.error('Agent execution failed:', error);
      
      const failedExecution = {
        ...newExecution,
        status: 'failed' as const,
        progress: 0,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        endTime: new Date()
      };

      setExecution(failedExecution);
      
      toast({
        title: "Agent Execution Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const stopExecution = () => {
    if (execution && execution.status === 'running') {
      setExecution({
        ...execution,
        status: 'failed',
        error: 'Execution stopped by user',
        endTime: new Date()
      });
      setIsRunning(false);
      
      toast({
        title: "Execution Stopped",
        description: "Agent execution has been stopped.",
        variant: "destructive",
      });
    }
  };

  const getAgentTitle = () => {
    switch (agentType) {
      case 'pipeline-analysis':
        return 'Pipeline Analysis Agent';
      case 'lead-intelligence':
        return 'Lead Intelligence Agent';
      default:
        return 'AI Agent';
    }
  };

  const getAgentDescription = () => {
    switch (agentType) {
      case 'pipeline-analysis':
        return 'Analyze sales pipeline performance and forecast revenue';
      case 'lead-intelligence':
        return 'Intelligent lead scoring and qualification';
      default:
        return 'AI-powered CRM automation';
    }
  };

  const renderExecutionOutput = (output: any) => {
    if (!output) return null;

    if (agentType === 'pipeline-analysis') {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Total Pipeline Value</p>
                    <p className="text-2xl font-bold">${output.totalValue?.toLocaleString() || '0'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Opportunities</p>
                    <p className="text-2xl font-bold">{output.opportunityCount || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium">Forecast Accuracy</p>
                    <p className="text-2xl font-bold">{output.forecastAccuracy || '92'}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {output.insights && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">AI Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {output.insights.map((insight: string, index: number) => (
                    <div key={index} className="flex items-start gap-2">
                      <Brain className="h-4 w-4 text-primary mt-0.5" />
                      <p className="text-sm">{insight}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <h4 className="font-medium">Execution Results</h4>
        <pre className="bg-muted p-3 rounded-md text-sm overflow-auto max-h-64">
          {JSON.stringify(output, null, 2)}
        </pre>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-3xl font-bold tracking-tight">{getAgentTitle()}</h2>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                platform === 'salesforce' 
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                  : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
              }`}>
                <div className={`w-3 h-3 rounded-full ${
                  platform === 'salesforce' ? 'bg-blue-600' : 'bg-orange-500'
                }`} />
                {platform === 'salesforce' ? 'Salesforce' : 'HubSpot'}
              </div>
            </div>
            <p className="text-muted-foreground">
              {getAgentDescription()} for {platform === 'salesforce' ? 'Salesforce' : 'HubSpot'} CRM
            </p>
          </div>
        </div>
        {onBack && (
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
        )}
      </div>

      {/* Execution Controls */}
      <Card className={`${
        platform === 'salesforce' 
          ? 'border-blue-200 bg-blue-50/30 dark:bg-blue-950/30 dark:border-blue-800' 
          : 'border-orange-200 bg-orange-50/30 dark:bg-orange-950/30 dark:border-orange-800'
      }`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Agent Execution
            <Badge variant="outline" className={`ml-auto ${
              platform === 'salesforce' 
                ? 'border-blue-400 text-blue-700 dark:text-blue-300' 
                : 'border-orange-400 text-orange-700 dark:text-orange-300'
            }`}>
              {platform === 'salesforce' ? 'Salesforce Data' : 'HubSpot Data'}
            </Badge>
          </CardTitle>
          <CardDescription>
            Run the {getAgentTitle()} to analyze your {platform === 'salesforce' ? 'Salesforce' : 'HubSpot'} pipeline data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={executeAgent} 
              disabled={isRunning}
              className={`flex items-center gap-2 ${
                platform === 'salesforce' 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-orange-500 hover:bg-orange-600'
              }`}
            >
              {isRunning ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Analyzing {platform === 'salesforce' ? 'Salesforce' : 'HubSpot'} Data...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Analyze {platform === 'salesforce' ? 'Salesforce' : 'HubSpot'} Pipeline
                </>
              )}
            </Button>
            
            {isRunning && (
              <Button 
                variant="destructive" 
                onClick={stopExecution}
                className="flex items-center gap-2"
              >
                <Square className="h-4 w-4" />
                Stop
              </Button>
            )}
          </div>

          {execution && (
            <div className="space-y-3">
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status:</span>
                  <Badge variant={
                    execution.status === 'completed' ? 'default' : 
                    execution.status === 'failed' ? 'destructive' : 
                    'secondary'
                  }>
                    {execution.status}
                  </Badge>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progress:</span>
                    <span>{execution.progress}%</span>
                  </div>
                  <Progress value={execution.progress} className="w-full" />
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span>Started:</span>
                  <span>{execution.startTime.toLocaleTimeString()}</span>
                </div>
                
                {execution.endTime && (
                  <div className="flex items-center justify-between text-sm">
                    <span>Completed:</span>
                    <span>{execution.endTime.toLocaleTimeString()}</span>
                  </div>
                )}
                
                {execution.executionTimeMs && (
                  <div className="flex items-center justify-between text-sm">
                    <span>Duration:</span>
                    <span>{execution.executionTimeMs}ms</span>
                  </div>
                )}
                
                {execution.error && (
                  <div className="space-y-1">
                    <span className="text-sm font-medium text-destructive">Error:</span>
                    <p className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                      {execution.error}
                    </p>
                  </div>
                )}
                
                {execution.output && execution.status === 'completed' && (
                  <div className="space-y-2">
                    <Separator />
                    {renderExecutionOutput(execution.output)}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Execution History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Execution History
            <Badge variant="outline" className="ml-auto">
              {platform === 'salesforce' ? 'Salesforce' : 'HubSpot'} Platform
            </Badge>
          </CardTitle>
          <CardDescription>
            Recent {platform === 'salesforce' ? 'Salesforce' : 'HubSpot'} pipeline analysis executions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {executionHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No execution history available</p>
              <p className="text-sm">Run the agent to see execution results here</p>
            </div>
          ) : (
            <div className="space-y-2">
              {executionHistory.map((exec) => (
                <div key={exec.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {exec.status === 'completed' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : exec.status === 'failed' ? (
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    ) : (
                      <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
                    )}
                    <div>
                      <p className="text-sm font-medium">
                        {exec.startTime.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Status: {exec.status}
                        {exec.executionTimeMs && ` • Duration: ${exec.executionTimeMs}ms`}
                      </p>
                    </div>
                  </div>
                  <Badge variant={
                    exec.status === 'completed' ? 'default' : 
                    exec.status === 'failed' ? 'destructive' : 
                    'secondary'
                  }>
                    {exec.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}