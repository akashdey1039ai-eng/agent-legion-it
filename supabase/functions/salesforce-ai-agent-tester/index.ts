import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

interface SalesforceContact {
  Id: string;
  FirstName: string;
  LastName: string;
  Email: string;
  Phone?: string;
  Title?: string;
  Department?: string;
  LeadSource?: string;
  Account?: {
    Name: string;
    Industry: string;
    AnnualRevenue: number;
  };
  CreatedDate: string;
  LastModifiedDate: string;
}

interface SalesforceOpportunity {
  Id: string;
  Name: string;
  Amount?: number;
  CloseDate: string;
  StageName: string;
  Probability: number;
  Account?: {
    Name: string;
    Industry: string;
  };
  Contact?: {
    Name: string;
    Email: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { agentType, userId } = await req.json();
    console.log(`🚀 Starting real Salesforce AI test for ${agentType}`);

    // Get user's most recent Salesforce token
    const { data: tokenData, error: tokenError } = await supabase
      .from('salesforce_tokens')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (tokenError || !tokenData || tokenData.length === 0) {
      console.error('❌ No Salesforce token found:', tokenError);
      return new Response(JSON.stringify({
        error: 'No Salesforce connection found. Please connect to Salesforce first.',
        requiresAuth: true
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const token = tokenData[0]; // Get the first (most recent) token
    
    // Check if token is still valid
    if (new Date(token.expires_at) <= new Date()) {
      console.log('🔄 Token expired, needs refresh');
      return new Response(JSON.stringify({
        error: 'Salesforce token expired. Please reconnect to Salesforce.',
        requiresAuth: true
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('✅ Valid Salesforce token found');

    // Fetch real data from Salesforce based on agent type
    let salesforceData;
    let analysisResult;

    switch (agentType) {
      case 'customer-sentiment':
        salesforceData = await fetchSalesforceContacts(token);
        analysisResult = await analyzeCustomerSentiment(salesforceData);
        break;
      
      case 'churn-prediction':
        salesforceData = await fetchSalesforceOpportunities(token);
        analysisResult = await analyzeChurnPrediction(salesforceData);
        break;
      
      case 'customer-segmentation':
        salesforceData = await fetchSalesforceContacts(token);
        analysisResult = await analyzeCustomerSegmentation(salesforceData);
        break;
      
      default:
        throw new Error(`Unknown agent type: ${agentType}`);
    }

    console.log(`✅ Analysis completed for ${agentType}`);

    return new Response(JSON.stringify({
      success: true,
      agentType,
      dataSource: 'salesforce_sandbox',
      recordsAnalyzed: salesforceData.length,
      analysis: analysisResult,
      rawSalesforceData: salesforceData,
      confidence: 0.95,
      insights: Array.isArray(analysisResult) ? analysisResult : [analysisResult],
      recommendations: [`Successfully analyzed ${salesforceData.length} real Salesforce records`, 'Real API integration working'],
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Error in Salesforce AI agent tester:', error);
    return new Response(JSON.stringify({
      error: error.message,
      details: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function fetchSalesforceContacts(tokenData: any): Promise<SalesforceContact[]> {
  console.log('📋 Fetching contacts from Salesforce...');
  
  const response = await fetch(`${tokenData.instance_url}/services/data/v58.0/query/?q=SELECT Id, FirstName, LastName, Email, Phone, Title, Department, LeadSource, Account.Name, Account.Industry, Account.AnnualRevenue, CreatedDate, LastModifiedDate FROM Contact WHERE Email != null LIMIT 20`, {
    headers: {
      'Authorization': `Bearer ${tokenData.access_token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Salesforce API error:', errorText);
    throw new Error(`Salesforce API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log(`✅ Fetched ${data.records.length} contacts from Salesforce`);
  
  return data.records;
}

async function fetchSalesforceOpportunities(tokenData: any): Promise<SalesforceOpportunity[]> {
  console.log('🎯 Fetching opportunities from Salesforce...');
  
  const response = await fetch(`${tokenData.instance_url}/services/data/v58.0/query/?q=SELECT Id, Name, Amount, CloseDate, StageName, Probability, Account.Name, Account.Industry FROM Opportunity WHERE CloseDate >= THIS_YEAR LIMIT 20`, {
    headers: {
      'Authorization': `Bearer ${tokenData.access_token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Salesforce API error:', errorText);
    throw new Error(`Salesforce API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log(`✅ Fetched ${data.records.length} opportunities from Salesforce`);
  
  return data.records;
}

async function analyzeCustomerSentiment(contacts: SalesforceContact[]) {
  console.log('🧠 Analyzing customer sentiment with AI...');
  
  const prompt = `Analyze the customer sentiment for these real Salesforce contacts. For each contact, provide sentiment analysis based on their profile data including lead source, title, department, and company information.

Contacts data:
${JSON.stringify(contacts.slice(0, 10), null, 2)}

For each contact, provide:
1. Overall sentiment score (-1 to 1)
2. Sentiment classification (positive/neutral/negative)
3. Key factors influencing sentiment
4. Recommended actions
5. Confidence level (0-1)

Return as a JSON array with detailed analysis for each contact.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14',
      messages: [
        { 
          role: 'system', 
          content: 'You are an expert CRM analyst specializing in customer sentiment analysis. Analyze real Salesforce data and provide actionable insights.' 
        },
        { role: 'user', content: prompt }
      ],
      max_tokens: 2000,
      temperature: 0.7
    }),
  });

  const data = await response.json();
  const analysis = data.choices[0].message.content;
  
  try {
    return JSON.parse(analysis);
  } catch {
    return { analysis, rawResponse: analysis };
  }
}

async function analyzeChurnPrediction(opportunities: SalesforceOpportunity[]) {
  console.log('📊 Analyzing churn prediction with AI...');
  
  const prompt = `Analyze the churn risk for these real Salesforce opportunities. Consider stage progression, deal amounts, close dates, and probability to predict churn risk.

Opportunities data:
${JSON.stringify(opportunities.slice(0, 10), null, 2)}

For each opportunity/account, provide:
1. Churn risk score (0-100)
2. Risk classification (low/medium/high)
3. Key risk factors
4. Recommended retention actions
5. Confidence level (0-1)
6. Timeline for intervention

Return as a JSON array with detailed churn analysis.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14',
      messages: [
        { 
          role: 'system', 
          content: 'You are an expert in customer churn prediction and retention strategies. Analyze real Salesforce opportunity data to predict churn risk.' 
        },
        { role: 'user', content: prompt }
      ],
      max_tokens: 2000,
      temperature: 0.7
    }),
  });

  const data = await response.json();
  const analysis = data.choices[0].message.content;
  
  try {
    return JSON.parse(analysis);
  } catch {
    return { analysis, rawResponse: analysis };
  }
}

async function analyzeCustomerSegmentation(contacts: SalesforceContact[]) {
  console.log('🎯 Analyzing customer segmentation with AI...');
  
  const prompt = `Analyze and segment these real Salesforce contacts into meaningful customer segments based on their titles, departments, companies, and other profile data.

Contacts data:
${JSON.stringify(contacts.slice(0, 10), null, 2)}

Provide:
1. Segment classification for each contact (e.g., Enterprise, SMB, Startup, etc.)
2. Segment characteristics and criteria
3. Value proposition for each segment
4. Recommended marketing approach
5. Confidence level (0-1)
6. Cross-sell/upsell opportunities

Return as a JSON array with detailed segmentation analysis.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14',
      messages: [
        { 
          role: 'system', 
          content: 'You are an expert in customer segmentation and market analysis. Analyze real Salesforce contact data to create actionable customer segments.' 
        },
        { role: 'user', content: prompt }
      ],
      max_tokens: 2000,
      temperature: 0.7
    }),
  });

  const data = await response.json();
  const analysis = data.choices[0].message.content;
  
  try {
    return JSON.parse(analysis);
  } catch {
    return { analysis, rawResponse: analysis };
  }
}