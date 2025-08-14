import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from "@/components/ui/button";
import { CrmDashboard } from "@/components/CrmDashboard";
import { SalesforceIntegration } from "@/components/SalesforceIntegration";
import HubSpotIntegration from "@/components/HubSpotIntegration";
import LeadIntelligenceAgent from "@/components/LeadIntelligenceAgent";
import { EnhancedAIAgentTester } from "@/components/EnhancedAIAgentTester";
import { Header } from "@/components/Header";
import { Brain, Database, Bot, BarChart3, Activity, Users, Target } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your CRM integrations and AI agents
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="integration">Integrations</TabsTrigger>
            <TabsTrigger value="agents">AI Agents</TabsTrigger>
            <TabsTrigger value="dashboard">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Contacts
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2,103</div>
                  <p className="text-xs text-muted-foreground">
                    +15% from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Integrations
                  </CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2</div>
                  <p className="text-xs text-muted-foreground">
                    Salesforce & HubSpot
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    AI Accuracy
                  </CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">94.2%</div>
                  <p className="text-xs text-muted-foreground">
                    +2.1% from last week
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Data Sync
                  </CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Real-time</div>
                  <p className="text-xs text-muted-foreground">
                    Last sync 2min ago
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Platform Cards */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Salesforce
                  </CardTitle>
                  <CardDescription>
                    Enterprise CRM platform integration
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <span className="text-sm font-medium text-green-600">Connected</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Contacts</span>
                      <span className="text-sm font-medium">1,247</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Last Sync</span>
                      <span className="text-sm font-medium">2 minutes ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    HubSpot
                  </CardTitle>
                  <CardDescription>
                    Marketing automation platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <span className="text-sm font-medium text-green-600">Connected</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Contacts</span>
                      <span className="text-sm font-medium">856</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Last Sync</span>
                      <span className="text-sm font-medium">5 minutes ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Lead Intelligence Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Lead Intelligence Agent
                </CardTitle>
                <CardDescription>
                  AI-powered lead analysis and scoring
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">2,341</div>
                    <div className="text-sm text-muted-foreground">Leads Analyzed</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">94%</div>
                    <div className="text-sm text-muted-foreground">Accuracy Rate</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">2.4s</div>
                    <div className="text-sm text-muted-foreground">Avg Response</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integration" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Salesforce Integration</CardTitle>
                  <CardDescription>
                    Connect and sync your Salesforce CRM data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SalesforceIntegration />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>HubSpot Integration</CardTitle>
                  <CardDescription>
                    Connect and sync your HubSpot marketing data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <HubSpotIntegration />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Lead Intelligence Agent</CardTitle>
                <CardDescription>
                  AI-powered lead analysis and insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LeadIntelligenceAgent />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="agents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  AI Agents
                </CardTitle>
                <CardDescription>
                  Manage your AI-powered automation agents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LeadIntelligenceAgent />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Analytics Dashboard
                </CardTitle>
                <CardDescription>
                  Real-time insights and analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CrmDashboard />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;