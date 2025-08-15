import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  Settings, 
  Brain, 
  Shield, 
  Clock, 
  Target, 
  Bot,
  Database,
  Zap,
  TrendingUp,
  Users,
  Building2,
  AlertTriangle,
  CheckCircle,
  Save,
  Calendar,
  Mail,
  Phone,
  FileText,
  DollarSign,
  Star,
  Filter,
  Bell,
  Globe
} from 'lucide-react';

interface AgentConfig {
  id?: string;
  name: string;
  type: string;
  status: 'draft' | 'active' | 'paused';
  platform: 'salesforce' | 'hubspot' | 'both';
  requiresApproval: boolean;
  confidenceThreshold: number;
  maxActionsPerDay: number;
  syncFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
  automationRules: {
    leadScoring: boolean;
    autoAssignment: boolean;
    followUpTasks: boolean;
    duplicateDetection: boolean;
    dataEnrichment: boolean;
    opportunityStageUpdates: boolean;
    emailNotifications: boolean;
    activityLogging: boolean;
  };
  salesforceConfig?: {
    objects: string[];
    fields: string[];
    customFilters: Record<string, any>;
    triggerConditions: string[];
    bulkOperations: boolean;
    sandboxMode: boolean;
    apiVersion: string;
  };
  notifications: {
    email: boolean;
    inApp: boolean;
    webhook: string;
    slackWebhook?: string;
  };
  customPrompt?: string;
  fieldMappings: Record<string, string>;
  schedule?: {
    timezone: string;
    workingHours: { start: string; end: string };
    weekdays: string[];
  };
}

interface AgentConfigurationProps {
  platform: 'salesforce' | 'hubspot';
  agentType?: string;
  onClose?: () => void;
}

