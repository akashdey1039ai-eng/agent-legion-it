import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from "@/components/ui/button";
import { CrmDashboard } from "@/components/CrmDashboard";
import { SalesforceIntegration } from "@/components/SalesforceIntegration";
import { EnhancedAIAgentTester } from "@/components/EnhancedAIAgentTester";
import { Header } from "@/components/Header";
import heroCommand from "@/assets/hero-command.jpg";
import { Brain, Database, Users, Target, TrendingUp, Activity, Bot, Zap, Shield, BarChart3, PieChart, Sparkles } from "lucide-react";

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
      {/* CRM Intelligence Hero Section */}
      <section className="relative overflow-hidden bg-gradient-surface">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{ backgroundImage: `url(${heroCommand})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/70" />
        </div>
        
        <div className="relative container mx-auto px-6 py-24 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-6 py-3 mb-8 shadow-lg">
              <Brain className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary tracking-wide">CRM Intelligence Platform</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold mb-8 leading-tight">
              <span className="bg-gradient-primary bg-clip-text text-transparent">CRM Intelligence</span>
              <br />
              <span className="text-foreground">AI Agentic Center</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              Transform your CRM workflows with autonomous AI agents. Intelligent lead scoring, 
              pipeline forecasting, automated insights, and predictive analytics powered by advanced machine learning.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button variant="primary" size="lg" className="min-w-52 h-12">
                <Bot className="h-5 w-5" />
                Launch AI Agents
              </Button>
              <Button variant="professional" size="lg" className="min-w-52 h-12">
                <BarChart3 className="h-5 w-5" />
                View Intelligence
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CRM Intelligence Agents Grid */}
      <section className="py-20 border-b border-border/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-6 py-3 mb-8 shadow-md">
              <Bot className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary tracking-wide">AI Agent Capabilities</span>
            </div>
            <h2 className="text-4xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
              CRM Intelligence Agents
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Autonomous AI agents that transform your CRM workflows with intelligent automation,
              predictive insights, and data-driven decision making.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* Lead Intelligence Agent */}
            <div className="bg-card border border-border/50 rounded-lg p-8 hover:shadow-lg transition-all duration-300 hover:border-primary/30">
              <div className="p-3 bg-primary/10 rounded-lg w-fit mb-6">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-4">Lead Intelligence Agent</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                AI-powered lead scoring, qualification, and prioritization with real-time analysis and automated follow-up recommendations.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full">Lead Scoring</span>
                <span className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full">Auto Qualification</span>
                <span className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full">Priority Ranking</span>
              </div>
            </div>

            {/* Pipeline Forecasting Agent */}
            <div className="bg-card border border-border/50 rounded-lg p-8 hover:shadow-lg transition-all duration-300 hover:border-primary/30">
              <div className="p-3 bg-accent/10 rounded-lg w-fit mb-6">
                <Target className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-4">Pipeline Forecasting Agent</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Predictive pipeline analysis with deal probability forecasting, revenue predictions, and risk assessment automation.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-accent/10 text-accent text-xs rounded-full">Revenue Forecasting</span>
                <span className="px-3 py-1 bg-accent/10 text-accent text-xs rounded-full">Risk Assessment</span>
                <span className="px-3 py-1 bg-accent/10 text-accent text-xs rounded-full">Deal Probability</span>
              </div>
            </div>

            {/* Activity Intelligence Agent */}
            <div className="bg-card border border-border/50 rounded-lg p-8 hover:shadow-lg transition-all duration-300 hover:border-primary/30">
              <div className="p-3 bg-success/10 rounded-lg w-fit mb-6">
                <Activity className="h-8 w-8 text-success" />
              </div>
              <h3 className="text-xl font-bold mb-4">Activity Intelligence Agent</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Smart activity recommendations, automated task creation, and optimal timing for customer engagement based on behavioral patterns.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-success/10 text-success text-xs rounded-full">Next Best Action</span>
                <span className="px-3 py-1 bg-success/10 text-success text-xs rounded-full">Auto Tasks</span>
                <span className="px-3 py-1 bg-success/10 text-success text-xs rounded-full">Optimal Timing</span>
              </div>
            </div>

            {/* Contact Intelligence Agent */}
            <div className="bg-card border border-border/50 rounded-lg p-8 hover:shadow-lg transition-all duration-300 hover:border-primary/30">
              <div className="p-3 bg-purple-500/10 rounded-lg w-fit mb-6">
                <Brain className="h-8 w-8 text-purple-500" />
              </div>
              <h3 className="text-xl font-bold mb-4">Contact Intelligence Agent</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Deep contact analysis with relationship mapping, engagement scoring, and personalized communication strategy recommendations.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-purple-500/10 text-purple-500 text-xs rounded-full">Relationship Mapping</span>
                <span className="px-3 py-1 bg-purple-500/10 text-purple-500 text-xs rounded-full">Engagement Score</span>
                <span className="px-3 py-1 bg-purple-500/10 text-purple-500 text-xs rounded-full">Personalization</span>
              </div>
            </div>

            {/* Opportunity Risk Agent */}
            <div className="bg-card border border-border/50 rounded-lg p-8 hover:shadow-lg transition-all duration-300 hover:border-primary/30">
              <div className="p-3 bg-orange-500/10 rounded-lg w-fit mb-6">
                <Shield className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold mb-4">Opportunity Risk Agent</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Early warning system for deals at risk with automated alerts, risk mitigation strategies, and intervention recommendations.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-orange-500/10 text-orange-500 text-xs rounded-full">Risk Detection</span>
                <span className="px-3 py-1 bg-orange-500/10 text-orange-500 text-xs rounded-full">Early Warnings</span>
                <span className="px-3 py-1 bg-orange-500/10 text-orange-500 text-xs rounded-full">Mitigation Plans</span>
              </div>
            </div>

            {/* Performance Analytics Agent */}
            <div className="bg-card border border-border/50 rounded-lg p-8 hover:shadow-lg transition-all duration-300 hover:border-primary/30">
              <div className="p-3 bg-blue-500/10 rounded-lg w-fit mb-6">
                <TrendingUp className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold mb-4">Performance Analytics Agent</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Comprehensive performance tracking with sales rep coaching recommendations, quota forecasting, and team optimization insights.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-blue-500/10 text-blue-500 text-xs rounded-full">Performance Tracking</span>
                <span className="px-3 py-1 bg-blue-500/10 text-blue-500 text-xs rounded-full">Coaching AI</span>
                <span className="px-3 py-1 bg-blue-500/10 text-blue-500 text-xs rounded-full">Team Optimization</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Salesforce Data Integration */}
      <section className="py-20 border-b border-border/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-6 py-3 mb-8 shadow-md">
              <Database className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary tracking-wide">Data Integration</span>
            </div>
            <h2 className="text-4xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
              Salesforce CRM Data Pipeline
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Connect your Salesforce environment to enable AI-powered intelligence. Sync leads, opportunities, 
              and activities for real-time analysis and automated insights.
            </p>
          </div>
          <SalesforceIntegration />
        </div>
      </section>

      {/* AI Agent Testing Center */}
      <section className="py-20 border-b border-border/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/30 rounded-full px-6 py-3 mb-8 shadow-md">
              <Sparkles className="h-4 w-4 text-accent" />
              <span className="text-sm font-semibold text-accent tracking-wide">AI Agent Control Center</span>
            </div>
            <h2 className="text-4xl font-bold mb-6">
              CRM Intelligence Testing Suite
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Test and validate your CRM AI agents with real Salesforce data. Enable autonomous actions, 
              monitor performance, and fine-tune intelligence algorithms for optimal results.
            </p>
          </div>
          <EnhancedAIAgentTester />
        </div>
      </section>

      {/* CRM Intelligence Dashboard */}
      <section className="py-20 border-b border-border/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-success/10 border border-success/30 rounded-full px-6 py-3 mb-8 shadow-md">
              <PieChart className="h-4 w-4 text-success" />
              <span className="text-sm font-semibold text-success tracking-wide">CRM Intelligence Dashboard</span>
            </div>
            <h2 className="text-4xl font-bold mb-6">
              Real-Time CRM Intelligence
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Live intelligence dashboard powered by AI analysis of your CRM data. Track lead performance, 
              pipeline health, and AI-generated insights from your connected Salesforce environment.
            </p>
          </div>
          <CrmDashboard />
        </div>
      </section>

      {/* CRM Intelligence Footer */}
      <footer className="border-t border-border/30 bg-gradient-surface py-12">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-2 bg-gradient-primary rounded-lg shadow-glow">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">
                CRM Intelligence AI Agentic Center
              </span>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Transform your CRM workflows with autonomous AI agents. Powered by OpenAI and advanced 
              machine learning for lead intelligence, pipeline forecasting, and predictive analytics.
            </p>
            <div className="mt-6 text-sm text-muted-foreground/70">
              © 2024 CRM Intelligence AI Agentic Center. Intelligent CRM Automation for Modern Sales Teams.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
