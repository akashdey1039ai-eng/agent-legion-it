import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Code2, Server, Cloud, Database, Shield, Zap, Brain, 
  Network, Lock, Globe, Activity, CheckCircle, ArrowRight,
  Layers, Cpu, HardDrive, Monitor, Settings
} from 'lucide-react';

export const StunningSoftwareArchitecture = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const ArchitectureNode = ({ 
    icon: Icon, 
    title, 
    subtitle, 
    metrics, 
    delay = 0,
    glowColor = "primary",
    children 
  }: {
    icon: any;
    title: string;
    subtitle: string;
    metrics?: string;
    delay?: number;
    glowColor?: string;
    children?: React.ReactNode;
  }) => (
    <div 
      className={`glass-card p-6 text-center transform transition-all duration-1000 hover:scale-105 hover:shadow-2xl ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className={`mx-auto mb-4 p-4 rounded-full bg-gradient-to-r from-${glowColor} to-accent glow-${glowColor} animate-pulse-soft`}>
        <Icon className="h-8 w-8 text-white" />
      </div>
      <h3 className="font-bold text-lg mb-2 text-gradient-primary">{title}</h3>
      <p className="text-sm text-muted-foreground mb-3">{subtitle}</p>
      {metrics && <Badge className="mb-4 bg-primary/10 text-primary">{metrics}</Badge>}
      {children}
    </div>
  );

  const ConnectionLine = ({ direction = "horizontal", animated = false }: { direction?: "horizontal" | "vertical"; animated?: boolean }) => (
    <div className={`flex items-center justify-center ${direction === 'vertical' ? 'flex-col' : ''}`}>
      <div className={`bg-gradient-primary ${direction === 'vertical' ? 'w-0.5 h-16' : 'h-0.5 w-16'} ${animated ? 'animate-pulse' : ''} rounded-full`} />
      <ArrowRight className={`h-4 w-4 text-primary mx-2 ${direction === 'vertical' ? 'rotate-90' : ''} ${animated ? 'animate-bounce' : ''}`} />
      <div className={`bg-gradient-primary ${direction === 'vertical' ? 'w-0.5 h-16' : 'h-0.5 w-16'} ${animated ? 'animate-pulse' : ''} rounded-full`} />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-hero p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <div className="inline-flex p-4 bg-primary/10 rounded-full animate-float">
            <Layers className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-6xl font-bold text-gradient-primary animate-fade-in">
            Software Architecture
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '200ms' }}>
            A visually stunning overview of our enterprise-grade technology stack
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Badge className="bg-success/10 text-success px-4 py-2 text-base animate-scale-in" style={{ animationDelay: '400ms' }}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Production Ready
            </Badge>
            <Badge className="bg-primary/10 text-primary px-4 py-2 text-base animate-scale-in" style={{ animationDelay: '500ms' }}>
              <Shield className="h-4 w-4 mr-2" />
              Enterprise Security
            </Badge>
            <Badge className="bg-accent/10 text-accent px-4 py-2 text-base animate-scale-in" style={{ animationDelay: '600ms' }}>
              <Zap className="h-4 w-4 mr-2" />
              Real-time Processing
            </Badge>
          </div>
        </div>

        {/* Main Architecture Flow */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          {/* Frontend Layer */}
          <ArchitectureNode
            icon={Monitor}
            title="Frontend Layer"
            subtitle="React + TypeScript + Vite"
            metrics="77+ Components"
            delay={800}
            glowColor="blue-500"
          >
            <div className="space-y-3 text-left">
              <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                <span className="text-xs">CRM Components</span>
                <Badge variant="outline" className="text-xs">15</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                <span className="text-xs">AI Components</span>
                <Badge variant="outline" className="text-xs">24</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                <span className="text-xs">UI Components</span>
                <Badge variant="outline" className="text-xs">30</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                <span className="text-xs">Integration</span>
                <Badge variant="outline" className="text-xs">8</Badge>
              </div>
            </div>
          </ArchitectureNode>

          {/* Connection to Backend */}
          <div className="hidden lg:block">
            <ConnectionLine animated />
          </div>

          {/* Backend Layer */}
          <ArchitectureNode
            icon={Server}
            title="Backend Layer"
            subtitle="Supabase + PostgreSQL + Deno"
            metrics="20 Edge Functions"
            delay={1000}
            glowColor="green-500"
          >
            <div className="space-y-3 text-left">
              <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                <span className="text-xs">Authentication</span>
                <Badge variant="outline" className="text-xs">OAuth 2.0</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                <span className="text-xs">Database</span>
                <Badge variant="outline" className="text-xs">PostgreSQL</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                <span className="text-xs">Runtime</span>
                <Badge variant="outline" className="text-xs">Deno Edge</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                <span className="text-xs">Real-time</span>
                <Badge variant="outline" className="text-xs">WebSockets</Badge>
              </div>
            </div>
          </ArchitectureNode>
        </div>

        {/* Vertical Connection */}
        <div className="flex justify-center">
          <ConnectionLine direction="vertical" animated />
        </div>

        {/* External Services Layer */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ArchitectureNode
            icon={Cloud}
            title="Salesforce API"
            subtitle="CRM Integration"
            metrics="REST API"
            delay={1200}
            glowColor="orange-500"
          >
            <div className="text-left space-y-2">
              <div className="text-xs p-2 bg-muted/30 rounded">7 Functions</div>
              <div className="text-xs p-2 bg-muted/30 rounded">OAuth Token Active</div>
            </div>
          </ArchitectureNode>

          <ArchitectureNode
            icon={Database}
            title="HubSpot API"
            subtitle="Marketing Automation"
            metrics="CRM API v3"
            delay={1300}
            glowColor="purple-500"
          >
            <div className="text-left space-y-2">
              <div className="text-xs p-2 bg-muted/30 rounded">6 Functions</div>
              <div className="text-xs p-2 bg-muted/30 rounded">83 Sync Operations</div>
            </div>
          </ArchitectureNode>

          <ArchitectureNode
            icon={Brain}
            title="OpenAI API"
            subtitle="AI Intelligence"
            metrics="GPT-4 Turbo"
            delay={1400}
            glowColor="red-500"
          >
            <div className="text-left space-y-2">
              <div className="text-xs p-2 bg-muted/30 rounded">AI Agents</div>
              <div className="text-xs p-2 bg-muted/30 rounded">Smart Processing</div>
            </div>
          </ArchitectureNode>

          <ArchitectureNode
            icon={Globe}
            title="Google Cloud"
            subtitle="Voice & Analytics"
            metrics="TTS API"
            delay={1500}
            glowColor="cyan-500"
          >
            <div className="text-left space-y-2">
              <div className="text-xs p-2 bg-muted/30 rounded">Text-to-Speech</div>
              <div className="text-xs p-2 bg-muted/30 rounded">Voice Synthesis</div>
            </div>
          </ArchitectureNode>
        </div>

        {/* Security & Performance Layer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="glass-card p-6 text-center animate-fade-in" style={{ animationDelay: '1600ms' }}>
            <div className="p-4 bg-gradient-to-r from-red-500 to-orange-500 rounded-full mx-auto mb-4 w-fit glow-accent">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h3 className="font-bold text-lg mb-4 text-gradient-primary">Security Layer</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <Lock className="h-4 w-4 text-green-500" />
                <span className="text-sm">Row Level Security</span>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <Lock className="h-4 w-4 text-green-500" />
                <span className="text-sm">AES-256 Encryption</span>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <Lock className="h-4 w-4 text-green-500" />
                <span className="text-sm">TLS 1.3 Transport</span>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
            </div>
          </Card>

          <Card className="glass-card p-6 text-center animate-fade-in" style={{ animationDelay: '1700ms' }}>
            <div className="p-4 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mx-auto mb-4 w-fit glow-primary">
              <Activity className="h-8 w-8 text-white" />
            </div>
            <h3 className="font-bold text-lg mb-4 text-gradient-primary">Performance</h3>
            <div className="space-y-3">
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-primary">447ms</div>
                <div className="text-xs text-muted-foreground">Avg Response Time</div>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-success">6.3M+</div>
                <div className="text-xs text-muted-foreground">Records Processed</div>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-accent">99.9%</div>
                <div className="text-xs text-muted-foreground">Uptime</div>
              </div>
            </div>
          </Card>

          <Card className="glass-card p-6 text-center animate-fade-in" style={{ animationDelay: '1800ms' }}>
            <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-4 w-fit glow-accent">
              <Network className="h-8 w-8 text-white" />
            </div>
            <h3 className="font-bold text-lg mb-4 text-gradient-primary">Real-time Data</h3>
            <div className="space-y-3">
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-primary">30</div>
                <div className="text-xs text-muted-foreground">Active Contacts</div>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-success">21</div>
                <div className="text-xs text-muted-foreground">Company Records</div>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-accent">11</div>
                <div className="text-xs text-muted-foreground">AI Test Runs</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Data Flow Visualization */}
        <Card className="glass-card p-8 animate-fade-in" style={{ animationDelay: '2000ms' }}>
          <h2 className="text-3xl font-bold text-center mb-8 text-gradient-primary">Data Flow Architecture</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
            <div className="text-center">
              <div className="p-3 bg-blue-100 rounded-full mx-auto mb-2 w-fit">
                <Monitor className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-sm font-semibold">User Interface</div>
              <div className="text-xs text-muted-foreground">React Components</div>
            </div>
            
            <ArrowRight className="h-6 w-6 text-primary mx-auto animate-pulse" />
            
            <div className="text-center">
              <div className="p-3 bg-green-100 rounded-full mx-auto mb-2 w-fit">
                <Server className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-sm font-semibold">Edge Functions</div>
              <div className="text-xs text-muted-foreground">Business Logic</div>
            </div>
            
            <ArrowRight className="h-6 w-6 text-primary mx-auto animate-pulse" />
            
            <div className="text-center">
              <div className="p-3 bg-purple-100 rounded-full mx-auto mb-2 w-fit">
                <Cloud className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-sm font-semibold">External APIs</div>
              <div className="text-xs text-muted-foreground">CRM & AI Services</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};