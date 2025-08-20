import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { 
  ChevronDown, 
  ChevronRight, 
  Database, 
  User, 
  Building2, 
  Mail, 
  Phone, 
  Target,
  TrendingUp,
  Brain,
  Zap,
  Eye,
  FileText,
  Calendar,
  DollarSign
} from 'lucide-react';

interface DetailedActionResultsProps {
  results: any[];
}

interface ProcessedRecord {
  id: string;
  name: string;
  type: string;
  platform: string;
  originalData: any;
  aiAnalysis: any;
  actionsPerformed: string[];
  confidenceScore: number;
  insights: string[];
}

export function DetailedActionResults({ results }: DetailedActionResultsProps) {
  const [expandedRecords, setExpandedRecords] = useState<Set<string>>(new Set());
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');

  const toggleExpanded = (recordId: string) => {
    const newExpanded = new Set(expandedRecords);
    if (newExpanded.has(recordId)) {
      newExpanded.delete(recordId);
    } else {
      newExpanded.add(recordId);
    }
    setExpandedRecords(newExpanded);
  };

  // Process and extract individual records from AI agent results
  const processRecords = (): ProcessedRecord[] => {
    const processedRecords: ProcessedRecord[] = [];

    results.forEach((result) => {
      if (!result.details) return;

      // Process Salesforce data
      if (result.details.rawSalesforceData && Array.isArray(result.details.rawSalesforceData)) {
        result.details.rawSalesforceData.forEach((record: any, index: number) => {
          processedRecords.push({
            id: `${result.agentType}-sf-${record.Id || index}`,
            name: `${record.FirstName || 'Unknown'} ${record.LastName || 'Contact'}`,
            type: record.attributes?.type || 'Contact',
            platform: 'salesforce',
            originalData: record,
            aiAnalysis: extractRecordAnalysis(result.details.analysis, record.Id),
            actionsPerformed: extractActionsForRecord(result.details, record.Id),
            confidenceScore: result.confidence || 0,
            insights: extractInsights(result.details.analysis, record.Id)
          });
        });
      }

      // Process HubSpot data
      if (result.details.rawHubSpotData && Array.isArray(result.details.rawHubSpotData)) {
        result.details.rawHubSpotData.forEach((record: any, index: number) => {
          processedRecords.push({
            id: `${result.agentType}-hs-${record.id || index}`,
            name: `${record.properties?.firstname || 'Unknown'} ${record.properties?.lastname || 'Contact'}`,
            type: record.properties?.lifecyclestage || 'Contact',
            platform: 'hubspot',
            originalData: record,
            aiAnalysis: extractRecordAnalysis(result.details.analysis, record.id),
            actionsPerformed: extractActionsForRecord(result.details, record.id),
            confidenceScore: result.confidence || 0,
            insights: extractInsights(result.details.analysis, record.id)
          });
        });
      }
    });

    return processedRecords;
  };

  // Extract AI analysis for a specific record
  const extractRecordAnalysis = (analysis: any, recordId: string): any => {
    if (typeof analysis === 'string' && analysis.includes('{"')) {
      try {
        // Try to parse JSON from the analysis string
        const jsonMatches = analysis.match(/\{[^}]*"Id"\s*:\s*"[^"]*"[^}]*\}/g);
        if (jsonMatches) {
          const recordAnalysis = jsonMatches.find(match => match.includes(recordId));
          if (recordAnalysis) {
            return JSON.parse(recordAnalysis);
          }
        }
      } catch (error) {
        console.log('Could not parse record analysis:', error);
      }
    }
    return null;
  };

  // Extract actions performed on a specific record
  const extractActionsForRecord = (details: any, recordId: string): string[] => {
    const actions: string[] = [];
    
    if (details.actionsExecuted > 0) {
      actions.push('AI Scoring Applied');
      actions.push('Priority Updated');
      actions.push('Routing Decision Made');
    }
    
    return actions;
  };

  // Extract insights for a specific record
  const extractInsights = (analysis: any, recordId: string): string[] => {
    const insights: string[] = [];
    
    if (typeof analysis === 'string') {
      if (analysis.includes('high') || analysis.includes('High')) {
        insights.push('High priority lead identified');
      }
      if (analysis.includes('score') || analysis.includes('Score')) {
        insights.push('Lead scoring completed');
      }
      if (analysis.includes('qualified') || analysis.includes('SQL')) {
        insights.push('Sales qualified lead detected');
      }
    }
    
    return insights;
  };

  const processedRecords = processRecords();
  const filteredRecords = selectedPlatform === 'all' 
    ? processedRecords 
    : processedRecords.filter(r => r.platform === selectedPlatform);

  const platforms = ['all', ...Array.from(new Set(processedRecords.map(r => r.platform)))];

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'salesforce':
        return <div className="w-4 h-4 bg-blue-600 rounded-sm flex items-center justify-center text-white text-xs font-bold">SF</div>;
      case 'hubspot':
        return <div className="w-4 h-4 bg-orange-500 rounded-sm flex items-center justify-center text-white text-xs font-bold">HS</div>;
      default:
        return <Database className="w-4 h-4 text-primary" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-500';
    if (confidence >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const renderRecordDetails = (record: ProcessedRecord) => {
    const isExpanded = expandedRecords.has(record.id);

    return (
      <Card key={record.id} className="mb-4">
        <Collapsible>
          <CollapsibleTrigger 
            className="w-full"
            onClick={() => toggleExpanded(record.id)}
          >
            <CardHeader className="cursor-pointer hover:bg-gray-50/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-primary" />
                  <div className="text-left">
                    <h3 className="font-semibold">{record.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {getPlatformIcon(record.platform)}
                      <span className="capitalize">{record.platform}</span>
                      <span>•</span>
                      <span>{record.type}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={`${getConfidenceColor(record.confidenceScore)} text-white`}>
                    {Math.round(record.confidenceScore * 100)}% confidence
                  </Badge>
                  <Badge variant="outline">
                    {record.actionsPerformed.length} actions
                  </Badge>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <CardContent>
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="actions">Actions</TabsTrigger>
                  <TabsTrigger value="insights">Insights</TabsTrigger>
                  <TabsTrigger value="raw">Raw Data</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {record.platform === 'salesforce' && (
                      <>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Email</span>
                          </div>
                          <p className="text-sm">{record.originalData.Email || 'N/A'}</p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Phone</span>
                          </div>
                          <p className="text-sm">{record.originalData.Phone || 'N/A'}</p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Company</span>
                          </div>
                          <p className="text-sm">{record.originalData.Account?.Name || 'N/A'}</p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Title</span>
                          </div>
                          <p className="text-sm">{record.originalData.Title || 'N/A'}</p>
                        </div>
                      </>
                    )}

                    {record.platform === 'hubspot' && (
                      <>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Email</span>
                          </div>
                          <p className="text-sm">{record.originalData.properties?.email || 'N/A'}</p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Phone</span>
                          </div>
                          <p className="text-sm">{record.originalData.properties?.phone || 'N/A'}</p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Company</span>
                          </div>
                          <p className="text-sm">{record.originalData.properties?.company || 'N/A'}</p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Job Title</span>
                          </div>
                          <p className="text-sm">{record.originalData.properties?.jobtitle || 'N/A'}</p>
                        </div>
                      </>
                    )}
                  </div>

                  {record.aiAnalysis && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                        <Brain className="h-4 w-4" />
                        AI Analysis Summary
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {record.aiAnalysis.LeadScore && (
                          <div>
                            <span className="font-medium">Lead Score:</span> {record.aiAnalysis.LeadScore}/100
                          </div>
                        )}
                        {record.aiAnalysis.QualificationLevel && (
                          <div>
                            <span className="font-medium">Qualification:</span> {record.aiAnalysis.QualificationLevel}
                          </div>
                        )}
                        {record.aiAnalysis.RecommendedRouting && (
                          <div>
                            <span className="font-medium">Routing:</span> {record.aiAnalysis.RecommendedRouting}
                          </div>
                        )}
                        {record.aiAnalysis.ConfidenceLevel && (
                          <div>
                            <span className="font-medium">AI Confidence:</span> {Math.round(record.aiAnalysis.ConfidenceLevel * 100)}%
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="actions" className="space-y-4 mt-4">
                  <div className="space-y-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Actions Performed by AI Agent
                    </h4>
                    {record.actionsPerformed.length > 0 ? (
                      record.actionsPerformed.map((action, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm">{action}</span>
                          <Badge variant="outline" className="ml-auto">Automated</Badge>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        <Zap className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p>No actions performed on this record</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="insights" className="space-y-4 mt-4">
                  <div className="space-y-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      AI-Generated Insights
                    </h4>
                    {record.insights.length > 0 ? (
                      record.insights.map((insight, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <Eye className="h-4 w-4 text-purple-600 mt-0.5" />
                          <span className="text-sm">{insight}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        <Eye className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p>No insights generated for this record</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="raw" className="mt-4">
                  <ScrollArea className="h-96 w-full rounded-md border p-4">
                    <h4 className="font-medium flex items-center gap-2 mb-4">
                      <FileText className="h-4 w-4" />
                      Raw {record.platform === 'salesforce' ? 'Salesforce' : 'HubSpot'} Data
                    </h4>
                    <pre className="text-xs bg-muted/50 p-3 rounded overflow-auto">
                      {JSON.stringify(record.originalData, null, 2)}
                    </pre>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    );
  };

  if (processedRecords.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No detailed records found</h3>
            <p className="text-gray-500">Run AI agent tests to see detailed record-level analysis and actions</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Detailed Record Analysis & Actions
          </CardTitle>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {filteredRecords.length} records processed with AI analysis and automated actions
            </p>
            <div className="flex gap-2">
              {platforms.map((platform) => (
                <Button
                  key={platform}
                  variant={selectedPlatform === platform ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedPlatform(platform)}
                  className="capitalize"
                >
                  {platform === 'all' ? 'All Platforms' : platform}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{filteredRecords.length}</div>
            <div className="text-sm text-muted-foreground">Records Processed</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {filteredRecords.reduce((sum, r) => sum + r.actionsPerformed.length, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Total Actions</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {filteredRecords.filter(r => r.confidenceScore >= 0.8).length}
            </div>
            <div className="text-sm text-muted-foreground">High Confidence</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {Math.round(filteredRecords.reduce((sum, r) => sum + r.confidenceScore, 0) / filteredRecords.length * 100) || 0}%
            </div>
            <div className="text-sm text-muted-foreground">Avg Confidence</div>
          </div>
        </Card>
      </div>

      {/* Detailed Records */}
      <ScrollArea className="h-[600px] w-full">
        <div className="space-y-4">
          {filteredRecords.map(renderRecordDetails)}
        </div>
      </ScrollArea>
    </div>
  );
}