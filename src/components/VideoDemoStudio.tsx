import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Video, Camera, Mic, Share2, Download, Play, Settings,
  Sparkles, Monitor, BarChart3, Users, Target, Shield,
  Globe, CheckCircle, Clock, Zap
} from 'lucide-react';
import { VideoRecorder } from './VideoRecorder';
import { GlobalAIAgentRunner } from './GlobalAIAgentRunner';
import { EnterpriseWelcomeDashboard } from './EnterpriseWelcomeDashboard';
import { EnterpriseSafetyDashboard } from './EnterpriseSafetyDashboard';
import { UserPlaybook } from './UserPlaybook';

export const VideoDemoStudio = () => {
  const [currentDemoView, setCurrentDemoView] = useState<string>('overview');
  const [isRecordingMode, setIsRecordingMode] = useState(false);
  const [generatedVideos, setGeneratedVideos] = useState<Blob[]>([]);

  const demoViews = [
    {
      id: 'overview',
      title: 'Enterprise Overview',
      icon: Sparkles,
      component: EnterpriseWelcomeDashboard,
      description: 'Showcase 24 AI agents and enterprise features',
      duration: '2-3 min',
      script: [
        'Welcome to our Universal AI CRM Platform',
        'Show 24 agents across 4 categories',
        'Highlight universal platform support',
        'Present ROI metrics and business impact'
      ]
    },
    {
      id: 'agents',
      title: 'AI Agents Live Demo',
      icon: Zap,
      component: GlobalAIAgentRunner,
      description: 'Run agents with real CRM data',
      duration: '3-4 min',
      script: [
        'Navigate to AI agents interface',
        'Run all 24 agents simultaneously',
        'Show real-time progress and results',
        'Display confidence scores and metrics'
      ]
    },
    {
      id: 'playbook',
      title: 'User Onboarding',
      icon: Users,
      component: UserPlaybook,
      description: 'Guide users through implementation',
      duration: '2-3 min',
      script: [
        'Show 30-minute quick start guide',
        'Demonstrate use cases for different teams',
        'Highlight best practices',
        'Show troubleshooting resources'
      ]
    },
    {
      id: 'security',
      title: 'Enterprise Security',
      icon: Shield,
      component: EnterpriseSafetyDashboard,
      description: 'Enterprise security and compliance',
      duration: '1-2 min',
      script: [
        'Show security dashboard',
        'Highlight compliance certifications',
        'Demonstrate real-time monitoring',
        'Show AI safety controls'
      ]
    }
  ];

  const currentView = demoViews.find(view => view.id === currentDemoView);
  const CurrentComponent = currentView?.component || EnterpriseWelcomeDashboard;

  const handleVideoGenerated = (videoBlob: Blob) => {
    setGeneratedVideos(prev => [...prev, videoBlob]);
  };

  const downloadAllVideos = () => {
    generatedVideos.forEach((blob, index) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-crm-demo-part-${index + 1}-${new Date().getTime()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-4 bg-purple-100 rounded-full">
            <Video className="h-12 w-12 text-purple-600" />
          </div>
        </div>
        <h1 className="text-4xl font-bold">Video Demo Studio</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Create professional demo videos showcasing your 24 AI agents and enterprise platform
        </p>
        <div className="flex justify-center gap-2">
          <Badge className="bg-blue-100 text-blue-800">
            <Camera className="h-3 w-3 mr-1" />
            Screen Recording
          </Badge>
          <Badge className="bg-green-100 text-green-800">
            <Mic className="h-3 w-3 mr-1" />
            Voice Over
          </Badge>
          <Badge className="bg-purple-100 text-purple-800">
            <Share2 className="h-3 w-3 mr-1" />
            Ready to Share
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="recorder" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recorder">Video Recorder</TabsTrigger>
          <TabsTrigger value="demo-views">Demo Views</TabsTrigger>
          <TabsTrigger value="scripts">Demo Scripts</TabsTrigger>
        </TabsList>

        <TabsContent value="recorder" className="space-y-6">
          <VideoRecorder onVideoGenerated={handleVideoGenerated} />
          
          {generatedVideos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Generated Videos ({generatedVideos.length})
                </CardTitle>
                <CardDescription>
                  Your demo videos are ready for download and sharing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Button onClick={downloadAllVideos}>
                    <Download className="h-4 w-4 mr-2" />
                    Download All Videos
                  </Button>
                  <Button variant="outline">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Videos
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="demo-views" className="space-y-6">
          {/* Demo View Selector */}
          <Card>
            <CardHeader>
              <CardTitle>Choose Demo View to Record</CardTitle>
              <CardDescription>
                Select the section of your platform you want to showcase
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {demoViews.map((view) => {
                  const IconComponent = view.icon;
                  return (
                    <Card 
                      key={view.id}
                      className={`cursor-pointer transition-all ${
                        currentDemoView === view.id 
                          ? 'border-primary bg-primary/5' 
                          : 'hover:border-primary/50'
                      }`}
                      onClick={() => setCurrentDemoView(view.id)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <IconComponent className="h-5 w-5 text-primary" />
                          <CardTitle className="text-base">{view.title}</CardTitle>
                        </div>
                        <CardDescription className="text-sm">
                          {view.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <Badge variant="outline" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {view.duration}
                        </Badge>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Live Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Live Preview: {currentView?.title}
              </CardTitle>
              <CardDescription>
                This is what will be recorded when you start the demo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 bg-muted/50">
                <CurrentComponent />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scripts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Demo Scripts & Talking Points</CardTitle>
              <CardDescription>
                Follow these scripts for professional, consistent demo presentations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {demoViews.map((view, index) => {
                const IconComponent = view.icon;
                return (
                  <Card key={view.id} className="border-l-4 border-l-primary">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <IconComponent className="h-5 w-5" />
                        {view.title} Script
                        <Badge variant="outline">
                          <Clock className="h-3 w-3 mr-1" />
                          {view.duration}
                        </Badge>
                      </CardTitle>
                      <CardDescription>{view.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <h4 className="font-semibold">Speaking Points:</h4>
                        <ol className="space-y-2">
                          {view.script.map((point, pointIndex) => (
                            <li key={pointIndex} className="flex items-start gap-3">
                              <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                                {pointIndex + 1}
                              </span>
                              <span className="text-sm">{point}</span>
                            </li>
                          ))}
                        </ol>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setCurrentDemoView(view.id)}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Practice This Demo
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </CardContent>
          </Card>

          {/* Master Demo Script */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Complete Platform Demo Script (6-7 minutes)
              </CardTitle>
              <CardDescription>
                Full demonstration script covering all platform capabilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Sparkles className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Opening Hook:</strong> "Today I'll show you how 24 AI agents can transform your entire CRM operation in just 30 minutes of setup time."
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold">Section 1: The Problem (30 seconds)</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Sales teams spend 65% time on admin tasks</li>
                      <li>• Leads fall through cracks</li>
                      <li>• Inconsistent data across platforms</li>
                      <li>• Poor forecasting accuracy</li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold">Section 2: The Solution (1 minute)</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• 24 specialized AI agents</li>
                      <li>• Universal CRM platform support</li>
                      <li>• Real-time intelligence and automation</li>
                      <li>• Enterprise-grade security</li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold">Section 3: Live Demo (4 minutes)</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Run agents with real CRM data</li>
                      <li>• Show real-time processing</li>
                      <li>• Highlight autonomous actions</li>
                      <li>• Display confidence scores</li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold">Section 4: ROI & Close (1.5 minutes)</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• 35% increase in conversion rates</li>
                      <li>• 28% reduction in sales cycle</li>
                      <li>• 80% reduction in manual tasks</li>
                      <li>• Call to action</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};