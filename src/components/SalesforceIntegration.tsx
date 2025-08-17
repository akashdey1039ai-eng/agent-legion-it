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
  console.log('🔧 SalesforceIntegration component rendering...');
  
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  console.log('🔧 Component state:', { isConnecting, isSyncing, isConnected, user: user?.id });

  const handleConnect = async () => {
    console.log('🚀 Connect button clicked');
    console.log('👤 Current user:', user);
    
    if (!user) {
      console.log('❌ No user found');
      toast({
        title: "Authentication Required",
        description: "Please log in to connect to Salesforce.",
        variant: "destructive",
      });
      return;
    }

    console.log('✅ User authenticated, proceeding with connection');
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
        console.log('🎉 Received message from popup:', event.data);
        if (event.data.type === 'SALESFORCE_AUTH_SUCCESS') {
          console.log('✅ Auth success message received, stopping connecting state');
          setIsConnecting(false);
          
          // Wait a moment for the token to be stored, then check connection
          setTimeout(() => {
            console.log('🔄 Checking connection after successful auth...');
            checkConnection();
          }, 3000); // Increased timeout to 3 seconds
          
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
          console.log('🚪 Popup window closed, checking connection status');
          clearInterval(checkClosed);
          window.removeEventListener('message', handleMessage);
          setIsConnecting(false);
          // Check if connection was successful
          setTimeout(() => {
            console.log('🔄 Final connection check after popup closed');
            checkConnection();
          }, 1000);
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
    console.log('🔍 Check Status button clicked');
    console.log('👤 Current user:', user);
    
    if (!user) {
      console.log('🚫 No user found, cannot check connection');
      toast({
        title: "Authentication Required", 
        description: "Please log in first to check Salesforce connection status.",
        variant: "destructive",
      });
      return;
    }

    console.log('🔍 Checking Salesforce connection for user:', user.id);
    console.log('🔍 User email:', user.email);
    
    try {
      // First, let's check what tokens exist in the database
      const { data: allTokens, error: allTokensError } = await supabase
        .from('salesforce_tokens')
        .select('user_id, expires_at, created_at')
        .order('created_at', { ascending: false });

      console.log('🗂️ All Salesforce tokens in database:', allTokens);
      console.log('🗂️ All tokens error:', allTokensError);

      // Now check for user-specific tokens
      const { data, error } = await supabase
        .from('salesforce_tokens')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      console.log('🎯 User-specific Salesforce token query result:', { data, error });
      console.log('🎯 Query was for user_id:', user.id);

      if (error) {
        console.log('💥 Database error:', error);
        setIsConnected(false);
        return;
      }

      if (data) {
        // Check if token is still valid (not expired)
        const now = new Date();
        const expiresAt = new Date(data.expires_at);
        
        console.log('⏰ Token expiration check:', { 
          now: now.toISOString(), 
          expiresAt: expiresAt.toISOString(), 
          isValid: expiresAt > now,
          accessToken: data.access_token ? '✅ Present' : '❌ Missing',
          refreshToken: data.refresh_token ? '✅ Present' : '❌ Missing',
          timeDiffMinutes: Math.round((expiresAt.getTime() - now.getTime()) / (1000 * 60))
        });
        
        if (expiresAt > now && data.access_token) {
          console.log('✅ Setting connected to true - valid token found');
          setIsConnected(true);
          setLastSyncTime(data.updated_at);
          toast({
            title: "Connection Verified",
            description: "Salesforce Developer Sandbox is connected and ready!",
          });
        } else {
          // Token is expired or invalid
          console.log('⏰ Salesforce token has expired or is invalid');
          setIsConnected(false);
          toast({
            title: "Token Expired",
            description: "Please reconnect to Salesforce Developer Sandbox.",
            variant: "destructive",
          });
        }
      } else {
        console.log('❌ No tokens found for current user');
        console.log('❌ Current user ID:', user.id);
        setIsConnected(false);
        toast({
          title: "Not Connected",
          description: "No Salesforce connection found. Please connect first.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('💥 Exception during connection check:', error);
      setIsConnected(false);
      toast({
        title: "Connection Check Failed",
        description: "Unable to verify Salesforce connection status.",
        variant: "destructive",
      });
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

  // Check connection status on component mount and when user changes
  useEffect(() => {
    if (user) {
      console.log('🔄 Auto-checking connection for user:', user.id);
      checkConnection();
    }
  }, [user]);

  return (
    <div className="space-y-6">
      {!user ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5" />
              Salesforce Developer Sandbox Integration
            </CardTitle>
            <CardDescription>
              You need to log in first to connect your Salesforce Developer Sandbox
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = '/auth'}>
              Log In to Continue
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5" />
              Salesforce Developer Sandbox Integration
            </CardTitle>
            <CardDescription>
              Connect your <strong>Salesforce Developer Sandbox</strong> to enable AI agents
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
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleConnect} 
                      disabled={isConnecting}
                      size="lg"
                      className="flex items-center gap-2"
                    >
                      {isConnecting ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        'Connect Now'
                      )}
                    </Button>
                    
                    <Button 
                      variant="outline"
                      onClick={() => {
                        console.log('🔄 Check Status button clicked directly');
                        console.log('👤 User at button click:', user);
                        checkConnection();
                      }}
                      className="flex items-center gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Check Status
                    </Button>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Need a developer sandbox? <a href="https://developer.salesforce.com" className="text-blue-600 hover:underline" target="_blank">Create one free →</a>
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
      )}

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
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mt-2 space-y-1 text-sm text-green-600 dark:text-green-400">
                <div><strong>Lead Scoring:</strong> Auto-update lead scores and statuses</div>
                <div><strong>Task Creation:</strong> Create follow-up tasks and meetings</div>
                <div><strong>Pipeline Management:</strong> Adjust opportunity probabilities and stages</div>
                <div><strong>AI Insights:</strong> Add AI analysis to record descriptions</div>
              </div>
            </CardContent>
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