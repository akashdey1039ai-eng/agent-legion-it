import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function SalesforceCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        if (error) {
          throw new Error(`Salesforce OAuth error: ${error}`);
        }

        if (!code || !state) {
          throw new Error('Missing authorization code or state parameter');
        }

        // Exchange the authorization code for tokens
        const { data, error: functionError } = await supabase.functions.invoke('salesforce-auth', {
          body: { code, state }
        });

        if (functionError) throw functionError;

        if (data?.success) {
          toast({
            title: "Connected Successfully",
            description: "Your Salesforce account has been connected.",
          });
          
          // Close the popup window if we're in one
          if (window.opener) {
            window.close();
          } else {
            navigate('/');
          }
        } else {
          throw new Error(data?.error || 'Authentication failed');
        }

      } catch (error) {
        console.error('Salesforce callback error:', error);
        toast({
          title: "Connection Failed",
          description: error.message || "Failed to connect to Salesforce.",
          variant: "destructive",
        });
        
        // Close popup or redirect on error
        if (window.opener) {
          window.close();
        } else {
          navigate('/');
        }
      } finally {
        setIsProcessing(false);
      }
    };

    handleCallback();
  }, [searchParams, navigate, toast]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        <h2 className="text-xl font-semibold">
          {isProcessing ? 'Connecting to Salesforce...' : 'Processing complete'}
        </h2>
        <p className="text-muted-foreground">
          {isProcessing 
            ? 'Please wait while we establish the connection.' 
            : 'You can close this window.'
          }
        </p>
      </div>
    </div>
  );
}