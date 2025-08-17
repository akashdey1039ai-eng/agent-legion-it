import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertTriangle, CheckCircle, XCircle, Stethoscope } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface DiagnosticResult {
  success: boolean;
  diagnostics: {
    environment: any;
    openai: any;
    salesforce: any;
    hubspot: any;
    database: any;
    errors: string[];
  };
  summary: {
    total_errors: number;
    critical_issues: string[];
    recommendations: string[];
  };
  timestamp: string;
}

export const AIDiagnostics = () => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<DiagnosticResult | null>(null);
  const { user } = useAuth();

  const runDiagnostics = async () => {
    if (!user) {
      toast.error('Please sign in to run diagnostics');
      return;
    }

    setTesting(true);
    setResults(null);

    try {
      console.log('🔍 Starting AI diagnostics...');
      
      const { data, error } = await supabase.functions.invoke('ai-diagnostics', {
        body: { userId: user.id }
      });

      if (error) {
        throw error;
      }

      setResults(data);
      
      if (data.success) {
        toast.success('Diagnostics completed - No critical issues found!');
      } else {
        toast.error(`${data.summary.total_errors} critical issues found`);
      }
      
    } catch (error) {
      console.error('❌ Error running diagnostics:', error);
      toast.error('Failed to run diagnostics: ' + error.message);
    } finally {
      setTesting(false);
    }
  };

  const getStatusBadge = (isOk: boolean, label: string) => {
    return isOk ? (
      <Badge variant="secondary" className="bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3 mr-1" />
        {label}
      </Badge>
    ) : (
      <Badge variant="destructive">
        <XCircle className="w-3 h-3 mr-1" />
        {label}
      </Badge>
    );
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Stethoscope className="w-5 h-5" />
          AI System Diagnostics
        </CardTitle>
        <CardDescription>
          Diagnose why all AI agents are failing - Check OpenAI API, tokens, and connections
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button 
            onClick={runDiagnostics} 
            disabled={testing}
            className="w-full"
            variant="outline"
          >
            {testing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Running Diagnostics...
              </>
            ) : (
              <>
                <Stethoscope className="w-4 h-4 mr-2" />
                Run System Diagnostics
              </>
            )}
          </Button>

          {results && (
            <div className="space-y-6">
              {/* Summary */}
              <Card className={results.success ? "border-green-200" : "border-red-200"}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {results.success ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    )}
                    Diagnostic Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-red-600">{results.summary.total_errors}</div>
                      <div className="text-sm text-muted-foreground">Critical Issues</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{results.summary.recommendations.length}</div>
                      <div className="text-sm text-muted-foreground">Recommendations</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Environment Check */}
              <Card>
                <CardHeader>
                  <CardTitle>Environment Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <span>Supabase URL</span>
                      {getStatusBadge(results.diagnostics.environment.supabase_url, results.diagnostics.environment.supabase_url ? 'OK' : 'Missing')}
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Service Role Key</span>
                      {getStatusBadge(results.diagnostics.environment.supabase_service_role_key, results.diagnostics.environment.supabase_service_role_key ? 'OK' : 'Missing')}
                    </div>
                    <div className="flex items-center justify-between">
                      <span>OpenAI API Key</span>
                      {getStatusBadge(results.diagnostics.environment.openai_api_key, results.diagnostics.environment.openai_api_key ? 'OK' : 'Missing')}
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Key Length</span>
                      <Badge variant="outline">{results.diagnostics.environment.openai_key_length} chars</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* OpenAI Status */}
              <Card>
                <CardHeader>
                  <CardTitle>OpenAI API Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>API Response</span>
                      {getStatusBadge(results.diagnostics.openai.ok, `${results.diagnostics.openai.status} ${results.diagnostics.openai.statusText}`)}
                    </div>
                    {results.diagnostics.openai.success && (
                      <div className="flex items-center justify-between">
                        <span>Model Used</span>
                        <Badge variant="outline">{results.diagnostics.openai.model_used}</Badge>
                      </div>
                    )}
                    {results.diagnostics.openai.error && (
                      <div className="text-sm text-red-600 p-2 bg-red-50 rounded">
                        {results.diagnostics.openai.error}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Connection Status */}
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Salesforce Connection</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span>Tokens Found</span>
                        <Badge variant="outline">{results.diagnostics.salesforce.tokens_found}</Badge>
                      </div>
                      {results.diagnostics.salesforce.is_expired !== undefined && (
                        <div className="flex items-center justify-between">
                          <span>Token Status</span>
                          {getStatusBadge(!results.diagnostics.salesforce.is_expired, results.diagnostics.salesforce.is_expired ? 'Expired' : 'Valid')}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>HubSpot Connection</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span>Tokens Found</span>
                        <Badge variant="outline">{results.diagnostics.hubspot.tokens_found}</Badge>
                      </div>
                      {results.diagnostics.hubspot.is_expired !== undefined && (
                        <div className="flex items-center justify-between">
                          <span>Token Status</span>
                          {getStatusBadge(!results.diagnostics.hubspot.is_expired, results.diagnostics.hubspot.is_expired ? 'Expired' : 'Valid')}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Critical Issues */}
              {results.summary.critical_issues.length > 0 && (
                <Card className="border-red-200">
                  <CardHeader>
                    <CardTitle className="text-red-600">Critical Issues Found</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {results.summary.critical_issues.map((issue, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm text-red-600 p-2 bg-red-50 rounded">
                          <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          {issue}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recommendations */}
              {results.summary.recommendations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recommended Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {results.summary.recommendations.map((rec, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm p-2 bg-blue-50 rounded">
                          <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-600" />
                          {rec}
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