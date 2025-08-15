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

interface BulkAnalysisResult {
  lead: any;
  analysis: AnalysisResult;
  success: boolean;
  error?: string;
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
  const [bulkResults, setBulkResults] = useState<BulkAnalysisResult[]>([]);
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
        .not('salesforce_id', 'is', null)
        .order('last_sync_at', { ascending: false })
        .limit(5);

      if (error) {
        throw new Error(error.message);
      }

      // Filter for HubSpot contacts (those synced from HubSpot will have numeric IDs)
      const hubspotContacts = data?.filter(contact => 
        contact.salesforce_id && !contact.salesforce_id.startsWith('003')
      ) || [];

      setRecentLeads(hubspotContacts);
      
      toast({
        title: "Recent Leads Loaded",
        description: `Loaded ${hubspotContacts.length} recent HubSpot contacts.`,
      });
    } catch (error) {
      console.error('Error loading HubSpot leads:', error);
      toast({
        title: "Load Failed",
        description: "Failed to load recent HubSpot leads.",
        variant: "destructive",
      });
    }
  };

  const loadRecentSalesforceLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .not('salesforce_id', 'is', null)
        .order('last_sync_at', { ascending: false })
        .limit(5);

      if (error) {
        throw new Error(error.message);
      }

      // Filter for Salesforce contacts (those synced from Salesforce will have IDs starting with '003')
      const salesforceContacts = data?.filter(contact => 
        contact.salesforce_id && contact.salesforce_id.startsWith('003')
      ) || [];

      setRecentLeads(salesforceContacts);
      
      toast({
        title: "Recent Records Loaded",
        description: `Loaded ${salesforceContacts.length} recent Salesforce contacts.`,
      });
    } catch (error) {
      console.error('Error loading Salesforce leads:', error);
      toast({
        title: "Load Failed",
        description: "Failed to load recent Salesforce leads.",
        variant: "destructive",
      });
    }
  };

  const loadAllSalesforceLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .not('salesforce_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(50); // Load more records for browsing

      if (error) {
        throw new Error(error.message);
      }

      setRecentLeads(data || []);
      toast({
        title: "Records Loaded",
        description: `Loaded ${data?.length || 0} Salesforce records for selection.`,
      });
    } catch (error) {
      console.error('Error loading all Salesforce leads:', error);
      toast({
        title: "Load Failed",
        description: "Failed to load Salesforce records.",
        variant: "destructive",
      });
    }
  };

  const selectLead = (lead: any) => {
    setLeadData(JSON.stringify(lead, null, 2));
    setSelectedLeads([lead]);
    toast({
      title: "Record Selected",
      description: `Selected ${lead.first_name} ${lead.last_name} for single analysis.`,
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
      title: "All Records Selected",
      description: `Selected ${recentLeads.length} records for bulk analysis.`,
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
      
      // Process results into structured format
      const bulkAnalysisResults: BulkAnalysisResult[] = selectedLeads.map((lead, index) => {
        const result = results[index];
        return {
          lead,
          analysis: result.error ? null : result.data.analysis,
          success: !result.error,
          error: result.error?.message
        };
      });
      
      // Store bulk results
      setBulkResults(bulkAnalysisResults);
      
      const successful = bulkAnalysisResults.filter(r => r.success);
      const failed = bulkAnalysisResults.filter(r => !r.success);

      toast({
        title: "Bulk Analysis Complete",
        description: `Analyzed ${successful.length} leads successfully. ${failed.length} failed.`,
      });

      // Clear single analysis display since we now have bulk results
      setAnalysis(null);
      setLeadData('');

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

  const exportIndividualToHubSpot = async (lead: any, analysis: AnalysisResult) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('hubspot-export', {
        body: {
          leadData: lead,
          analysis: analysis,
          platform: selectedPlatform
        },
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) throw new Error(error.message);

      toast({
        title: "Export Successful",
        description: `${lead.first_name} ${lead.last_name}'s analysis exported to HubSpot.`,
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

  const exportIndividualToSalesforce = async (lead: any, analysis: AnalysisResult) => {
    if (!user) return;
    
    try {
      console.log('🚀 Starting Salesforce export for:', lead.first_name, lead.last_name);
      
      const { data, error } = await supabase.functions.invoke('salesforce-export', {
        body: {
          leadData: lead,
          analysis: analysis,
          platform: selectedPlatform
        },
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      console.log('📤 Export response:', { data, error });

      if (error) {
        console.error('❌ Export error details:', error);
        throw new Error(error.message);
      }

      // Handle successful response or graceful handling of missing records
      if (data?.success === false && data?.action === 'cleared_invalid_id') {
        toast({
          title: "Salesforce Record Not Found",
          description: "The Salesforce record was not found and has been cleared from the contact. Please sync with Salesforce again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Export Successful",
        description: `${lead.first_name} ${lead.last_name}'s analysis exported to Salesforce.`,
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

  const viewDetailedAnalysis = (lead: any, analysis: AnalysisResult) => {
    setLeadData(JSON.stringify(lead, null, 2));
    setAnalysis(analysis);
    setBulkResults([]); // Clear bulk results to show single analysis
    toast({
      title: "Viewing Details",
      description: `Showing detailed analysis for ${lead.first_name} ${lead.last_name}.`,
    });
  };

  const exportAllSuccessfulResults = async () => {
    if (!user) return;
    
    const successfulResults = bulkResults.filter(r => r.success);
    if (successfulResults.length === 0) return;

    try {
      const session = await supabase.auth.getSession();
      const authToken = session.data.session?.access_token;

      const exportPromises = successfulResults.map(result => {
        if (selectedPlatform === 'hubspot') {
          return supabase.functions.invoke('hubspot-export', {
            body: {
              leadData: result.lead,
              analysis: result.analysis,
              platform: selectedPlatform
            },
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          });
        } else {
          return supabase.functions.invoke('salesforce-export', {
            body: {
              leadData: result.lead,
              analysis: result.analysis,
              platform: selectedPlatform
            },
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          });
        }
      });

      const results = await Promise.all(exportPromises);
      const successful = results.filter(r => !r.error).length;
      const failed = results.filter(r => r.error).length;

      toast({
        title: "Bulk Export Complete",
        description: `Exported ${successful} results successfully. ${failed} failed.`,
      });
    } catch (error) {
      console.error('Error in bulk export:', error);
      toast({
        title: "Bulk Export Failed",
        description: "Failed to export results.",
        variant: "destructive",
      });
    }
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
              <div className="flex flex-wrap gap-2">
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
                  onClick={() => syncSalesforceData('lead')}
                  variant="outline"
                  size="sm"
                  disabled={isSyncing}
                  className="border-green-300 text-green-700 hover:bg-green-100"
                >
                  {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sync Leads'}
                </Button>
                <Button
                  onClick={() => loadRecentSalesforceLeads()}
                  variant="outline"
                  size="sm" 
                  className="border-green-300 text-green-700 hover:bg-green-100"
                >
                  Load Recent Records
                </Button>
                <Button
                  onClick={() => loadAllSalesforceLeads()}
                  variant="outline"
                  size="sm" 
                  className="border-green-300 text-green-700 hover:bg-green-100"
                >
                  Browse All Records
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
                <label className="text-sm font-medium">
                  {selectedPlatform === 'hubspot' ? 'HubSpot' : 'Salesforce'} Records 
                  ({recentLeads.length} loaded)
                </label>
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
                      {selectedLeads.length} record{selectedLeads.length > 1 ? 's' : ''} selected 
                      {selectedLeads.length === 1 ? ' for single analysis' : ' for bulk analysis'}
                    </span>
                    <Button
                      onClick={selectedLeads.length === 1 ? handleAnalyze : analyzeBulkLeads}
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
                          {selectedLeads.length === 1 ? 'Analyze Single Record' : `Analyze ${selectedLeads.length} Records`}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              <div className="grid gap-2 max-h-60 overflow-y-auto">
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
                          title={isSelected ? "Remove from selection" : "Add to selection"}
                        >
                          {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                        </button>
                        <div 
                          className="flex-1 cursor-pointer"
                          onClick={() => selectLead(lead)}
                          title="Click to select for single analysis"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h5 className="font-medium">{lead.first_name} {lead.last_name}</h5>
                              <p className="text-sm text-gray-600">{lead.email}</p>
                              <p className="text-xs text-gray-500">
                                {lead.title ? `${lead.title} • ` : ''}
                                {lead.company || 'No company'} 
                                {lead.salesforce_id && <span className="ml-2 text-green-600">• SF: {lead.salesforce_type}</span>}
                              </p>
                            </div>
                            <div className="text-xs text-gray-400">
                              <div>{lead.status}</div>
                              {lead.lead_score > 0 && (
                                <div className="text-blue-600 font-medium">Score: {lead.lead_score}</div>
                              )}
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

      {/* Bulk Analysis Results */}
      {bulkResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Bulk Analysis Results
              <Badge variant="outline">
                {bulkResults.filter(r => r.success).length} / {bulkResults.length} Successful
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              {bulkResults.map((result, index) => (
                <Card key={index} className={`${result.success ? 'border-green-200' : 'border-red-200'}`}>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h5 className="font-medium">{result.lead.first_name} {result.lead.last_name}</h5>
                        <p className="text-sm text-muted-foreground">{result.lead.email}</p>
                        <p className="text-xs text-muted-foreground">{result.lead.title} • {result.lead.company || 'No company'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {result.success ? (
                          <>
                            <Badge className={getPriorityColor(result.analysis.priorityLevel)}>
                              {result.analysis.priorityLevel}
                            </Badge>
                            <div className={`text-lg font-semibold ${getScoreColor(result.analysis.leadScore)}`}>
                              {result.analysis.leadScore}/100
                            </div>
                          </>
                        ) : (
                          <Badge variant="destructive">Failed</Badge>
                        )}
                      </div>
                    </div>

                    {result.success ? (
                      <div className="space-y-3">
                        <div className="p-3 bg-muted rounded-lg">
                          <p className="text-sm">{result.analysis.summary}</p>
                        </div>
                        
                        <div className="grid md:grid-cols-3 gap-3">
                          <div className="text-center p-2 bg-green-50 rounded">
                            <div className="text-xs text-green-600 font-medium">Revenue Potential</div>
                            <div className="text-sm font-semibold text-green-700">
                              {result.analysis.opportunityAssessment.revenuePotential}
                            </div>
                          </div>
                          <div className="text-center p-2 bg-blue-50 rounded">
                            <div className="text-xs text-blue-600 font-medium">Timeline</div>
                            <div className="text-sm font-semibold text-blue-700">
                              {result.analysis.opportunityAssessment.timeline}
                            </div>
                          </div>
                          <div className="text-center p-2 bg-purple-50 rounded">
                            <div className="text-xs text-purple-600 font-medium">Confidence</div>
                            <div className="text-sm font-semibold text-purple-700">
                              {result.analysis.opportunityAssessment.confidence}
                            </div>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-3">
                          <div>
                            <h6 className="text-xs font-medium text-muted-foreground mb-1">Key Insights</h6>
                            <ul className="space-y-1">
                              {result.analysis.keyInsights.slice(0, 2).map((insight, idx) => (
                                <li key={idx} className="text-xs flex items-start gap-1">
                                  <div className="w-1 h-1 bg-blue-600 rounded-full mt-1.5 flex-shrink-0" />
                                  <span>{insight}</span>
                                </li>
                              ))}
                              {result.analysis.keyInsights.length > 2 && (
                                <li className="text-xs text-muted-foreground">
                                  +{result.analysis.keyInsights.length - 2} more insights
                                </li>
                              )}
                            </ul>
                          </div>
                          <div>
                            <h6 className="text-xs font-medium text-muted-foreground mb-1">Recommended Actions</h6>
                            <ul className="space-y-1">
                              {result.analysis.recommendedActions.slice(0, 2).map((action, idx) => (
                                <li key={idx} className="text-xs flex items-start gap-1">
                                  <div className="w-1 h-1 bg-green-600 rounded-full mt-1.5 flex-shrink-0" />
                                  <span>{action}</span>
                                </li>
                              ))}
                              {result.analysis.recommendedActions.length > 2 && (
                                <li className="text-xs text-muted-foreground">
                                  +{result.analysis.recommendedActions.length - 2} more actions
                                </li>
                              )}
                            </ul>
                          </div>
                        </div>

                        {/* Individual Export Buttons */}
                        <div className="flex gap-2 pt-2">
                          {selectedPlatform === 'hubspot' && (
                            <Button
                              onClick={() => exportIndividualToHubSpot(result.lead, result.analysis)}
                              variant="outline"
                              size="sm"
                              className="text-xs border-orange-300 text-orange-700 hover:bg-orange-100"
                            >
                              Export to HubSpot
                            </Button>
                          )}
                          {selectedPlatform === 'salesforce' && (
                            <Button
                              onClick={() => exportIndividualToSalesforce(result.lead, result.analysis)}
                              variant="outline"
                              size="sm"
                              className="text-xs border-green-300 text-green-700 hover:bg-green-100"
                            >
                              Export to Salesforce
                            </Button>
                          )}
                          <Button
                            onClick={() => viewDetailedAnalysis(result.lead, result.analysis)}
                            variant="outline"
                            size="sm"
                            className="text-xs"
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-red-50 rounded-lg">
                        <p className="text-sm text-red-700">Analysis failed: {result.error}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Bulk Export Actions */}
            <div className="flex gap-2 pt-4 border-t">
              <Button
                onClick={exportAllSuccessfulResults}
                disabled={bulkResults.filter(r => r.success).length === 0}
                className="flex-1"
              >
                Export All Successful Results ({bulkResults.filter(r => r.success).length})
              </Button>
              <Button
                onClick={() => setBulkResults([])}
                variant="outline"
              >
                Clear Results
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}