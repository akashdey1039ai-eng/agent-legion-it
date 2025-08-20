import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, Shield, Zap, Target, Users, TrendingUp, 
  CheckCircle, Activity, BarChart3, Lock, Globe, Presentation, Play, Layers
} from 'lucide-react';
import PresentationDeck from './PresentationDeck';
import { EnterpriseArchitectureDashboard } from './EnterpriseArchitectureDashboard';

export const EnterpriseWelcomeDashboard = () => {
  const [showPresentation, setShowPresentation] = useState(false);
  const [showArchitecture, setShowArchitecture] = useState(false);

  if (showPresentation) {
    return <PresentationDeck />;
  }

  if (showArchitecture) {
    return <EnterpriseArchitectureDashboard />;
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-8 px-4 bg-gradient-surface rounded-lg border">
        <div className="flex justify-center">
          <div className="p-4 bg-primary/10 rounded-full">
            <Brain className="h-12 w-12 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          24 AI Agents Ready for Production
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Your autonomous AI workforce is deployed and ready to transform your CRM operations across all platforms
        </p>
        <div className="flex justify-center gap-2 mb-6">
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Production Ready
          </Badge>
          <Badge className="bg-blue-100 text-blue-800">
            <Shield className="h-3 w-3 mr-1" />
            Enterprise Security
          </Badge>
          <Badge className="bg-purple-100 text-purple-800">
            <Globe className="h-3 w-3 mr-1" />
            Universal CRM Support
          </Badge>
        </div>
        <div className="flex justify-center gap-4">
          <Button 
            onClick={() => setShowPresentation(true)}
            className="bg-gradient-primary hover:scale-105 transition-all duration-300 shadow-glow"
            size="lg"
          >
            <Presentation className="h-5 w-5 mr-2" />
            View Executive Presentation
          </Button>
          <Button 
            onClick={() => setShowArchitecture(true)}
            variant="outline" 
            className="hover:scale-105 transition-all duration-300"
            size="lg"
          >
            <Layers className="h-5 w-5 mr-2" />
            Technical Architecture
          </Button>
          <Button 
            variant="outline" 
            className="hover:scale-105 transition-all duration-300"
            size="lg"
          >
            <Play className="h-5 w-5 mr-2" />
            Live Demo
          </Button>
        </div>
      </div>

      {/* Key Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-primary/20 bg-gradient-to-br from-card to-card/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Revenue Impact</CardTitle>
                <CardDescription>Measurable business outcomes</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm">Lead Conversion Rate</span>
              <span className="font-semibold text-green-600">+35%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Sales Cycle Reduction</span>
              <span className="font-semibold text-blue-600">-28%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Pipeline Accuracy</span>
              <span className="font-semibold text-purple-600">+42%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-accent/20 bg-gradient-to-br from-card to-card/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Zap className="h-6 w-6 text-accent" />
              </div>
              <div>
                <CardTitle className="text-lg">Operational Efficiency</CardTitle>
                <CardDescription>Automated workflows</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm">Manual Tasks Eliminated</span>
              <span className="font-semibold text-green-600">80%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Response Time</span>
              <span className="font-semibold text-blue-600">5 minutes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">24/7 Operations</span>
              <span className="font-semibold text-purple-600">100%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-success/20 bg-gradient-to-br from-card to-card/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <Shield className="h-6 w-6 text-success" />
              </div>
              <div>
                <CardTitle className="text-lg">Enterprise Security</CardTitle>
                <CardDescription>Bank-grade protection</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm">Data Encryption</span>
              <span className="font-semibold text-green-600">AES-256</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Compliance</span>
              <span className="font-semibold text-blue-600">SOC 2, GDPR</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Audit Trail</span>
              <span className="font-semibold text-purple-600">Complete</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agent Categories */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center">AI Agent Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="text-center">
            <CardHeader className="pb-3">
              <div className="mx-auto p-3 bg-blue-100 rounded-full w-fit">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Lead Intelligence</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                6 specialized agents for lead scoring, qualification, and prioritization
              </p>
              <div className="space-y-1 text-xs">
                <div>• Lead Intelligence AI</div>
                <div>• Customer Sentiment AI</div>
                <div>• Churn Prediction AI</div>
                <div>• Customer Segmentation AI</div>
                <div>• Lead Scoring AI</div>
                <div>• Contact Intelligence AI</div>
              </div>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader className="pb-3">
              <div className="mx-auto p-3 bg-green-100 rounded-full w-fit">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-lg">Pipeline Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                6 agents for forecasting, opportunity scoring, and deal analysis
              </p>
              <div className="space-y-1 text-xs">
                <div>• Pipeline Analysis AI</div>
                <div>• Opportunity Scoring AI</div>
                <div>• Deal Intelligence AI</div>
                <div>• Revenue Forecasting AI</div>
                <div>• Risk Assessment AI</div>
                <div>• Win/Loss Analysis AI</div>
              </div>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader className="pb-3">
              <div className="mx-auto p-3 bg-purple-100 rounded-full w-fit">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle className="text-lg">Communication</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                6 agents for automated outreach and engagement optimization
              </p>
              <div className="space-y-1 text-xs">
                <div>• Communication AI</div>
                <div>• Email Intelligence AI</div>
                <div>• Meeting Scheduler AI</div>
                <div>• Follow-up Automation AI</div>
                <div>• Content Generation AI</div>
                <div>• Engagement Optimizer AI</div>
              </div>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader className="pb-3">
              <div className="mx-auto p-3 bg-orange-100 rounded-full w-fit">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle className="text-lg">Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                6 agents for coaching, analytics, and performance optimization
              </p>
              <div className="space-y-1 text-xs">
                <div>• Sales Coaching AI</div>
                <div>• Performance Analytics AI</div>
                <div>• Territory Management AI</div>
                <div>• Competitive Intelligence AI</div>
                <div>• Market Analysis AI</div>
                <div>• Quota Tracking AI</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Platform Support */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Universal CRM Platform Support
          </CardTitle>
          <CardDescription>
            All 24 agents work seamlessly across every major CRM platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-blue-600 rounded-lg mx-auto flex items-center justify-center text-white font-bold">
                SF
              </div>
              <h3 className="font-semibold">Salesforce</h3>
              <p className="text-sm text-muted-foreground">
                Full integration with Sales Cloud, Service Cloud, and Marketing Cloud
              </p>
              <Badge className="bg-green-100 text-green-800">24/24 Agents</Badge>
            </div>
            
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-orange-500 rounded-lg mx-auto flex items-center justify-center text-white font-bold">
                HS
              </div>
              <h3 className="font-semibold">HubSpot</h3>
              <p className="text-sm text-muted-foreground">
                Complete integration with CRM, Marketing, and Service Hubs
              </p>
              <Badge className="bg-green-100 text-green-800">24/24 Agents</Badge>
            </div>
            
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-gradient-primary rounded-lg mx-auto flex items-center justify-center">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold">Native CRM</h3>
              <p className="text-sm text-muted-foreground">
                AI-first platform designed for maximum agent performance
              </p>
              <Badge className="bg-blue-100 text-blue-800">Optimized</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Features */}
      <Card className="border-warning/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Enterprise Security & Compliance
          </CardTitle>
          <CardDescription>
            Bank-grade security measures protecting your data and operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold">Data Protection</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• AES-256 encryption at rest and in transit</li>
                <li>• Zero-trust security architecture</li>
                <li>• Regular security audits and penetration testing</li>
                <li>• GDPR, CCPA, and SOC 2 Type II compliance</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold">Access Controls</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Role-based access control (RBAC)</li>
                <li>• Multi-factor authentication (MFA)</li>
                <li>• Complete audit trails and logging</li>
                <li>• Real-time security monitoring</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};