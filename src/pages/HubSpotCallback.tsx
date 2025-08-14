import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function HubSpotCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing HubSpot authentication...');

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');

      if (error) {
        setStatus('error');
        setMessage(`Authentication failed: ${error}`);
        
        toast({
          title: "Authentication Failed",
          description: `HubSpot authentication failed: ${error}`,
          variant: "destructive",
        });

        // Send error message to parent window
        if (window.opener) {
          window.opener.postMessage({
            type: 'HUBSPOT_AUTH_ERROR',
            error: `Authentication failed: ${error}`
          }, window.location.origin);
          window.close();
        } else {
          setTimeout(() => navigate('/'), 3000);
        }
        return;
      }

      if (!code || !state) {
        setStatus('error');
        setMessage('Missing authorization code or state parameter.');
        
        toast({
          title: "Authentication Failed",
          description: "Missing required parameters from HubSpot.",
          variant: "destructive",
        });

        if (window.opener) {
          window.opener.postMessage({
            type: 'HUBSPOT_AUTH_ERROR',
            error: 'Missing authorization code or state'
          }, window.location.origin);
          window.close();
        } else {
          setTimeout(() => navigate('/'), 3000);
        }
        return;
      }

      try {
        setMessage('Exchanging authorization code for tokens...');

        const { data, error: authError } = await supabase.functions.invoke('hubspot-auth', {
          body: { code, state }
        });

        if (authError) {
          throw new Error(authError.message || 'Authentication failed');
        }

        setStatus('success');
        setMessage('HubSpot connected successfully!');
        
        toast({
          title: "Success!",
          description: "Your HubSpot account has been connected successfully.",
        });

        // Send success message to parent window
        if (window.opener) {
          window.opener.postMessage({
            type: 'HUBSPOT_AUTH_SUCCESS',
            data: data
          }, window.location.origin);
          window.close();
        } else {
          setTimeout(() => navigate('/'), 2000);
        }

      } catch (error) {
        console.error('HubSpot authentication error:', error);
        setStatus('error');
        setMessage(`Authentication failed: ${error.message}`);
        
        toast({
          title: "Authentication Failed",
          description: error.message || "An unexpected error occurred.",
          variant: "destructive",
        });

        if (window.opener) {
          window.opener.postMessage({
            type: 'HUBSPOT_AUTH_ERROR',
            error: error.message || 'Authentication failed'
          }, window.location.origin);
          window.close();
        } else {
          setTimeout(() => navigate('/'), 3000);
        }
      }
    };

    handleCallback();
  }, [searchParams, navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="text-center space-y-4">
          {status === 'processing' && (
            <>
              <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
              <h1 className="text-xl font-semibold">Connecting HubSpot</h1>
              <p className="text-muted-foreground">{message}</p>
            </>
          )}
          
          {status === 'success' && (
            <>
              <CheckCircle className="w-12 h-12 mx-auto text-green-600" />
              <h1 className="text-xl font-semibold text-green-900">Success!</h1>
              <p className="text-green-700">{message}</p>
              <p className="text-sm text-muted-foreground">
                {window.opener ? 'This window will close automatically.' : 'Redirecting to dashboard...'}
              </p>
            </>
          )}
          
          {status === 'error' && (
            <>
              <XCircle className="w-12 h-12 mx-auto text-red-600" />
              <h1 className="text-xl font-semibold text-red-900">Authentication Failed</h1>
              <p className="text-red-700">{message}</p>
              <p className="text-sm text-muted-foreground">
                {window.opener ? 'This window will close automatically.' : 'Redirecting to dashboard...'}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}