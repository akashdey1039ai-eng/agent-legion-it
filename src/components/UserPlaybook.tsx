import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BookOpen, Play, CheckCircle, ArrowRight, Users, Target, 
  Activity, BarChart3, Shield, Zap, Clock, Star,
  Lightbulb, Settings, Database, MessageSquare
} from 'lucide-react';

export const UserPlaybook = () => {
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const markStepComplete = (stepId: string) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }
  };

  const quickStartSteps = [
    {
      id: 'connect-crm',
      title: 'Connect Your CRM',
      description: 'Link Salesforce, HubSpot, or use our Native CRM',
      time: '5 minutes',
      icon: Database
    },
    {
      id: 'enable-agents',
      title: 'Enable AI Agents',
      description: 'Activate the agents that match your business needs',
      time: '10 minutes',
      icon: Zap
    },
    {
      id: 'configure-rules',
      title: 'Set Business Rules',
      description: 'Define confidence thresholds and approval workflows',
      time: '15 minutes',
      icon: Settings
    },
    {
      id: 'test-run',
      title: 'Run Test Campaign',
      description: 'Start with a small dataset to validate results',
      time: '30 minutes',
      icon: Play
    }
  ];

  const useCases = [
    {
      category: 'Sales Teams',
      icon: Target,
      color: 'blue',
      scenarios: [
        {
          title: 'Lead Qualification Automation',
          description: 'Automatically score and prioritize incoming leads',
          agents: ['Lead Intelligence AI', 'Customer Sentiment AI', 'Lead Scoring AI'],
          outcome: '35% increase in qualified leads, 50% faster response time',
          steps: [
            'Enable Lead Intelligence AI agent',
            'Connect to your lead sources (web forms, ads, etc.)',
            'Set minimum qualification score (recommended: 70+)',
            'Review and approve high-priority leads daily'
          ]
        },
        {
          title: 'Pipeline Forecasting',
          description: 'Predict revenue and identify at-risk deals',
          agents: ['Pipeline Analysis AI', 'Opportunity Scoring AI', 'Risk Assessment AI'],
          outcome: '42% improvement in forecast accuracy',
          steps: [
            'Connect historical deal data (minimum 6 months)',
            'Enable Pipeline Analysis and Opportunity Scoring agents',
            'Set up weekly forecast review meetings',
            'Monitor deal risk scores and take preventive action'
          ]
        }
      ]
    },
    {
      category: 'Marketing Teams',
      icon: MessageSquare,
      color: 'purple',
      scenarios: [
        {
          title: 'Personalized Email Campaigns',
          description: 'Generate personalized content based on customer data',
          agents: ['Communication AI', 'Content Generation AI', 'Engagement Optimizer AI'],
          outcome: '28% higher open rates, 45% better click-through rates',
          steps: [
            'Connect email marketing platform',
            'Enable Communication and Content Generation agents',
            'Upload customer segmentation data',
            'Launch A/B test campaigns to optimize performance'
          ]
        },
        {
          title: 'Customer Segmentation',
          description: 'Automatically group customers for targeted campaigns',
          agents: ['Customer Segmentation AI', 'Market Analysis AI', 'Competitive Intelligence AI'],
          outcome: '60% improvement in campaign relevance',
          steps: [
            'Import customer database with transaction history',
            'Enable Customer Segmentation and Market Analysis agents',
            'Review suggested segments and refine criteria',
            'Create targeted campaigns for each segment'
          ]
        }
      ]
    },
    {
      category: 'Customer Success',
      icon: Users,
      color: 'green',
      scenarios: [
        {
          title: 'Churn Prevention',
          description: 'Identify at-risk customers and prevent churn',
          agents: ['Churn Prediction AI', 'Customer Sentiment AI', 'Engagement Optimizer AI'],
          outcome: '25% reduction in churn rate',
          steps: [
            'Connect customer usage and support data',
            'Enable Churn Prediction and Sentiment Analysis agents',
            'Set up alerts for high-risk customers',
            'Create automated intervention workflows'
          ]
        }
      ]
    }
  ];

  const bestPractices = [
    {
      icon: Shield,
      title: 'Start with Low-Risk Agents',
      description: 'Begin with read-only agents like Lead Intelligence and Pipeline Analysis before enabling agents that make changes to your data.'
    },
    {
      icon: Settings,
      title: 'Set Conservative Thresholds',
      description: 'Start with higher confidence thresholds (80%+) and human approval for all actions. Lower thresholds as you gain confidence.'
    },
    {
      icon: Clock,
      title: 'Monitor Daily Initially',
      description: 'Review agent actions daily for the first week, then weekly once you\'re comfortable with the results.'
    },
    {
      icon: BarChart3,
      title: 'Measure Business Impact',
      description: 'Track key metrics like conversion rates, response times, and revenue impact to quantify AI agent value.'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-4 bg-primary/10 rounded-full">
            <BookOpen className="h-12 w-12 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl font-bold">AI Agent Playbook</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Complete guide to deploying and managing your 24 AI agents for maximum business impact
        </p>
      </div>

      <Tabs defaultValue="quick-start" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="quick-start">Quick Start</TabsTrigger>
          <TabsTrigger value="use-cases">Use Cases</TabsTrigger>
          <TabsTrigger value="best-practices">Best Practices</TabsTrigger>
          <TabsTrigger value="troubleshooting">Troubleshooting</TabsTrigger>
        </TabsList>

        <TabsContent value="quick-start" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                30-Minute Quick Start
              </CardTitle>
              <CardDescription>
                Get your first AI agents running in 30 minutes or less
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {quickStartSteps.map((step, index) => {
                  const IconComponent = step.icon;
                  const isCompleted = completedSteps.includes(step.id);
                  
                  return (
                    <div key={step.id} className="flex items-start gap-4 p-4 border rounded-lg">
                      <div className="flex-shrink-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isCompleted ? 'bg-green-100 text-green-600' : 'bg-primary/10 text-primary'
                        }`}>
                          {isCompleted ? <CheckCircle className="h-4 w-4" /> : <span className="text-sm font-bold">{index + 1}</span>}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <IconComponent className="h-4 w-4" />
                          <h3 className="font-semibold">{step.title}</h3>
                          <Badge variant="outline" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {step.time}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
                        <Button
                          size="sm"
                          variant={isCompleted ? "outline" : "default"}
                          onClick={() => markStepComplete(step.id)}
                          disabled={isCompleted}
                        >
                          {isCompleted ? 'Completed' : 'Mark Complete'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="use-cases" className="space-y-6">
          {useCases.map((useCase) => {
            const IconComponent = useCase.icon;
            return (
              <Card key={useCase.category}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <IconComponent className={`h-5 w-5 text-${useCase.color}-600`} />
                    {useCase.category}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {useCase.scenarios.map((scenario, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-2">{scenario.title}</h3>
                        <p className="text-muted-foreground">{scenario.description}</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">AI Agents Used:</h4>
                          <div className="space-y-1">
                            {scenario.agents.map((agent) => (
                              <Badge key={agent} variant="secondary" className="mr-1">
                                {agent}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Expected Outcome:</h4>
                          <p className="text-sm text-green-600 font-medium">{scenario.outcome}</p>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Implementation Steps:</h4>
                        <ol className="space-y-1 text-sm text-muted-foreground">
                          {scenario.steps.map((step, stepIndex) => (
                            <li key={stepIndex} className="flex items-start gap-2">
                              <span className="font-bold text-primary">{stepIndex + 1}.</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="best-practices" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bestPractices.map((practice, index) => {
              const IconComponent = practice.icon;
              return (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <IconComponent className="h-5 w-5 text-primary" />
                      {practice.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{practice.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertDescription>
              <strong>Pro Tip:</strong> Start with 3-4 agents maximum in your first deployment. 
              Once these are running smoothly, gradually enable additional agents. This approach 
              reduces complexity and helps your team build confidence with the AI system.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="troubleshooting" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Common Issues & Solutions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="border-l-4 border-yellow-500 pl-4">
                  <h3 className="font-semibold">Agent shows "Low Confidence" frequently</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    This usually indicates insufficient training data or unclear business rules.
                  </p>
                  <ul className="text-sm space-y-1">
                    <li>• Ensure you have at least 100 historical records for training</li>
                    <li>• Review and clarify your business rules and criteria</li>
                    <li>• Consider lowering confidence threshold temporarily (to 60-70%)</li>
                  </ul>
                </div>

                <div className="border-l-4 border-red-500 pl-4">
                  <h3 className="font-semibold">Agent execution fails or times out</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Network issues or API rate limits can cause execution failures.
                  </p>
                  <ul className="text-sm space-y-1">
                    <li>• Check your CRM API connection status</li>
                    <li>• Verify API rate limits haven't been exceeded</li>
                    <li>• Try running the agent on a smaller data set first</li>
                  </ul>
                </div>

                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-semibold">Unexpected agent actions or results</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    AI agents learn from your data patterns and may need adjustment.
                  </p>
                  <ul className="text-sm space-y-1">
                    <li>• Review the agent's training data for bias or errors</li>
                    <li>• Adjust business rules and confidence thresholds</li>
                    <li>• Enable human approval for all actions temporarily</li>
                    <li>• Contact support for agent retraining if needed</li>
                  </ul>
                </div>
              </div>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <strong>Need Help?</strong> Our support team is available 24/7 for enterprise customers. 
                  Contact support through the platform or email enterprise@yourcompany.com
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};