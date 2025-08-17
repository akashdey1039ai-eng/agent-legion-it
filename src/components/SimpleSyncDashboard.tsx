import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Building, 
  Target,
  CheckCircle, 
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface SyncResult {
  dataType: string;
  success: boolean;
  recordsProcessed: number;
  recordsUpdated: number;
  error?: string;
}

export function SimpleSyncDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [issyncing, setIsSyncing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<SyncResult[]>([]);

  const dataTypes = [
    { id: 'contacts', name: 'Contacts', icon: Users },
    { id: 'companies', name: 'Companies', icon: Building },
    { id: 'deals', name: 'Deals', icon: Target },
  ];

  const handleSync = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to sync data.",
        variant: "destructive",
      });
      return;
    }

    setIsSyncing(true);
    setProgress(0);
    setResults([]);

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error('No active session');
      }

      const totalTypes = dataTypes.length;
      const newResults: SyncResult[] = [];

      for (let i = 0; i < totalTypes; i++) {
        const dataType = dataTypes[i];
        const progressValue = ((i + 1) / totalTypes) * 100;
        setProgress(progressValue);

        try {
          console.log(`Syncing ${dataType.id}...`);
          
          const { data: result, error } = await supabase.functions.invoke('simple-salesforce-sync', {
            body: { dataType: dataType.id },
            headers: {
              'Authorization': `Bearer ${session.session.access_token}`,
              'Content-Type': 'application/json'
            },
          });

          if (error) {
            console.error(`Sync error for ${dataType.id}:`, error);
            newResults.push({
              dataType: dataType.id,
              success: false,
              recordsProcessed: 0,
              recordsUpdated: 0,
              error: error.message
            });
            
            toast({
              title: `${dataType.name} Sync Failed`,
              description: error.message,
              variant: "destructive",
            });
          } else {
            console.log(`Sync success for ${dataType.id}:`, result);
            newResults.push({
              dataType: dataType.id,
              success: true,
              recordsProcessed: result.recordsProcessed || 0,
              recordsUpdated: result.recordsUpdated || 0,
            });
            
            toast({
              title: `${dataType.name} Synced`,
              description: `Updated ${result.recordsUpdated || 0} records`,
            });
          }
        } catch (error) {
          console.error(`Sync error for ${dataType.id}:`, error);
          newResults.push({
            dataType: dataType.id,
            success: false,
            recordsProcessed: 0,
            recordsUpdated: 0,
            error: error.message
          });
        }

        setResults([...newResults]);
        
        // Small delay between syncs
        if (i < totalTypes - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      const successCount = newResults.filter(r => r.success).length;
      const totalRecords = newResults.reduce((sum, r) => sum + r.recordsUpdated, 0);

      toast({
        title: "Sync Complete",
        description: `Successfully synced ${successCount}/${totalTypes} data types. Total records: ${totalRecords}`,
        variant: successCount > 0 ? "default" : "destructive",
      });

    } catch (error) {
      console.error('Sync failed:', error);
      toast({
        title: "Sync Failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
      setProgress(100);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Simple Salesforce Sync</CardTitle>
          <CardDescription>
            Sync your Salesforce data directly without complications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {dataTypes.map((type) => {
              const Icon = type.icon;
              const result = results.find(r => r.dataType === type.id);
              
              return (
                <div key={type.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="font-medium">{type.name}</div>
                    {result && (
                      <div className="text-sm text-muted-foreground">
                        {result.success ? (
                          <span className="text-green-600">
                            ✓ {result.recordsUpdated} updated
                          </span>
                        ) : (
                          <span className="text-red-600">✗ Failed</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {issyncing && (
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Syncing data...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          <Button 
            onClick={handleSync} 
            disabled={issyncing || !user}
            className="w-full"
            size="lg"
          >
            {issyncing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Syncing...
              </>
            ) : (
              'Start Sync'
            )}
          </Button>

          {!user && (
            <p className="text-sm text-muted-foreground text-center">
              Please log in to sync your Salesforce data
            </p>
          )}
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sync Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.map((result, index) => {
                const dataType = dataTypes.find(dt => dt.id === result.dataType);
                const Icon = dataType?.icon || AlertTriangle;
                
                return (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      <span className="font-medium">{dataType?.name || result.dataType}</span>
                      <Badge variant={result.success ? "default" : "destructive"}>
                        {result.success ? 'Success' : 'Failed'}
                      </Badge>
                    </div>
                    <div className="text-right">
                      {result.success ? (
                        <div className="text-sm">
                          <div>Processed: {result.recordsProcessed}</div>
                          <div className="text-green-600">Updated: {result.recordsUpdated}</div>
                        </div>
                      ) : (
                        <div className="text-sm text-red-600">
                          {result.error || 'Unknown error'}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}