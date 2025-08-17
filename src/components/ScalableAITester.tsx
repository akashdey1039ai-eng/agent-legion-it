import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Activity, 
  Database, 
  Clock,
  TrendingUp,
  Zap,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface ScalableTestProgress {
  testId: string;
  platform: string;
  agent_type: string;
  status: 'running' | 'completed' | 'failed';
  records_processed: number;
  confidence: number;
  created_at: string;
}

interface ScalableTestRun {
  id: string;
  status: 'running' | 'completed' | 'failed';
  total_platforms: number;
  total_agent_types: number;
  batch_size: number;
  total_records: number;
  results?: any;
  completion_time?: number;
  started_at: string;
  completed_at?: string;
}

interface LiveStats {
  totalRecords: number;
  processedRecords: number;
  completedTests: number;
  failedTests: number;
  avgConfidence: number;
  recordsPerSecond: number;
  estimatedTimeRemaining: number;
}

export const ScalableAITester = () => {
  const [testing, setTesting] = useState(false);
  const [currentTestRun, setCurrentTestRun] = useState<ScalableTestRun | null>(null);
  const [testProgress, setTestProgress] = useState<ScalableTestProgress[]>([]);
  const [liveStats, setLiveStats] = useState<LiveStats | null>(null);
  const [batchSize, setBatchSize] = useState(1000);
  const [maxConcurrency, setMaxConcurrency] = useState(3);
  const { user } = useAuth();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Real-time subscription to test progress
  useEffect(() => {
    if (!currentTestRun?.id) return;

    const channel = supabase
      .channel('test-progress')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ai_test_progress',
          filter: `test_run_id=eq.${currentTestRun.id}`
        },
        (payload) => {
          setTestProgress(prev => [...prev, payload.new as ScalableTestProgress]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'ai_test_runs',
          filter: `id=eq.${currentTestRun.id}`
        },
        (payload) => {
          setCurrentTestRun(prev => prev ? { ...prev, ...payload.new } : null);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentTestRun?.id]);

  // Calculate live statistics
  useEffect(() => {
    if (!currentTestRun || !testProgress.length) return;

    const completedTests = testProgress.filter(p => p.status === 'completed').length;
    const failedTests = testProgress.filter(p => p.status === 'failed').length;
    const totalProcessed = testProgress.reduce((sum, p) => sum + p.records_processed, 0);
    const avgConfidence = testProgress.length > 0 
      ? testProgress.reduce((sum, p) => sum + p.confidence, 0) / testProgress.length 
      : 0;

    const elapsedTime = (new Date().getTime() - new Date(currentTestRun.started_at).getTime()) / 1000;
    const recordsPerSecond = elapsedTime > 0 ? totalProcessed / elapsedTime : 0;
    const remainingRecords = currentTestRun.total_records - totalProcessed;
    const estimatedTimeRemaining = recordsPerSecond > 0 ? remainingRecords / recordsPerSecond : 0;

    setLiveStats({
      totalRecords: currentTestRun.total_records,
      processedRecords: totalProcessed,
      completedTests,
      failedTests,
      avgConfidence: avgConfidence * 100,
      recordsPerSecond: Math.round(recordsPerSecond),
      estimatedTimeRemaining: Math.round(estimatedTimeRemaining / 60) // in minutes
    });
  }, [testProgress, currentTestRun]);

  const startScalableTest = async () => {
    if (!user) {
      toast.error('Please sign in to run tests');
      return;
    }

    setTesting(true);
    setTestProgress([]);
    setLiveStats(null);

    try {
      console.log('🚀 Starting scalable AI agent test for 150,000 records...');
      
      const { data, error } = await supabase.functions.invoke('ai-agent-test-runner-scalable', {
        body: { 
          userId: user.id,
          batchSize,
          maxConcurrency,
          enableBackground: true
        }
      });

      if (error) {
        throw error;
      }

      setCurrentTestRun({
        id: data.testId,
        status: 'running',
        total_platforms: 3,
        total_agent_types: 8,
        batch_size: batchSize,
        total_records: 150000,
        started_at: new Date().toISOString()
      });

      toast.success('Scalable test started! Processing 150,000 records...');
      
      // Start polling for updates
      startPolling(data.testId);
      
    } catch (error) {
      console.error('❌ Error starting scalable test:', error);
      toast.error('Failed to start scalable test: ' + error.message);
      setTesting(false);
    }
  };

  const startPolling = (testId: string) => {
    intervalRef.current = setInterval(async () => {
      try {
        const { data: testRun } = await supabase
          .from('ai_test_runs')
          .select('*')
          .eq('id', testId)
          .single();

        if (testRun?.status === 'completed' || testRun?.status === 'failed') {
          setTesting(false);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          
          if (testRun.status === 'completed') {
            toast.success(`Test completed! Processed ${testRun.total_records} records in ${Math.round(testRun.completion_time / 1000 / 60)} minutes`);
          } else {
            toast.error('Test failed. Check the progress for details.');
          }
        }
      } catch (error) {
        console.error('Error polling test status:', error);
      }
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const getProgressPercentage = () => {
    if (!liveStats) return 0;
    return Math.round((liveStats.processedRecords / liveStats.totalRecords) * 100);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-6 h-6" />
            Scalable AI Agent Testing - 150,000 Records
          </CardTitle>
          <CardDescription>
            Real-time testing across Salesforce (50K), HubSpot (50K), and Native CRM (50K) records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
              <label className="text-sm font-medium">Batch Size</label>
              <select 
                value={batchSize} 
                onChange={(e) => setBatchSize(Number(e.target.value))}
                disabled={testing}
                className="w-full mt-1 p-2 border rounded"
              >
                <option value={500}>500 (Conservative)</option>
                <option value={1000}>1000 (Balanced)</option>
                <option value={2000}>2000 (Aggressive)</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium">Max Concurrency</label>
              <select 
                value={maxConcurrency} 
                onChange={(e) => setMaxConcurrency(Number(e.target.value))}
                disabled={testing}
                className="w-full mt-1 p-2 border rounded"
              >
                <option value={2}>2 (Safe)</option>
                <option value={3}>3 (Balanced)</option>
                <option value={5}>5 (Fast)</option>
              </select>
            </div>
          </div>
          
          <Button 
            onClick={startScalableTest} 
            disabled={testing}
            size="lg"
            className="w-full"
          >
            {testing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Testing 150,000 Records...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 mr-2" />
                Start Scalable Test (150K Records)
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Live Stats Dashboard */}
      {liveStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Records Processed</p>
                  <p className="text-2xl font-bold">{liveStats.processedRecords.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">of {liveStats.totalRecords.toLocaleString()}</p>
                </div>
                <Database className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Processing Speed</p>
                  <p className="text-2xl font-bold">{liveStats.recordsPerSecond}</p>
                  <p className="text-xs text-muted-foreground">records/second</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Confidence</p>
                  <p className="text-2xl font-bold">{liveStats.avgConfidence.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">across all tests</p>
                </div>
                <CheckCircle className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Time Remaining</p>
                  <p className="text-2xl font-bold">{liveStats.estimatedTimeRemaining}m</p>
                  <p className="text-xs text-muted-foreground">estimated</p>
                </div>
                <Clock className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Progress Bar */}
      {testing && liveStats && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span>{getProgressPercentage()}%</span>
              </div>
              <Progress value={getProgressPercentage()} className="h-3" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Tests: {liveStats.completedTests} completed, {liveStats.failedTests} failed</span>
                <span>{liveStats.processedRecords.toLocaleString()} / {liveStats.totalRecords.toLocaleString()} records</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Results */}
      {testProgress.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Real-time Test Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All Platforms</TabsTrigger>
                <TabsTrigger value="salesforce">Salesforce</TabsTrigger>
                <TabsTrigger value="hubspot">HubSpot</TabsTrigger>
                <TabsTrigger value="native">Native</TabsTrigger>
              </TabsList>
              
              {['all', 'salesforce', 'hubspot', 'native'].map(platform => (
                <TabsContent key={platform} value={platform} className="space-y-2">
                  {testProgress
                    .filter(p => platform === 'all' || p.platform === platform)
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .map((progress, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {progress.status === 'completed' ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : progress.status === 'failed' ? (
                            <XCircle className="w-4 h-4 text-red-500" />
                          ) : (
                            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                          )}
                          <Badge variant={progress.platform === 'salesforce' ? 'default' : progress.platform === 'hubspot' ? 'secondary' : 'outline'}>
                            {progress.platform}
                          </Badge>
                        </div>
                        <span className="font-medium">{progress.agent_type}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{progress.records_processed.toLocaleString()} records</span>
                        <span>{(progress.confidence * 100).toFixed(1)}% confidence</span>
                        <span>{new Date(progress.created_at).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};