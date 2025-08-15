import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CrmDashboard } from "@/components/CrmDashboard";
import { SalesforceIntegration } from "@/components/SalesforceIntegration";
import HubSpotIntegration from "@/components/HubSpotIntegration";
import { AgentConfiguration } from "@/components/AgentConfiguration";
import LeadIntelligenceAgent from "@/components/LeadIntelligenceAgent";
import { AgentExecutionPanel } from "@/components/AgentExecutionPanel";
import { AgentConfigurationSelector } from "@/components/AgentConfigurationSelector";
import { EnhancedAIAgentTester } from "@/components/EnhancedAIAgentTester";
import { Header } from "@/components/Header";
import { SandboxConnector } from "@/components/SandboxConnector";
import heroCommand from "@/assets/hero-command.jpg";
import { Brain, Database, Users, Target, TrendingUp, Activity, Bot, Zap, Shield, BarChart3, PieChart, Sparkles, Settings, Smartphone, Monitor } from "lucide-react";
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
  const location = useLocation();
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [showAgentConfig, setShowAgentConfig] = useState<{platform: 'salesforce' | 'hubspot'; agentType: string} | null>(null);
  const [showAgentSelector, setShowAgentSelector] = useState<string | null>(null);

  useEffect(() => {
    // Clear previous test results on page load
    clearTestResults();
    
    if (!loading && !user) {
      navigate('/auth');
    }

    // Handle navigation state for agent management
    const state = location.state as { activeTab?: string; openAgent?: string } | null;
    
    if (state?.activeTab) {
      setActiveTab(state.activeTab);
    }
    if (state?.openAgent) {
      setActiveTab('agents');
      setActiveAgent(state.openAgent);
    }
  }, [user, loading, navigate, location.state]);

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
    <div className="min-h-screen bg-background mobile-safe-area">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-surface">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{ backgroundImage: `url(${heroCommand})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/70" />
        </div>
        
        <div className="relative container mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 sm:px-6 py-2 sm:py-3 mb-6 sm:mb-8 shadow-lg">
              <Brain className="h-4 w-4 text-primary" />
              <span className="text-xs sm:text-sm font-semibold text-primary tracking-wide">Universal CRM AI Platform</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
              <span className="bg-gradient-primary bg-clip-text text-transparent">Universal CRM</span>
              <br />
              <span className="text-foreground">AI Intelligence Platform</span>
            </h1>
            
            <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-4">
              Connect any CRM platform or use our independent CRM system. Autonomous AI agents work across 
              Salesforce, HubSpot, Pipedrive, and more - plus our native CRM intelligence layer.
            </p>

            {/* Mobile Responsive Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 max-w-2xl mx-auto">
              <div className="flex items-center justify-center p-4 bg-card rounded-lg border">
                <Smartphone className="h-6 w-6 text-primary mr-2" />
                <span className="text-sm font-medium">Mobile Optimized</span>
              </div>
              <div className="flex items-center justify-center p-4 bg-card rounded-lg border">
                <Monitor className="h-6 w-6 text-primary mr-2" />
                <span className="text-sm font-medium">Cross-Platform</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Navigation Tabs */}
      <section className="py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 gap-1">
              <TabsTrigger value="overview" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Overview</span>
                <span className="sm:hidden">Info</span>
              </TabsTrigger>
              <TabsTrigger value="integration" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <Database className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Integration</span>
                <span className="sm:hidden">Connect</span>
              </TabsTrigger>
              <TabsTrigger value="crm" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm" onClick={() => navigate('/crm')}>
                <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Native CRM</span>
                <span className="sm:hidden">CRM</span>
              </TabsTrigger>
              <TabsTrigger value="agents" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <Bot className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">AI Agents</span>
                <span className="sm:hidden">AI</span>
              </TabsTrigger>
              <TabsTrigger value="dashboard" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <PieChart className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Dashboard</span>
                <span className="sm:hidden">Stats</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-6 sm:mt-8">
              <div className="space-y-8">
                {/* Sandbox Connector */}
                <div className="max-w-4xl mx-auto">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-4">Connect Your Sandbox</h2>
                    <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                      Test with your CRM sandbox before production deployment
                    </p>
                  </div>
                  <SandboxConnector />
                </div>

                {/* Features Grid */}
                <div className="grid mobile-grid gap-4 sm:gap-6">
                  <Card className="bg-gradient-to-br from-card to-card/50 border-primary/20">
                    <CardHeader>
                      <Users className="h-8 w-8 sm:h-10 sm:w-10 text-primary mb-3 sm:mb-4" />
                      <CardTitle className="text-base sm:text-lg">Lead Intelligence</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm">
                        AI-powered lead scoring and qualification with automated prioritization.
                      </CardDescription>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-card to-card/50 border-accent/20">
                    <CardHeader>
                      <Target className="h-8 w-8 sm:h-10 sm:w-10 text-accent mb-3 sm:mb-4" />
                      <CardTitle className="text-base sm:text-lg">Pipeline Forecasting</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm">
                        Predictive analytics for revenue forecasting and risk assessment.
                      </CardDescription>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-card to-card/50 border-success/20">
                    <CardHeader>
                      <Activity className="h-8 w-8 sm:h-10 sm:w-10 text-success mb-3 sm:mb-4" />
                      <CardTitle className="text-base sm:text-lg">Activity Intelligence</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm">
                        Smart recommendations for next best actions and optimal timing.
                      </CardDescription>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-card to-card/50 border-warning/20">
                    <CardHeader>
                      <Shield className="h-8 w-8 sm:h-10 sm:w-10 text-warning mb-3 sm:mb-4" />
                      <CardTitle className="text-base sm:text-lg">Enterprise Security</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm">
                        Bank-grade encryption, audit trails, and compliance with industry standards.
                      </CardDescription>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Other tabs remain the same but with mobile-responsive updates */}
            <TabsContent value="integration" className="mt-6 sm:mt-8">
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-xl sm:text-2xl font-bold mb-4">Connect Your CRM Platform</h2>
                  <p className="text-muted-foreground mb-6 sm:mb-8 text-sm sm:text-base">
                    Integrate with your existing CRM or use our native platform
                  </p>
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  {/* Platform selection cards with mobile optimization */}
                  <button
                    onClick={() => setSelectedPlatform('salesforce')}
                    className={`bg-card border rounded-lg p-3 sm:p-4 text-center transition-all hover:shadow-lg ${
                      selectedPlatform === 'salesforce' 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
                        : 'border-border/50 hover:border-border'
                    }`}
                  >
                    <div className="w-8 h-8 sm:w-12 sm:h-12 bg-blue-600 rounded-lg mx-auto mb-2 sm:mb-3 flex items-center justify-center text-white font-bold text-xs sm:text-base">SF</div>
                    <h3 className="font-medium mb-1 text-xs sm:text-sm">Salesforce</h3>
                    <p className="text-xs text-muted-foreground hidden sm:block">Enterprise CRM</p>
                  </button>
                  
                  <button
                    onClick={() => setSelectedPlatform('hubspot')}
                    className={`bg-card border rounded-lg p-3 sm:p-4 text-center transition-all hover:shadow-lg ${
                      selectedPlatform === 'hubspot' 
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-950' 
                        : 'border-border/50 hover:border-border'
                    }`}
                  >
                    <div className="w-8 h-8 sm:w-12 sm:h-12 bg-orange-500 rounded-lg mx-auto mb-2 sm:mb-3 flex items-center justify-center text-white font-bold text-xs sm:text-base">HS</div>
                    <h3 className="font-medium mb-1 text-xs sm:text-sm">HubSpot</h3>
                    <p className="text-xs text-muted-foreground hidden sm:block">Inbound Marketing</p>
                  </button>
                  
                  <button
                    onClick={() => setSelectedPlatform('pipedrive')}
                    className="bg-card border rounded-lg p-3 sm:p-4 text-center transition-all opacity-50 cursor-not-allowed"
                    disabled
                  >
                    <div className="w-8 h-8 sm:w-12 sm:h-12 bg-green-600 rounded-lg mx-auto mb-2 sm:mb-3 flex items-center justify-center text-white font-bold text-xs sm:text-base">PD</div>
                    <h3 className="font-medium mb-1 text-xs sm:text-sm">Pipedrive</h3>
                    <p className="text-xs text-muted-foreground hidden sm:block">Coming Soon</p>
                  </button>
                  
                  <button
                    onClick={() => setSelectedPlatform('native')}
                    className={`bg-card border rounded-lg p-3 sm:p-4 text-center transition-all hover:shadow-lg ${
                      selectedPlatform === 'native' 
                        ? 'border-primary bg-primary/10' 
                        : 'border-primary/50 bg-primary/5 hover:border-primary'
                    }`}
                  >
                    <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-primary rounded-lg mx-auto mb-2 sm:mb-3 flex items-center justify-center">
                      <Brain className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <h3 className="font-medium mb-1 text-xs sm:text-sm">Native CRM</h3>
                    <p className="text-xs text-muted-foreground hidden sm:block">AI-First Platform</p>
                  </button>
                </div>
                
                {/* Integration content */}
                {selectedPlatform === 'salesforce' && <SalesforceIntegration />}
                {selectedPlatform === 'hubspot' && <HubSpotIntegration />}
                {selectedPlatform === 'native' && (
                  <div className="text-center py-8 sm:py-12">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-primary rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold mb-2">Native AI-First CRM</h3>
                    <p className="text-muted-foreground mb-4 text-sm sm:text-base max-w-md mx-auto">
                      Our built-in CRM system designed specifically for AI automation and intelligence.
                    </p>
                    <Button className="bg-gradient-primary hover:opacity-90 w-full sm:w-auto" onClick={() => navigate('/crm')}>
                      Explore Native CRM
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* AI Agents Tab - keeping existing logic but with mobile responsive updates */}
            <TabsContent value="agents" className="mt-6 sm:mt-8">
              {showAgentConfig ? (
                <AgentConfiguration 
                  platform={showAgentConfig.platform}
                  agentType={showAgentConfig.agentType}
                  onClose={() => setShowAgentConfig(null)}
                />
              ) : showAgentSelector ? (
                <AgentConfigurationSelector
                  agentType={showAgentSelector}
                  onSelectPlatform={(platform) => {
                    setShowAgentConfig({ platform, agentType: showAgentSelector });
                    setShowAgentSelector(null);
                  }}
                  onBack={() => setShowAgentSelector(null)}
                  onQuickRun={(platform?: 'salesforce' | 'hubspot') => {
                    setShowAgentSelector(null);
                    setActiveAgent(showAgentSelector);
                    if (platform) {
                      setSelectedPlatform(platform);
                    }
                  }}
                />
              ) : activeAgent ? (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                        {activeAgent === 'lead-intelligence' && 'Lead Intelligence Agent'}
                        {activeAgent === 'pipeline-analysis' && 'Pipeline Analysis Agent'}
                        {activeAgent && !['lead-intelligence', 'pipeline-analysis'].includes(activeAgent) && 'AI Agent'}
                      </h2>
                      <p className="text-muted-foreground text-sm sm:text-base">
                        {activeAgent === 'lead-intelligence' && 'Analyze and score leads using AI'}
                        {activeAgent === 'pipeline-analysis' && 'Analyze sales pipeline performance and forecast revenue'}
                        {activeAgent && !['lead-intelligence', 'pipeline-analysis'].includes(activeAgent) && 'Manage your AI agent'}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => setActiveAgent(null)}
                      className="w-full sm:w-auto"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Back to Agents
                    </Button>
                  </div>
                  
                  {activeAgent === 'lead-intelligence' && <LeadIntelligenceAgent />}
                  {activeAgent === 'pipeline-analysis' && <AgentExecutionPanel agentType="pipeline-analysis" platform={(selectedPlatform as 'salesforce' | 'hubspot') || "salesforce"} onBack={() => setActiveAgent(null)} />}
                </div>
              ) : (
                <EnhancedAIAgentTester />
              )}
            </TabsContent>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="mt-6 sm:mt-8">
              <CrmDashboard />
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
};

export default Index;