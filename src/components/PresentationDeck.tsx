import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Play, Users, Shield, Zap, BarChart3, Globe, CheckCircle, ArrowRight, Target, TrendingUp, Lock, Cpu, Database, Cloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const PresentationDeck = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 'hero',
      title: 'Universal CRM AI Intelligence Platform',
      subtitle: 'Transforming Customer Relationships with Autonomous AI',
      content: (
        <div className="text-center space-y-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-primary opacity-20 blur-3xl rounded-full"></div>
            <div className="relative bg-gradient-to-br from-primary/10 to-accent/10 backdrop-blur-sm border border-white/10 rounded-3xl p-12">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">24</div>
                  <div className="text-sm text-muted-foreground mt-1">AI Agents</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">99.9%</div>
                  <div className="text-sm text-muted-foreground mt-1">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">70%</div>
                  <div className="text-sm text-muted-foreground mt-1">Time Saved</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">3</div>
                  <div className="text-sm text-muted-foreground mt-1">CRM Platforms</div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Badge variant="outline" className="bg-white/5 border-primary/30 text-primary">Production Ready</Badge>
            <Badge variant="outline" className="bg-white/5 border-green-500/30 text-green-400">Enterprise Security</Badge>
            <Badge variant="outline" className="bg-white/5 border-blue-500/30 text-blue-400">Universal CRM</Badge>
          </div>
        </div>
      )
    },
    {
      id: 'problem',
      title: 'The CRM Challenge',
      subtitle: 'Traditional systems hold back modern sales teams',
      content: (
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
              <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0"></div>
              <div>
                <h4 className="font-semibold text-red-400 mb-2">Manual Lead Qualification</h4>
                <p className="text-sm text-muted-foreground">Sales teams spend 60% of their time on manual data entry and lead qualification</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
              <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0"></div>
              <div>
                <h4 className="font-semibold text-red-400 mb-2">Inconsistent Forecasting</h4>
                <p className="text-sm text-muted-foreground">Pipeline accuracy averages only 47% across industries</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
              <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0"></div>
              <div>
                <h4 className="font-semibold text-red-400 mb-2">Siloed Data</h4>
                <p className="text-sm text-muted-foreground">Critical customer insights trapped across multiple disconnected systems</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full"></div>
              <div className="relative bg-gradient-to-br from-red-500/10 to-orange-500/10 backdrop-blur-sm border border-red-500/20 rounded-3xl p-8 text-center">
                <TrendingUp className="h-16 w-16 text-red-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-red-400 mb-2">47%</h3>
                <p className="text-muted-foreground">Average Pipeline Accuracy</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'solution',
      title: 'AI-First Intelligence Layer',
      subtitle: 'Autonomous agents that transform your CRM workflow',
      content: (
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 bg-gradient-to-br from-primary/10 to-blue-500/10 border-primary/20">
            <Cpu className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-3">Autonomous AI Agents</h3>
            <p className="text-muted-foreground mb-4">24 specialized agents handle routine tasks 24/7 with 95%+ accuracy</p>
            <Badge variant="outline" className="bg-primary/10 border-primary/30 text-primary">Always On</Badge>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
            <Globe className="h-12 w-12 text-green-400 mb-4" />
            <h3 className="text-xl font-semibold mb-3">Universal Compatibility</h3>
            <p className="text-muted-foreground mb-4">Seamlessly connects Salesforce, HubSpot, and native CRM systems</p>
            <Badge variant="outline" className="bg-green-500/10 border-green-500/30 text-green-400">Multi-Platform</Badge>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
            <BarChart3 className="h-12 w-12 text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold mb-3">Predictive Analytics</h3>
            <p className="text-muted-foreground mb-4">Real-time intelligence enables proactive decision-making</p>
            <Badge variant="outline" className="bg-purple-500/10 border-purple-500/30 text-purple-400">Real-Time</Badge>
          </Card>
        </div>
      )
    },
    {
      id: 'agents',
      title: '24 Specialized AI Agents',
      subtitle: 'Purpose-built intelligence for every CRM workflow',
      content: (
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <Card className="p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/20">
              <div className="flex items-center gap-3 mb-3">
                <Target className="h-6 w-6 text-blue-400" />
                <h4 className="font-semibold">Lead Intelligence</h4>
                <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">6 Agents</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Lead scoring • Qualification • Routing • Enrichment</p>
            </Card>
            <Card className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="h-6 w-6 text-green-400" />
                <h4 className="font-semibold">Pipeline Analysis</h4>
                <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">8 Agents</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Deal progression • Win/loss prediction • Forecasting</p>
            </Card>
          </div>
          <div className="space-y-4">
            <Card className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
              <div className="flex items-center gap-3 mb-3">
                <Users className="h-6 w-6 text-purple-400" />
                <h4 className="font-semibold">Communication AI</h4>
                <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30">5 Agents</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Personalized outreach • Engagement optimization</p>
            </Card>
            <Card className="p-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/20">
              <div className="flex items-center gap-3 mb-3">
                <BarChart3 className="h-6 w-6 text-orange-400" />
                <h4 className="font-semibold">Performance Analytics</h4>
                <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/30">5 Agents</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Sales coaching • Territory optimization • Quota management</p>
            </Card>
          </div>
        </div>
      )
    },
    {
      id: 'architecture',
      title: 'Enterprise Architecture',
      subtitle: 'Built for scale, security, and performance',
      content: (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <h4 className="font-semibold text-blue-400 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-400"></div>
              Frontend
            </h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div>React 18 + TypeScript</div>
              <div>Tailwind CSS Design System</div>
              <div>Vite Build Optimization</div>
              <div>Real-time UI Updates</div>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold text-green-400 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
              Backend
            </h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div>Supabase + PostgreSQL</div>
              <div>Edge Functions</div>
              <div>Row Level Security</div>
              <div>Real-time Subscriptions</div>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold text-purple-400 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-400"></div>
              AI Engine
            </h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div>OpenAI GPT-4 Integration</div>
              <div>Custom AI Agents</div>
              <div>Natural Language Processing</div>
              <div>Predictive Analytics</div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'security',
      title: 'Enterprise Security',
      subtitle: 'Zero-trust architecture with global compliance',
      content: (
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
              <div className="flex items-center gap-3 mb-3">
                <Shield className="h-6 w-6 text-green-400" />
                <h4 className="font-semibold">Data Protection</h4>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>• AES-256 encryption at rest</div>
                <div>• TLS 1.3 in transit</div>
                <div>• Zero-trust architecture</div>
              </div>
            </Card>
            <Card className="p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/20">
              <div className="flex items-center gap-3 mb-3">
                <Lock className="h-6 w-6 text-blue-400" />
                <h4 className="font-semibold">Access Controls</h4>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>• Multi-factor authentication</div>
                <div>• Role-based permissions</div>
                <div>• Session management</div>
              </div>
            </Card>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500/20 blur-2xl rounded-full"></div>
              <div className="relative bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-sm border border-green-500/20 rounded-3xl p-8 text-center">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">GDPR</Badge>
                  <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">SOX</Badge>
                  <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">ISO 27001</Badge>
                  <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">SOC 2</Badge>
                </div>
                <h3 className="text-lg font-semibold text-green-400">Compliance Ready</h3>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'performance',
      title: 'Performance Metrics',
      subtitle: 'Proven results across enterprise deployments',
      content: (
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 text-center bg-gradient-to-br from-primary/10 to-blue-500/10 border-primary/20">
            <div className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">95%+</div>
            <div className="text-lg font-semibold mb-2">AI Confidence</div>
            <div className="text-sm text-muted-foreground">Agent analysis accuracy</div>
          </Card>
          <Card className="p-6 text-center bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
            <div className="text-4xl font-bold text-green-400 mb-2">&lt;2s</div>
            <div className="text-lg font-semibold mb-2">Execution Time</div>
            <div className="text-sm text-muted-foreground">Average agent response</div>
          </Card>
          <Card className="p-6 text-center bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
            <div className="text-4xl font-bold text-purple-400 mb-2">99.9%</div>
            <div className="text-lg font-semibold mb-2">Uptime SLA</div>
            <div className="text-sm text-muted-foreground">Platform availability</div>
          </Card>
        </div>
      )
    },
    {
      id: 'roi',
      title: 'Business Impact & ROI',
      subtitle: 'Measurable value from day one',
      content: (
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-green-400 mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Immediate Returns (0-3 months)
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                  <span className="text-sm">Lead qualification time</span>
                  <span className="font-semibold text-green-400">-70%</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                  <span className="text-sm">Conversion rates</span>
                  <span className="font-semibold text-green-400">+25%</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                  <span className="text-sm">Forecast accuracy</span>
                  <span className="font-semibold text-green-400">+40%</span>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-blue-400 mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Long-term Value (6+ months)
              </h4>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <div className="font-medium text-blue-400 mb-1">Predictive Intelligence</div>
                  <div>Strategic insights drive proactive decisions</div>
                </div>
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <div className="font-medium text-blue-400 mb-1">Workflow Automation</div>
                  <div>Eliminate repetitive tasks entirely</div>
                </div>
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <div className="font-medium text-blue-400 mb-1">Scalable Growth</div>
                  <div>Expand without proportional cost increases</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'integration',
      title: 'Universal CRM Ecosystem',
      subtitle: 'Seamless integration with your existing tools',
      content: (
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 bg-gradient-to-br from-blue-600/10 to-blue-400/10 border-blue-500/20">
            <div className="flex items-center gap-3 mb-4">
              <Database className="h-8 w-8 text-blue-400" />
              <h3 className="text-xl font-semibold">Salesforce</h3>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground mb-4">
              <div>• Bi-directional sync</div>
              <div>• Custom object support</div>
              <div>• Workflow automation</div>
              <div>• Real-time updates</div>
            </div>
            <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">Enterprise Ready</Badge>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-orange-600/10 to-orange-400/10 border-orange-500/20">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="h-8 w-8 text-orange-400" />
              <h3 className="text-xl font-semibold">HubSpot</h3>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground mb-4">
              <div>• Marketing automation</div>
              <div>• Lead lifecycle management</div>
              <div>• Contact enrichment</div>
              <div>• Pipeline synchronization</div>
            </div>
            <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/30">Fully Integrated</Badge>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-purple-600/10 to-purple-400/10 border-purple-500/20">
            <div className="flex items-center gap-3 mb-4">
              <Cloud className="h-8 w-8 text-purple-400" />
              <h3 className="text-xl font-semibold">Native CRM</h3>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground mb-4">
              <div>• Modern interface</div>
              <div>• Built-in AI capabilities</div>
              <div>• Custom workflows</div>
              <div>• Advanced analytics</div>
            </div>
            <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30">AI-Native</Badge>
          </Card>
        </div>
      )
    },
    {
      id: 'deployment',
      title: 'Ready for Enterprise',
      subtitle: 'Production-tested and deployment-ready',
      content: (
        <div className="text-center space-y-8">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
              <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Production Status</h3>
              <p className="text-sm text-muted-foreground">24 AI agents tested and operational</p>
            </Card>
            <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
              <Shield className="h-12 w-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Security Verified</h3>
              <p className="text-sm text-muted-foreground">Enterprise frameworks implemented</p>
            </Card>
            <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
              <Zap className="h-12 w-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Monitoring Active</h3>
              <p className="text-sm text-muted-foreground">Real-time performance tracking</p>
            </Card>
          </div>
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
            <h3 className="text-2xl font-bold mb-4">Experience the Future of CRM Intelligence</h3>
            <p className="text-muted-foreground mb-6">Ready for pilot deployment or full enterprise rollout</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button className="bg-gradient-primary hover:scale-105 transition-transform">
                <Play className="h-4 w-4 mr-2" />
                Live Demo
              </Button>
              <Button variant="outline" className="hover:scale-105 transition-transform">
                Enterprise Consultation
              </Button>
            </div>
          </div>
        </div>
      )
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const currentSlideData = slides[currentSlide];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/80 to-background/60 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              {currentSlide + 1} / {slides.length}
            </div>
            <div className="flex gap-1">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentSlide 
                      ? 'bg-primary w-8' 
                      : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className="hover:scale-105 transition-transform"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={nextSlide}
              disabled={currentSlide === slides.length - 1}
              className="hover:scale-105 transition-transform"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Slide Content */}
        <div className="animate-fade-in">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
              {currentSlideData.title}
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {currentSlideData.subtitle}
            </p>
          </div>

          <div className="animate-scale-in">
            {currentSlideData.content}
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="flex items-center justify-between mt-12 pt-8 border-t border-white/10">
          <div className="text-sm text-muted-foreground">
            Universal CRM AI Intelligence Platform
          </div>
          <div className="flex items-center gap-4">
            {currentSlide < slides.length - 1 && (
              <Button 
                onClick={nextSlide}
                className="bg-gradient-primary hover:scale-105 transition-transform group"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PresentationDeck;