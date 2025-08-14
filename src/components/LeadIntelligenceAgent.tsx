import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Brain, Loader2, TrendingUp, AlertTriangle, Target, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface AnalysisResult {
  leadScore: number;
  priorityLevel: 'High' | 'Medium' | 'Low';
  keyInsights: string[];
  recommendedActions: string[];
  riskFactors: string[];
  opportunityAssessment: {
    revenuePotential: string;
    timeline: string;
    confidence: 'High' | 'Medium' | 'Low';
  };
  summary: string;
}

export default function LeadIntelligenceAgent() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [leadData, setLeadData] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<'salesforce' | 'hubspot'>('salesforce');
  const { user } = useAuth();
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!user || !leadData.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter lead data to analyze.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      let parsedLeadData;
      try {
        parsedLeadData = JSON.parse(leadData);
      } catch {
        // If not JSON, treat as plain text
        parsedLeadData = { description: leadData };
      }

      const { data, error } = await supabase.functions.invoke('lead-intelligence-agent', {
        body: {
          leadData: parsedLeadData,
          platform: selectedPlatform
        },
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      setAnalysis(data.analysis);
      
      if (data.aiPowered) {
        toast({
          title: "AI Analysis Complete",
          description: "Lead analyzed using real AI intelligence.",
        });
      } else {
        toast({
          title: "Analysis Complete", 
          description: "Lead analysis generated successfully.",
        });
      }

    } catch (error) {
      console.error('Error analyzing lead:', error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze lead data.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-600" />
            Lead Intelligence Agent
          </CardTitle>
          <CardDescription>
            Analyze lead data using AI to provide intelligent scoring and actionable insights
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Platform Source</label>
            <div className="flex gap-2">
              <Button
                variant={selectedPlatform === 'salesforce' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPlatform('salesforce')}
              >
                Salesforce
              </Button>
              <Button
                variant={selectedPlatform === 'hubspot' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPlatform('hubspot')}
              >
                HubSpot
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="leadData" className="text-sm font-medium">
              Lead Data (JSON or Text)
            </label>
            <Textarea
              id="leadData"
              placeholder='Example: {"name": "John Doe", "company": "TechCorp", "email": "john@techcorp.com", "phone": "+1234567890", "title": "CTO", "industry": "Technology", "revenue": "$5M", "employees": 50}'
              value={leadData}
              onChange={(e) => setLeadData(e.target.value)}
              rows={6}
            />
          </div>

          <Button 
            onClick={handleAnalyze} 
            disabled={isAnalyzing || !leadData.trim()}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing Lead...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                Analyze Lead
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Lead Analysis Results
              <Badge className={getPriorityColor(analysis.priorityLevel)}>
                {analysis.priorityLevel} Priority
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Lead Score */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Lead Score:</span>
              </div>
              <div className={`text-2xl font-bold ${getScoreColor(analysis.leadScore)}`}>
                {analysis.leadScore}/100
              </div>
            </div>

            {/* Summary */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Summary</h4>
              <p className="text-blue-800">{analysis.summary}</p>
            </div>

            {/* Opportunity Assessment */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="font-medium">Revenue Potential</span>
                  </div>
                  <p className="text-lg font-semibold text-green-600">
                    {analysis.opportunityAssessment.revenuePotential}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">Timeline</span>
                  </div>
                  <p className="text-lg font-semibold text-blue-600">
                    {analysis.opportunityAssessment.timeline}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-purple-600" />
                    <span className="font-medium">Confidence</span>
                  </div>
                  <Badge className={getPriorityColor(analysis.opportunityAssessment.confidence)}>
                    {analysis.opportunityAssessment.confidence}
                  </Badge>
                </CardContent>
              </Card>
            </div>

            {/* Key Insights */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Brain className="w-4 h-4" />
                Key Insights
              </h4>
              <ul className="space-y-2">
                {analysis.keyInsights.map((insight, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommended Actions */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Recommended Actions
              </h4>
              <ul className="space-y-2">
                {analysis.recommendedActions.map((action, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0" />
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Risk Factors */}
            {analysis.riskFactors.length > 0 && (
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  Risk Factors
                </h4>
                <ul className="space-y-2">
                  {analysis.riskFactors.map((risk, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0" />
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}