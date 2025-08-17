import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, TestTube } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface TestResult {
  status: 'PASSED' | 'FAILED';
  error?: string;
  response?: any;
}

interface TestResults {
  salesforce: Record<string, TestResult>;
  hubspot: Record<string, TestResult>;
  native: Record<string, TestResult>;
  summary: {
    totalTests: number;
    passed: number;
    failed: number;
    errors: string[];
  };
  success: boolean;
  completedAt: string;
  recommendations: string[];
}

export const ComprehensiveAITester = () => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<TestResults | null>(null);
  const { user } = useAuth();

  const runComprehensiveTest = async () => {
    if (!user) {
      toast.error('Please sign in to run tests');
      return;
    }

    setTesting(true);
    setResults(null);

    try {
      console.log('🧪 Starting comprehensive AI agent test...');
      
      const { data, error } = await supabase.functions.invoke('ai-agent-test-runner', {
        body: { userId: user.id }
      });

      if (error) {
        throw error;
      }

      setResults(data);
      
      if (data.success) {
        toast.success(`All tests passed! (${data.summary.passed}/${data.summary.totalTests})`);
      } else {
        toast.error(`${data.summary.failed} tests failed out of ${data.summary.totalTests}`);
      }
      
    } catch (error) {
      console.error('❌ Error running comprehensive test:', error);
      toast.error('Failed to run comprehensive test: ' + error.message);
    } finally {
      setTesting(false);
    }
  };

  const getStatusBadge = (status: 'PASSED' | 'FAILED') => {
    return status === 'PASSED' ? (
      <Badge variant="secondary" className="bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3 mr-1" />
        PASSED
      </Badge>
    ) : (
      <Badge variant="destructive">
        <XCircle className="w-3 h-3 mr-1" />
        FAILED
      </Badge>
    );
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="w-5 h-5" />
          Comprehensive AI Agent Tester
        </CardTitle>
        <CardDescription>
          Test all AI agents across Salesforce, HubSpot, and Native platforms to identify failures
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button 
            onClick={runComprehensiveTest} 
            disabled={testing}
            className="w-full"
          >
            {testing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Running Comprehensive Test...
              </>
            ) : (
              <>
                <TestTube className="w-4 h-4 mr-2" />
                Run All AI Agent Tests
              </>
            )}
          </Button>

          {results && (
            <div className="space-y-6">
              {/* Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Test Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold">{results.summary.totalTests}</div>
                      <div className="text-sm text-muted-foreground">Total Tests</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">{results.summary.passed}</div>
                      <div className="text-sm text-muted-foreground">Passed</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">{results.summary.failed}</div>
                      <div className="text-sm text-muted-foreground">Failed</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Salesforce Results */}
              <Card>
                <CardHeader>
                  <CardTitle>Salesforce AI Agents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(results.salesforce).map(([agentType, result]) => (
                      <div key={agentType} className="flex items-center justify-between p-2 border rounded">
                        <span className="font-medium">{agentType}</span>
                        {getStatusBadge(result.status)}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* HubSpot Results */}
              <Card>
                <CardHeader>
                  <CardTitle>HubSpot AI Agents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(results.hubspot).map(([agentType, result]) => (
                      <div key={agentType} className="flex items-center justify-between p-2 border rounded">
                        <span className="font-medium">{agentType}</span>
                        {getStatusBadge(result.status)}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Native Results */}
              <Card>
                <CardHeader>
                  <CardTitle>Native AI Agents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(results.native).map(([agentType, result]) => (
                      <div key={agentType} className="flex items-center justify-between p-2 border rounded">
                        <span className="font-medium">{agentType}</span>
                        {getStatusBadge(result.status)}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Errors and Recommendations */}
              {results.summary.errors.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-red-600">Errors Found</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      {results.summary.errors.map((error, index) => (
                        <div key={index} className="text-sm text-red-600 p-2 bg-red-50 rounded">
                          {error}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {results.recommendations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      {results.recommendations.map((rec, index) => (
                        <div key={index} className="text-sm p-2 bg-blue-50 rounded">
                          • {rec}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};