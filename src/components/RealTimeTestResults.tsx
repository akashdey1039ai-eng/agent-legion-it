import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { CheckCircle, XCircle, AlertCircle, PlayCircle, PauseCircle, RotateCcw, Eye, ChevronRight } from 'lucide-react';
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
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const { toast } = useToast();

  // Removed auto-run functionality - tests must be manually triggered

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
            Real-Time AI Agent Testing - Verifying Fixes
            <div className="flex gap-2">
              <Button 
                onClick={runAllTests} 
                disabled={isRunning}
                className="flex items-center gap-2"
              >
                {isRunning ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                {isRunning ? 'Testing...' : 'Re-run All Tests'}
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
                  <div 
                    key={result.id} 
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                    onClick={() => {
                      setSelectedResult(result);
                      setShowDetailsModal(true);
                    }}
                  >
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
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      
                      {result.error && (
                        <div className="text-sm text-red-600 max-w-xs truncate" title={result.error}>
                          {result.error}
                        </div>
                      )}
                      
                      {getStatusBadge(result.status)}
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Execution Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              {selectedResult && `${agents.find(a => a.id === selectedResult.id)?.name} - Execution Details`}
            </DialogTitle>
          </DialogHeader>
          
          {selectedResult && (
            <div className="space-y-6">
              {/* Execution Summary */}
              <Card>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Status</div>
                      <div className="font-medium">{getStatusBadge(selectedResult.status)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Records Processed</div>
                      <div className="font-medium">{selectedResult.recordsAnalyzed || 0}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Confidence</div>
                      <div className="font-medium">{(selectedResult.confidence * 100).toFixed(1)}%</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Execution Time</div>
                      <div className="font-medium">{selectedResult.executionTime}ms</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="actions">Actions Taken</TabsTrigger>
                  <TabsTrigger value="insights">AI Insights</TabsTrigger>
                  <TabsTrigger value="raw">Raw Data</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-4">
                  {/* Platform Data Summary */}
                  {selectedResult.details?.rawSalesforceData && selectedResult.details.rawSalesforceData.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">📊 Salesforce Data Retrieved</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div>
                            <div className="text-2xl font-bold text-blue-600">{selectedResult.details.rawSalesforceData.length}</div>
                            <div className="text-sm text-muted-foreground">Total Records</div>
                          </div>
                          <div>
                            <div className="font-medium">{selectedResult.details.rawSalesforceData[0]?.FirstName} {selectedResult.details.rawSalesforceData[0]?.LastName}</div>
                            <div className="text-sm text-muted-foreground">Sample Contact</div>
                          </div>
                          <div>
                            <div className="font-medium">{selectedResult.details.rawSalesforceData[0]?.Account?.Name || 'N/A'}</div>
                            <div className="text-sm text-muted-foreground">Sample Company</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {selectedResult.details?.rawHubSpotData && selectedResult.details.rawHubSpotData.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">📊 HubSpot Data Retrieved</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div>
                            <div className="text-2xl font-bold text-orange-600">{selectedResult.details.rawHubSpotData.length}</div>
                            <div className="text-sm text-muted-foreground">Total Records</div>
                          </div>
                          <div>
                            <div className="font-medium">{selectedResult.details.rawHubSpotData[0]?.properties?.firstname} {selectedResult.details.rawHubSpotData[0]?.properties?.lastname}</div>
                            <div className="text-sm text-muted-foreground">Sample Contact</div>
                          </div>
                          <div>
                            <div className="font-medium">{selectedResult.details.rawHubSpotData[0]?.properties?.company || 'N/A'}</div>
                            <div className="text-sm text-muted-foreground">Sample Company</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="actions" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">⚡ Actions Performed by AI Agent</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedResult.details?.actionsExecuted > 0 ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                              <div className="text-2xl font-bold text-purple-600">{selectedResult.details.actionsExecuted}</div>
                              <div className="text-sm text-muted-foreground">Total Actions</div>
                            </div>
                            <div>
                              <div className="font-medium">Autonomous Updates</div>
                              <div className="text-sm text-muted-foreground">Action Type</div>
                            </div>
                            <div>
                              <div className="font-medium">{selectedResult.agentType}</div>
                              <div className="text-sm text-muted-foreground">Agent Type</div>
                            </div>
                          </div>
                          <div className="p-4 bg-accent/20 rounded-lg">
                            <p className="text-sm">
                              The AI agent successfully performed {selectedResult.details.actionsExecuted} autonomous actions on CRM records, 
                              including field updates, lead scoring, and status changes based on intelligent analysis.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No specific actions were recorded for this execution.</p>
                          <p className="text-sm mt-2">The agent may have performed analysis-only operations.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="insights" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">🤖 AI Analysis & Insights</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedResult.details?.analysis ? (
                        <div className="space-y-4">
                          {typeof selectedResult.details.analysis === 'string' && selectedResult.details.analysis.includes('{"') && (
                            <div className="space-y-3">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <div className="text-2xl font-bold text-green-600">
                                    {selectedResult.details.analysis.split('{"').length - 1}
                                  </div>
                                  <div className="text-sm text-muted-foreground">Records Analyzed</div>
                                </div>
                                <div>
                                  <div className="font-medium">Individual Processing</div>
                                  <div className="text-sm text-muted-foreground">Analysis Type</div>
                                </div>
                              </div>
                              <div className="p-4 bg-accent/20 rounded-lg">
                                <h5 className="font-medium mb-2">Analysis Preview:</h5>
                                <div className="bg-background p-3 rounded border text-xs font-mono max-h-40 overflow-y-auto">
                                  {selectedResult.details.analysis.substring(0, 800)}
                                  {selectedResult.details.analysis.length > 800 && '\n... (view Raw Data tab for complete analysis)'}
                                </div>
                              </div>
                            </div>
                          )}

                          {typeof selectedResult.details.analysis === 'object' && selectedResult.details.analysis.analysis && (
                            <div className="space-y-3">
                              <div className="p-4 bg-accent/20 rounded-lg">
                                <h5 className="font-medium mb-2">Analysis Summary:</h5>
                                <p className="text-sm">{selectedResult.details.analysis.analysis}</p>
                                {selectedResult.details.analysis.confidence && (
                                  <div className="mt-2 pt-2 border-t">
                                    <span className="text-sm font-medium">AI Confidence: </span>
                                    <Badge variant="secondary">{(selectedResult.details.analysis.confidence * 100).toFixed(1)}%</Badge>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No detailed analysis data available for this execution.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="raw" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">📋 Complete Execution Data</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-4 bg-accent/20 rounded-lg">
                          <h5 className="font-medium mb-2">Full Response Data:</h5>
                          <div className="bg-background p-4 rounded border text-xs font-mono max-h-96 overflow-y-auto">
                            <pre>{JSON.stringify(selectedResult.details, null, 2)}</pre>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Detailed Results */}
      {completedTests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Actions & Record Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {completedTests.map((result) => {
                const agent = agents.find(a => a.id === result.id);
                const details = result.details;
                
                return (
                  <div key={result.id} className="border rounded-lg p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{agent?.name}</h3>
                        <p className="text-sm text-muted-foreground">{agent?.platform} • {result.agentType}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">✅ {result.recordsAnalyzed} records processed</div>
                        <div className="text-sm text-muted-foreground">🎯 {(result.confidence * 100).toFixed(1)}% confidence</div>
                      </div>
                    </div>

                    {/* Raw Platform Data Summary */}
                    {details?.rawSalesforceData && details.rawSalesforceData.length > 0 && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">📊 Salesforce Data Retrieved</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Total Records:</span> {details.rawSalesforceData.length}
                          </div>
                          <div>
                            <span className="font-medium">Sample Record:</span> 
                            {details.rawSalesforceData[0]?.FirstName} {details.rawSalesforceData[0]?.LastName}
                          </div>
                          <div>
                            <span className="font-medium">Company:</span> 
                            {details.rawSalesforceData[0]?.Account?.Name || 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium">Industry:</span> 
                            {details.rawSalesforceData[0]?.Account?.Industry || 'N/A'}
                          </div>
                        </div>
                      </div>
                    )}

                    {details?.rawHubSpotData && details.rawHubSpotData.length > 0 && (
                      <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                        <h4 className="font-medium text-orange-900 dark:text-orange-100 mb-2">📊 HubSpot Data Retrieved</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Total Records:</span> {details.rawHubSpotData.length}
                          </div>
                          <div>
                            <span className="font-medium">Sample Contact:</span> 
                            {details.rawHubSpotData[0]?.properties?.firstname} {details.rawHubSpotData[0]?.properties?.lastname}
                          </div>
                          <div>
                            <span className="font-medium">Company:</span> 
                            {details.rawHubSpotData[0]?.properties?.company || 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium">Stage:</span> 
                            {details.rawHubSpotData[0]?.properties?.lifecyclestage || 'N/A'}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* AI Analysis Results */}
                    {details?.analysis && (
                      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                        <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">🤖 AI Analysis Results</h4>
                        
                        {/* Check if analysis contains JSON data with individual records */}
                        {typeof details.analysis === 'string' && details.analysis.includes('{"') && (
                          <div className="space-y-3">
                            <div className="text-sm">
                              <span className="font-medium">Analysis Type:</span> Individual Record Processing
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">Records with AI Insights:</span> 
                              {details.analysis.split('{"').length - 1} records scored and analyzed
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-3 rounded border text-xs font-mono max-h-32 overflow-y-auto">
                              {details.analysis.substring(0, 500)}
                              {details.analysis.length > 500 && '... (truncated)'}
                            </div>
                          </div>
                        )}

                        {typeof details.analysis === 'object' && details.analysis.analysis && (
                          <div className="space-y-2">
                            <div className="text-sm">
                              <span className="font-medium">Analysis Summary:</span> {details.analysis.analysis}
                            </div>
                            {details.analysis.confidence && (
                              <div className="text-sm">
                                <span className="font-medium">AI Confidence:</span> {(details.analysis.confidence * 100).toFixed(1)}%
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Actions Taken */}
                    {details?.actionsExecuted > 0 && (
                      <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                        <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">⚡ Actions Performed</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Total Actions:</span> {details.actionsExecuted}
                          </div>
                          <div>
                            <span className="font-medium">Action Type:</span> Autonomous AI Updates
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-muted-foreground">
                          ✅ AI agent successfully executed {details.actionsExecuted} automated actions on your CRM data
                        </div>
                      </div>
                    )}

                    {/* Performance Metrics */}
                    <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">📈 Performance Metrics</h4>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Execution Time:</span> {result.executionTime}ms
                        </div>
                        <div>
                          <span className="font-medium">Success Rate:</span> 
                          {result.status === 'completed' ? '100%' : '0%'}
                        </div>
                        <div>
                          <span className="font-medium">Platform:</span> 
                          {agent?.platform === 'salesforce' ? 'Salesforce Sandbox' : 
                           agent?.platform === 'hubspot' ? 'HubSpot Sandbox' : 'Native Platform'}
                        </div>
                      </div>
                    </div>

                    {/* Error Details */}
                    {result.error && (
                      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                        <h4 className="font-medium text-red-900 dark:text-red-100 mb-2">❌ Error Details</h4>
                        <div className="text-sm text-red-700 dark:text-red-300">
                          {result.error}
                        </div>
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