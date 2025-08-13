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
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroCommand})` }}
        >
          <div className="absolute inset-0 bg-background/80" />
        </div>
        
        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6">
              <Terminal className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI Command Center</span>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 bg-gradient-command bg-clip-text text-transparent">
              Autonomous AI Agents
              <br />
              <span className="text-foreground">for Salesforce</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Connect your Salesforce Developer Sandbox and watch AI agents autonomously manage leads, opportunities, and tasks.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="command" size="lg" className="min-w-48">
                <Bot className="h-5 w-5" />
                Test AI Agents
              </Button>
              <Button variant="neural" size="lg" className="min-w-48">
                <Database className="h-5 w-5" />
                Connect Salesforce
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Salesforce Integration Section */}
      <section className="py-16 border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6">
              <Database className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Salesforce Integration</span>
            </div>
            <h2 className="text-3xl font-bold mb-4">Connect Your Salesforce Developer Sandbox</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Enable fully autonomous AI agents by connecting your Salesforce Developer Sandbox.
            </p>
          </div>
          <SalesforceIntegration />
        </div>
      </section>

      {/* Enhanced AI Agent Testing Suite */}
      <section className="py-16 border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Autonomous AI Testing</span>
            </div>
            <h2 className="text-3xl font-bold mb-4">AI Agent Testing Suite</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Test OpenAI-powered agents that can analyze AND take autonomous actions in your Salesforce Developer Sandbox.
            </p>
          </div>
          <EnhancedAIAgentTester />
        </div>
      </section>

      {/* CRM Intelligence Dashboard */}
      <section className="py-16 border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6">
              <Brain className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">CRM Intelligence</span>
            </div>
            <h2 className="text-3xl font-bold mb-4">Customer Relationship Data</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Real-time insights from your synchronized Salesforce data.
            </p>
          </div>
          <CrmDashboard />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            Autonomous AI Agents for Salesforce - Powered by OpenAI and Advanced Intelligence
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
