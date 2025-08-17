import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, RefreshCw, ExternalLink, User, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface TokenInfo {
  user_id: string;
  expires_at: string;
  created_at: string;
  is_valid: boolean;
}

export function SalesforceConnectionManager() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected' | 'error'>('checking');
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [allTokens, setAllTokens] = useState<TokenInfo[]>([]);
  const [debugInfo, setDebugInfo] = useState<string>('');
  
  const { toast } = useToast();
  const { user } = useAuth();

  const checkConnection = async () => {
    if (!user) {
      setConnectionStatus('error');
      setDebugInfo('No user logged in');
      return;
    }

    try {
      setConnectionStatus('checking');
      
      // Get all tokens for debugging
      const { data: allTokensData } = await supabase
        .from('salesforce_tokens')
        .select('user_id, expires_at, created_at')
        .order('created_at', { ascending: false });

      const processedTokens = (allTokensData || []).map(token => ({
        ...token,
        is_valid: new Date(token.expires_at) > new Date()
      }));
      
      setAllTokens(processedTokens);
      
      // Check current user's token
      const { data: userToken } = await supabase
        .from('salesforce_tokens')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (userToken) {
        const isValid = new Date(userToken.expires_at) > new Date();
        setTokenInfo({
          user_id: userToken.user_id,
          expires_at: userToken.expires_at,
          created_at: userToken.created_at,
          is_valid: isValid
        });
        
        if (isValid && userToken.access_token) {
          setConnectionStatus('connected');
          setDebugInfo(`Connected successfully! Token expires at ${new Date(userToken.expires_at).toLocaleString()}`);
          toast({
            title: "✅ Connected",
            description: "Salesforce Developer Sandbox is connected and ready!",
          });
        } else {
          setConnectionStatus('disconnected');
          setDebugInfo('Token found but expired or invalid');
        }
      } else {
        setConnectionStatus('disconnected');
        setDebugInfo(`No token found for current user (${user.email})`);
        
        // Check if other users have tokens
        const validTokensFromOtherUsers = processedTokens.filter(t => t.is_valid && t.user_id !== user.id);
        if (validTokensFromOtherUsers.length > 0) {
          setDebugInfo(prev => prev + `. Found ${validTokensFromOtherUsers.length} valid token(s) from other user(s).`);
        }
      }
    } catch (error) {
      console.error('Connection check error:', error);
      setConnectionStatus('error');
      setDebugInfo(`Error checking connection: ${error.message}`);
    }
  };

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
          
          // Check connection after a short delay
          setTimeout(() => {
            checkConnection();
          }, 2000);
          
          toast({
            title: "Authentication Successful",
            description: "Checking connection status...",
          });
          window.removeEventListener('message', handleMessage);
        }
      };

      window.addEventListener('message', handleMessage);

      // Check if popup was closed without success
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', handleMessage);
          setIsConnecting(false);
          // Check connection in case auth was successful but message was missed
          setTimeout(checkConnection, 1000);
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

  // Check connection on mount and when user changes
  useEffect(() => {
    if (user) {
      checkConnection();
    } else {
      setConnectionStatus('error');
      setDebugInfo('No user logged in');
    }
  }, [user]);

  if (!user) {
    return (
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
    );
  }

  return (
    <div className="space-y-6">
      {/* Current User Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Current User
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div><strong>Email:</strong> {user.email}</div>
            <div><strong>User ID:</strong> <code className="text-xs bg-muted px-1 py-0.5 rounded">{user.id}</code></div>
          </div>
        </CardContent>
      </Card>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Salesforce Developer Sandbox Connection
          </CardTitle>
          <CardDescription>
            Connect your Salesforce Developer Sandbox to enable AI agents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={connectionStatus === 'connected' ? "default" : connectionStatus === 'checking' ? "secondary" : "destructive"}>
                {connectionStatus === 'connected' && (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Connected
                  </>
                )}
                {connectionStatus === 'checking' && (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                    Checking...
                  </>
                )}
                {(connectionStatus === 'disconnected' || connectionStatus === 'error') && (
                  <>
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Not Connected
                  </>
                )}
              </Badge>
              {tokenInfo && (
                <span className="text-sm text-muted-foreground">
                  Token expires: {new Date(tokenInfo.expires_at).toLocaleString()}
                </span>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleConnect} 
                disabled={isConnecting}
                variant={connectionStatus === 'connected' ? 'outline' : 'default'}
              >
                {isConnecting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    Connecting...
                  </>
                ) : connectionStatus === 'connected' ? (
                  'Reconnect'
                ) : (
                  'Connect Now'
                )}
              </Button>
              
              <Button 
                variant="outline"
                onClick={checkConnection}
                disabled={connectionStatus === 'checking'}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Status
              </Button>
            </div>
          </div>

          {debugInfo && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{debugInfo}</AlertDescription>
            </Alert>
          )}

          <div className="text-xs text-muted-foreground">
            Need a developer sandbox? <a href="https://developer.salesforce.com" className="text-blue-600 hover:underline" target="_blank">Create one free →</a>
          </div>
        </CardContent>
      </Card>

      {/* Debug Info - All Tokens */}
      {allTokens.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Debug: All Salesforce Tokens
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {allTokens.map((token, index) => (
                <div key={index} className="text-xs bg-muted p-2 rounded">
                  <div><strong>User:</strong> <code>{token.user_id}</code> {token.user_id === user.id && <Badge variant="outline" className="text-xs">YOU</Badge>}</div>
                  <div><strong>Created:</strong> {new Date(token.created_at).toLocaleString()}</div>
                  <div><strong>Expires:</strong> {new Date(token.expires_at).toLocaleString()}</div>
                  <div><strong>Status:</strong> <Badge variant={token.is_valid ? "default" : "destructive"} className="text-xs">
                    {token.is_valid ? 'Valid' : 'Expired'}
                  </Badge></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}