import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from "@/components/ui/button";
import { CrmDashboard } from "@/components/CrmDashboard";
import { SalesforceIntegration } from "@/components/SalesforceIntegration";
import HubSpotIntegration from "@/components/HubSpotIntegration";
import LeadIntelligenceAgent from "@/components/LeadIntelligenceAgent";
import SalesforceDataExtractor from "@/components/SalesforceDataExtractor";
import { EnhancedAIAgentTester } from "@/components/EnhancedAIAgentTester";
import { Header } from "@/components/Header";
import heroCommand from "@/assets/hero-command.jpg";
import { Brain, Database, Users, Target, TrendingUp, Activity, Bot, Zap, Shield, BarChart3, PieChart, Sparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Clear previous test results on page load
const clearTestResults = () => {
  const testResults = localStorage.getItem('aiAgentTestResults');
  if (testResults) {
    localStorage.removeItem('aiAgentTestResults');
  }
};

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [activeAgent, setActiveAgent] = useState<string | null>(null);

  useEffect(() => {
    // Clear previous test results on page load
    clearTestResults();
    
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-surface">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{ backgroundImage: `url(${heroCommand})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/70" />
        </div>
        
        <div className="relative container mx-auto px-6 py-16 lg:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-6 py-3 mb-8 shadow-lg">
              <Brain className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary tracking-wide">Universal CRM AI Platform</span>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-primary bg-clip-text text-transparent">Universal CRM</span>
              <br />
              <span className="text-foreground">AI Intelligence Platform</span>
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Connect any CRM platform or use our independent CRM system. Autonomous AI agents work across 
              Salesforce, HubSpot, Pipedrive, and more - plus our native CRM intelligence layer.
            </p>
          </div>
        </div>
      </section>

      {/* Main Navigation Tabs */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="integration" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                CRM Integration
              </TabsTrigger>
              <TabsTrigger value="agents" className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                AI Agents
              </TabsTrigger>
              <TabsTrigger value="data-extractor" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                SF Data
              </TabsTrigger>
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <PieChart className="h-4 w-4" />
                Intelligence Dashboard
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Lead Intelligence */}
                <div className="bg-card border border-border/50 rounded-lg p-6 hover:shadow-lg transition-all duration-300">
                  <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Lead Intelligence</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    AI-powered lead scoring and qualification with automated prioritization.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">Lead Scoring</span>
                    <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">Auto Qualification</span>
                  </div>
                </div>

                {/* Pipeline Forecasting */}
                <div className="bg-card border border-border/50 rounded-lg p-6 hover:shadow-lg transition-all duration-300">
                  <div className="p-3 bg-accent/10 rounded-lg w-fit mb-4">
                    <Target className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Pipeline Forecasting</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Predictive analytics for revenue forecasting and risk assessment.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-accent/10 text-accent text-xs rounded-full">Revenue Prediction</span>
                    <span className="px-2 py-1 bg-accent/10 text-accent text-xs rounded-full">Risk Analysis</span>
                  </div>
                </div>

                {/* Activity Intelligence */}
                <div className="bg-card border border-border/50 rounded-lg p-6 hover:shadow-lg transition-all duration-300">
                  <div className="p-3 bg-success/10 rounded-lg w-fit mb-4">
                    <Activity className="h-6 w-6 text-success" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Activity Intelligence</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Smart recommendations for next best actions and optimal timing.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-success/10 text-success text-xs rounded-full">Next Best Action</span>
                    <span className="px-2 py-1 bg-success/10 text-success text-xs rounded-full">Optimal Timing</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* CRM Integration Tab */}
            <TabsContent value="integration" className="mt-8">
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-4">Connect Your CRM Platform</h2>
                  <p className="text-muted-foreground mb-8">
                    Integrate with your existing CRM or use our native platform
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {/* Platform Cards */}
                  <button
                    onClick={() => setSelectedPlatform('salesforce')}
                    className={`bg-card border rounded-lg p-4 text-center transition-all hover:shadow-lg hover:scale-105 ${
                      selectedPlatform === 'salesforce' 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
                        : 'border-border/50 hover:border-border'
                    }`}
                  >
                    <div className="w-12 h-12 bg-blue-600 rounded-lg mx-auto mb-3 flex items-center justify-center text-white font-bold">SF</div>
                    <h3 className="font-medium mb-1">Salesforce</h3>
                    <p className="text-xs text-muted-foreground">Enterprise CRM</p>
                  </button>
                  
                  <button
                    onClick={() => setSelectedPlatform('hubspot')}
                    className={`bg-card border rounded-lg p-4 text-center transition-all hover:shadow-lg hover:scale-105 ${
                      selectedPlatform === 'hubspot' 
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-950' 
                        : 'border-border/50 hover:border-border'
                    }`}
                  >
                    <div className="w-12 h-12 bg-orange-500 rounded-lg mx-auto mb-3 flex items-center justify-center text-white font-bold">HS</div>
                    <h3 className="font-medium mb-1">HubSpot</h3>
                    <p className="text-xs text-muted-foreground">Inbound Marketing</p>
                  </button>
                  
                  <button
                    onClick={() => setSelectedPlatform('pipedrive')}
                    className={`bg-card border rounded-lg p-4 text-center transition-all hover:shadow-lg hover:scale-105 opacity-50 cursor-not-allowed ${
                      selectedPlatform === 'pipedrive' 
                        ? 'border-green-500 bg-green-50 dark:bg-green-950' 
                        : 'border-border/50'
                    }`}
                    disabled
                  >
                    <div className="w-12 h-12 bg-green-600 rounded-lg mx-auto mb-3 flex items-center justify-center text-white font-bold">PD</div>
                    <h3 className="font-medium mb-1">Pipedrive</h3>
                    <p className="text-xs text-muted-foreground">Coming Soon</p>
                  </button>
                  
                  <button
                    onClick={() => setSelectedPlatform('native')}
                    className={`bg-card border rounded-lg p-4 text-center transition-all hover:shadow-lg hover:scale-105 ${
                      selectedPlatform === 'native' 
                        ? 'border-primary bg-primary/10' 
                        : 'border-primary/50 bg-primary/5 hover:border-primary'
                    }`}
                  >
                    <div className="w-12 h-12 bg-gradient-primary rounded-lg mx-auto mb-3 flex items-center justify-center">
                      <Brain className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-medium mb-1">Native CRM</h3>
                    <p className="text-xs text-muted-foreground">AI-First Platform</p>
                  </button>
                </div>
                
                {/* Show integration details based on selected platform */}
                {selectedPlatform === 'salesforce' && <SalesforceIntegration />}
                {selectedPlatform === 'hubspot' && <HubSpotIntegration />}
                {selectedPlatform === 'pipedrive' && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Target className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Pipedrive Integration</h3>
                    <p className="text-muted-foreground mb-4">Coming soon! Pipedrive integration is currently in development.</p>
                    <Button disabled className="opacity-50">
                      Connect Pipedrive (Coming Soon)
                    </Button>
                  </div>
                )}
                {selectedPlatform === 'native' && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-primary rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Brain className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Native AI-First CRM</h3>
                    <p className="text-muted-foreground mb-4">
                      Our built-in CRM system designed specifically for AI automation and intelligence.
                    </p>
                    <Button className="bg-gradient-primary hover:opacity-90">
                      Explore Native CRM
                    </Button>
                  </div>
                )}
                {!selectedPlatform && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Database className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Select a CRM Platform</h3>
                    <p className="text-muted-foreground">
                      Choose a CRM platform above to view integration details and setup instructions.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* AI Agents Tab */}
            <TabsContent value="agents" className="mt-8">
              {activeAgent ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-bold tracking-tight">
                        {activeAgent === 'lead-intelligence' ? 'Lead Intelligence Agent' : 'AI Agent'}
                      </h2>
                      <p className="text-muted-foreground">
                        {activeAgent === 'lead-intelligence' ? 'Analyze and score leads using AI' : 'Manage your AI agent'}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => setActiveAgent(null)}
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Back to Agents
                    </Button>
                  </div>
                  
                  {activeAgent === 'lead-intelligence' && <LeadIntelligenceAgent />}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-bold tracking-tight">AI Agents</h2>
                      <p className="text-muted-foreground">
                        Autonomous AI agents for your CRM operations
                      </p>
                    </div>
                    <Button>
                      <Shield className="h-4 w-4 mr-2" />
                      Configure Agents
                    </Button>
                  </div>

                  {/* Stats Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-card border border-border/50 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-primary" />
                        <div>
                          <p className="text-sm font-medium">Active Agents</p>
                          <p className="text-2xl font-bold">2</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-card border border-border/50 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <Bot className="h-4 w-4 text-primary" />
                        <div>
                          <p className="text-sm font-medium">Total Agents</p>
                          <p className="text-2xl font-bold">5</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-card border border-border/50 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <div>
                          <p className="text-sm font-medium">Avg Success Rate</p>
                          <p className="text-2xl font-bold">92.5%</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-card border border-border/50 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-primary" />
                        <div>
                          <p className="text-sm font-medium">Actions Today</p>
                          <p className="text-2xl font-bold">147</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI Agents Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Lead Intelligence Agent */}
                    <div className="bg-card border border-border/50 rounded-lg p-6 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Brain className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold">Lead Intelligence Agent</h3>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Active
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        Automatically scores and prioritizes leads using AI analysis
                      </p>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium mb-2">Capabilities</p>
                          <div className="flex flex-wrap gap-1">
                            <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">Lead Scoring</span>
                            <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">Priority Assignment</span>
                            <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">Follow-up Tasks</span>
                          </div>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span><strong>Last Run:</strong> 2 hours ago</span>
                          <span><strong>Success:</strong> 94%</span>
                        </div>
                        <Button 
                          className="w-full"
                          onClick={() => setActiveAgent('lead-intelligence')}
                        >
                          <Brain className="h-4 w-4 mr-2" />
                          Manage Agent
                        </Button>
                      </div>
                    </div>

                    {/* Pipeline Analysis Agent */}
                    <div className="bg-card border border-border/50 rounded-lg p-6 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <TrendingUp className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold">Pipeline Analysis Agent</h3>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Active
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        Analyzes deal risks and adjusts probability forecasts
                      </p>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium mb-2">Capabilities</p>
                          <div className="flex flex-wrap gap-1">
                            <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">Risk Analysis</span>
                            <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">Probability Updates</span>
                            <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">Review Scheduling</span>
                          </div>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span><strong>Last Run:</strong> 1 hour ago</span>
                          <span><strong>Success:</strong> 91%</span>
                        </div>
                        <Button className="w-full">
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Manage Agent
                        </Button>
                      </div>
                    </div>

                    {/* Smart Follow-up Agent */}
                    <div className="bg-card border border-border/50 rounded-lg p-6 hover:shadow-lg transition-all duration-300 opacity-75">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-muted rounded-lg">
                            <Sparkles className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold">Smart Follow-up Agent</h3>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                              Draft
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        Automated personalized follow-ups based on lead behavior
                      </p>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium mb-2">Capabilities</p>
                          <div className="flex flex-wrap gap-1">
                            <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">Email Automation</span>
                            <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">Timing Optimization</span>
                            <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">A/B Testing</span>
                          </div>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span><strong>Status:</strong> In Development</span>
                          <span><strong>ETA:</strong> Q2 2024</span>
                        </div>
                        <Button variant="outline" className="w-full">
                          <Sparkles className="h-4 w-4 mr-2" />
                          Configure Agent
                        </Button>
                      </div>
                    </div>

                    {/* Meeting Scheduler Agent */}
                    <div className="bg-card border border-border/50 rounded-lg p-6 hover:shadow-lg transition-all duration-300 opacity-75">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-muted rounded-lg">
                            <Target className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold">Meeting Scheduler Agent</h3>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                              Draft
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        Intelligent meeting coordination and calendar optimization
                      </p>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium mb-2">Capabilities</p>
                          <div className="flex flex-wrap gap-1">
                            <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">Calendar Sync</span>
                            <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">Optimal Timing</span>
                            <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">Auto Booking</span>
                          </div>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span><strong>Status:</strong> In Development</span>
                          <span><strong>ETA:</strong> Q2 2024</span>
                        </div>
                        <Button variant="outline" className="w-full">
                          <Sparkles className="h-4 w-4 mr-2" />
                          Configure Agent
                        </Button>
                      </div>
                    </div>

                    {/* Cross-Platform Sync Agent */}
                    <div className="bg-card border border-border/50 rounded-lg p-6 hover:shadow-lg transition-all duration-300 opacity-75">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-muted rounded-lg">
                            <Activity className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold">Cross-Platform Sync Agent</h3>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                              Draft
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        Keep data synchronized across all connected CRM platforms
                      </p>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium mb-2">Capabilities</p>
                          <div className="flex flex-wrap gap-1">
                            <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">Real-time Sync</span>
                            <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">Conflict Resolution</span>
                            <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">Data Mapping</span>
                          </div>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span><strong>Status:</strong> In Development</span>
                          <span><strong>ETA:</strong> Q3 2024</span>
                        </div>
                        <Button variant="outline" className="w-full">
                          <Sparkles className="h-4 w-4 mr-2" />
                          Configure Agent
                        </Button>
                      </div>
                    </div>

                    {/* Revenue Forecasting Agent */}
                    <div className="bg-card border border-border/50 rounded-lg p-6 hover:shadow-lg transition-all duration-300 opacity-75">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-muted rounded-lg">
                            <BarChart3 className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold">Revenue Forecasting Agent</h3>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                              Draft
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        Advanced revenue predictions based on pipeline analysis
                      </p>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium mb-2">Capabilities</p>
                          <div className="flex flex-wrap gap-1">
                            <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">Revenue Prediction</span>
                            <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">Trend Analysis</span>
                            <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">Goal Tracking</span>
                          </div>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span><strong>Status:</strong> In Development</span>
                          <span><strong>ETA:</strong> Q3 2024</span>
                        </div>
                        <Button variant="outline" className="w-full">
                          <Sparkles className="h-4 w-4 mr-2" />
                          Configure Agent
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
            )}
            </TabsContent>

            {/* Salesforce Data Extractor Tab */}
            <TabsContent value="data-extractor" className="mt-8">
              <SalesforceDataExtractor />
            </TabsContent>

            {/* Intelligence Dashboard Tab */}
            <TabsContent value="dashboard" className="mt-8">
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-4">Real-Time CRM Intelligence</h2>
                  <p className="text-muted-foreground mb-8">
                    Live analytics and insights from your connected CRM data
                  </p>
                </div>
                <CrmDashboard />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
};

export default Index;