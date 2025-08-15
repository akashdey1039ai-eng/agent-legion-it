import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export function SalesforceDebugger() {
  const { user } = useAuth();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testSalesforceConnection = async () => {
    if (!user) {
      setError('Please log in first');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🧪 Testing Salesforce AI Agent directly...');
      
      const { data, error: functionError } = await supabase.functions.invoke('salesforce-ai-agent-tester', {
        body: { 
          agentType: 'customer-sentiment',
          userId: user.id
        }
      });

      console.log('🧪 Direct function response:', { data, error: functionError });

      if (functionError) {
        throw new Error(`Function error: ${functionError.message}`);
      }

      setResult(data);
    } catch (err: any) {
      console.error('🧪 Test error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>🧪 Salesforce Debugger</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={testSalesforceConnection} disabled={loading}>
          {loading ? 'Testing...' : 'Test Salesforce AI Function'}
        </Button>

        {error && (
          <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded">
            <h3 className="font-bold text-destructive">Error:</h3>
            <p className="text-destructive/80">{error}</p>
          </div>
        )}

        {result && (
          <div className="mt-4 space-y-4">
            <div className="p-4 bg-success/10 border border-success/20 rounded">
              <h3 className="font-bold text-success">Success!</h3>
              <p className="text-success/80">Records analyzed: {result.recordsAnalyzed}</p>
              <p className="text-success/80">Data source: {result.dataSource}</p>
            </div>

            <div className="p-4 bg-blue-950/30 border border-blue-500/20 rounded">
              <h3 className="font-bold text-blue-400">Raw Salesforce Data ({result.rawSalesforceData?.length || 0} records):</h3>
              <pre className="text-xs mt-2 overflow-auto max-h-60 text-blue-100">
                {JSON.stringify(result.rawSalesforceData, null, 2)}
              </pre>
            </div>

            <div className="p-4 bg-green-950/30 border border-green-500/20 rounded">
              <h3 className="font-bold text-green-400">AI Analysis:</h3>
              <pre className="text-xs mt-2 overflow-auto max-h-60 text-green-100">
                {JSON.stringify(result.analysis, null, 2)}
              </pre>
            </div>

            <div className="p-4 bg-muted/30 border border-border rounded">
              <h3 className="font-bold text-foreground">Complete Response:</h3>
              <pre className="text-xs mt-2 overflow-auto max-h-60 text-muted-foreground">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}