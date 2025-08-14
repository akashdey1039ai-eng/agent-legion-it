import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, ExternalLink, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface HubSpotIntegrationProps {
  onSyncComplete?: () => void;
}

export default function HubSpotIntegration({ onSyncComplete }: HubSpotIntegrationProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const syncOptions = [
    {
      id: 'contacts',
      name: 'Contacts',
      description: 'Sync contact information and lead data'
    },
    {
      id: 'companies', 
      name: 'Companies',
      description: 'Sync company and account data'
    },
    {
      id: 'deals',
      name: 'Deals', 
      description: 'Sync opportunities and deal pipeline'
    }
  ];

  useEffect(() => {
    if (user) {
      checkConnection();
    }
  }, [user]);

  const checkConnection = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('hubspot_tokens')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking HubSpot connection:', error);
        return;
      }

      if (data) {
        const isExpired = new Date(data.expires_at) <= new Date();
        setIsConnected(!isExpired);
        
        if (isExpired) {
          toast({
            title: "HubSpot Connection Expired",
            description: "Please reconnect your HubSpot account.",
            variant: "destructive",
          });
        }
      } else {
        setIsConnected(false);
      }
    } catch (error) {
      console.error('Error checking HubSpot connection:', error);
    }
  };

  const handleConnect = async () => {
    if (!user) return;

    setIsConnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke('hubspot-auth-url', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) {
        console.error('Error getting HubSpot auth URL:', error);
        toast({
          title: "Connection Failed",
          description: "Unable to generate HubSpot authorization URL. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (data?.authUrl) {
        // Open popup window for OAuth
        const popup = window.open(
          data.authUrl,
          'hubspot-auth',
          'width=600,height=600,scrollbars=yes,resizable=yes'
        );

        // Listen for messages from the popup
        const messageListener = (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return;
          
          if (event.data.type === 'HUBSPOT_AUTH_SUCCESS') {
            popup?.close();
            window.removeEventListener('message', messageListener);
            
            toast({
              title: "Connected Successfully!",
              description: "Your HubSpot account has been connected.",
            });
            
            checkConnection();
          } else if (event.data.type === 'HUBSPOT_AUTH_ERROR') {
            popup?.close();
            window.removeEventListener('message', messageListener);
            
            toast({
              title: "Connection Failed",
              description: event.data.error || "Failed to connect to HubSpot.",
              variant: "destructive",
            });
          }
        };

        window.addEventListener('message', messageListener);

        // Check if popup was closed manually
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed);
            window.removeEventListener('message', messageListener);
            setIsConnecting(false);
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Error connecting to HubSpot:', error);
      toast({
        title: "Connection Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSync = async (objectType: string) => {
    if (!user) return;

    setIsSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('hubspot-sync', {
        body: {
          objectType,
          direction: 'from'
        },
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) {
        console.error('Error syncing HubSpot data:', error);
        console.error('Full error details:', JSON.stringify(error, null, 2));
        
        // Try to get more details from the error
        let errorMessage = `Failed to sync ${objectType}. Please try again.`;
        if (error.message) {
          errorMessage = error.message;
        }
        
        toast({
          title: "Sync Failed",
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }

      if (data) {
        console.log('Sync response data:', data);
        toast({
          title: "Sync Successful",
          description: `Successfully synced ${objectType} data.`,
        });
      }

      setLastSyncTime(new Date().toLocaleString());
      onSyncComplete?.();
    } catch (error) {
      console.error('Error syncing HubSpot data:', error);
      toast({
        title: "Sync Failed",
        description: "An unexpected error occurred during sync.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    if (!user) return;

    try {
      // Delete tokens from database
      const { error } = await supabase
        .from('hubspot_tokens')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Error disconnecting HubSpot:', error);
        toast({
          title: "Disconnect Failed",
          description: "Failed to disconnect HubSpot. Please try again.",
          variant: "destructive",
        });
        return;
      }

      setIsConnected(false);
      setLastSyncTime(null);
      
      toast({
        title: "Disconnected",
        description: "HubSpot has been disconnected successfully.",
      });
    } catch (error) {
      console.error('Error disconnecting HubSpot:', error);
      toast({
        title: "Disconnect Failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              HubSpot Integration
              {isConnected ? (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Connected
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Not Connected
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Connect your HubSpot CRM to sync contacts, companies, and deals data
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isConnected ? (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Getting Started</h4>
              <p className="text-sm text-blue-700 mb-3">
                To connect HubSpot, you'll need:
              </p>
              <ul className="text-sm text-blue-700 space-y-1 mb-3">
                <li>• A HubSpot account with CRM access</li>
                <li>• Admin permissions to authorize the connection</li>
                <li>• Access to contacts, companies, and deals data</li>
              </ul>
              <Button 
                onClick={handleConnect} 
                disabled={isConnecting}
                className="w-full"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Connect HubSpot Account
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h4 className="font-medium text-green-900">HubSpot Connected</h4>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDisconnect}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  Disconnect
                </Button>
              </div>
              <p className="text-sm text-green-700">
                Your AI agent is ready to access HubSpot data for intelligent CRM operations.
              </p>
              {lastSyncTime && (
                <p className="text-xs text-green-600 mt-2">
                  Last sync: {lastSyncTime}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Sync Data</h4>
              <div className="grid gap-3">
                {syncOptions.map((option) => (
                  <div key={option.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h5 className="font-medium">{option.name}</h5>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                    <Button
                      onClick={() => handleSync(option.id)}
                      disabled={isSyncing}
                      size="sm"
                    >
                      {isSyncing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'Sync Now'
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}