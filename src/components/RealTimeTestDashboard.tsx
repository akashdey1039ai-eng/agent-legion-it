import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Database, 
  Clock,
  TrendingUp,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  Monitor,
  Network,
  BarChart3,
  Timer
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface BatchProgress {
  batchId: string;
  platform: string;
  agentType: string;
  recordsProcessed: number;
  status: 'processing' | 'completed' | 'failed';
  startTime: number;
  endTime?: number;
  confidence: number;
  apiCalls: number;
}

interface APICall {
  id: string;
  endpoint: string;
  method: string;
  status: number;
  responseTime: number;
  timestamp: number;
  platform: string;
  agentType: string;
}

interface TrafficFlow {
  platform: string;
  totalRequests: number;
  successRate: number;
  avgResponseTime: number;
  concurrentCalls: number;
  rateLimitHits: number;
}

export const RealTimeTestDashboard = () => {
  const [batches, setBatches] = useState<BatchProgress[]>([]);
  const [apiCalls, setApiCalls] = useState<APICall[]>([]);
  const [trafficFlow, setTrafficFlow] = useState<TrafficFlow[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [testParameters, setTestParameters] = useState({
    batchSize: 1000,
    maxConcurrency: 3,
    totalRecords: 150000,
    platforms: ['salesforce', 'hubspot', 'native'],
    agentTypes: ['lead-intelligence', 'pipeline-analysis', 'customer-sentiment', 'churn-prediction', 'customer-segmentation', 'opportunity-scoring', 'communication-ai', 'sales-coaching']
  });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { user } = useAuth();

  // Simulate real-time batch processing
  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      // Simulate new batch completion
      const platform = testParameters.platforms[Math.floor(Math.random() * testParameters.platforms.length)];
      const agentType = testParameters.agentTypes[Math.floor(Math.random() * testParameters.agentTypes.length)];
      const recordsProcessed = Math.floor(Math.random() * testParameters.batchSize) + 500;
      const confidence = Math.random() * 0.3 + 0.7; // 70-100%
      const apiCalls = Math.floor(Math.random() * 10) + 5;

      const newBatch: BatchProgress = {
        batchId: `batch-${Date.now()}`,
        platform,
        agentType,
        recordsProcessed,
        status: Math.random() > 0.9 ? 'failed' : 'completed',
        startTime: Date.now() - Math.random() * 5000,
        endTime: Date.now(),
        confidence,
        apiCalls
      };

      setBatches(prev => [newBatch, ...prev.slice(0, 49)]); // Keep last 50 batches

      // Simulate API calls
      for (let i = 0; i < apiCalls; i++) {
        const newApiCall: APICall = {
          id: `call-${Date.now()}-${i}`,
          endpoint: Math.random() > 0.5 ? '/rest/v1/contacts' : '/chat/completions',
          method: 'POST',
          status: Math.random() > 0.1 ? 200 : (Math.random() > 0.7 ? 429 : 500),
          responseTime: Math.random() * 2000 + 200,
          timestamp: Date.now(),
          platform,
          agentType
        };

        setApiCalls(prev => [newApiCall, ...prev.slice(0, 99)]); // Keep last 100 calls
      }

      // Update traffic flow
      setTrafficFlow(prev => {
        const updated = [...prev];
        const platformIndex = updated.findIndex(tf => tf.platform === platform);
        
        if (platformIndex >= 0) {
          updated[platformIndex] = {
            ...updated[platformIndex],
            totalRequests: updated[platformIndex].totalRequests + apiCalls,
            successRate: Math.random() * 20 + 80, // 80-100%
            avgResponseTime: Math.random() * 1000 + 500, // 500-1500ms
            concurrentCalls: Math.floor(Math.random() * testParameters.maxConcurrency) + 1,
            rateLimitHits: updated[platformIndex].rateLimitHits + (Math.random() > 0.95 ? 1 : 0)
          };
        } else {
          updated.push({
            platform,
            totalRequests: apiCalls,
            successRate: Math.random() * 20 + 80,
            avgResponseTime: Math.random() * 1000 + 500,
            concurrentCalls: Math.floor(Math.random() * testParameters.maxConcurrency) + 1,
            rateLimitHits: 0
          });
        }
        
        return updated;
      });
    }, 2000); // New batch every 2 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, testParameters]);

  const startRealTest = async () => {
    if (!user) return;

    setIsRunning(true);
    setBatches([]);
    setApiCalls([]);
    setTrafficFlow([]);

    try {
      await supabase.functions.invoke('ai-agent-test-runner-scalable', {
        body: { 
          userId: user.id,
          batchSize: testParameters.batchSize,
          maxConcurrency: testParameters.maxConcurrency,
          enableBackground: true
        }
      });
    } catch (error) {
      console.error('Error starting test:', error);
    }
  };

  const stopTest = () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const getTotalRecordsProcessed = () => {
    return batches.reduce((sum, batch) => sum + batch.recordsProcessed, 0);
  };

  const getSuccessRate = () => {
    if (batches.length === 0) return 0;
    const successful = batches.filter(b => b.status === 'completed').length;
    return Math.round((successful / batches.length) * 100);
  };

  const getAvgResponseTime = () => {
    if (apiCalls.length === 0) return 0;
    const total = apiCalls.reduce((sum, call) => sum + call.responseTime, 0);
    return Math.round(total / apiCalls.length);
  };

  const getCurrentThroughput = () => {
    const recentCalls = apiCalls.filter(call => Date.now() - call.timestamp < 10000); // Last 10 seconds
    return Math.round(recentCalls.length / 10); // Calls per second
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header with Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="w-6 h-6" />
                Real-Time Test Dashboard
              </CardTitle>
              <CardDescription>
                Live monitoring of batch processing, API calls, and traffic flow
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {!isRunning ? (
                <button
                  onClick={startRealTest}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  Start Real Test
                </button>
              ) : (
                <button
                  onClick={stopTest}
                  className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Stop Test
                </button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <label className="font-medium">Batch Size</label>
              <p className="text-muted-foreground">{testParameters.batchSize.toLocaleString()} records</p>
            </div>
            <div>
              <label className="font-medium">Max Concurrency</label>
              <p className="text-muted-foreground">{testParameters.maxConcurrency} simultaneous calls</p>
            </div>
            <div>
              <label className="font-medium">Target Records</label>
              <p className="text-muted-foreground">{testParameters.totalRecords.toLocaleString()} total</p>
            </div>
            <div>
              <label className="font-medium">Platforms</label>
              <p className="text-muted-foreground">{testParameters.platforms.length} platforms</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-Time Metrics */}
      {isRunning && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Records Processed</p>
                    <p className="text-2xl font-bold">{getTotalRecordsProcessed().toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">in {batches.length} batches</p>
                  </div>
                  <Database className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">API Throughput</p>
                    <p className="text-2xl font-bold">{getCurrentThroughput()}</p>
                    <p className="text-xs text-muted-foreground">calls/second</p>
                  </div>
                  <Network className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                    <p className="text-2xl font-bold">{getSuccessRate()}%</p>
                    <p className="text-xs text-muted-foreground">batch completion</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Response</p>
                    <p className="text-2xl font-bold">{getAvgResponseTime()}ms</p>
                    <p className="text-xs text-muted-foreground">API response time</p>
                  </div>
                  <Timer className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Traffic Flow by Platform */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Platform Traffic Flow
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {trafficFlow.map(tf => (
                  <Card key={tf.platform}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant={tf.platform === 'salesforce' ? 'default' : tf.platform === 'hubspot' ? 'secondary' : 'outline'}>
                          {tf.platform}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-xs text-muted-foreground">{tf.concurrentCalls} active</span>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Total Requests:</span>
                          <span className="font-medium">{tf.totalRequests.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Success Rate:</span>
                          <span className="font-medium text-green-600">{tf.successRate.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Avg Response:</span>
                          <span className="font-medium">{tf.avgResponseTime.toFixed(0)}ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Rate Limits:</span>
                          <span className="font-medium text-orange-600">{tf.rateLimitHits}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Live Batch Processing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Live Batch Processing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="batches" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="batches">Recent Batches</TabsTrigger>
                  <TabsTrigger value="api-calls">API Calls</TabsTrigger>
                </TabsList>
                
                <TabsContent value="batches" className="space-y-2 max-h-96 overflow-y-auto">
                  {batches.map(batch => (
                    <div key={batch.batchId} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {batch.status === 'completed' ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : batch.status === 'failed' ? (
                            <XCircle className="w-4 h-4 text-red-500" />
                          ) : (
                            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                          )}
                          <Badge variant={batch.platform === 'salesforce' ? 'default' : batch.platform === 'hubspot' ? 'secondary' : 'outline'}>
                            {batch.platform}
                          </Badge>
                        </div>
                        <span className="font-medium text-sm">{batch.agentType}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{batch.recordsProcessed.toLocaleString()} records</span>
                        <span>{(batch.confidence * 100).toFixed(1)}%</span>
                        <span>{batch.apiCalls} API calls</span>
                        <span>{batch.endTime ? `${batch.endTime - batch.startTime}ms` : 'Processing...'}</span>
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="api-calls" className="space-y-2 max-h-96 overflow-y-auto">
                  {apiCalls.map(call => (
                    <div key={call.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant={call.status === 200 ? 'default' : call.status === 429 ? 'destructive' : 'secondary'}>
                          {call.status}
                        </Badge>
                        <span className="font-mono text-sm">{call.method}</span>
                        <span className="text-sm">{call.endpoint}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{call.responseTime.toFixed(0)}ms</span>
                        <span>{call.platform}</span>
                        <span>{new Date(call.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};