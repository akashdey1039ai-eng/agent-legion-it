import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Database, Shield, Zap, Smartphone, Monitor } from "lucide-react";
import { Link } from "react-router-dom";
import { SandboxConnector } from "@/components/SandboxConnector";
import heroImage from "@/assets/hero-command.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 mobile-safe-area">
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
          <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            AI CRM Intelligence Platform
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Deploy intelligent automation on top of your existing CRM. Advanced AI agents that learn, adapt, and optimize your sales pipeline.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-base lg:text-lg px-6 lg:px-8 py-4 lg:py-6 w-full sm:w-auto">
              <Link to="/crm">Launch CRM Platform</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-base lg:text-lg px-6 lg:px-8 py-4 lg:py-6 w-full sm:w-auto">
              <Link to="/ai-agents">Explore AI Agents</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24 px-4 mobile-safe-area">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">Enterprise-Grade Intelligence</h2>
            <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">
              Transform your CRM into an intelligent command center with AI-powered insights and automation.
            </p>
          </div>
          
          <div className="grid mobile-grid gap-6 lg:gap-8">
            <Card className="bg-gradient-to-br from-card to-card/50 border-primary/20">
              <CardHeader>
                <Brain className="h-10 lg:h-12 w-10 lg:w-12 text-primary mb-4" />
                <CardTitle className="text-lg lg:text-xl">AI-Powered Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm lg:text-base">
                  Advanced machine learning algorithms analyze your data to provide actionable insights and predictions.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-card to-card/50 border-accent/20">
              <CardHeader>
                <Database className="h-10 lg:h-12 w-10 lg:w-12 text-accent mb-4" />
                <CardTitle className="text-lg lg:text-xl">Universal Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm lg:text-base">
                  Seamlessly connect with Salesforce, HubSpot, Pipedrive, and 100+ other CRM platforms.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-card to-card/50 border-success/20">
              <CardHeader>
                <Shield className="h-10 lg:h-12 w-10 lg:w-12 text-success mb-4" />
                <CardTitle className="text-lg lg:text-xl">Enterprise Security</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm lg:text-base">
                  Bank-grade encryption, audit trails, and compliance with SOC 2, GDPR, and industry standards.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-card to-card/50 border-warning/20">
              <CardHeader>
                <Zap className="h-10 lg:h-12 w-10 lg:w-12 text-warning mb-4" />
                <CardTitle className="text-lg lg:text-xl">Real-time Intelligence</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm lg:text-base">
                  Live data processing, instant notifications, and automated actions based on customer behavior.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Mobile Responsiveness Section */}
      <section className="py-16 lg:py-24 px-4 bg-muted/30 mobile-safe-area">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6">Mobile-First Design</h2>
          <p className="text-lg lg:text-xl text-muted-foreground mb-8">
            Optimized for all devices - Windows, macOS, Android, and iOS.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="flex items-center justify-center p-8 bg-card rounded-lg border">
              <div className="text-center">
                <Smartphone className="h-16 w-16 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Mobile Optimized</h3>
                <p className="text-sm text-muted-foreground">
                  Native mobile experience on iOS and Android
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-center p-8 bg-card rounded-lg border">
              <div className="text-center">
                <Monitor className="h-16 w-16 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Desktop Ready</h3>
                <p className="text-sm text-muted-foreground">
                  Full-featured desktop application for Windows and macOS
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sandbox Connector Section */}
      <section className="py-16 lg:py-24 px-4 mobile-safe-area">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">Connect Your Sandbox</h2>
            <p className="text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto">
              Test our platform with your existing CRM sandbox before deploying to production. 
              Ensure seamless integration and validate all features in your environment.
            </p>
          </div>
          
          <SandboxConnector />
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 lg:py-24 px-4 bg-primary/5 mobile-safe-area">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6">Ready to Transform Your CRM?</h2>
          <p className="text-lg lg:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start with our sandbox environment, test your integrations, and deploy an intelligent layer 
            on top of your existing CRM infrastructure.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-base lg:text-lg px-6 lg:px-8 py-4 lg:py-6 w-full sm:w-auto">
              <Link to="/crm">Start Free Trial</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-base lg:text-lg px-6 lg:px-8 py-4 lg:py-6 w-full sm:w-auto">
              <Link to="/ai-agents">View Documentation</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;