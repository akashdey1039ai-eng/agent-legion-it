import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from "@/components/ui/button";
import { AgentCard } from "@/components/AgentCard";
import { CommandCenter } from "@/components/CommandCenter";
import { CrmDashboard } from "@/components/CrmDashboard";
import { SalesforceIntegration } from "@/components/SalesforceIntegration";
import { AIAgentTester } from "@/components/AIAgentTester";
import { AIAgentDashboard } from "@/components/AIAgentDashboard";
import { EnhancedAIAgentTester } from "@/components/EnhancedAIAgentTester";
import { Header } from "@/components/Header";
import heroCommand from "@/assets/hero-command.jpg";
import { Terminal, Code, Database, Shield, Bot, Zap, Target, Brain } from "lucide-react";

const aiAgents = [
  {
    id: "crm-001",
    name: "CRM Intelligence Layer",
    description: "Enterprise-ready AI layer that optimizes Salesforce operations, reduces license costs by 60-70%, and adds intelligent automation for lead scoring, case management, and process optimization.",
    capabilities: ["License Optimization", "Intelligent Lead Scoring", "Automated Case Routing", "Process Intelligence", "Cost Reduction Analytics", "Salesforce Enhancement", "Workflow Automation", "Predictive Insights", "Integration Management"],
    status: "active" as const,
    specialization: "CRM Development Team",
    icon: "bot" as const,
    team: "CRM Development",
    priority: "critical" as const
  },
  {
    id: "automation-002",
    name: "Integration Master",
    description: "Handles all automation and integrations across Boomi, AWS Glue, and UiPath platforms for seamless data flow and process automation.",
    capabilities: ["Boomi Integration", "AWS Glue ETL", "UiPath RPA", "Data Pipeline Management", "Process Automation"],
    status: "active" as const,
    specialization: "Automation & Integrations Team",
    icon: "zap" as const,
    team: "Automation & Integrations",
    priority: "high" as const
  },
  {
    id: "sales-003",
    name: "Sales Operations AI",
    description: "Optimizes SDR and BDR operations with intelligent lead scoring, outreach automation, and performance analytics.",
    capabilities: ["Lead Scoring", "Outreach Automation", "Performance Analytics", "Territory Management", "Sales Coaching"],
    status: "deployed" as const,
    specialization: "Sales Operations Team",
    icon: "target" as const,
    team: "Sales Operations",
    priority: "high" as const
  },
  {
    id: "infra-004",
    name: "Infrastructure Guardian",
    description: "Monitors and maintains IT infrastructure, provides automated support, and ensures system reliability and security.",
    capabilities: ["System Monitoring", "Automated Support", "Security Management", "Performance Optimization", "Incident Response"],
    status: "active" as const,
    specialization: "IT Infrastructure & Support Team",
    icon: "shield" as const,
    team: "IT Infrastructure & Support",
    priority: "critical" as const
  },
  {
    id: "workday-005",
    name: "Workday Support Specialist",
    description: "Manages Workday business applications with automated user support, system optimization, and HR process enhancement.",
    capabilities: ["User Support Automation", "System Configuration", "HR Process Optimization", "Data Analytics", "Compliance Monitoring"],
    status: "active" as const,
    specialization: "Business Applications Team",
    icon: "bot" as const,
    team: "Business Applications",
    priority: "medium" as const
  },
  {
    id: "netsuite-006",
    name: "NetSuite Finance AI",
    description: "Handles NetSuite IT finance operations with automated reporting, financial data analysis, and system optimization.",
    capabilities: ["Financial Reporting", "Data Analysis", "System Optimization", "Compliance Tracking", "Process Automation"],
    status: "active" as const,
    specialization: "IT Finance Team",
    icon: "bot" as const,
    team: "IT Finance",
    priority: "high" as const
  },
  {
    id: "product-007",
    name: "Product Strategy AI",
    description: "Supports product management with market analysis, feature prioritization, roadmap planning, and stakeholder communication.",
    capabilities: ["Market Analysis", "Feature Prioritization", "Roadmap Planning", "Stakeholder Management", "Competitive Intelligence"],
    status: "standby" as const,
    specialization: "Product Management Team",
    icon: "target" as const,
    team: "Product Management",
    priority: "medium" as const
  }
];

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
              Deploy Your Army of
              <br />
              <span className="text-foreground">AI Agents</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Welcome to the command center where intelligent agents work tirelessly to optimize, secure, and enhance your IT infrastructure.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="command" size="lg" className="min-w-48">
                <Bot className="h-5 w-5" />
                Deploy All Agents
              </Button>
              <Button variant="neural" size="lg" className="min-w-48">
                <Code className="h-5 w-5" />
                View Operations
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Command Center Stats */}
      <section className="py-16 border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Command Center Status</h2>
            <p className="text-muted-foreground">Real-time monitoring of AI agent operations</p>
          </div>
          <CommandCenter />
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
            <h2 className="text-3xl font-bold mb-4">Connect Your Salesforce</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Sync and manage your Salesforce data directly from your AI command center.
            </p>
          </div>
          <SalesforceIntegration />
        </div>
      </section>

      {/* CRM Intelligence Dashboard */}
      <section className="py-16 border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6">
              <Brain className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">CRM Intelligence Layer</span>
            </div>
            <h2 className="text-3xl font-bold mb-4">Customer Relationship Intelligence</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              AI-powered insights and analytics for your sales pipeline, customer relationships, and revenue optimization.
            </p>
          </div>
          <CrmDashboard />
        </div>
      </section>

      {/* AI Agent Dashboard */}
      <section className="py-16 border-b border-border/50">
        <div className="container mx-auto px-4">
          <AIAgentDashboard />
        </div>
      </section>

      {/* Enhanced AI Agent Testing Suite */}
      <section className="py-16 border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Enhanced Agentic AI</span>
            </div>
            <h2 className="text-3xl font-bold mb-4">Autonomous AI Agent Testing</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Test OpenAI-powered agents that can analyze AND take autonomous actions in your Salesforce.
            </p>
          </div>
          <EnhancedAIAgentTester />
        </div>
      </section>

      {/* Standard AI Agent Testing Suite */}
      <section className="py-16 border-b border-border/50">
        <div className="container mx-auto px-4">
          <AIAgentTester />
        </div>
      </section>

      {/* AI Agents Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Active AI Agents</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Each agent is specialized for specific tasks and operates autonomously to maintain optimal system performance.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {aiAgents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            AI Army Command Center - Powered by Advanced Intelligence Systems
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
