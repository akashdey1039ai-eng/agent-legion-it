import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Database, 
  Zap, 
  CheckCircle, 
  Clock, 
  Users, 
  Building, 
  Target,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  Brain,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface SyncStatus {
  isRunning: boolean;
  progress: number;
  currentTask: string;
  completed: string[];
  failed: string[];
}

interface ConnectionStatus {
  salesforce: boolean;
  hubspot: boolean;
}

const syncDataTypes = [
  {
    id: 'contacts',
    name: 'Contacts & Leads',
    description: 'Sync customer contacts and lead information',
    icon: Users,
    estimatedTime: '2-5 minutes',
    priority: 'high'
  },
  {
    id: 'companies',
    name: 'Companies & Accounts',
    description: 'Sync company and account data',
    icon: Building,
    estimatedTime: '1-3 minutes',
    priority: 'high'
  },
  {
    id: 'deals',
    name: 'Deals & Opportunities',
    description: 'Sync sales opportunities and pipeline',
    icon: Target,
    estimatedTime: '2-4 minutes',
    priority: 'medium'
  }
];

export function IntelligentSyncDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [connections, setConnections] = useState<ConnectionStatus>({ salesforce: false, hubspot: false });
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isRunning: false,
    progress: 0,
    currentTask: '',
    completed: [],
    failed: []
  });
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<'salesforce' | 'hubspot' | 'both'>('both');
  const [selectedDataTypes, setSelectedDataTypes] = useState<string[]>(['contacts', 'companies', 'deals']);

  useEffect(() => {
    if (user) {
      checkConnections();
    }
  }, [user]);

  const checkConnections = async () => {
    if (!user) return;

    try {
      const [sfResult, hsResult] = await Promise.allSettled([
        supabase
          .from('salesforce_tokens')
          .select('id')
          .eq('user_id', user.id)
          .gt('expires_at', new Date().toISOString())
          .limit(1)
          .maybeSingle(),
        supabase
          .from('hubspot_tokens')
          .select('id')
          .eq('user_id', user.id)
          .gt('expires_at', new Date().toISOString())
          .limit(1)
          .maybeSingle()
      ]);

      const sfConnected = sfResult.status === 'fulfilled' && !!sfResult.value.data;
      const hsConnected = hsResult.status === 'fulfilled' && !!hsResult.value.data;

      setConnections({ salesforce: sfConnected, hubspot: hsConnected });

      // Auto-select platform based on what's connected
      if (sfConnected && hsConnected) {
        setSelectedPlatform('both');
      } else if (sfConnected) {
        setSelectedPlatform('salesforce');
      } else if (hsConnected) {
        setSelectedPlatform('hubspot');
      }
    } catch (error) {
      console.error('Error checking connections:', error);
    }
  };

  const handleSmartSync = async () => {
    if (!user || (!connections.salesforce && !connections.hubspot)) {
      toast({
        title: "No Connections",
        description: "Please connect at least one CRM platform first.",
        variant: "destructive",
      });
      return;
    }

    setSyncStatus({
      isRunning: true,
      progress: 0,
      currentTask: 'Initializing AI-powered sync...',
      completed: [],
      failed: []
    });

      try {
        const platforms = [];
        if ((selectedPlatform === 'both' || selectedPlatform === 'salesforce') && connections.salesforce) {
          platforms.push('salesforce');
        }
        if ((selectedPlatform === 'both' || selectedPlatform === 'hubspot') && connections.hubspot) {
          platforms.push('hubspot');
        }

        if (platforms.length === 0) {
          throw new Error('No connected platforms selected for sync');
        }

        let totalSteps = platforms.length * selectedDataTypes.length;
        let currentStep = 0;
        let totalSuccess = 0;
        let totalFailed = 0;

        // Get current session token
        const { data: session } = await supabase.auth.getSession();
        if (!session.session) {
          throw new Error('User not authenticated');
        }

        for (const platform of platforms) {
          for (const dataType of selectedDataTypes) {
            currentStep++;
            const progress = (currentStep / totalSteps) * 100;
            
            setSyncStatus(prev => ({
              ...prev,
              progress,
              currentTask: `Syncing ${dataType} from ${platform}...`
            }));

            try {
              console.log(`Starting sync: ${platform} -> ${dataType}`);
              console.log('Session data:', session.session);
              
              const functionName = platform === 'salesforce' ? 'salesforce-sync' : 'hubspot-sync';
              
              const requestBody = {
                objectType: dataType,
                direction: 'from_salesforce',
                intelligent: true
              };
              
              console.log('Invoking function with body:', requestBody);
              
              const { data: result, error } = await supabase.functions.invoke(functionName, {
                body: requestBody,
                headers: {
                  'Authorization': `Bearer ${session.session.access_token}`,
                  'Content-Type': 'application/json'
                },
              });

              if (error) {
                console.error(`Sync error for ${dataType} from ${platform}:`, error);
                setSyncStatus(prev => ({
                  ...prev,
                  failed: [...prev.failed, `${platform}:${dataType}`]
                }));
                totalFailed++;
                
                toast({
                  title: "Sync Warning",
                  description: `Failed to sync ${dataType} from ${platform}: ${error.message}`,
                  variant: "destructive",
                });
              } else {
                console.log(`Sync successful for ${dataType} from ${platform}:`, result);
                setSyncStatus(prev => ({
                  ...prev,
                  completed: [...prev.completed, `${platform}:${dataType}`]
                }));
                totalSuccess++;
                
                const recordsInfo = result?.recordsProcessed ? ` (${result.recordsProcessed} records)` : '';
                toast({
                  title: "Sync Success",
                  description: `${dataType} synced from ${platform}${recordsInfo}`,
                });
              }

              // Brief delay to show progress and prevent overwhelming
              await new Promise(resolve => setTimeout(resolve, 800));
              
            } catch (error) {
              console.error(`Error syncing ${dataType} from ${platform}:`, error);
              setSyncStatus(prev => ({
                ...prev,
                failed: [...prev.failed, `${platform}:${dataType}`]
              }));
              totalFailed++;
              
              toast({
                title: "Sync Error",
                description: `Failed to sync ${dataType} from ${platform}`,
                variant: "destructive",
              });
            }
          }
        }

      setSyncStatus(prev => ({
        ...prev,
        isRunning: false,
        progress: 100,
        currentTask: 'Sync completed!'
      }));

      setLastSyncTime(new Date().toLocaleString());

      const successCount = syncStatus.completed.length;
      const failCount = syncStatus.failed.length;

      toast({
        title: "Sync Completed",
        description: `Successfully synced ${successCount} data types${failCount > 0 ? ` (${failCount} failed)` : ''}.`,
        variant: successCount > 0 ? "default" : "destructive",
      });

    } catch (error) {
      console.error('Error during sync:', error);
      setSyncStatus(prev => ({
        ...prev,
        isRunning: false,
        currentTask: 'Sync failed'
      }));
      
      toast({
        title: "Sync Failed",
        description: "An unexpected error occurred during sync.",
        variant: "destructive",
      });
    }
  };

  const toggleDataType = (dataTypeId: string) => {
    setSelectedDataTypes(prev => 
      prev.includes(dataTypeId) 
        ? prev.filter(id => id !== dataTypeId)
        : [...prev, dataTypeId]
    );
  };

  const connectedPlatforms = Object.entries(connections).filter(([, connected]) => connected);

  if (connectedPlatforms.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI-Powered Sync Dashboard
          </CardTitle>
          <CardDescription>
            Connect your CRM platforms to enable intelligent data synchronization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No CRM platforms connected</p>
            <p className="text-sm text-muted-foreground">
              Visit the Integration tab to connect Salesforce or HubSpot
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI-Powered Sync Dashboard
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Sparkles className="h-3 w-3 mr-1" />
              Next-Gen Intelligence
            </Badge>
          </CardTitle>
          <CardDescription>
            Intelligent data synchronization with automated conflict resolution
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            {connections.salesforce && (
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Salesforce Connected</span>
              </div>
            )}
            {connections.hubspot && (
              <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 rounded-lg">
                <CheckCircle className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-800">HubSpot Connected</span>
              </div>
            )}
          </div>
          
          {lastSyncTime && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Last sync: {lastSyncTime}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sync Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Smart Sync Configuration</CardTitle>
          <CardDescription>
            Configure your intelligent data synchronization preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Platform Selection */}
          {connectedPlatforms.length > 1 && (
            <div>
              <label className="text-sm font-medium mb-3 block">Sync From</label>
              <Tabs value={selectedPlatform} onValueChange={(value) => setSelectedPlatform(value as any)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="both">Both Platforms</TabsTrigger>
                  <TabsTrigger value="salesforce" disabled={!connections.salesforce}>Salesforce</TabsTrigger>
                  <TabsTrigger value="hubspot" disabled={!connections.hubspot}>HubSpot</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          )}

          {/* Data Type Selection */}
          <div>
            <label className="text-sm font-medium mb-3 block">Data Types to Sync</label>
            <div className="grid gap-3">
              {syncDataTypes.map((dataType) => {
                const Icon = dataType.icon;
                const isSelected = selectedDataTypes.includes(dataType.id);
                
                return (
                  <div
                    key={dataType.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => toggleDataType(dataType.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className={`h-5 w-5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                        <div>
                          <h4 className="font-medium">{dataType.name}</h4>
                          <p className="text-sm text-muted-foreground">{dataType.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={dataType.priority === 'high' ? 'default' : 'secondary'} className="mb-1">
                          {dataType.priority} priority
                        </Badge>
                        <p className="text-xs text-muted-foreground">{dataType.estimatedTime}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sync Button */}
          <div className="pt-4">
            <Button 
              onClick={handleSmartSync} 
              disabled={syncStatus.isRunning || selectedDataTypes.length === 0}
              className="w-full h-12 text-base"
              size="lg"
            >
              {syncStatus.isRunning ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  {syncStatus.currentTask}
                </>
              ) : (
                <>
                  <Zap className="h-5 w-5 mr-2" />
                  Start Intelligent Sync
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sync Progress */}
      {syncStatus.isRunning && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 animate-spin" />
              Sync in Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>{syncStatus.currentTask}</span>
                <span>{Math.round(syncStatus.progress)}%</span>
              </div>
              <Progress value={syncStatus.progress} className="h-2" />
            </div>
            
            {syncStatus.completed.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-green-800 mb-2">Completed:</h4>
                <div className="space-y-1">
                  {syncStatus.completed.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-green-700">
                      <CheckCircle className="h-3 w-3" />
                      {item.replace(':', ' → ')}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {syncStatus.failed.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-red-800 mb-2">Failed:</h4>
                <div className="space-y-1">
                  {syncStatus.failed.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-red-700">
                      <AlertTriangle className="h-3 w-3" />
                      {item.replace(':', ' → ')}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}