import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ChevronDown, 
  ChevronRight, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Brain, 
  Database,
  Activity,
  Info,
  Code,
  BarChart3,
  MessageSquare
} from 'lucide-react';

interface TestResult {
  agentId: string;
  agentName: string;
  platform: string;
  status: 'completed' | 'failed' | 'running';
  confidence?: number;
  results?: any;
  error?: string;
  executionTime?: number;
  actionsExecuted?: number;
  securityScore?: number;
  summary?: string;
  analysis?: any[];
  logs?: string[];
  rawResponse?: any;
  salesforceData?: any;
  aiAnalysis?: any;
  recordCount?: number;
}

interface TestResultsViewerProps {
  results: TestResult[];
  isRunning: boolean;
  currentTest: string;
}

export function TestResultsViewer({ results, isRunning, currentTest }: TestResultsViewerProps) {
  const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set());

  const toggleExpanded = (resultId: string) => {
    const newExpanded = new Set(expandedResults);
    if (newExpanded.has(resultId)) {
      newExpanded.delete(resultId);
    } else {
      newExpanded.add(resultId);
    }
    setExpandedResults(newExpanded);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return 'bg-gray-500';
    if (confidence >= 0.8) return 'bg-green-500';
    if (confidence >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatAnalysisResults = (analysis: any[]) => {
    if (!analysis || !Array.isArray(analysis)) {
      console.log('❌ Analysis not array:', typeof analysis, analysis);
      return <p className="text-muted-foreground">Analysis data is not in expected format</p>;
    }
    
    console.log('✅ Formatting analysis results:', analysis.length, 'items');
    
    return analysis.map((item, index) => (
      <Card key={index} className="mb-2">
        <CardContent className="p-3">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">{item.name || item.contactId || `Item ${index + 1}`}</span>
              {item.confidence && (
                <Badge variant="outline" className={`${getConfidenceColor(item.confidence)} text-white`}>
                  {Math.round(item.confidence * 100)}% confident
                </Badge>
              )}
            </div>
            {item.reasoning && (
              <p className="text-sm text-muted-foreground">{item.reasoning}</p>
            )}
            {item.recommendedActions && (
              <div className="space-y-1">
                <span className="text-xs font-medium">Recommended Actions:</span>
                <ul className="list-disc list-inside text-xs space-y-1">
                  {item.recommendedActions.map((action: string, i: number) => (
                    <li key={i}>{action}</li>
                  ))}
                </ul>
              </div>
            )}
            {item.sentimentScore !== undefined && (
              <div className="flex items-center gap-2">
                <span className="text-xs">Sentiment:</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${item.sentimentScore > 0 ? 'bg-green-500' : item.sentimentScore < 0 ? 'bg-red-500' : 'bg-gray-500'}`}
                    style={{ width: `${Math.abs(item.sentimentScore) + 50}%` }}
                  />
                </div>
                <span className="text-xs">{item.sentimentScore}</span>
              </div>
            )}
            {item.churnRisk !== undefined && (
              <div className="flex items-center gap-2">
                <span className="text-xs">Churn Risk:</span>
                <Badge variant={item.churnRisk > 70 ? 'destructive' : item.churnRisk > 40 ? 'outline' : 'secondary'}>
                  {item.churnRisk}%
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    ));
  };

  if (results.length === 0 && !isRunning) {
    return (
      <Card className="mt-6">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No test results yet</h3>
            <p className="text-gray-500">Run some AI agent tests to see detailed results here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 mt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Test Results & Detailed Analysis
        </h3>
        {isRunning && (
          <Badge variant="outline" className="animate-pulse">
            Running: {currentTest}
          </Badge>
        )}
      </div>

      {results.map((result) => {
        const resultId = `${result.agentId}-${result.platform}`;
        const isExpanded = expandedResults.has(resultId);

        return (
          <Card key={resultId} className="w-full">
            <Collapsible>
              <CollapsibleTrigger 
                className="w-full"
                onClick={() => toggleExpanded(resultId)}
              >
                <CardHeader className="cursor-pointer hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result.status)}
                      <div className="text-left">
                        <CardTitle className="text-base">{result.agentName}</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <span>{result.platform}</span>
                          {result.executionTime && (
                            <span>• {result.executionTime}ms</span>
                          )}
                          {result.actionsExecuted !== undefined && (
                            <span>• {result.actionsExecuted} actions</span>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {result.confidence && (
                        <Badge className={`${getConfidenceColor(result.confidence)} text-white`}>
                          {Math.round(result.confidence * 100)}%
                        </Badge>
                      )}
                      {result.status === 'failed' && (
                        <Badge variant="destructive">Failed</Badge>
                      )}
                      {result.status === 'completed' && (
                        <Badge variant="default">Success</Badge>
                      )}
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <Tabs defaultValue="summary" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="summary">Summary</TabsTrigger>
                      <TabsTrigger value="analysis">Analysis</TabsTrigger>
                      <TabsTrigger value="logs">Logs</TabsTrigger>
                      <TabsTrigger value="raw">Raw Data</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="summary" className="space-y-4 mt-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground">Status</span>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(result.status)}
                            <span className="text-sm font-medium capitalize">{result.status}</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground">Confidence</span>
                          <span className="text-sm font-medium">
                            {result.confidence ? `${Math.round(result.confidence * 100)}%` : 'N/A'}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground">Execution Time</span>
                          <span className="text-sm font-medium">
                            {result.executionTime ? `${result.executionTime}ms` : 'N/A'}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground">Actions</span>
                          <span className="text-sm font-medium">
                            {result.actionsExecuted ?? 'N/A'}
                          </span>
                        </div>
                      </div>
                      
                      {result.summary && (
                        <Alert>
                          <Brain className="h-4 w-4" />
                          <AlertDescription>{result.summary}</AlertDescription>
                        </Alert>
                      )}
                      
                      {result.error && (
                        <Alert variant="destructive">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Error:</strong> {result.error}
                          </AlertDescription>
                        </Alert>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="analysis" className="mt-4">
                      <ScrollArea className="h-96 w-full rounded-md border p-4">
                        {result.analysis ? (
                          <div className="space-y-3">
                            <h4 className="font-medium flex items-center gap-2">
                              <Database className="h-4 w-4" />
                              Analysis Results ({result.analysis.length} items)
                            </h4>
                            {formatAnalysisResults(result.analysis)}
                          </div>
                        ) : (
                          <p className="text-muted-foreground text-center py-8">
                            No detailed analysis available
                          </p>
                        )}
                      </ScrollArea>
                    </TabsContent>
                    
                    <TabsContent value="logs" className="mt-4">
                      <ScrollArea className="h-96 w-full rounded-md border p-4">
                        {result.logs && result.logs.length > 0 ? (
                          <div className="space-y-2">
                            <h4 className="font-medium flex items-center gap-2">
                              <MessageSquare className="h-4 w-4" />
                              Execution Logs
                            </h4>
                            {result.logs.map((log, index) => (
                              <div key={index} className="font-mono text-xs bg-gray-50 p-2 rounded">
                                {log}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground text-center py-8">
                            No logs available
                          </p>
                        )}
                      </ScrollArea>
                    </TabsContent>
                    
                     <TabsContent value="raw" className="mt-4">
                       <ScrollArea className="h-96 w-full rounded-md border p-4">
                         <div className="space-y-4">
                           <h4 className="font-medium flex items-center gap-2">
                             <Code className="h-4 w-4" />
                             Raw Response Data {result.platform && `(${result.platform})`}
                           </h4>
                           
                           {/* Debug Info */}
                           <div className="text-xs text-muted-foreground bg-secondary/50 border border-border p-2 rounded">
                             Debug: Platform={result.platform}, Has salesforceData={!!result.salesforceData}, Has rawResponse={!!result.rawResponse}
                           </div>
                           
                           {/* Salesforce Data Section */}
                           {result.platform === 'salesforce' && result.salesforceData && (
                             <div className="space-y-2">
                               <h5 className="text-sm font-medium text-blue-400">📊 Real Salesforce Data ({result.salesforceData.length} records)</h5>
                               <pre className="bg-blue-950/30 border border-blue-500/20 p-3 rounded-md text-xs overflow-auto text-blue-100">
                                 {JSON.stringify(result.salesforceData, null, 2)}
                               </pre>
                             </div>
                           )}
                           
                           {/* AI Analysis Section */}
                           {result.platform === 'salesforce' && result.aiAnalysis && (
                             <div className="space-y-2">
                               <h5 className="text-sm font-medium text-green-400">🧠 AI Analysis Results</h5>
                               <pre className="bg-green-950/30 border border-green-500/20 p-3 rounded-md text-xs overflow-auto text-green-100">
                                 {typeof result.aiAnalysis === 'string' ? result.aiAnalysis : JSON.stringify(result.aiAnalysis, null, 2)}
                               </pre>
                             </div>
                           )}
                           
                           {/* Complete Raw Response */}
                           <div className="space-y-2">
                             <h5 className="text-sm font-medium text-muted-foreground">📋 Complete Test Result</h5>
                             <pre className="bg-muted/50 border border-border p-3 rounded-md text-xs overflow-auto text-foreground">
                               {JSON.stringify(result.rawResponse || result, null, 2)}
                             </pre>
                           </div>
                         </div>
                       </ScrollArea>
                     </TabsContent>
                  </Tabs>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        );
      })}
    </div>
  );
}