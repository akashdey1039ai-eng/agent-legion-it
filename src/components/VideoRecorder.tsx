import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Video, Play, Square, Download, Settings, Mic, MicOff,
  Camera, Monitor, Sparkles, CheckCircle, Clock, BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VideoRecorderProps {
  onVideoGenerated?: (videoBlob: Blob) => void;
}

export const VideoRecorder: React.FC<VideoRecorderProps> = ({ onVideoGenerated }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [recordingType, setRecordingType] = useState<'screen' | 'demo'>('demo');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const demoScenarios = [
    {
      id: 'hd-complete-demo',
      title: 'HD Complete AI Agent Demo',
      description: 'Professional 6-7 minute demo showcasing end-to-end AI agent workflow',
      duration: '6-7 minutes',
      steps: [
        '🎬 Opening Hook: Enterprise dashboard with "24 AI Agents" (30s)',
        '📊 Platform Overview: Universal support, ROI metrics (1min)',
        '⚡ Live Agent Execution: All 24 agents with real data (4min)',
        '🔍 Record Actions: Show detailed AI actions on records',
        '🎯 ROI Impact: Business results and call-to-action (1.5min)'
      ]
    },
    {
      id: 'agents-deep-dive',
      title: 'AI Agents Deep Dive',
      description: 'Focused demo on agent execution and record-level actions',
      duration: '4-5 minutes',
      steps: [
        'Navigate to AI Agents tab showing all 24 agents',
        'Start comprehensive test with live Salesforce/HubSpot data',
        'Display real-time progress bars and confidence scores',
        'Switch to "Record Actions" tab for detailed view',
        'Show AI analysis, scoring, and autonomous actions',
        'Demonstrate platform switching between CRM systems'
      ]
    },
    {
      id: 'enterprise-highlight',
      title: 'Enterprise Feature Highlight',
      description: 'Business-focused demo emphasizing ROI and security',
      duration: '3-4 minutes',
      steps: [
        'Enterprise dashboard with key performance metrics',
        'Security and compliance feature overview',
        'Live agent execution showing business impact',
        'ROI presentation: 35% conversion ↑, 28% cycle ↓',
        'Enterprise security monitoring in action'
      ]
    },
    {
      id: 'quick-power-demo',
      title: 'Power Demo (2 minutes)',
      description: 'High-impact condensed demo for busy executives',
      duration: '2 minutes',
      steps: [
        'Show 24 agents + universal platform support (15s)',
        'Run 8-10 key agents with live data (75s)',
        'Quick Record Actions view (15s)',
        'ROI metrics and next steps (15s)'
      ]
    }
  ];

  const startScreenRecording = async () => {
    try {
      setIsPreparing(true);
      
      // Request screen capture
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: { 
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        },
        audio: false
      });

      let finalStream = displayStream;

      // Add microphone audio if enabled
      if (audioEnabled) {
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              sampleRate: 44100
            } 
          });
          
          // Combine video and audio streams
          const audioTracks = audioStream.getAudioTracks();
          if (audioTracks.length > 0) {
            finalStream.addTrack(audioTracks[0]);
          }
        } catch (audioError) {
          console.warn('Could not access microphone:', audioError);
          toast({
            title: "Audio Warning",
            description: "Continuing without microphone audio",
            variant: "default"
          });
        }
      }

      streamRef.current = finalStream;
      chunksRef.current = [];

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(finalStream, {
        mimeType: 'video/webm;codecs=vp9,opus'
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setVideoBlob(blob);
        onVideoGenerated?.(blob);
        
        toast({
          title: "Recording Complete",
          description: "Your demo video is ready for download",
        });
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(100); // Collect data every 100ms
      
      setIsRecording(true);
      setIsPreparing(false);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast({
        title: "Recording Started",
        description: "Demo recording is now in progress",
      });

    } catch (error) {
      console.error('Error starting recording:', error);
      setIsPreparing(false);
      toast({
        title: "Recording Error",
        description: "Could not start screen recording. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
  };

  const downloadVideo = () => {
    if (videoBlob) {
      const url = URL.createObjectURL(videoBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-crm-demo-${new Date().getTime()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Download Started",
        description: "Your demo video is downloading",
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const generateAutomatedDemo = async (scenario: string) => {
    toast({
      title: "Demo Generation",
      description: "Automated demo generation is coming soon!",
    });
  };

  return (
    <div className="space-y-6">
      {/* Recording Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Video Demo Recorder
          </CardTitle>
          <CardDescription>
            Create professional demo videos of your AI agents in action
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Recording Status */}
          {(isRecording || isPreparing) && (
            <Alert>
              <Camera className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>
                  {isPreparing ? 'Preparing to record...' : `Recording: ${formatTime(recordingTime)}`}
                </span>
                {isRecording && (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-sm font-mono">{formatTime(recordingTime)}</span>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Controls */}
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              {!isRecording ? (
                <Button 
                  onClick={startScreenRecording} 
                  disabled={isPreparing}
                  className="flex items-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  {isPreparing ? 'Starting...' : 'Start Recording'}
                </Button>
              ) : (
                <Button 
                  onClick={stopRecording} 
                  variant="destructive"
                  className="flex items-center gap-2"
                >
                  <Square className="h-4 w-4" />
                  Stop Recording
                </Button>
              )}
              
              <Button
                onClick={() => setAudioEnabled(!audioEnabled)}
                variant="outline"
                className="flex items-center gap-2"
              >
                {audioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                {audioEnabled ? 'Audio On' : 'Audio Off'}
              </Button>
            </div>

            {videoBlob && (
              <Button 
                onClick={downloadVideo}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download Video
              </Button>
            )}
          </div>

          {/* Recording Progress */}
          {isRecording && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Recording Progress</span>
                <span>{formatTime(recordingTime)}</span>
              </div>
              <Progress value={(recordingTime / 300) * 100} className="w-full" />
              <p className="text-xs text-muted-foreground">
                Recommended: 3-5 minutes for optimal demo length
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Demo Scenarios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Guided Demo Scenarios
          </CardTitle>
          <CardDescription>
            Follow these structured scenarios for professional demo videos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {demoScenarios.map((scenario) => (
              <Card key={scenario.id} className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{scenario.title}</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {scenario.duration}
                    </Badge>
                  </div>
                  <CardDescription>{scenario.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium">Demo Steps:</h4>
                    <ul className="space-y-1">
                      {scenario.steps.map((step, index) => (
                        <li key={index} className="text-xs text-muted-foreground flex items-start gap-2">
                          <span className="font-bold text-primary">{index + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button 
                    onClick={() => generateAutomatedDemo(scenario.id)}
                    className="w-full"
                    variant="outline"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Follow This Script
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tips for Great Demos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Pro Tips for Demo Videos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold">Before Recording:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Close unnecessary browser tabs and applications</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Test your microphone audio levels</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Prepare a brief script or talking points</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Ensure stable internet connection for live demos</span>
                </li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold">During Recording:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Speak clearly and at a moderate pace</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Highlight key metrics and results</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Show real data from connected CRM systems</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Keep the demo focused and under 5 minutes</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};