export function AgentConfiguration({ platform, agentType, onClose }: AgentConfigurationProps) {
  const [configs, setConfigs] = useState<AgentConfig[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<AgentConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Default agent configurations
  const defaultConfigs: AgentConfig[] = [
    {
      name: 'Lead Intelligence Agent',
      type: 'lead-intelligence',
      status: 'draft',
      platform,
      requiresApproval: true,
      confidenceThreshold: 0.75,
      maxActionsPerDay: 100,
      syncFrequency: 'hourly',
      automationRules: {
        leadScoring: true,
        autoAssignment: true,
        followUpTasks: true,
        duplicateDetection: true,
        dataEnrichment: false,
        opportunityStageUpdates: false,
        emailNotifications: true,
        activityLogging: true
      },
      salesforceConfig: platform === 'salesforce' ? {
        objects: ['Lead', 'Contact', 'Account'],
        fields: ['Email', 'Phone', 'Company', 'Title', 'LeadSource'],
        customFilters: {},
        triggerConditions: ['New Lead Created', 'Lead Status Changed'],
        bulkOperations: true,
        sandboxMode: true,
        apiVersion: '58.0'
      } : undefined,
      notifications: {
        email: true,
        inApp: true,
        webhook: '',
        slackWebhook: ''
      },
      fieldMappings: {},
      schedule: {
        timezone: 'America/New_York',
        workingHours: { start: '09:00', end: '17:00' },
        weekdays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
      },
      customPrompt: `Analyze lead data and assign scores based on engagement, company size, and buying signals. Focus on identifying high-value prospects.`
    },
    {
      name: 'Data Sync Agent',
      type: 'data-sync',
      status: 'draft',
      platform,
      requiresApproval: false,
      confidenceThreshold: 0.95,
      maxActionsPerDay: 1000,
      syncFrequency: 'realtime',
      automationRules: {
        leadScoring: false,
        autoAssignment: false,
        followUpTasks: false,
        duplicateDetection: true,
        dataEnrichment: true,
        opportunityStageUpdates: false,
        emailNotifications: false,
        activityLogging: true
      },
      salesforceConfig: platform === 'salesforce' ? {
        objects: ['Lead', 'Contact', 'Account', 'Opportunity'],
        fields: ['*'],
        customFilters: {},
        triggerConditions: ['Data Updated', 'Record Created', 'Record Modified'],
        bulkOperations: true,
        sandboxMode: true,
        apiVersion: '58.0'
      } : undefined,
      notifications: {
        email: false,
        inApp: true,
        webhook: '',
        slackWebhook: ''
      },
      fieldMappings: {},
      schedule: {
        timezone: 'America/New_York',
        workingHours: { start: '00:00', end: '23:59' },
        weekdays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      },
      customPrompt: `Ensure data consistency between platforms. Detect and resolve conflicts intelligently.`
    }
  ];

  useEffect(() => {
    loadConfigurations();
  }, [user, platform, agentType]);

  const loadConfigurations = async () => {
    if (!user) return;

    try {
      let query = supabase
        .from('ai_agents')
        .select('*')
        .eq('created_by', user.id)
        .contains('config', { platform });

      // If specific agent type is requested, filter by that
      if (agentType) {
        query = query.eq('type', agentType);
      }

      const { data: agents, error } = await query;

      if (error) throw error;

      if (agents && agents.length > 0) {
        const agentConfigs = agents.map(agent => {
          const config = agent.config as any;
          return {
            id: agent.id,
            name: agent.name,
            type: agent.type,
            status: agent.status as 'draft' | 'active' | 'paused',
            platform: config?.platform || platform,
            requiresApproval: agent.requires_human_approval,
            confidenceThreshold: agent.min_confidence_threshold || 0.75,
            maxActionsPerDay: config?.maxActionsPerDay || 100,
            syncFrequency: config?.syncFrequency || 'hourly',
            automationRules: config?.automationRules || defaultConfigs[0].automationRules,
            notifications: config?.notifications || defaultConfigs[0].notifications,
            customPrompt: config?.customPrompt || '',
            fieldMappings: config?.fieldMappings || {}
          };
        });
        setConfigs(agentConfigs.filter(config => !agentType || config.type === agentType));
      } else {
        setConfigs(defaultConfigs.filter(config => !agentType || config.type === agentType));
      }
    } catch (error) {
      console.error('Error loading agent configurations:', error);
      setConfigs(defaultConfigs);
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfiguration = async (config: AgentConfig) => {
    if (!user) return;

    setIsSaving(true);
    try {
      const agentData = {
        name: config.name,
        type: config.type,
        status: config.status,
        created_by: user.id,
        requires_human_approval: config.requiresApproval,
        min_confidence_threshold: config.confidenceThreshold,
        config: {
          platform: config.platform,
          maxActionsPerDay: config.maxActionsPerDay,
          syncFrequency: config.syncFrequency,
          automationRules: config.automationRules,
          notifications: config.notifications,
          customPrompt: config.customPrompt,
          fieldMappings: config.fieldMappings
        }
      };

      if (config.id) {
        const { error } = await supabase
          .from('ai_agents')
          .update(agentData)
          .eq('id', config.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('ai_agents')
          .insert([agentData])
          .select()
          .single();
        if (error) throw error;
        config.id = data.id;
      }

      toast({
        title: "Configuration Saved",
        description: `${config.name} has been configured successfully.`,
      });

      loadConfigurations();
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save agent configuration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateConfig = (field: string, value: any) => {
    if (!selectedConfig) return;

    setSelectedConfig({
      ...selectedConfig,
      [field]: value
    });
  };

  const updateAutomationRule = (rule: string, enabled: boolean) => {
    if (!selectedConfig) return;

    setSelectedConfig({
      ...selectedConfig,
      automationRules: {
        ...selectedConfig.automationRules,
        [rule]: enabled
      }
    });
  };

  const updateSalesforceConfig = (field: string, value: any) => {
    if (!selectedConfig) return;

    setSelectedConfig({
      ...selectedConfig,
      salesforceConfig: {
        ...selectedConfig.salesforceConfig,
        [field]: value
      }
    });
  };

  const updateSchedule = (field: string, value: any) => {
    if (!selectedConfig) return;

    setSelectedConfig({
      ...selectedConfig,
      schedule: {
        ...selectedConfig.schedule,
        [field]: value
      }
    });
  };

  const updateNotification = (type: string, enabled: boolean | string) => {
    if (!selectedConfig) return;

    setSelectedConfig({
      ...selectedConfig,
      notifications: {
        ...selectedConfig.notifications,
        [type]: enabled
      }
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 animate-spin" />
          <span>Loading agent configurations...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">
              {agentType ? 
                `${agentType.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} Configuration` :
                `${platform === 'salesforce' ? 'Salesforce' : 'HubSpot'} Agent Configuration`
              }
            </h2>
            <p className="text-muted-foreground">
              Configure AI agent{agentType ? '' : 's'} for {platform === 'salesforce' ? 'Salesforce' : 'HubSpot'} integration
            </p>
          </div>
        </div>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            {agentType ? 'Agent Configuration' : 'Available Agents'}
          </h3>
          {configs.map((config, index) => (
            <Card 
              key={config.id || index}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedConfig === config ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedConfig(config)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{config.name}</CardTitle>
                  <Badge variant={config.status === 'active' ? 'default' : 'secondary'}>
                    {config.status}
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  Type: {config.type}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Configuration Panel */}
        {selectedConfig && (
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    {selectedConfig.name}
                  </CardTitle>
                  <Button
                    onClick={() => saveConfiguration(selectedConfig)}
                    disabled={isSaving}
                    className="flex items-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <Settings className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Configuration
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="general" className="w-full">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="automation">Automation</TabsTrigger>
                    {platform === 'salesforce' && <TabsTrigger value="salesforce">Salesforce</TabsTrigger>}
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                    <TabsTrigger value="advanced">Advanced</TabsTrigger>
                  </TabsList>

                  <TabsContent value="general" className="space-y-6 mt-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Agent Status</Label>
                        <Select 
                          value={selectedConfig.status} 
                          onValueChange={(value) => updateConfig('status', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="paused">Paused</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Sync Frequency</Label>
                        <Select 
                          value={selectedConfig.syncFrequency} 
                          onValueChange={(value) => updateConfig('syncFrequency', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="realtime">Real-time</SelectItem>
                            <SelectItem value="hourly">Hourly</SelectItem>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Confidence Threshold: {Math.round(selectedConfig.confidenceThreshold * 100)}%</Label>
                      <Slider
                        value={[selectedConfig.confidenceThreshold]}
                        onValueChange={([value]) => updateConfig('confidenceThreshold', value)}
                        max={1}
                        min={0.1}
                        step={0.05}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground">
                        Actions below this confidence level will require human approval
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Max Actions Per Day</Label>
                      <Input
                        type="number"
                        value={selectedConfig.maxActionsPerDay}
                        onChange={(e) => updateConfig('maxActionsPerDay', parseInt(e.target.value))}
                        placeholder="100"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={selectedConfig.requiresApproval}
                        onCheckedChange={(checked) => updateConfig('requiresApproval', checked)}
                      />
                      <Label>Require human approval for all actions</Label>
                    </div>
                  </TabsContent>

                  <TabsContent value="automation" className="space-y-6 mt-6">
                    <div className="space-y-4">
                      <h4 className="font-medium">Automation Rules</h4>
                      
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={selectedConfig.automationRules.leadScoring}
                            onCheckedChange={(checked) => updateAutomationRule('leadScoring', checked)}
                          />
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <Label>Automatic Lead Scoring</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={selectedConfig.automationRules.autoAssignment}
                            onCheckedChange={(checked) => updateAutomationRule('autoAssignment', checked)}
                          />
                          <Target className="h-4 w-4 text-muted-foreground" />
                          <Label>Auto-assign leads to sales reps</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={selectedConfig.automationRules.followUpTasks}
                            onCheckedChange={(checked) => updateAutomationRule('followUpTasks', checked)}
                          />
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <Label>Create follow-up tasks</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={selectedConfig.automationRules.duplicateDetection}
                            onCheckedChange={(checked) => updateAutomationRule('duplicateDetection', checked)}
                          />
                          <Shield className="h-4 w-4 text-muted-foreground" />
                          <Label>Duplicate detection and merging</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={selectedConfig.automationRules.opportunityStageUpdates}
                            onCheckedChange={(checked) => updateAutomationRule('opportunityStageUpdates', checked)}
                          />
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                          <Label>Automatic opportunity stage updates</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={selectedConfig.automationRules.emailNotifications}
                            onCheckedChange={(checked) => updateAutomationRule('emailNotifications', checked)}
                          />
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <Label>Send email notifications</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={selectedConfig.automationRules.activityLogging}
                            onCheckedChange={(checked) => updateAutomationRule('activityLogging', checked)}
                          />
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <Label>Automatic activity logging</Label>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {platform === 'salesforce' && (
                    <TabsContent value="salesforce" className="space-y-6 mt-6">
                      <div className="space-y-6">
                        <div className="flex items-center gap-2">
                          <Database className="h-5 w-5 text-primary" />
                          <h4 className="font-medium">Salesforce Configuration</h4>
                        </div>

                        {/* Salesforce Objects */}
                        <div className="space-y-3">
                          <Label>Salesforce Objects to Monitor</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {['Lead', 'Contact', 'Account', 'Opportunity', 'Case', 'Campaign'].map((object) => (
                              <div key={object} className="flex items-center space-x-2">
                                <Switch
                                  checked={selectedConfig.salesforceConfig?.objects.includes(object) || false}
                                  onCheckedChange={(checked) => {
                                    const currentObjects = selectedConfig.salesforceConfig?.objects || [];
                                    const newObjects = checked 
                                      ? [...currentObjects, object]
                                      : currentObjects.filter(obj => obj !== object);
                                    updateSalesforceConfig('objects', newObjects);
                                  }}
                                />
                                <Label className="text-sm">{object}</Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* API Configuration */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>API Version</Label>
                            <Select 
                              value={selectedConfig.salesforceConfig?.apiVersion || '58.0'}
                              onValueChange={(value) => updateSalesforceConfig('apiVersion', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="58.0">v58.0</SelectItem>
                                <SelectItem value="57.0">v57.0</SelectItem>
                                <SelectItem value="56.0">v56.0</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex items-center space-x-2 pt-7">
                            <Switch
                              checked={selectedConfig.salesforceConfig?.sandboxMode || false}
                              onCheckedChange={(checked) => updateSalesforceConfig('sandboxMode', checked)}
                            />
                            <Label>Sandbox Mode</Label>
                          </div>
                        </div>

                        {/* Trigger Conditions */}
                        <div className="space-y-3">
                          <Label>Trigger Conditions</Label>
                          <div className="space-y-2">
                            {['New Lead Created', 'Lead Status Changed', 'Opportunity Stage Changed', 
                              'Amount Updated', 'Close Date Modified', 'Contact Updated'].map((trigger) => (
                              <div key={trigger} className="flex items-center space-x-2">
                                <Switch
                                  checked={selectedConfig.salesforceConfig?.triggerConditions.includes(trigger) || false}
                                  onCheckedChange={(checked) => {
                                    const currentTriggers = selectedConfig.salesforceConfig?.triggerConditions || [];
                                    const newTriggers = checked 
                                      ? [...currentTriggers, trigger]
                                      : currentTriggers.filter(t => t !== trigger);
                                    updateSalesforceConfig('triggerConditions', newTriggers);
                                  }}
                                />
                                <Label className="text-sm">{trigger}</Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Field Mapping */}
                        <div className="space-y-3">
                          <Label>Key Fields to Monitor</Label>
                          <div className="grid grid-cols-3 gap-2">
                            {['Email', 'Phone', 'Company', 'Title', 'LeadSource', 'Amount', 'StageName', 
                              'Probability', 'CloseDate', 'LastActivityDate'].map((field) => (
                              <div key={field} className="flex items-center space-x-2">
                                <Switch
                                  checked={selectedConfig.salesforceConfig?.fields.includes(field) || false}
                                  onCheckedChange={(checked) => {
                                    const currentFields = selectedConfig.salesforceConfig?.fields || [];
                                    const newFields = checked 
                                      ? [...currentFields, field]
                                      : currentFields.filter(f => f !== field);
                                    updateSalesforceConfig('fields', newFields);
                                  }}
                                />
                                <Label className="text-sm">{field}</Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Advanced Settings */}
                        <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                          <h5 className="font-medium text-sm">Advanced Settings</h5>
                          
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={selectedConfig.salesforceConfig?.bulkOperations || false}
                              onCheckedChange={(checked) => updateSalesforceConfig('bulkOperations', checked)}
                            />
                            <Label className="text-sm">Enable Bulk Operations</Label>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm">Minimum Deal Amount Filter</Label>
                            <Input
                              type="number"
                              placeholder="10000"
                              value={selectedConfig.salesforceConfig?.customFilters?.['Amount__gte'] || ''}
                              onChange={(e) => updateSalesforceConfig('customFilters', {
                                ...selectedConfig.salesforceConfig?.customFilters,
                                'Amount__gte': e.target.value ? parseInt(e.target.value) : undefined
                              })}
                            />
                          </div>
                        </div>

                        {/* Real-time Sync Status */}
                        <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium">Salesforce Connection Status</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Connected to Salesforce sandbox. Agent will monitor selected objects and fields in real-time.
                          </p>
                        </div>
                      </div>
                    </TabsContent>
                  )}

                  <TabsContent value="notifications" className="space-y-6 mt-6">
                    <div className="space-y-4">
                      <h4 className="font-medium">Notification Settings</h4>
                      
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={selectedConfig.notifications.email}
                            onCheckedChange={(checked) => updateNotification('email', checked)}
                          />
                          <Label>Email notifications</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={selectedConfig.notifications.inApp}
                            onCheckedChange={(checked) => updateNotification('inApp', checked)}
                          />
                          <Label>In-app notifications</Label>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Webhook URL (optional)</Label>
                          <Input
                            value={selectedConfig.notifications.webhook}
                            onChange={(e) => updateNotification('webhook', e.target.value)}
                            placeholder="https://your-webhook-url.com"
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="advanced" className="space-y-6 mt-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Custom AI Prompt</Label>
                        <Textarea
                          value={selectedConfig.customPrompt}
                          onChange={(e) => updateConfig('customPrompt', e.target.value)}
                          placeholder="Enter custom instructions for the AI agent..."
                          rows={6}
                        />
                        <p className="text-xs text-muted-foreground">
                          Customize how the AI agent processes and acts on data
                        </p>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-2">
                        <Label>Security Level</Label>
                        <Select defaultValue="standard">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="standard">Standard</SelectItem>
                            <SelectItem value="enhanced">Enhanced</SelectItem>
                            <SelectItem value="maximum">Maximum</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}