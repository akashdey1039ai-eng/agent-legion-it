import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bot, Brain, TrendingUp, Zap, Calendar, Target, Play, Settings, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";

const agents = [
  {
    id: "lead-intelligence",
    title: "Lead Intelligence Agent",
    description: "Automatically scores and prioritizes leads using AI analysis",
    status: "active",
    icon: Brain,
    capabilities: ["Lead Scoring", "Priority Assignment", "Follow-up Tasks"],
    lastRun: "2 hours ago",
    successRate: "94%"
  },
  {
    id: "pipeline-analysis",
    title: "Pipeline Analysis Agent", 
    description: "Analyzes deal risks and adjusts probability forecasts",
    status: "active",
    icon: TrendingUp,
    capabilities: ["Risk Analysis", "Probability Updates", "Review Scheduling"],
    lastRun: "1 hour ago", 
    successRate: "91%"
  },
  {
    id: "follow-up",
    title: "Smart Follow-up Agent",
    description: "Generates personalized email sequences based on lead behavior",
    status: "draft",
    icon: Zap,
    capabilities: ["Email Generation", "Timing Optimization", "Engagement Tracking"],
    lastRun: "Never",
    successRate: "N/A"
  },
  {
    id: "meetings",
    title: "Meeting Scheduler Agent",
    description: "Books meetings based on lead scoring and availability",
    status: "draft", 
    icon: Calendar,
    capabilities: ["Calendar Integration", "Optimal Timing", "Agenda Creation"],
    lastRun: "Never",
    successRate: "N/A"
  },
  {
    id: "sync",
    title: "Cross-Platform Sync Agent",
    description: "Syncs data between Salesforce and HubSpot intelligently",
    status: "draft",
    icon: Target,
    capabilities: ["Data Synchronization", "Conflict Resolution", "Duplicate Detection"],
    lastRun: "Never",
    successRate: "N/A"
  }
];

export default function AIAgents() {
  const navigate = useNavigate();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
      case "draft":
        return <Badge variant="secondary">Draft</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const handleAgentClick = (agentId: string) => {
    navigate(`/ai-agents/${agentId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Agents</h1>
          <p className="text-muted-foreground">
            Autonomous AI agents for your CRM operations
          </p>
        </div>
        <Button>
          <Settings className="h-4 w-4 mr-2" />
          Configure Agents
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium">Active Agents</p>
                <p className="text-2xl font-bold">2</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium">Total Agents</p>
                <p className="text-2xl font-bold">5</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium">Avg Success Rate</p>
                <p className="text-2xl font-bold">92.5%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium">Actions Today</p>
                <p className="text-2xl font-bold">147</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => {
          const IconComponent = agent.icon;
          return (
            <Card key={agent.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <IconComponent className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{agent.title}</CardTitle>
                      {getStatusBadge(agent.status)}
                    </div>
                  </div>
                </div>
                <CardDescription className="mt-2">
                  {agent.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Capabilities</p>
                  <div className="flex flex-wrap gap-1">
                    {agent.capabilities.map((capability) => (
                      <Badge key={capability} variant="outline" className="text-xs">
                        {capability}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-between text-sm text-muted-foreground">
                  <div>
                    <span className="font-medium">Last Run:</span> {agent.lastRun}
                  </div>
                  <div>
                    <span className="font-medium">Success:</span> {agent.successRate}
                  </div>
                </div>
                
                <Button 
                  className="w-full" 
                  variant={agent.status === "active" ? "default" : "outline"}
                  onClick={() => handleAgentClick(agent.id)}
                >
                  <Play className="h-4 w-4 mr-2" />
                  {agent.status === "active" ? "Manage Agent" : "Configure Agent"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}