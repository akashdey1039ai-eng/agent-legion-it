import { useState, useEffect } from 'react';
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
      // Get Salesforce OAuth URL from our backend
      const { data, error } = await supabase.functions.invoke('salesforce-auth-url', {
        body: { userId: user.id }
      });

      if (error) throw error;

      if (!data?.authUrl) {
        throw new Error('Failed to get Salesforce authorization URL');
      }

      // Open Salesforce OAuth in new window
      const popup = window.open(
        data.authUrl,
        'salesforce-auth',
        'width=600,height=700,scrollbars=yes,resizable=yes'
      );

      // Listen for messages from the popup
      const handleMessage = (event: MessageEvent) => {
        if (event.data.type === 'SALESFORCE_AUTH_SUCCESS') {
          setIsConnecting(false);
          checkConnection(); // Refresh connection status
          toast({
            title: "Connected Successfully",
            description: "Your Salesforce account has been connected.",
          });
          window.removeEventListener('message', handleMessage);
        }
      };

      window.addEventListener('message', handleMessage);

      // Listen for the callback (fallback)
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', handleMessage);
          setIsConnecting(false);
          // Check if connection was successful
          checkConnection();
        }
      }, 1000);

    } catch (error) {
      console.error('Connection error:', error);
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to initiate Salesforce connection.",
        variant: "destructive",
      });
      setIsConnecting(false);
    }
  };

  const checkConnection = async () => {
    if (!user) {
      console.log('No user found, cannot check connection');
      return;
    }

    console.log('Checking Salesforce connection for user:', user.id);
    
    try {
      const { data, error } = await supabase
        .from('salesforce_tokens')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      console.log('Salesforce token query result:', { data, error });

      if (data && !error) {
        // Check if token is still valid (not expired)
        const now = new Date();
        const expiresAt = new Date(data.expires_at);
        
        console.log('Token expiration check:', { 
          now: now.toISOString(), 
          expiresAt: expiresAt.toISOString(), 
          isValid: expiresAt > now 
        });
        
        if (expiresAt > now) {
          console.log('Setting connected to true');
          setIsConnected(true);
          setLastSyncTime(data.updated_at);
        } else {
          // Token is expired
          console.log('Salesforce token has expired');
          setIsConnected(false);
        }
      } else {
        console.log('No valid token found, setting connected to false');
        setIsConnected(false);
      }
    } catch (error) {
      console.error('Error checking connection:', error);
      setIsConnected(false);
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
  useEffect(() => {
    checkConnection();
  }, [user]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Salesforce Developer Sandbox Integration
          </CardTitle>
          <CardDescription>
            Connect your <strong>Salesforce Developer Sandbox</strong> to enable fully autonomous AI agents that make real changes to your CRM data
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
              <div className="space-y-4">
                <Button 
                  onClick={handleConnect} 
                  disabled={isConnecting}
                  className="flex items-center gap-2"
                >
                  {isConnecting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Connecting to Salesforce...
                    </>
                  ) : (
                    'Connect Developer Sandbox'
                  )}
                </Button>
                
                <div className="text-sm text-muted-foreground bg-blue-50 dark:bg-blue-950 p-3 rounded border border-blue-200 dark:border-blue-800">
                  <strong>📚 Setup Instructions:</strong>
                  <ol className="mt-2 space-y-1 list-decimal list-inside">
                    <li>Create a <strong>Developer Sandbox</strong> at <a href="https://developer.salesforce.com" className="text-blue-600 hover:underline" target="_blank">developer.salesforce.com</a></li>
                    <li>Enable API access in your sandbox settings</li>
                    <li>Click "Connect Developer Sandbox" above to authenticate</li>
                    <li>Your AI agents will then make <strong>real autonomous changes</strong> to leads, opportunities, and tasks</li>
                  </ol>
                </div>
              </div>
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
        <>
          <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                <CheckCircle className="h-5 w-5" />
                🚀 Autonomous AI Agents Ready!
              </CardTitle>
              <CardDescription className="text-green-600 dark:text-green-400">
                Your Salesforce Developer Sandbox is connected. AI agents can now make <strong>real autonomous changes</strong> to your CRM data including:
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li><strong>Lead Scoring:</strong> Auto-update lead scores and statuses</li>
                  <li><strong>Task Creation:</strong> Create follow-up tasks and meetings</li>
                  <li><strong>Pipeline Management:</strong> Adjust opportunity probabilities and stages</li>
                  <li><strong>AI Insights:</strong> Add AI analysis to record descriptions</li>
                </ul>
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Data Synchronization
              </CardTitle>
              <CardDescription>
                Sync data from your Salesforce Developer Sandbox to enable AI analysis
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
          </>
        )}
    </div>
  );
}