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
      id: 'hd-complete-demo',
      title: 'HD Complete Platform Demo',
      icon: Video,
      component: EnterpriseWelcomeDashboard,
      description: 'Full 6-7 minute HD demo showcasing all 24 AI agents end-to-end',
      duration: '6-7 min',
      script: [
        '🎬 OPENING HOOK (30s): "Transform your entire CRM operation with 24 AI agents in just 30 minutes"',
        '📊 ENTERPRISE DASHBOARD: Show "24 AI Agents", universal platform support, ROI metrics',
        '⚡ LIVE AGENT EXECUTION: Run all agents simultaneously with real CRM data',
        '🔍 RECORD ACTIONS: Display detailed actions taken on individual records',
        '🎯 ROI & BUSINESS IMPACT: Present conversion increases, cycle reduction, automation stats',
        '🚀 CALL TO ACTION: Next steps for implementation'
      ]
    },
    {
      id: 'opening-hook',
      title: 'Opening Hook Segment',
      icon: Target,
      component: EnterpriseWelcomeDashboard,
      description: 'Compelling 30-second opening that showcases platform power',
      duration: '30 sec',
      script: [
        'Display enterprise dashboard prominently showing "24 AI Agents"',
        '"Today I\'ll show you how 24 specialized AI agents can transform your entire CRM operation"',
        'Highlight universal platform compatibility (Salesforce, HubSpot, etc.)',
        'Tease the business impact: 35% conversion increase, 28% cycle reduction'
      ]
    },
    {
      id: 'agents-live',
      title: 'AI Agents Live Execution',
      icon: Zap,
      component: GlobalAIAgentRunner,
      description: 'Core 4-minute demo of agents running with real data',
      duration: '4 min',
      script: [
        'Navigate to AI Agents tab - show all 24 agents ready',
        'Start comprehensive test with real Salesforce/HubSpot data',
        'Display real-time progress bars and confidence scores',
        'Switch to "Record Actions" tab - show detailed actions on individual records',
        'Highlight platform switching (Salesforce ↔ HubSpot) with live data',
        'Show AI analysis, scoring, and autonomous actions taken'
      ]
    },
    {
      id: 'roi-impact',
      title: 'ROI & Business Impact',
      icon: BarChart3,
      component: EnterpriseWelcomeDashboard,
      description: 'Final segment showcasing business value and security',
      duration: '1.5 min',
      script: [
        'Return to enterprise dashboard with updated post-demo metrics',
        'Highlight security monitoring and compliance features',
        'Present concrete ROI: 35% conversion increase, 28% cycle reduction, 80% automation',
        'Show enterprise security badges and real-time monitoring',
        'Clear call-to-action: "Ready to transform your CRM operations?"'
      ]
    },
    {
      id: 'quick-highlight',
      title: 'Quick 2-Minute Highlight',
      icon: Clock,
      component: GlobalAIAgentRunner,
      description: 'Condensed demo focusing on key differentiators',
      duration: '2 min',
      script: [
        'Show 24 agents overview with universal platform support',
        'Run 6-8 high-impact agents with live data',
        'Display real-time processing and confidence scores',
        'Quick view of Record Actions showing AI decision-making',
        'End with ROI metrics and next steps'
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

          {/* HD Demo Recording Setup */}
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-purple/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5 text-primary" />
                HD Demo Recording Setup (1920x1080)
              </CardTitle>
              <CardDescription>
                Professional high-definition recording configuration for your AI agent demo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Camera className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Recording Quality:</strong> 1080p HD at 30fps with VP9 codec for crisp, professional video quality. Estimated file size: 50-100MB for 6-7 minutes.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border border-green-200 bg-green-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-green-800">🎬 Pre-Recording</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1 text-xs text-green-700">
                        <li>• Close all unnecessary tabs</li>
                        <li>• Set display to 1920x1080</li>
                        <li>• Test microphone levels</li>
                        <li>• Disable notifications</li>
                        <li>• Ensure stable internet</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border border-blue-200 bg-blue-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-blue-800">🎯 Demo Flow</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1 text-xs text-blue-700">
                        <li>• Hook: 30s (Enterprise dashboard)</li>
                        <li>• Overview: 1min (Platform features)</li>
                        <li>• Live Demo: 4min (All 24 agents)</li>
                        <li>• Record Actions: Deep dive</li>
                        <li>• ROI Impact: 1.5min (Results)</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border border-purple-200 bg-purple-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-purple-800">📊 Key Highlights</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1 text-xs text-purple-700">
                        <li>• 24 AI agents running live</li>
                        <li>• Real Salesforce/HubSpot data</li>
                        <li>• Record-level action tracking</li>
                        <li>• 35% conversion increase</li>
                        <li>• Enterprise security features</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Master Demo Script */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                HD AI Agent Demo Script (6-7 minutes)
              </CardTitle>
              <CardDescription>
                Complete script for creating your high-definition AI agent demonstration video
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <Alert className="border-green-200 bg-green-50">
                  <Sparkles className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>🎬 Opening Hook (30 seconds):</strong> "Today I'll demonstrate how 24 specialized AI agents can transform your entire CRM operation, processing thousands of records in real-time with confidence scores and detailed action tracking."
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Card className="border-l-4 border-l-blue-500">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base text-blue-800">🏢 Enterprise Dashboard (1 minute)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                            <span>Showcase "24 AI Agents" prominently on dashboard</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                            <span>Highlight universal platform support (Salesforce, HubSpot)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                            <span>Display key metrics: 35% conversion ↑, 28% cycle ↓</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                            <span>Show enterprise security badges and compliance</span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-purple-500">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base text-purple-800">🎯 ROI & Impact (1.5 minutes)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                            <span>Return to dashboard showing updated metrics</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                            <span>Present concrete ROI: 80% task automation</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                            <span>Highlight real-time security monitoring</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                            <span>Clear CTA: "Ready to transform your CRM?"</span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-4">
                    <Card className="border-l-4 border-l-orange-500">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base text-orange-800">⚡ Live AI Agent Demo (4 minutes)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                            <span>Navigate to AI Agents tab, show all 24 agents</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                            <span>Start comprehensive test with real CRM data</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                            <span>Show real-time progress bars and confidence scores</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                            <span><strong>KEY:</strong> Switch to "Record Actions" tab</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                            <span>Display detailed actions on individual records</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                            <span>Show platform switching (Salesforce ↔ HubSpot)</span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-red-500">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base text-red-800">🎙️ Voice-Over Script</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3 text-sm">
                          <p className="font-medium">"Here's something revolutionary..."</p>
                          <p>"Watch as 24 AI agents process thousands of CRM records simultaneously..."</p>
                          <p>"Notice the confidence scores and detailed actions on each record..."</p>
                          <p>"This isn't just automation - it's intelligent decision-making at scale."</p>
                          <p className="font-medium">"In 30 minutes, you can have this running on your CRM."</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <Alert className="border-yellow-200 bg-yellow-50">
                  <Settings className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    <strong>Pro Tip:</strong> During the "Record Actions" segment, expand a few record details to show the AI analysis, scoring, and specific actions taken. This demonstrates the intelligence and transparency of the system.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};