import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, ArrowLeft } from 'lucide-react';

interface AgentConfigurationSelectorProps {
  agentType: string;
  onSelectPlatform: (platform: 'salesforce' | 'hubspot') => void;
  onBack: () => void;
}

export function AgentConfigurationSelector({ 
  agentType, 
  onSelectPlatform, 
  onBack 
}: AgentConfigurationSelectorProps) {
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
                  
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Connect to your Salesforce developer sandbox and analyze real opportunity data
                    </p>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-xs">Developer Sandbox</Badge>
                      <Badge variant="secondary" className="text-xs">Real-time Sync</Badge>
                      <Badge variant="secondary" className="text-xs">AI Analysis</Badge>
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
                  
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Connect to your HubSpot account and analyze deals, contacts, and pipeline data
                    </p>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-xs">Deal Pipeline</Badge>
                      <Badge variant="secondary" className="text-xs">Contact Scoring</Badge>
                      <Badge variant="secondary" className="text-xs">Marketing Automation</Badge>
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