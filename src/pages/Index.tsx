import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from "@/components/ui/button";
import { CrmDashboard } from "@/components/CrmDashboard";
import { SalesforceIntegration } from "@/components/SalesforceIntegration";
import { EnhancedAIAgentTester } from "@/components/EnhancedAIAgentTester";
import { Header } from "@/components/Header";
import heroCommand from "@/assets/hero-command.jpg";
import { Terminal, Database, Shield, Bot, Zap, Brain, Cloud, Lock, Server, Network, Cpu, BarChart3 } from "lucide-react";

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
              <span className="bg-gradient-primary bg-clip-text text-transparent">Enterprise IT AI</span>
              <br />
              <span className="text-foreground">Solutions Portfolio</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              Comprehensive AI automation platform for enterprise IT operations. Deploy intelligent agents 
              for cybersecurity, cloud management, infrastructure monitoring, CRM automation, and business intelligence.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button variant="primary" size="lg" className="min-w-52 h-12">
                <Bot className="h-5 w-5" />
                Deploy AI Solutions
              </Button>
              <Button variant="professional" size="lg" className="min-w-52 h-12">
                <Shield className="h-5 w-5" />
                View Portfolio
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* AI Solutions Portfolio Grid */}
      <section className="py-20 border-b border-border/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-6 py-3 mb-8 shadow-md">
              <Brain className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary tracking-wide">AI Solutions Portfolio</span>
            </div>
            <h2 className="text-4xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
              Enterprise AI Capabilities
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Comprehensive suite of AI-powered solutions for modern enterprise IT operations, 
              security, and business intelligence.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* Cybersecurity AI */}
            <div className="bg-card border border-border/50 rounded-lg p-8 hover:shadow-lg transition-all duration-300 hover:border-primary/30">
              <div className="p-3 bg-destructive/10 rounded-lg w-fit mb-6">
                <Shield className="h-8 w-8 text-destructive" />
              </div>
              <h3 className="text-xl font-bold mb-4">Cybersecurity AI</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Autonomous threat detection, incident response, and security monitoring with real-time vulnerability assessment and automated remediation.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-destructive/10 text-destructive text-xs rounded-full">Threat Detection</span>
                <span className="px-3 py-1 bg-destructive/10 text-destructive text-xs rounded-full">Auto Remediation</span>
                <span className="px-3 py-1 bg-destructive/10 text-destructive text-xs rounded-full">SOC Integration</span>
              </div>
            </div>

            {/* Cloud Infrastructure AI */}
            <div className="bg-card border border-border/50 rounded-lg p-8 hover:shadow-lg transition-all duration-300 hover:border-primary/30">
              <div className="p-3 bg-blue-500/10 rounded-lg w-fit mb-6">
                <Cloud className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold mb-4">Cloud Infrastructure AI</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Intelligent cloud resource management, cost optimization, and auto-scaling across AWS, Azure, and GCP environments.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-blue-500/10 text-blue-500 text-xs rounded-full">Auto-Scaling</span>
                <span className="px-3 py-1 bg-blue-500/10 text-blue-500 text-xs rounded-full">Cost Optimization</span>
                <span className="px-3 py-1 bg-blue-500/10 text-blue-500 text-xs rounded-full">Multi-Cloud</span>
              </div>
            </div>

            {/* Network Operations AI */}
            <div className="bg-card border border-border/50 rounded-lg p-8 hover:shadow-lg transition-all duration-300 hover:border-primary/30">
              <div className="p-3 bg-purple-500/10 rounded-lg w-fit mb-6">
                <Network className="h-8 w-8 text-purple-500" />
              </div>
              <h3 className="text-xl font-bold mb-4">Network Operations AI</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Automated network monitoring, performance optimization, and predictive maintenance for enterprise network infrastructure.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-purple-500/10 text-purple-500 text-xs rounded-full">Traffic Analysis</span>
                <span className="px-3 py-1 bg-purple-500/10 text-purple-500 text-xs rounded-full">Predictive Maintenance</span>
                <span className="px-3 py-1 bg-purple-500/10 text-purple-500 text-xs rounded-full">Auto-Remediation</span>
              </div>
            </div>

            {/* Server Management AI */}
            <div className="bg-card border border-border/50 rounded-lg p-8 hover:shadow-lg transition-all duration-300 hover:border-primary/30">
              <div className="p-3 bg-orange-500/10 rounded-lg w-fit mb-6">
                <Server className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold mb-4">Server Management AI</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Intelligent server provisioning, health monitoring, and automated maintenance for physical and virtual server environments.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-orange-500/10 text-orange-500 text-xs rounded-full">Health Monitoring</span>
                <span className="px-3 py-1 bg-orange-500/10 text-orange-500 text-xs rounded-full">Auto Provisioning</span>
                <span className="px-3 py-1 bg-orange-500/10 text-orange-500 text-xs rounded-full">Load Balancing</span>
              </div>
            </div>

            {/* CRM Automation AI */}
            <div className="bg-card border border-border/50 rounded-lg p-8 hover:shadow-lg transition-all duration-300 hover:border-primary/30">
              <div className="p-3 bg-primary/10 rounded-lg w-fit mb-6">
                <Database className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-4">CRM Automation AI</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Salesforce integration with intelligent lead scoring, opportunity management, and automated customer engagement workflows.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full">Lead Scoring</span>
                <span className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full">Salesforce Integration</span>
                <span className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full">Auto Workflows</span>
              </div>
            </div>

            {/* Business Intelligence AI */}
            <div className="bg-card border border-border/50 rounded-lg p-8 hover:shadow-lg transition-all duration-300 hover:border-primary/30">
              <div className="p-3 bg-success/10 rounded-lg w-fit mb-6">
                <BarChart3 className="h-8 w-8 text-success" />
              </div>
              <h3 className="text-xl font-bold mb-4">Business Intelligence AI</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Advanced analytics, predictive insights, and automated reporting across all enterprise systems and data sources.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-success/10 text-success text-xs rounded-full">Predictive Analytics</span>
                <span className="px-3 py-1 bg-success/10 text-success text-xs rounded-full">Auto Reporting</span>
                <span className="px-3 py-1 bg-success/10 text-success text-xs rounded-full">Data Integration</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CRM Integration Section */}
      <section className="py-20 border-b border-border/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-6 py-3 mb-8 shadow-md">
              <Database className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary tracking-wide">CRM Integration</span>
            </div>
            <h2 className="text-4xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
              Salesforce Developer Integration
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Live demonstration of Salesforce Developer Sandbox integration with AI-powered 
              lead management and automated CRM operations.
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
                Enterprise IT AI Portfolio
              </span>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Comprehensive AI automation platform for enterprise IT operations. Powered by OpenAI and advanced 
              machine learning for cybersecurity, cloud management, infrastructure, and business intelligence.
            </p>
            <div className="mt-6 text-sm text-muted-foreground/70">
              © 2024 Enterprise IT AI Portfolio. Professional AI Solutions for Modern IT Operations.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
