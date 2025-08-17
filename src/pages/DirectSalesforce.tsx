import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export default function DirectSalesforce() {
  const [instanceUrl, setInstanceUrl] = useState('https://orgfarm-66a6a9e5d7-dev-ed.develop.lightning.force.com');
  const [accessToken, setAccessToken] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();

  const testConnection = async () => {
    if (!accessToken.trim()) {
      toast({
        title: "Missing Token",
        description: "Please enter your Salesforce session token",
        variant: "destructive",
      });
      return;
    }

    setIsTesting(true);
    
    try {
      // Test the connection directly
      const response = await fetch(`${instanceUrl}/services/data/v58.0/sobjects/Account/describe`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Save the working credentials
        const { error } = await supabase
          .from('salesforce_tokens')
          .upsert({
            user_id: user?.id,
            access_token: accessToken,
            instance_url: instanceUrl,
            token_type: 'Bearer',
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
          }, {
            onConflict: 'user_id'
          });

        if (error) throw error;

        setIsConnected(true);
        toast({
          title: "✅ Connected Successfully!",
          description: "Your Salesforce sandbox is now connected and ready to use.",
        });
      } else {
        throw new Error(`Connection failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect to Salesforce. Please check your credentials.",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  if (isConnected) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-6 w-6" />
              Salesforce Connected Successfully!
            </CardTitle>
            <CardDescription>
              Your sandbox is ready. You can now use AI agents with your Salesforce data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Connection established to: {instanceUrl}
                </AlertDescription>
              </Alert>
              
              <Button onClick={() => window.location.href = '/ai-agents'}>
                Go to AI Agents →
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Direct Salesforce Connection
          </CardTitle>
          <CardDescription>
            Connect your Salesforce sandbox directly using a session token
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertDescription>
              <strong>Quick Setup:</strong> Get your session token from Salesforce Developer Console → Execute Anonymous → 
              <code className="bg-muted px-1 py-0.5 rounded text-xs ml-1">System.debug(UserInfo.getSessionId());</code>
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <Label htmlFor="instanceUrl">Salesforce Instance URL</Label>
              <Input
                id="instanceUrl"
                value={instanceUrl}
                onChange={(e) => setInstanceUrl(e.target.value)}
                placeholder="https://your-org.develop.lightning.force.com"
              />
            </div>

            <div>
              <Label htmlFor="accessToken">Session Token</Label>
              <Input
                id="accessToken"
                type="password"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="00D... (your session token)"
              />
            </div>

            <Button 
              onClick={testConnection} 
              disabled={isTesting}
              className="w-full"
            >
              {isTesting ? 'Testing Connection...' : 'Connect & Test'}
            </Button>
          </div>

          <div className="bg-muted p-4 rounded-lg text-sm">
            <h4 className="font-semibold mb-2">How to get your session token:</h4>
            <ol className="list-decimal list-inside space-y-1">
              <li>Log into your Salesforce sandbox</li>
              <li>Open Developer Console (Setup → Developer Console)</li>
              <li>Click Execute Anonymous</li>
              <li>Run: <code>System.debug(UserInfo.getSessionId());</code></li>
              <li>Copy the token from the debug log</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}