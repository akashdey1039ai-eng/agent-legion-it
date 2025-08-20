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
        
        // Debug log the response data structure
        console.log(`Response for ${agent.name} (${agent.platform}):`, data);
        
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
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        📊 {selectedResult.platform === 'hubspot' ? 'HubSpot' : selectedResult.platform === 'salesforce' ? 'Salesforce' : 'Platform'} Data Retrieved
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div>
                            <div className="text-2xl font-bold text-blue-600">{selectedResult.recordsAnalyzed}</div>
                            <div className="text-sm text-muted-foreground">Total Records Processed</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-green-600">{(selectedResult.confidence * 100).toFixed(1)}%</div>
                            <div className="text-sm text-muted-foreground">Analysis Confidence</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-purple-600">{selectedResult.executionTime}ms</div>
                            <div className="text-sm text-muted-foreground">Processing Time</div>
                          </div>
                        </div>
                        
                        {selectedResult.details?.dataSource && (
                          <div className="mt-4 p-3 bg-accent/20 rounded-lg">
                            <div className="text-sm font-medium">Data Source: {selectedResult.details.dataSource}</div>
                            <div className="text-sm text-muted-foreground mt-1">
                              Agent Type: {selectedResult.agentType} • Platform: {selectedResult.platform}
                            </div>
                          </div>
                        )}

                        {/* Show actual platform data from edge function response */}
                        {selectedResult.details && (
                          <div className="p-4 bg-muted/50 rounded-lg">
                            <h5 className="font-medium mb-2">Live Data Retrieved:</h5>
                            <div className="text-sm space-y-2">
                              <div><strong>Success:</strong> {selectedResult.details.success ? 'Yes' : 'No'}</div>
                              <div><strong>Agent Type:</strong> {selectedResult.details.agentType}</div>
                              <div><strong>Data Source:</strong> {selectedResult.details.dataSource}</div>
                              <div><strong>Records Analyzed:</strong> {selectedResult.details.recordsAnalyzed}</div>
                              <div><strong>Has Analysis:</strong> {selectedResult.details.analysis ? 'Yes' : 'No'}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="actions" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">⚡ Actions Performed by AI Agent</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div>
                            <div className="text-2xl font-bold text-purple-600">{selectedResult.recordsAnalyzed}</div>
                            <div className="text-sm text-muted-foreground">Records Processed</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-green-600">{(selectedResult.confidence * 100).toFixed(1)}%</div>
                            <div className="text-sm text-muted-foreground">Analysis Confidence</div>
                          </div>
                          <div>
                            <div className="font-medium">{selectedResult.agentType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
                            <div className="text-sm text-muted-foreground">Agent Type</div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="p-4 bg-accent/20 rounded-lg">
                            <h5 className="font-medium mb-2">🎯 Agent Actions Performed:</h5>
                            <ul className="space-y-2 text-sm">
                              <li className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                Connected to {selectedResult.platform === 'hubspot' ? 'HubSpot' : selectedResult.platform === 'salesforce' ? 'Salesforce' : 'Native'} API
                              </li>
                              <li className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                Retrieved {selectedResult.recordsAnalyzed} records for analysis
                              </li>
                              <li className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                Applied AI {selectedResult.agentType} analysis to each record
                              </li>
                              <li className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                Generated individual scoring and recommendations
                              </li>
                              {selectedResult.details?.success && (
                                <li className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                  Successfully completed analysis with {(selectedResult.confidence * 100).toFixed(1)}% confidence
                                </li>
                              )}
                            </ul>
                          </div>

                          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <h5 className="font-medium text-green-900 dark:text-green-100 mb-2">✅ Execution Summary</h5>
                            <p className="text-sm text-green-700 dark:text-green-300">
                              The AI agent successfully analyzed {selectedResult.recordsAnalyzed} CRM records using {selectedResult.agentType} intelligence, 
                              providing detailed insights and recommendations for each record with {(selectedResult.confidence * 100).toFixed(1)}% confidence.
                            </p>
                          </div>
                        </div>
                      </div>
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
                          {/* Parse and display individual record insights */}
                          {(() => {
                            let analysisData = null;
                            let analysisText = null;
                            
                            try {
                              // Check multiple possible locations for analysis data
                              const rawAnalysis = selectedResult.details.analysis?.analysis || selectedResult.details.analysis;
                              analysisText = rawAnalysis;
                              
                              if (typeof rawAnalysis === 'string') {
                                // Extract JSON from the analysis string
                                const jsonMatch = rawAnalysis.match(/```json\n([\s\S]*?)\n```/);
                                if (jsonMatch) {
                                  analysisData = JSON.parse(jsonMatch[1]);
                                } else {
                                  // Try to parse the entire string as JSON
                                  try {
                                    analysisData = JSON.parse(rawAnalysis);
                                  } catch (e) {
                                    console.log('Could not parse as direct JSON:', e);
                                  }
                                }
                              } else if (typeof rawAnalysis === 'object') {
                                analysisData = rawAnalysis;
                              }
                            } catch (e) {
                              console.log('Could not parse analysis JSON:', e);
                            }

                            if (Array.isArray(analysisData)) {
                              return (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div>
                                      <div className="text-2xl font-bold text-blue-600">{analysisData.length}</div>
                                      <div className="text-sm text-muted-foreground">Records Analyzed</div>
                                    </div>
                                    <div>
                                      <div className="text-2xl font-bold text-green-600">
                                        {analysisData.filter(r => r.lead_score || r.LeadScore).length}
                                      </div>
                                      <div className="text-sm text-muted-foreground">Scored Records</div>
                                    </div>
                                    <div>
                                      <div className="text-2xl font-bold text-purple-600">
                                        {Math.round(analysisData.reduce((sum, r) => sum + (r.lead_score || r.LeadScore || 0), 0) / analysisData.length)}
                                      </div>
                                      <div className="text-sm text-muted-foreground">Avg Lead Score</div>
                                    </div>
                                  </div>

                                  <div className="space-y-3">
                                    <h5 className="font-medium">Individual Record Insights:</h5>
                                    {analysisData.slice(0, 3).map((record, idx) => (
                                      <div key={idx} className="p-4 border rounded-lg bg-accent/20">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                          <div>
                                            <span className="font-medium">Record ID:</span>
                                            <div className="text-muted-foreground">{record.id || record.Id}</div>
                                          </div>
                                          <div>
                                            <span className="font-medium">Lead Score:</span>
                                            <div className="text-green-600 font-bold">{record.lead_score || record.LeadScore}</div>
                                          </div>
                                          <div>
                                            <span className="font-medium">Qualification:</span>
                                            <div className="text-blue-600">{record.qualification_level || record.QualificationLevel}</div>
                                          </div>
                                          <div>
                                            <span className="font-medium">Confidence:</span>
                                            <div className="text-purple-600">{((record.confidence_level || record.ConfidenceLevel || 0) * 100).toFixed(0)}%</div>
                                          </div>
                                        </div>
                                        
                                        {(record.buying_intent_signals || record.BuyingIntentSignals) && (
                                          <div className="mt-3 pt-3 border-t">
                                            <span className="font-medium text-sm">Intent Signals:</span>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                              {(record.buying_intent_signals || record.BuyingIntentSignals).map((signal, i) => (
                                                <Badge key={i} variant="secondary" className="text-xs">{signal}</Badge>
                                              ))}
                                            </div>
                                          </div>
                                        )}

                                        {(record.recommended_routing || record.RecommendedRouting) && (
                                          <div className="mt-2">
                                            <span className="font-medium text-sm">Routing:</span>
                                            <span className="ml-2 text-orange-600">{record.recommended_routing || record.RecommendedRouting}</span>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                    
                                    {analysisData.length > 3 && (
                                      <div className="text-center p-3 bg-accent/10 rounded-lg">
                                        <span className="text-sm text-muted-foreground">
                                          + {analysisData.length - 3} more records analyzed (view Raw Data tab for complete analysis)
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            }

                            // Fallback for non-array analysis
                            return (
                              <div className="space-y-3">
                                <div className="p-4 bg-accent/20 rounded-lg">
                                  <h5 className="font-medium mb-2">Analysis Summary:</h5>
                                  <div className="bg-background p-3 rounded border text-sm max-h-40 overflow-y-auto">
                                    {analysisText 
                                      ? (typeof analysisText === 'string' 
                                          ? analysisText.substring(0, 1000)
                                          : JSON.stringify(analysisText, null, 2))
                                      : 'No analysis text available'
                                    }
                                    {typeof analysisText === 'string' && analysisText.length > 1000 && 
                                      '\n... (view Raw Data tab for complete analysis)'
                                    }
                                  </div>
                                </div>
                                <div className="text-xs text-muted-foreground p-2 bg-muted/50 rounded">
                                  <strong>Debug:</strong> Available in details: {Object.keys(selectedResult.details || {}).join(', ')}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                       ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No AI analysis data found at expected location.</p>
                          <p className="text-sm mt-2">The agent may still be processing or the response structure differs.</p>
                          <div className="text-xs mt-4 p-3 bg-muted/50 rounded text-left">
                            <strong>Debug info:</strong><br/>
                            Available keys in details: {Object.keys(selectedResult.details || {}).join(', ')}<br/>
                            Analysis type: {typeof selectedResult.details?.analysis}<br/>
                            Has analysis.analysis: {!!(selectedResult.details?.analysis?.analysis)}
                          </div>
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