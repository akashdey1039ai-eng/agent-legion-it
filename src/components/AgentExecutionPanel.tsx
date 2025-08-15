import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Play, 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  DollarSign,
  Target,
  Loader2,
  BarChart3,
  Eye,
  Zap,
  Settings
} from 'lucide-react';
import { AgentConfiguration } from './AgentConfiguration';

interface AnalysisResult {
  opportunity_id: string;
  opportunity_name: string;
  current_amount: number;
  current_stage: string;
  current_probability: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  confidence_score: number;
  recommended_probability: number;
  insights: string[];
  next_actions: string[];
  reasoning: string;
}

interface ExecutionResult {
  success: boolean;
  agent_name: string;
  execution_time: string;
  opportunities_analyzed: number;
  total_pipeline_value: number;
  summary: {
    high_risk_deals: number;
    medium_risk_deals: number;
    low_risk_deals: number;
    avg_confidence: number;
    probability_adjustments: number;
  };
  analyses: AnalysisResult[];
  recommendations: {
    immediate_attention: number;
    pipeline_health: string;
    next_review: string;
  };
}

export function AgentExecutionPanel() {
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisResult | null>(null);
  const [showConfig, setShowConfig] = useState<'salesforce' | 'hubspot' | null>(null);
  const { toast } = useToast();

  const executeAgent = async () => {
    setIsExecuting(true);
    setExecutionResult(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('pipeline-analysis-agent', {
        body: { action: 'analyze', limit: 10 }
      });

      if (error) throw error;

      setExecutionResult(data);
      
      toast({
        title: "Pipeline Analysis Complete",
        description: `Analyzed ${data.opportunities_analyzed} opportunities with ${data.summary.avg_confidence}% avg confidence`,
      });

    } catch (error) {
      console.error('Agent execution error:', error);
      toast({
        title: "Execution Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return <CheckCircle className="h-4 w-4" />;
      case 'medium': return <Clock className="h-4 w-4" />;
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  if (showConfig) {
    return (
      <AgentConfiguration 
        platform={showConfig}
        agentType="pipeline-analysis"
        onClose={() => setShowConfig(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Configuration Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Agent Configuration
          </CardTitle>
          <CardDescription>
            Configure the Pipeline Analysis Agent for your CRM platforms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              className="bg-gradient-primary hover:opacity-90"
              onClick={() => setShowConfig('salesforce')}
            >
              <Settings className="h-4 w-4 mr-2" />
              Configure for Salesforce
            </Button>
            <Button 
              className="bg-gradient-primary hover:opacity-90"
              onClick={() => setShowConfig('hubspot')}
            >
              <Settings className="h-4 w-4 mr-2" />
              Configure for HubSpot
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Execution Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Pipeline Analysis Agent
                  <Badge variant="secondary">Active</Badge>
                </CardTitle>
                <CardDescription>
                  AI-powered pipeline risk assessment and probability forecasting
                </CardDescription>
              </div>
            </div>
            <Button
              onClick={executeAgent}
              disabled={isExecuting}
              className="bg-gradient-primary hover:opacity-90"
            >
              {isExecuting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Run Analysis
                </>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Execution Results */}
      {executionResult && (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{executionResult.opportunities_analyzed}</p>
                    <p className="text-xs text-muted-foreground">Opportunities Analyzed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">
                      ${(executionResult.total_pipeline_value / 1000000).toFixed(1)}M
                    </p>
                    <p className="text-xs text-muted-foreground">Pipeline Value</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{executionResult.summary.avg_confidence}%</p>
                    <p className="text-xs text-muted-foreground">Avg Confidence</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <div>
                    <p className="text-2xl font-bold">{executionResult.summary.high_risk_deals}</p>
                    <p className="text-xs text-muted-foreground">High Risk Deals</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pipeline Health */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Pipeline Health Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">Low Risk</span>
                  </div>
                  <Progress value={(executionResult.summary.low_risk_deals / executionResult.opportunities_analyzed) * 100} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {executionResult.summary.low_risk_deals} deals
                  </p>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm font-medium">Medium Risk</span>
                  </div>
                  <Progress value={(executionResult.summary.medium_risk_deals / executionResult.opportunities_analyzed) * 100} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {executionResult.summary.medium_risk_deals} deals
                  </p>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-3 w-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm font-medium">High Risk</span>
                  </div>
                  <Progress value={(executionResult.summary.high_risk_deals / executionResult.opportunities_analyzed) * 100} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {executionResult.summary.high_risk_deals} deals
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Pipeline Health: {executionResult.recommendations.pipeline_health}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {executionResult.recommendations.immediate_attention > 0 
                    ? `${executionResult.recommendations.immediate_attention} deals require immediate attention`
                    : 'No deals require immediate attention'
                  }
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Next Review: {executionResult.recommendations.next_review}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Opportunity Analysis Details</CardTitle>
              <CardDescription>
                Click on any opportunity to view detailed insights and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {executionResult.analyses.map((analysis, index) => (
                  <div 
                    key={analysis.opportunity_id}
                    className="p-4 border border-border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedAnalysis(analysis)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge className={getRiskColor(analysis.risk_level)}>
                          {getRiskIcon(analysis.risk_level)}
                          {analysis.risk_level?.toUpperCase() || 'UNKNOWN'}
                        </Badge>
                        <div>
                          <h4 className="font-medium">{analysis.opportunity_name}</h4>
                          <p className="text-sm text-muted-foreground">
                            ${analysis.current_amount.toLocaleString()} • {analysis.current_stage}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">
                            {analysis.current_probability}% → {analysis.recommended_probability}%
                          </span>
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {analysis.confidence_score}% confidence
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Detailed Analysis Modal */}
          {selectedAnalysis && (
            <Card className="border-2 border-primary">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    {selectedAnalysis.opportunity_name}
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedAnalysis(null)}
                  >
                    Close
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-medium mb-3">Key Insights</h5>
                    <ul className="space-y-2">
                      {selectedAnalysis.insights.map((insight, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <div className="h-1.5 w-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="font-medium mb-3">Recommended Actions</h5>
                    <ul className="space-y-2">
                      {selectedAnalysis.next_actions.map((action, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <h5 className="font-medium mb-2">AI Reasoning</h5>
                  <p className="text-sm text-muted-foreground">{selectedAnalysis.reasoning}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}