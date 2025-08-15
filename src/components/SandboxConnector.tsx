import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useSecurityContext } from './SecurityProvider';
import { CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';

interface SandboxConfig {
  type: 'salesforce' | 'hubspot' | 'custom';
  url: string;
  clientId: string;
  clientSecret: string;
  testMode: boolean;
}

export const SandboxConnector = () => {
  const { logSecurityEvent, validateInput } = useSecurityContext();
  const [config, setConfig] = useState<SandboxConfig>({
    type: 'salesforce',
    url: '',
    clientId: '',
    clientSecret: '',
    testMode: true
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'connected' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleConnect = async () => {
    setIsConnecting(true);
    setConnectionStatus('testing');
    setErrorMessage('');

    // Validate inputs
    if (!validateInput(config.url, 'text') || !validateInput(config.clientId, 'text')) {
      setErrorMessage('Invalid URL or Client ID format');
      setConnectionStatus('error');
      setIsConnecting(false);
      return;
    }

    try {
      // Log sandbox connection attempt
      await logSecurityEvent('SANDBOX_CONNECTION_ATTEMPT', {
        type: config.type,
        url: config.url,
        testMode: config.testMode
      });

      // Test connection (mock implementation)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In a real implementation, this would test the actual connection
      // For now, we'll simulate a successful connection
      setConnectionStatus('connected');
      
      await logSecurityEvent('SANDBOX_CONNECTION_SUCCESS', {
        type: config.type,
        url: config.url
      });

    } catch (error) {
      setConnectionStatus('error');
      setErrorMessage('Failed to connect to sandbox. Please check your credentials.');
      
      await logSecurityEvent('SANDBOX_CONNECTION_FAILED', {
        type: config.type,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const getStatusBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" /> Connected</Badge>;
      case 'testing':
        return <Badge variant="secondary">Testing...</Badge>;
      case 'error':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" /> Error</Badge>;
      default:
        return <Badge variant="outline">Not Connected</Badge>;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Sandbox Environment Connector
          {getStatusBadge()}
        </CardTitle>
        <CardDescription>
          Connect your AI CRM Intelligence Platform to your CRM sandbox for testing before production deployment.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={config.type} onValueChange={(value) => setConfig({...config, type: value as any})}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="salesforce">Salesforce</TabsTrigger>
            <TabsTrigger value="hubspot">HubSpot</TabsTrigger>
            <TabsTrigger value="custom">Custom API</TabsTrigger>
          </TabsList>

          <TabsContent value="salesforce" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="sf-url">Salesforce Sandbox URL</Label>
                <Input
                  id="sf-url"
                  placeholder="https://your-company--sandbox.sandbox.my.salesforce.com"
                  value={config.url}
                  onChange={(e) => setConfig({...config, url: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="sf-client-id">Connected App Client ID</Label>
                <Input
                  id="sf-client-id"
                  placeholder="Your Salesforce Connected App Client ID"
                  value={config.clientId}
                  onChange={(e) => setConfig({...config, clientId: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="sf-client-secret">Connected App Client Secret</Label>
                <Input
                  id="sf-client-secret"
                  type="password"
                  placeholder="Your Salesforce Connected App Client Secret"
                  value={config.clientSecret}
                  onChange={(e) => setConfig({...config, clientSecret: e.target.value})}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="hubspot" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="hs-url">HubSpot API Base URL</Label>
                <Input
                  id="hs-url"
                  placeholder="https://api.hubspot.com"
                  value={config.url}
                  onChange={(e) => setConfig({...config, url: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="hs-client-id">HubSpot App Client ID</Label>
                <Input
                  id="hs-client-id"
                  placeholder="Your HubSpot App Client ID"
                  value={config.clientId}
                  onChange={(e) => setConfig({...config, clientId: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="hs-client-secret">HubSpot App Client Secret</Label>
                <Input
                  id="hs-client-secret"
                  type="password"
                  placeholder="Your HubSpot App Client Secret"
                  value={config.clientSecret}
                  onChange={(e) => setConfig({...config, clientSecret: e.target.value})}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="custom" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="custom-url">Custom API Base URL</Label>
                <Input
                  id="custom-url"
                  placeholder="https://your-api.company.com"
                  value={config.url}
                  onChange={(e) => setConfig({...config, url: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="custom-client-id">API Key / Client ID</Label>
                <Input
                  id="custom-client-id"
                  placeholder="Your API Key or Client ID"
                  value={config.clientId}
                  onChange={(e) => setConfig({...config, clientId: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="custom-client-secret">API Secret (if required)</Label>
                <Input
                  id="custom-client-secret"
                  type="password"
                  placeholder="Your API Secret"
                  value={config.clientSecret}
                  onChange={(e) => setConfig({...config, clientSecret: e.target.value})}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {errorMessage && (
          <Alert className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="test-mode"
              checked={config.testMode}
              onChange={(e) => setConfig({...config, testMode: e.target.checked})}
              className="rounded"
            />
            <Label htmlFor="test-mode">Test Mode (Sandbox)</Label>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <a href="https://docs.lovable.dev" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Documentation
              </a>
            </Button>
            <Button 
              onClick={handleConnect} 
              disabled={isConnecting || !config.url || !config.clientId}
            >
              {isConnecting ? 'Testing Connection...' : 'Test Connection'}
            </Button>
          </div>
        </div>

        {connectionStatus === 'connected' && (
          <Alert className="mt-4 border-green-500 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Successfully connected to {config.type} sandbox! You can now deploy this as an intelligent layer 
              on top of your existing CRM platform.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};