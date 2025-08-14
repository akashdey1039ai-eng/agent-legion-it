import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Download, Loader2, Database, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export default function SalesforceDataExtractor() {
  const [isLoading, setIsLoading] = useState(false);
  const [salesforceData, setSalesforceData] = useState('');
  const [dataType, setDataType] = useState<'leads' | 'contacts' | 'opportunities'>('leads');
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchSalesforceData = async (objectType: string) => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Map UI object types to API object types and database tables
      const objectTypeMap: Record<string, { apiType: string, table: 'contacts' | 'opportunities' }> = {
        'leads': { apiType: 'contact', table: 'contacts' },
        'contacts': { apiType: 'contact', table: 'contacts' }, 
        'opportunities': { apiType: 'opportunity', table: 'opportunities' }
      };

      const config = objectTypeMap[objectType];
      if (!config) {
        throw new Error(`Unsupported object type: ${objectType}`);
      }

      // First, sync data from Salesforce
      const { error: syncError } = await supabase.functions.invoke('salesforce-sync', {
        body: {
          objectType: config.apiType,
          userId: user.id,
          direction: 'from_salesforce'
        }
      });

      if (syncError) {
        throw new Error(syncError.message);
      }

      // Then, fetch the synced data from our database
      const { data: records, error: fetchError } = await supabase
        .from(config.table)
        .select('*')
        .not('salesforce_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(5);

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      // Format the data nicely
      const formattedData = JSON.stringify({ records: records || [] }, null, 2);
      setSalesforceData(formattedData);
      
      toast({
        title: "Data Retrieved",
        description: `Successfully fetched ${records?.length || 0} ${objectType} from Salesforce sandbox.`,
      });

    } catch (error) {
      console.error('Error fetching Salesforce data:', error);
      toast({
        title: "Fetch Failed",
        description: error.message || "Failed to fetch Salesforce data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const extractSingleRecord = () => {
    try {
      const data = JSON.parse(salesforceData);
      
      // Try to find the records array in different possible structures
      let records = [];
      if (data.records) {
        records = data.records;
      } else if (data.data && data.data.records) {
        records = data.data.records;
      } else if (Array.isArray(data)) {
        records = data;
      } else if (Array.isArray(data.data)) {
        records = data.data;
      }

      if (records && records.length > 0) {
        const singleRecord = records[0];
        const formattedRecord = JSON.stringify(singleRecord, null, 2);
        
        // Copy to clipboard
        navigator.clipboard.writeText(formattedRecord);
        
        toast({
          title: "Record Copied",
          description: "Single record JSON copied to clipboard for AI testing.",
        });
        
        return formattedRecord;
      } else {
        toast({
          title: "No Records Found",
          description: "No records available to extract.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Parse Error",
        description: "Could not parse the data as JSON.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-600" />
          Salesforce Data Extractor
        </CardTitle>
        <CardDescription>
          Pull real data from your Salesforce sandbox for AI agent testing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Data Type</label>
          <div className="flex gap-2">
            <Button
              variant={dataType === 'leads' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDataType('leads')}
            >
              Leads
            </Button>
            <Button
              variant={dataType === 'contacts' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDataType('contacts')}
            >
              Contacts
            </Button>
            <Button
              variant={dataType === 'opportunities' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDataType('opportunities')}
            >
              Opportunities
            </Button>
          </div>
        </div>

        <Button 
          onClick={() => fetchSalesforceData(dataType)} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Fetching {dataType}...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Fetch {dataType} Data
            </>
          )}
        </Button>

        {salesforceData && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Data Retrieved
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={extractSingleRecord}
              >
                <Download className="w-4 h-4 mr-2" />
                Copy Single Record
              </Button>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Salesforce JSON Data</label>
              <Textarea
                value={salesforceData}
                readOnly
                rows={12}
                className="font-mono text-xs"
                placeholder="Fetched Salesforce data will appear here..."
              />
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">How to Use This Data</h4>
              <ol className="text-sm text-blue-700 space-y-1">
                <li>1. Click "Copy Single Record" to get one formatted record</li>
                <li>2. Go to the Lead Intelligence Agent</li>
                <li>3. Paste the copied JSON into the Lead Data field</li>
                <li>4. Click "Analyze Lead" to test with real Salesforce data</li>
              </ol>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}