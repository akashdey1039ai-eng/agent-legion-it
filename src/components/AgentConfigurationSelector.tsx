import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, ArrowLeft, Database, Zap, Brain, Activity, Users, Target } from 'lucide-react';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import { useToast } from '@/hooks/use-toast';

interface AgentConfigurationSelectorProps {
  agentType: string;
  onSelectPlatform: (platform: 'salesforce' | 'hubspot') => void;
  onBack: () => void;
  onQuickRun?: () => void;
}

export function AgentConfigurationSelector({ 
  agentType, 
  onSelectPlatform, 
  onBack,
  onQuickRun
}: AgentConfigurationSelectorProps) {
  const navigate = useNavigate();
  const [realtimeSyncEnabled, setRealtimeSyncEnabled] = useState(false);
  const { toast } = useToast();
  
  // Enable real-time sync for relevant tables
  const { isConnected, lastSyncTime } = useRealtimeSync({
    enabled: realtimeSyncEnabled,
    tables: ['opportunities', 'contacts', 'companies']
  });
  const getAgentTitle = () => {
    switch (agentType) {
      case 'pipeline-analysis':
        return 'Pipeline Analysis Agent';
      case 'lead-intelligence':
        return 'Lead Intelligence Agent';
      default:
        return 'AI Agent';
    }
  };

  const getAgentDescription = () => {
    switch (agentType) {
      case 'pipeline-analysis':
        return 'AI-powered pipeline risk assessment and probability forecasting';
      case 'lead-intelligence':
        return 'Intelligent lead scoring and qualification';
      default:
        return 'AI-powered CRM automation';
    }
  };

  const handleSalesforceAction = (action: 'sandbox' | 'sync' | 'analysis') => {
    switch (action) {
      case 'sandbox':
        onSelectPlatform('salesforce');
        break;
      case 'sync':
        // Toggle real-time sync
        if (!realtimeSyncEnabled) {
          setRealtimeSyncEnabled(true);
          toast({
            title: "Real-time Sync Enabled",
            description: "Now monitoring Salesforce data for live updates",
          });
        } else {
          setRealtimeSyncEnabled(false);
          toast({
            title: "Real-time Sync Disabled",
            description: "Live monitoring has been turned off",
          });
        }
        break;
      case 'analysis':
        // Quick launch analysis using callback instead of navigation
        if (onQuickRun) {
          onQuickRun();
        }
        break;
    }
  };

  const handleHubSpotAction = (action: 'pipeline' | 'scoring' | 'automation') => {
    switch (action) {
      case 'pipeline':
        onSelectPlatform('hubspot');
        break;
      case 'scoring':
        alert('Contact scoring will be available after HubSpot integration');
        break;
      case 'automation':
        alert('Marketing automation features coming soon');
        break;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{getAgentTitle()}</h2>
          <p className="text-muted-foreground">{getAgentDescription()}</p>
        </div>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Agents
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Choose CRM Platform
          </CardTitle>
          <CardDescription>
            Select your CRM platform to configure the {getAgentTitle()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Salesforce Option */}
            <Card className="border border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800 hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                      SF
                    </div>
                    <div>
                      <h3 className="font-semibold">Configure for Salesforce</h3>
                      <p className="text-sm text-muted-foreground">Enterprise CRM Platform</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Connect to your Salesforce developer sandbox and analyze real opportunity data
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex items-center gap-1 text-xs"
                        onClick={() => handleSalesforceAction('sandbox')}
                      >
                        <Database className="h-3 w-3" />
                        Developer Sandbox
                      </Button>
                      <Button
                        variant={realtimeSyncEnabled ? "default" : "secondary"}
                        size="sm"
                        className="flex items-center gap-1 text-xs"
                        onClick={() => handleSalesforceAction('sync')}
                      >
                        <Zap className="h-3 w-3" />
                        {realtimeSyncEnabled ? 'Sync Active' : 'Real-time Sync'}
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex items-center gap-1 text-xs"
                        onClick={() => handleSalesforceAction('analysis')}
                      >
                        <Brain className="h-3 w-3" />
                        AI Analysis
                      </Button>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => onSelectPlatform('salesforce')}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Configure Salesforce
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* HubSpot Option */}
            <Card className="border border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800 hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold">
                      HS
                    </div>
                    <div>
                      <h3 className="font-semibold">Configure for HubSpot</h3>
                      <p className="text-sm text-muted-foreground">Inbound Marketing Platform</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Connect to your HubSpot account and analyze deals, contacts, and pipeline data
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex items-center gap-1 text-xs"
                        onClick={() => handleHubSpotAction('pipeline')}
                      >
                        <Target className="h-3 w-3" />
                        Deal Pipeline
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex items-center gap-1 text-xs"
                        onClick={() => handleHubSpotAction('scoring')}
                      >
                        <Users className="h-3 w-3" />
                        Contact Scoring
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex items-center gap-1 text-xs"
                        onClick={() => handleHubSpotAction('automation')}
                      >
                        <Activity className="h-3 w-3" />
                        Marketing Automation
                      </Button>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full bg-orange-500 hover:bg-orange-600"
                    onClick={() => onSelectPlatform('hubspot')}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Configure HubSpot
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <div className="text-center text-sm text-muted-foreground">
            <p className="mb-2">
              <strong>Note:</strong> Each platform integration maintains separate configurations and data.
            </p>
            <p>More CRM platforms (Pipedrive, Zoho) coming soon!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}