import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Clock, RefreshCw, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface SalesforceIntegrationProps {
  onSyncComplete?: () => void;
}

export function SalesforceIntegration({ onSyncComplete }: SalesforceIntegrationProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleConnect = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to connect to Salesforce.",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    try {
      // Build Salesforce OAuth URL
      const salesforceAuthUrl = new URL('https://login.salesforce.com/services/oauth2/authorize');
      salesforceAuthUrl.searchParams.set('response_type', 'code');
      salesforceAuthUrl.searchParams.set('client_id', 'YOUR_CLIENT_ID'); // This would be fetched from backend
      salesforceAuthUrl.searchParams.set('redirect_uri', `${window.location.origin}/salesforce-callback`);
      salesforceAuthUrl.searchParams.set('scope', 'api refresh_token offline_access');
      salesforceAuthUrl.searchParams.set('state', user.id);

      // Open Salesforce OAuth in new window
      const popup = window.open(
        salesforceAuthUrl.toString(),
        'salesforce-auth',
        'width=600,height=700,scrollbars=yes,resizable=yes'
      );

      // Listen for the callback
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          setIsConnecting(false);
          // Check if connection was successful
          checkConnection();
        }
      }, 1000);

    } catch (error) {
      console.error('Connection error:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to initiate Salesforce connection.",
        variant: "destructive",
      });
      setIsConnecting(false);
    }
  };

  const checkConnection = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('salesforce_tokens')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data && !error) {
        setIsConnected(true);
        setLastSyncTime(data.updated_at);
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    }
  };

  const handleSync = async (objectType: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to sync data.",
        variant: "destructive",
      });
      return;
    }

    setIsSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('salesforce-sync', {
        body: {
          objectType,
          userId: user.id,
          direction: 'from_salesforce',
        },
      });

      if (error) throw error;

      toast({
        title: "Sync Successful",
        description: `${objectType} data has been synced from Salesforce.`,
      });

      setLastSyncTime(new Date().toISOString());
      onSyncComplete?.();
      
    } catch (error) {
      console.error('Sync error:', error);
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync data from Salesforce.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const syncOptions = [
    { key: 'account', label: 'Companies', description: 'Sync Salesforce Accounts to Companies' },
    { key: 'contact', label: 'Contacts', description: 'Sync Salesforce Contacts' },
    { key: 'opportunity', label: 'Opportunities', description: 'Sync Salesforce Opportunities' },
  ];

  // Check connection status on component mount
  useState(() => {
    checkConnection();
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Salesforce Integration
          </CardTitle>
          <CardDescription>
            Connect and sync your Salesforce data with your CRM dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={isConnected ? "default" : "secondary"}>
                {isConnected ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Connected
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Not Connected
                  </>
                )}
              </Badge>
              {lastSyncTime && (
                <span className="text-sm text-muted-foreground">
                  Last sync: {new Date(lastSyncTime).toLocaleString()}
                </span>
              )}
            </div>
            
            {!isConnected ? (
              <Button 
                onClick={handleConnect} 
                disabled={isConnecting}
                className="flex items-center gap-2"
              >
                {isConnecting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  'Connect to Salesforce'
                )}
              </Button>
            ) : (
              <Button 
                variant="outline" 
                onClick={() => setIsConnected(false)}
              >
                Disconnect
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {isConnected && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Data Synchronization
            </CardTitle>
            <CardDescription>
              Sync specific data types from Salesforce to your local CRM
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {syncOptions.map((option) => (
                <Card key={option.key} className="p-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">{option.label}</h4>
                    <p className="text-sm text-muted-foreground">
                      {option.description}
                    </p>
                    <Button
                      size="sm"
                      onClick={() => handleSync(option.key)}
                      disabled={isSyncing}
                      className="w-full"
                    >
                      {isSyncing ? (
                        <>
                          <Clock className="h-3 w-3 mr-1" />
                          Syncing...
                        </>
                      ) : (
                        'Sync Now'
                      )}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}