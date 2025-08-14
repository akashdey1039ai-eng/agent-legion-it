import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Brain, Loader2, TrendingUp, AlertTriangle, Target, Clock, Key, Upload, CheckSquare, Square } from 'lucide-react';
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
  const [isSyncing, setIsSyncing] = useState(false);
  const [leadData, setLeadData] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<any[]>([]);
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
          platform: selectedPlatform,
          ...(apiKey && { apiKey })
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

  const exportToHubSpot = async () => {
    if (!user || !analysis) {
      toast({
        title: "Export Failed",
        description: "No analysis data to export.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('hubspot-export', {
        body: {
          leadData: JSON.parse(leadData),
          analysis: analysis,
          platform: selectedPlatform
        },
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "Export Successful",
        description: "Analysis results exported to HubSpot.",
      });

    } catch (error) {
      console.error('Error exporting to HubSpot:', error);
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export to HubSpot.",
        variant: "destructive",
      });
    }
  };

  const exportToSalesforce = async () => {
    if (!user || !analysis) {
      toast({
        title: "Export Failed",
        description: "No analysis data to export.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('salesforce-export', {
        body: {
          leadData: JSON.parse(leadData),
          analysis: analysis,
          platform: selectedPlatform
        },
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "Export Successful",
        description: "Analysis results exported to Salesforce.",
      });

    } catch (error) {
      console.error('Error exporting to Salesforce:', error);
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export to Salesforce.",
        variant: "destructive",
      });
    }
  };

  const syncHubSpotData = async (objectType: string) => {
    if (!user) return;

    setIsSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('hubspot-sync', {
        body: {
          objectType,
          direction: 'from'
        },
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "Sync Complete",
        description: `HubSpot ${objectType} synced successfully.`,
      });

      // Load recent leads after sync
      await loadRecentHubSpotLeads();

    } catch (error) {
      console.error('Error syncing HubSpot data:', error);
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync HubSpot data.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const syncSalesforceData = async (objectType: string) => {
    if (!user) return;

    setIsSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('salesforce-sync', {
        body: {
          objectType,
          userId: user.id,
          direction: 'from_salesforce'
        },
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "Sync Complete",
        description: `Salesforce ${objectType} synced successfully.`,
      });

      // Load recent leads after sync
      await loadRecentSalesforceLeads();

    } catch (error) {
      console.error('Error syncing Salesforce data:', error);
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync Salesforce data.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const loadRecentHubSpotLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .is('salesforce_id', null)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        throw new Error(error.message);
      }

      setRecentLeads(data || []);
    } catch (error) {
      console.error('Error loading HubSpot leads:', error);
    }
  };

  const loadRecentSalesforceLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .not('salesforce_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        throw new Error(error.message);
      }

      setRecentLeads(data || []);
    } catch (error) {
      console.error('Error loading Salesforce leads:', error);
    }
  };

  const selectLead = (lead: any) => {
    setLeadData(JSON.stringify(lead, null, 2));
    setSelectedLeads([lead]);
    toast({
      title: "Lead Selected",
      description: `Selected ${lead.first_name} ${lead.last_name} for analysis.`,
    });
  };

  const toggleLeadSelection = (lead: any) => {
    setSelectedLeads(prev => {
      const isSelected = prev.find(l => l.id === lead.id);
      if (isSelected) {
        return prev.filter(l => l.id !== lead.id);
      } else {
        return [...prev, lead];
      }
    });
  };

  const selectAllLeads = () => {
    setSelectedLeads([...recentLeads]);
    toast({
      title: "All Leads Selected",
      description: `Selected ${recentLeads.length} leads for bulk analysis.`,
    });
  };

  const clearSelection = () => {
    setSelectedLeads([]);
    setLeadData('');
  };

  const analyzeBulkLeads = async () => {
    if (selectedLeads.length === 0) {
      toast({
        title: "No Leads Selected",
        description: "Please select leads for bulk analysis.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const session = await supabase.auth.getSession();
      const authToken = session.data.session?.access_token;
      
      const analysisPromises = selectedLeads.map(lead => 
        supabase.functions.invoke('lead-intelligence-agent', {
          body: {
            leadData: lead,
            platform: selectedPlatform,
            ...(apiKey && { apiKey })
          },
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        })
      );

      const results = await Promise.all(analysisPromises);
      
      // Handle results and errors
      const successful = results.filter(r => !r.error);
      const failed = results.filter(r => r.error);

      toast({
        title: "Bulk Analysis Complete",
        description: `Analyzed ${successful.length} leads successfully. ${failed.length} failed.`,
      });

      if (successful.length > 0) {
        // Set the first successful analysis for display
        setAnalysis(successful[0].data.analysis);
        setLeadData(JSON.stringify(selectedLeads[0], null, 2));
      }

    } catch (error) {
      console.error('Error in bulk analysis:', error);
      toast({
        title: "Bulk Analysis Failed",
        description: "Failed to analyze selected leads.",
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

          {/* HubSpot Data Import */}
          {selectedPlatform === 'hubspot' && (
            <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900">Import from HubSpot</h4>
              <p className="text-sm text-blue-700">
                Sync and analyze leads directly from your HubSpot CRM
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={() => syncHubSpotData('contacts')}
                  variant="outline"
                  size="sm"
                  disabled={isSyncing}
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sync Contacts'}
                </Button>
                <Button
                  onClick={() => loadRecentHubSpotLeads()}
                  variant="outline" 
                  size="sm"
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  Load Recent Leads
                </Button>
              </div>
            </div>
          )}

          {/* Salesforce Data Import */}
          {selectedPlatform === 'salesforce' && (
            <div className="space-y-3 p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-900">Import from Salesforce</h4>
              <p className="text-sm text-green-700">
                Sync and analyze leads directly from your Salesforce CRM
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={() => syncSalesforceData('contact')}
                  variant="outline"
                  size="sm"
                  disabled={isSyncing}
                  className="border-green-300 text-green-700 hover:bg-green-100"
                >
                  {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sync Contacts'}
                </Button>
                <Button
                  onClick={() => loadRecentSalesforceLeads()}
                  variant="outline"
                  size="sm" 
                  className="border-green-300 text-green-700 hover:bg-green-100"
                >
                  Load Recent Leads
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="leadData" className="text-sm font-medium">
              Lead Data (JSON or select from synced data)
            </label>
            <Textarea
              id="leadData"
              placeholder='Example: {"name": "John Doe", "company": "TechCorp", "email": "john@techcorp.com", "phone": "+1234567890", "title": "CTO", "industry": "Technology", "revenue": "$5M", "employees": 50}'
              value={leadData}
              onChange={(e) => setLeadData(e.target.value)}
              rows={6}
            />
          </div>

          {/* Recent Leads Selection */}
          {recentLeads.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Recent {selectedPlatform === 'hubspot' ? 'HubSpot' : 'Salesforce'} Leads</label>
                <div className="flex gap-2">
                  <Button
                    onClick={selectAllLeads}
                    variant="outline"
                    size="sm"
                    disabled={selectedLeads.length === recentLeads.length}
                  >
                    Select All ({recentLeads.length})
                  </Button>
                  <Button
                    onClick={clearSelection}
                    variant="outline"
                    size="sm"
                    disabled={selectedLeads.length === 0}
                  >
                    Clear ({selectedLeads.length})
                  </Button>
                </div>
              </div>
              
              {selectedLeads.length > 0 && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-blue-700">
                      {selectedLeads.length} lead{selectedLeads.length > 1 ? 's' : ''} selected for bulk analysis
                    </span>
                    <Button
                      onClick={analyzeBulkLeads}
                      disabled={isAnalyzing || selectedLeads.length === 0}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Brain className="w-4 h-4 mr-2" />
                          Analyze {selectedLeads.length} Lead{selectedLeads.length > 1 ? 's' : ''}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              <div className="grid gap-2 max-h-48 overflow-y-auto">
                {recentLeads.map((lead) => {
                  const isSelected = selectedLeads.find(l => l.id === lead.id);
                  return (
                    <div
                      key={lead.id}
                      className={`p-3 border rounded-lg transition-colors ${
                        isSelected ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => toggleLeadSelection(lead)}
                          className="mt-1 text-blue-600 hover:text-blue-800"
                        >
                          {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                        </button>
                        <div 
                          className="flex-1 cursor-pointer"
                          onClick={() => selectLead(lead)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h5 className="font-medium">{lead.first_name} {lead.last_name}</h5>
                              <p className="text-sm text-gray-600">{lead.email}</p>
                              <p className="text-xs text-gray-500">{lead.title} • {lead.company || 'No company'}</p>
                            </div>
                            <div className="text-xs text-gray-400">
                              {lead.status}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="apiKey" className="text-sm font-medium flex items-center gap-2">
              <Key className="w-4 h-4" />
              OpenAI API Key (Optional - if Supabase secret not working)
            </label>
            <Input
              id="apiKey"
              type="password"
              placeholder="sk-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Only needed if the system's OpenAI key isn't configured properly. This is temporary and will be stored securely in Supabase.
            </p>
          </div>

          <Button 
            onClick={handleAnalyze} 
            disabled={isAnalyzing || isSyncing || !leadData.trim()}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing Lead...
              </>
            ) : isSyncing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Syncing Data...
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

            {/* Export Buttons */}
            {analysis && (
              <div className="grid md:grid-cols-2 gap-4">
                {selectedPlatform === 'hubspot' && (
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <h4 className="font-medium text-orange-900 mb-2">Export to HubSpot</h4>
                    <p className="text-sm text-orange-700 mb-3">
                      Send this analysis back to HubSpot as notes and update lead scoring.
                    </p>
                    <Button
                      onClick={exportToHubSpot}
                      variant="outline"
                      className="w-full border-orange-300 text-orange-700 hover:bg-orange-100"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Export to HubSpot
                    </Button>
                  </div>
                )}

                {selectedPlatform === 'salesforce' && (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-medium text-green-900 mb-2">Export to Salesforce</h4>
                    <p className="text-sm text-green-700 mb-3">
                      Send this analysis to Salesforce as tasks and update lead ratings.
                    </p>
                    <Button
                      onClick={exportToSalesforce}
                      variant="outline"
                      className="w-full border-green-300 text-green-700 hover:bg-green-100"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Export to Salesforce
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}