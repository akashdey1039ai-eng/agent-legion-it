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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Manage your CRM integrations and AI agents
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white border">
            <TabsTrigger value="overview" className="text-gray-700">Overview</TabsTrigger>
            <TabsTrigger value="integration" className="text-gray-700">Integrations</TabsTrigger>
            <TabsTrigger value="agents" className="text-gray-700">AI Agents</TabsTrigger>
            <TabsTrigger value="dashboard" className="text-gray-700">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-white border border-gray-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-900">
                    Total Contacts
                  </CardTitle>
                  <Users className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">2,103</div>
                  <p className="text-xs text-green-600">
                    +15% from last month
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-white border border-gray-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-900">
                    Active Integrations
                  </CardTitle>
                  <Database className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">2</div>
                  <p className="text-xs text-gray-500">
                    Salesforce & HubSpot
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-white border border-gray-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-900">
                    AI Accuracy
                  </CardTitle>
                  <Target className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">94.2%</div>
                  <p className="text-xs text-green-600">
                    +2.1% from last week
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-white border border-gray-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-900">
                    Data Sync
                  </CardTitle>
                  <Activity className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">Real-time</div>
                  <p className="text-xs text-gray-500">
                    Last sync 2min ago
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Platform Cards */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="bg-white border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <Database className="h-5 w-5 text-blue-600" />
                    Salesforce
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Enterprise CRM platform integration
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Status</span>
                      <span className="text-sm font-medium text-green-600">Connected</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Contacts</span>
                      <span className="text-sm font-medium text-gray-900">1,247</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Last Sync</span>
                      <span className="text-sm font-medium text-gray-900">2 minutes ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <Users className="h-5 w-5 text-orange-600" />
                    HubSpot
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Marketing automation platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Status</span>
                      <span className="text-sm font-medium text-green-600">Connected</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Contacts</span>
                      <span className="text-sm font-medium text-gray-900">856</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Last Sync</span>
                      <span className="text-sm font-medium text-gray-900">5 minutes ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Lead Intelligence Card */}
            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Brain className="h-5 w-5 text-purple-600" />
                  Lead Intelligence Agent
                </CardTitle>
                <CardDescription className="text-gray-600">
                  AI-powered lead analysis and scoring
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-2xl font-bold text-blue-600">2,341</div>
                    <div className="text-sm text-blue-700">Leads Analyzed</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-2xl font-bold text-green-600">94%</div>
                    <div className="text-sm text-green-700">Accuracy Rate</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="text-2xl font-bold text-purple-600">2.4s</div>
                    <div className="text-sm text-purple-700">Avg Response</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integration" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="bg-white border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-gray-900">Salesforce Integration</CardTitle>
                  <CardDescription className="text-gray-600">
                    Connect and sync your Salesforce CRM data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SalesforceIntegration />
                </CardContent>
              </Card>

              <Card className="bg-white border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-gray-900">HubSpot Integration</CardTitle>
                  <CardDescription className="text-gray-600">
                    Connect and sync your HubSpot marketing data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <HubSpotIntegration />
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">Lead Intelligence Agent</CardTitle>
                <CardDescription className="text-gray-600">
                  AI-powered lead analysis and insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LeadIntelligenceAgent />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="agents" className="space-y-6">
            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Bot className="h-5 w-5 text-blue-600" />
                  AI Agents
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Manage your AI-powered automation agents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LeadIntelligenceAgent />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-6">
            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Analytics Dashboard
                </CardTitle>
                <CardDescription className="text-gray-600">
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