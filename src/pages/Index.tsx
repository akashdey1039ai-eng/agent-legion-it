import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from "@/components/ui/button";
import { CrmDashboard } from "@/components/CrmDashboard";
import { SalesforceIntegration } from "@/components/SalesforceIntegration";
import { EnhancedAIAgentTester } from "@/components/EnhancedAIAgentTester";
import { Header } from "@/components/Header";
import heroCommand from "@/assets/hero-command.jpg";
import { Terminal, Database, Shield, Bot, Zap, Brain } from "lucide-react";

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
      {/* Professional Hero Section */}
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
              <Terminal className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary tracking-wide">Enterprise AI Platform</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold mb-8 leading-tight">
              <span className="bg-gradient-primary bg-clip-text text-transparent">Autonomous AI Agents</span>
              <br />
              <span className="text-foreground">for Salesforce CRM</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              Enterprise-grade AI automation platform that connects to your Salesforce Developer Sandbox 
              and deploys intelligent agents to autonomously manage CRM operations, leads, and opportunities.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button variant="primary" size="lg" className="min-w-52 h-12">
                <Bot className="h-5 w-5" />
                Deploy AI Agents
              </Button>
              <Button variant="professional" size="lg" className="min-w-52 h-12">
                <Database className="h-5 w-5" />
                Connect Salesforce
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Professional Integration Section */}
      <section className="py-20 border-b border-border/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-6 py-3 mb-8 shadow-md">
              <Database className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary tracking-wide">Enterprise Integration</span>
            </div>
            <h2 className="text-4xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
              Salesforce Developer Sandbox
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Seamlessly integrate with your Salesforce Developer environment to enable 
              enterprise-grade AI automation and intelligent CRM management.
            </p>
          </div>
          <SalesforceIntegration />
        </div>
      </section>

      {/* AI Testing Platform */}
      <section className="py-20 border-b border-border/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/30 rounded-full px-6 py-3 mb-8 shadow-md">
              <Zap className="h-4 w-4 text-accent" />
              <span className="text-sm font-semibold text-accent tracking-wide">AI Testing Platform</span>
            </div>
            <h2 className="text-4xl font-bold mb-6">
              Enterprise AI Agent Testing Suite
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Deploy and test OpenAI-powered autonomous agents with real-time analysis capabilities. 
              Monitor performance, validate actions, and ensure enterprise-grade reliability.
            </p>
          </div>
          <EnhancedAIAgentTester />
        </div>
      </section>

      {/* Business Intelligence Dashboard */}
      <section className="py-20 border-b border-border/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-success/10 border border-success/30 rounded-full px-6 py-3 mb-8 shadow-md">
              <Brain className="h-4 w-4 text-success" />
              <span className="text-sm font-semibold text-success tracking-wide">Business Intelligence</span>
            </div>
            <h2 className="text-4xl font-bold mb-6">
              Real-Time CRM Analytics
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Comprehensive business intelligence dashboard with real-time insights, 
              synchronized data streams, and enterprise-grade analytics from your Salesforce environment.
            </p>
          </div>
          <CrmDashboard />
        </div>
      </section>

      {/* Professional Footer */}
      <footer className="border-t border-border/30 bg-gradient-surface py-12">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-2 bg-gradient-primary rounded-lg shadow-glow">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">
                IT AI Command Center
              </span>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Enterprise AI automation platform powered by OpenAI and advanced machine learning. 
              Designed for professional Salesforce environments and business intelligence operations.
            </p>
            <div className="mt-6 text-sm text-muted-foreground/70">
              © 2024 IT AI Command Center. Professional AI Solutions.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
