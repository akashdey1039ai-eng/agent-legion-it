import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings, 
  Users, 
  Shield, 
  Database,
  Bell,
  Palette,
  Globe,
  Plus,
  Edit,
  Trash2,
  Save
} from "lucide-react";

interface SalesStage {
  id: string;
  name: string;
  probability: number;
  stage_order: number;
  is_closed_won: boolean;
  is_closed_lost: boolean;
  is_active: boolean;
}

interface Team {
  id: string;
  name: string;
  description: string | null;
  manager_id: string | null;
  created_at: string;
}

export function CRMSettings() {
  const [salesStages, setSalesStages] = useState<SalesStage[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [newStageName, setNewStageName] = useState('');
  const [newStageProbability, setNewStageProbability] = useState(50);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDescription, setNewTeamDescription] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      
      // Fetch sales stages
      const { data: stages, error: stagesError } = await supabase
        .from('sales_stages')
        .select('*')
        .order('stage_order');

      if (stagesError) throw stagesError;
      setSalesStages(stages || []);

      // Fetch teams
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .order('created_at');

      if (teamsError) throw teamsError;
      setTeams(teamsData || []);

    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch settings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addSalesStage = async () => {
    if (!newStageName.trim()) return;

    try {
      const maxOrder = Math.max(...salesStages.map(s => s.stage_order), 0);
      
      const { error } = await supabase
        .from('sales_stages')
        .insert([{
          name: newStageName,
          probability: newStageProbability,
          stage_order: maxOrder + 1,
          is_active: true
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Sales stage added successfully"
      });
      
      setNewStageName('');
      setNewStageProbability(50);
      fetchSettings();
    } catch (error) {
      console.error('Error adding sales stage:', error);
      toast({
        title: "Error",
        description: "Failed to add sales stage",
        variant: "destructive"
      });
    }
  };

  const addTeam = async () => {
    if (!newTeamName.trim()) return;

    try {
      const { error } = await supabase
        .from('teams')
        .insert([{
          name: newTeamName,
          description: newTeamDescription || null,
          manager_id: user?.id
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Team created successfully"
      });
      
      setNewTeamName('');
      setNewTeamDescription('');
      fetchSettings();
    } catch (error) {
      console.error('Error creating team:', error);
      toast({
        title: "Error",
        description: "Failed to create team",
        variant: "destructive"
      });
    }
  };

  const toggleStageActive = async (stageId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('sales_stages')
        .update({ is_active: !isActive })
        .eq('id', stageId);

      if (error) throw error;

      setSalesStages(salesStages.map(stage => 
        stage.id === stageId 
          ? { ...stage, is_active: !isActive }
          : stage
      ));

      toast({
        title: "Success",
        description: `Sales stage ${!isActive ? 'activated' : 'deactivated'}`
      });
    } catch (error) {
      console.error('Error updating sales stage:', error);
      toast({
        title: "Error",
        description: "Failed to update sales stage",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-6 bg-muted rounded mb-4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">CRM Settings</h2>
          <p className="text-muted-foreground">
            Configure your CRM system preferences and workflows
          </p>
        </div>
      </div>

      <Tabs defaultValue="pipeline" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="pipeline" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Pipeline
          </TabsTrigger>
          <TabsTrigger value="teams" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Teams
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Permissions
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="mt-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sales Pipeline Stages</CardTitle>
                <CardDescription>
                  Manage your sales pipeline stages and probabilities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add New Stage */}
                <div className="flex gap-4 p-4 bg-muted/30 rounded-lg">
                  <div className="flex-1">
                    <Label htmlFor="stageName">Stage Name</Label>
                    <Input
                      id="stageName"
                      value={newStageName}
                      onChange={(e) => setNewStageName(e.target.value)}
                      placeholder="e.g., Discovery"
                    />
                  </div>
                  <div className="w-32">
                    <Label htmlFor="probability">Probability %</Label>
                    <Input
                      id="probability"
                      type="number"
                      min="0"
                      max="100"
                      value={newStageProbability}
                      onChange={(e) => setNewStageProbability(Number(e.target.value))}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={addSalesStage}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Stage
                    </Button>
                  </div>
                </div>

                {/* Existing Stages */}
                <div className="space-y-2">
                  {salesStages.map((stage) => (
                    <div key={stage.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                          {stage.stage_order}
                        </div>
                        <div>
                          <div className="font-medium">{stage.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {stage.probability}% probability
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {stage.is_closed_won && <Badge variant="outline">Won</Badge>}
                          {stage.is_closed_lost && <Badge variant="outline">Lost</Badge>}
                          {!stage.is_active && <Badge variant="secondary">Inactive</Badge>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={stage.is_active}
                          onCheckedChange={() => toggleStageActive(stage.id, stage.is_active)}
                        />
                        <Button size="sm" variant="ghost">
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="teams" className="mt-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Management</CardTitle>
                <CardDescription>
                  Create and manage your sales teams
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add New Team */}
                <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                  <div>
                    <Label htmlFor="teamName">Team Name</Label>
                    <Input
                      id="teamName"
                      value={newTeamName}
                      onChange={(e) => setNewTeamName(e.target.value)}
                      placeholder="e.g., Enterprise Sales"
                    />
                  </div>
                  <div>
                    <Label htmlFor="teamDescription">Description (Optional)</Label>
                    <Input
                      id="teamDescription"
                      value={newTeamDescription}
                      onChange={(e) => setNewTeamDescription(e.target.value)}
                      placeholder="Brief description of the team"
                    />
                  </div>
                  <Button onClick={addTeam}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Team
                  </Button>
                </div>

                {/* Existing Teams */}
                <div className="space-y-2">
                  {teams.map((team) => (
                    <div key={team.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{team.name}</div>
                        {team.description && (
                          <div className="text-sm text-muted-foreground">{team.description}</div>
                        )}
                        <div className="text-xs text-muted-foreground">
                          Created {new Date(team.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>User Permissions</CardTitle>
              <CardDescription>
                Manage user roles and access permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Permission management is currently in development. Contact your administrator for access control.
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Configure how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Deal Updates</div>
                      <div className="text-sm text-muted-foreground">
                        Get notified when deals are updated
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">New Leads</div>
                      <div className="text-sm text-muted-foreground">
                        Get notified when new leads are created
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Task Reminders</div>
                      <div className="text-sm text-muted-foreground">
                        Get reminded about upcoming tasks
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Weekly Reports</div>
                      <div className="text-sm text-muted-foreground">
                        Receive weekly performance summaries
                      </div>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>
                Customize the look and feel of your CRM
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label>Theme</Label>
                    <Select defaultValue="system">
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Language</Label>
                    <Select defaultValue="en">
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Timezone</Label>
                    <Select defaultValue="utc">
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="utc">UTC</SelectItem>
                        <SelectItem value="est">Eastern Time</SelectItem>
                        <SelectItem value="pst">Pacific Time</SelectItem>
                        <SelectItem value="cst">Central Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
