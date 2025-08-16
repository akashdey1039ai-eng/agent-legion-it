import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { CheckCircle, XCircle, AlertCircle, PlayCircle, PauseCircle, RotateCcw } from 'lucide-react';
import { useToast } from './ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TestResult {
  id: string;
  agentType: string;
  platform: string;
  status: 'running' | 'completed' | 'failed';
  recordsAnalyzed: number;
  confidence: number;
  executionTime: number;
  error?: string;
  details?: any;
  timestamp: string;
}

interface RealTimeTestResultsProps {
  agents: Array<{
    id: string;
    name: string;
    type: string;
    platform: string;
  }>;
}

export function RealTimeTestResults({ agents }: RealTimeTestResultsProps) {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string | null>(null);
  const [overallProgress, setOverallProgress] = useState(0);
  const { toast } = useToast();

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    setOverallProgress(0);

    for (let i = 0; i < agents.length; i++) {
      const agent = agents[i];
      setCurrentTest(agent.id);
      
      // Initialize test result
      const testResult: TestResult = {
        id: agent.id,
        agentType: agent.type,
        platform: agent.platform,
        status: 'running',
        recordsAnalyzed: 0,
        confidence: 0,
        executionTime: 0,
        timestamp: new Date().toISOString()
      };

      setTestResults(prev => [...prev.filter(r => r.id !== agent.id), testResult]);

      try {
        const startTime = Date.now();
        let response;

        if (agent.platform === 'hubspot') {
          response = await supabase.functions.invoke('hubspot-ai-agent-tester', {
            body: { agentType: agent.type, userId: (await supabase.auth.getUser()).data.user?.id }
          });
        } else if (agent.platform === 'salesforce') {
          response = await supabase.functions.invoke('salesforce-ai-agent-tester', {
            body: { agentType: agent.type, userId: (await supabase.auth.getUser()).data.user?.id }
          });
        } else {
          response = await supabase.functions.invoke('enhanced-ai-agent-executor', {
            body: { 
              agentType: agent.type, 
              userId: (await supabase.auth.getUser()).data.user?.id,
              enableActions: true,
              platform: 'native'
            }
          });
        }

        const executionTime = Date.now() - startTime;

        if (response.error) {
          throw new Error(response.error.message || 'Unknown error');
        }

        const data = response.data;
        
        setTestResults(prev => prev.map(r => 
          r.id === agent.id 
            ? {
                ...r,
                status: 'completed',
                recordsAnalyzed: data.recordsAnalyzed || 0,
                confidence: data.confidence || 0,
                executionTime,
                details: data
              }
            : r
        ));

        toast({
          title: "Test Completed",
          description: `${agent.name} (${agent.platform}) analyzed ${data.recordsAnalyzed || 0} records`,
        });

      } catch (error: any) {
        console.error(`Test failed for ${agent.name}:`, error);
        
        setTestResults(prev => prev.map(r => 
          r.id === agent.id 
            ? {
                ...r,
                status: 'failed',
                error: error.message,
                executionTime: Date.now() - Date.now()
              }
            : r
        ));

        toast({
          title: "Test Failed",
          description: `${agent.name} (${agent.platform}): ${error.message}`,
          variant: "destructive"
        });
      }

      setOverallProgress(((i + 1) / agents.length) * 100);
    }

    setCurrentTest(null);
    setIsRunning(false);
    
    toast({
      title: "All Tests Completed",
      description: `Tested ${agents.length} agents across all platforms`,
    });
  };

  const clearResults = () => {
    setTestResults([]);
    setOverallProgress(0);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'running':
        return <AlertCircle className="w-5 h-5 text-yellow-500 animate-pulse" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'default',
      failed: 'destructive',
      running: 'secondary'
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const completedTests = testResults.filter(r => r.status === 'completed');
  const failedTests = testResults.filter(r => r.status === 'failed');
  const totalRecords = completedTests.reduce((sum, r) => sum + r.recordsAnalyzed, 0);
  const avgConfidence = completedTests.length > 0 
    ? completedTests.reduce((sum, r) => sum + r.confidence, 0) / completedTests.length 
    : 0;

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Real-Time AI Agent Testing
            <div className="flex gap-2">
              <Button 
                onClick={runAllTests} 
                disabled={isRunning}
                className="flex items-center gap-2"
              >
                {isRunning ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                {isRunning ? 'Testing...' : 'Run All Tests'}
              </Button>
              <Button 
                onClick={clearResults} 
                variant="outline"
                disabled={isRunning}
                className="flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Clear
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Overall Progress</span>
                <span>{overallProgress.toFixed(0)}%</span>
              </div>
              <Progress value={overallProgress} className="w-full" />
            </div>
            
            {currentTest && (
              <div className="text-sm text-muted-foreground">
                Currently testing: {agents.find(a => a.id === currentTest)?.name}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      {testResults.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{completedTests.length}</div>
              <div className="text-sm text-muted-foreground">Passed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{failedTests.length}</div>
              <div className="text-sm text-muted-foreground">Failed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{totalRecords}</div>
              <div className="text-sm text-muted-foreground">Records Analyzed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">{(avgConfidence * 100).toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Avg Confidence</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {testResults.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No tests run yet. Click "Run All Tests" to begin.
              </div>
            ) : (
              testResults.map((result) => {
                const agent = agents.find(a => a.id === result.id);
                return (
                  <div key={result.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result.status)}
                      <div>
                        <div className="font-medium">{agent?.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {agent?.platform} • {result.agentType}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {result.status === 'completed' && (
                        <>
                          <div className="text-sm text-muted-foreground">
                            {result.recordsAnalyzed} records • {(result.confidence * 100).toFixed(1)}% confidence
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {result.executionTime}ms
                          </div>
                        </>
                      )}
                      
                      {result.error && (
                        <div className="text-sm text-red-600 max-w-xs truncate" title={result.error}>
                          {result.error}
                        </div>
                      )}
                      
                      {getStatusBadge(result.status)}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Results */}
      {completedTests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Autonomous Actions Performed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {completedTests.map((result) => {
                const agent = agents.find(a => a.id === result.id);
                return (
                  <div key={result.id} className="border rounded-lg p-4">
                    <div className="font-medium mb-2">{agent?.name} ({agent?.platform})</div>
                    {result.details?.analysis?.parsedRecords && (
                      <div className="text-sm text-muted-foreground">
                        <div>✅ Analyzed {result.recordsAnalyzed} records</div>
                        <div>🎯 Confidence: {(result.confidence * 100).toFixed(1)}%</div>
                        <div>⚡ Execution: {result.executionTime}ms</div>
                        {result.details.actionsExecuted && (
                          <div>🤖 Actions: {result.details.actionsExecuted} autonomous updates</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}