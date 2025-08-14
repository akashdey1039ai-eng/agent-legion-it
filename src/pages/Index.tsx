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
import heroCommand from "@/assets/hero-command.jpg";
import { 
  Brain, 
  Database, 
  Users, 
  Target, 
  TrendingUp, 
  Activity, 
  Bot, 
  Zap, 
  Shield, 
  BarChart3, 
  PieChart, 
  Sparkles,
  ArrowRight,
  Globe,
  Layers,
  Settings,
  CheckCircle,
  Clock,
  Star
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
    clearTestResults();
    
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center">
        <div className="text-center space-y-4 animate-fade-in">
          <div className="relative">
            <div className="animate-spin h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full mx-auto"></div>
            <Brain className="absolute inset-0 h-6 w-6 text-primary m-auto" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">Universal CRM AI Platform</h3>
            <p className="text-muted-foreground font-medium">Initializing enterprise intelligence...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-5"></div>
        <div className="container mx-auto px-6 py-16 lg:py-24 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-4">
                <Badge variant="outline" className="w-fit border-primary/20 text-primary">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Enterprise AI Platform
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                  <span className="text-gradient-hero">Universal CRM</span>
                  <br />
                  <span className="text-foreground">Intelligence Platform</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
                  Transform your customer relationships with AI-powered insights, seamless integrations, 
                  and enterprise-grade analytics across Salesforce, HubSpot, and beyond.
                </p>
              </div>
              
              {/* Key Features */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Brain, label: "AI Intelligence", desc: "Advanced analytics" },
                  { icon: Globe, label: "Multi-Platform", desc: "Universal integration" },
                  { icon: Shield, label: "Enterprise", desc: "Security & scale" },
                  { icon: Zap, label: "Real-time", desc: "Live insights" }
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center space-x-3 p-3 rounded-lg bg-card/50 border border-border/30">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <feature.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{feature.label}</p>
                      <p className="text-xs text-muted-foreground">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative animate-slide-up">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src={heroCommand} 
                  alt="Universal CRM AI Platform Dashboard" 
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent"></div>
              </div>
              {/* Floating Stats */}
              <div className="absolute -bottom-6 -left-6 bg-card border border-border/50 rounded-xl p-4 shadow-xl animate-scale-in">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-bold text-lg">94%</p>
                    <p className="text-xs text-muted-foreground">Lead Accuracy</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-6 py-12">
        <Tabs defaultValue="overview" className="space-y-8">
          {/* Professional Tab Navigation */}
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-2 shadow-sm">
            <TabsList className="grid w-full grid-cols-4 bg-transparent gap-2">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm rounded-lg font-medium transition-all"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="integration" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm rounded-lg font-medium transition-all"
              >
                <Database className="h-4 w-4 mr-2" />
                CRM Integration
              </TabsTrigger>
              <TabsTrigger 
                value="agents" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm rounded-lg font-medium transition-all"
              >
                <Bot className="h-4 w-4 mr-2" />
                AI Agents
              </TabsTrigger>
              <TabsTrigger 
                value="dashboard" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm rounded-lg font-medium transition-all"
              >
                <PieChart className="h-4 w-4 mr-2" />
                Intelligence Dashboard
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8 animate-fade-in">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: "Active Integrations", value: "2", change: "+100%", icon: Database, color: "text-blue-600" },
                { label: "Lead Intelligence", value: "98%", change: "+15%", icon: Brain, color: "text-purple-600" },
                { label: "Data Sync", value: "Real-time", change: "Live", icon: Activity, color: "text-green-600" },
                { label: "AI Accuracy", value: "94.2%", change: "+8%", icon: Target, color: "text-orange-600" }
              ].map((stat, idx) => (
                <Card key={idx} className="card-elevated animate-scale-in" style={{ animationDelay: `${idx * 100}ms` }}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                        <p className="text-2xl font-bold mt-1">{stat.value}</p>
                        <Badge variant="secondary" className="mt-2 text-xs">
                          {stat.change}
                        </Badge>
                      </div>
                      <div className={`p-3 rounded-xl bg-muted/50 ${stat.color}`}>
                        <stat.icon className="w-6 h-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Platform Status Cards */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Salesforce Integration */}
              <Card className="card-professional">
                <CardHeader className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Database className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Salesforce Integration</CardTitle>
                        <CardDescription>Enterprise CRM connection</CardDescription>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Connected
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">1,247</p>
                      <p className="text-xs text-muted-foreground">Contacts Synced</p>
                    </div>
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">98%</p>
                      <p className="text-xs text-muted-foreground">Sync Success</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => setSelectedPlatform('salesforce')}
                    className="w-full btn-gradient"
                  >
                    Manage Integration
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              {/* HubSpot Integration */}
              <Card className="card-professional">
                <CardHeader className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Users className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">HubSpot Integration</CardTitle>
                        <CardDescription>Marketing & sales automation</CardDescription>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Connected
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <p className="text-2xl font-bold text-orange-600">856</p>
                      <p className="text-xs text-muted-foreground">Leads Tracked</p>
                    </div>
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">74%</p>
                      <p className="text-xs text-muted-foreground">Conversion Rate</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => setSelectedPlatform('hubspot')}
                    className="w-full btn-elegant"
                  >
                    Manage Integration
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* AI Intelligence Overview */}
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-primary rounded-lg">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  Lead Intelligence Agent
                </CardTitle>
                <CardDescription>
                  AI-powered lead analysis and scoring system
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                    <Star className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-600">94.2%</p>
                    <p className="text-sm text-blue-700 font-medium">AI Accuracy</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                    <Clock className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-600">2.4s</p>
                    <p className="text-sm text-green-700 font-medium">Avg Response</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                    <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-purple-600">347%</p>
                    <p className="text-sm text-purple-700 font-medium">ROI Increase</p>
                  </div>
                </div>
                
                <Button 
                  onClick={() => setActiveAgent('lead-intelligence')}
                  className="w-full btn-gradient text-lg py-6"
                >
                  <Brain className="w-5 h-5 mr-3" />
                  Launch Lead Intelligence Agent
                  <ArrowRight className="w-5 h-5 ml-3" />
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CRM Integration Tab */}
          <TabsContent value="integration" className="space-y-8 animate-fade-in">
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Database className="w-5 h-5 text-blue-600" />
                    </div>
                    Salesforce Integration
                  </CardTitle>
                  <CardDescription>
                    Connect and sync your Salesforce CRM data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SalesforceIntegration />
                </CardContent>
              </Card>

              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Users className="w-5 h-5 text-orange-600" />
                    </div>
                    HubSpot Integration
                  </CardTitle>
                  <CardDescription>
                    Connect and sync your HubSpot marketing data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <HubSpotIntegration />
                </CardContent>
              </Card>
            </div>

            <Card className="card-professional">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-primary rounded-lg">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  Lead Intelligence Agent
                </CardTitle>
                <CardDescription>
                  AI-powered lead analysis and insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LeadIntelligenceAgent />
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Agents Tab */}
          <TabsContent value="agents" className="space-y-8 animate-fade-in">
            {activeAgent === 'lead-intelligence' ? (
              <Card className="card-professional">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-primary rounded-lg">
                          <Brain className="w-5 h-5 text-white" />
                        </div>
                        Lead Intelligence Agent
                      </CardTitle>
                      <CardDescription>
                        Advanced AI analysis for lead scoring and insights
                      </CardDescription>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => setActiveAgent(null)}
                      className="border-border/50"
                    >
                      Back to Overview
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <LeadIntelligenceAgent />
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-8">
                {/* AI Agents Overview */}
                <div className="text-center space-y-4">
                  <div className="inline-flex p-4 bg-gradient-primary rounded-2xl shadow-glow">
                    <Bot className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold">AI Agent Command Center</h2>
                    <p className="text-muted-foreground mt-2 text-lg">
                      Deploy intelligent agents to automate and enhance your CRM workflows
                    </p>
                  </div>
                </div>

                {/* Agent Cards */}
                <div className="grid lg:grid-cols-2 gap-8">
                  <Card 
                    className="card-elevated cursor-pointer hover:shadow-2xl transition-all duration-300"
                    onClick={() => setActiveAgent('lead-intelligence')}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-gradient-primary rounded-xl">
                            <Brain className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-xl">Lead Intelligence Agent</CardTitle>
                            <CardDescription className="text-base">
                              AI-powered lead scoring and analysis
                            </CardDescription>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-muted/30 rounded-lg">
                          <p className="text-xl font-bold text-primary">2,341</p>
                          <p className="text-xs text-muted-foreground">Leads Analyzed</p>
                        </div>
                        <div className="text-center p-3 bg-muted/30 rounded-lg">
                          <p className="text-xl font-bold text-green-600">94%</p>
                          <p className="text-xs text-muted-foreground">Accuracy Rate</p>
                        </div>
                      </div>
                      <Button className="w-full btn-gradient">
                        Launch Agent
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="card-elevated opacity-75">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-muted rounded-xl">
                            <Settings className="w-6 h-6 text-muted-foreground" />
                          </div>
                          <div>
                            <CardTitle className="text-xl">Enhanced AI Agent</CardTitle>
                            <CardDescription className="text-base">
                              Advanced workflow automation
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant="outline">Coming Soon</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 bg-muted/30 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          Advanced AI capabilities for complex workflow automation and 
                          multi-platform intelligence analysis.
                        </p>
                      </div>
                      <Button variant="outline" disabled className="w-full">
                        Configure Agent
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Intelligence Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-8 animate-fade-in">
            <div className="space-y-8">
              <div className="text-center space-y-4">
                <div className="inline-flex p-4 bg-gradient-primary rounded-2xl shadow-glow">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">Real-Time Intelligence Dashboard</h2>
                  <p className="text-muted-foreground mt-2 text-lg">
                    Live analytics and insights from your connected CRM platforms
                  </p>
                </div>
              </div>

              <CrmDashboard />
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
};

export default Index;