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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();
    console.log(`🧪 Running comprehensive AI agent tests for user: ${userId}`);

    const testResults = {
      salesforce: {},
      hubspot: {},
      native: {},
      summary: {
        totalTests: 0,
        passed: 0,
        failed: 0,
        errors: []
      }
    };

    // Define all agent types to test
    const agentTypes = [
      'lead-intelligence',
      'pipeline-analysis', 
      'customer-sentiment',
      'churn-prediction',
      'customer-segmentation',
      'opportunity-scoring',
      'communication-ai',
      'sales-coaching'
    ];

    // Test Salesforce AI agents
    console.log('🔍 Testing Salesforce AI agents...');
    for (const agentType of agentTypes) {
      try {
        testResults.summary.totalTests++;
        
        const response = await supabase.functions.invoke('salesforce-ai-agent-tester', {
          body: { agentType, userId }
        });

        if (response.error) {
          throw new Error(response.error.message || 'Unknown error');
        }

        testResults.salesforce[agentType] = {
          status: 'PASSED',
          response: response.data
        };
        testResults.summary.passed++;
        console.log(`✅ Salesforce ${agentType}: PASSED`);
        
      } catch (error) {
        testResults.salesforce[agentType] = {
          status: 'FAILED',
          error: error.message
        };
        testResults.summary.failed++;
        testResults.summary.errors.push(`Salesforce ${agentType}: ${error.message}`);
        console.log(`❌ Salesforce ${agentType}: FAILED - ${error.message}`);
      }
    }

    // Test HubSpot AI agents
    console.log('🔍 Testing HubSpot AI agents...');
    for (const agentType of agentTypes) {
      try {
        testResults.summary.totalTests++;
        
        const response = await supabase.functions.invoke('hubspot-ai-agent-tester', {
          body: { agentType, userId }
        });

        if (response.error) {
          throw new Error(response.error.message || 'Unknown error');
        }

        testResults.hubspot[agentType] = {
          status: 'PASSED',
          response: response.data
        };
        testResults.summary.passed++;
        console.log(`✅ HubSpot ${agentType}: PASSED`);
        
      } catch (error) {
        testResults.hubspot[agentType] = {
          status: 'FAILED',
          error: error.message
        };
        testResults.summary.failed++;
        testResults.summary.errors.push(`HubSpot ${agentType}: ${error.message}`);
        console.log(`❌ HubSpot ${agentType}: FAILED - ${error.message}`);
      }
    }

    // Test Native AI agents  
    console.log('🔍 Testing Native AI agents...');
    
    for (const agentType of agentTypes) {
      try {
        testResults.summary.totalTests++;
        
        const response = await supabase.functions.invoke('enhanced-ai-agent-executor', {
          body: { agentType, userId }
        });

        if (response.error) {
          throw new Error(response.error.message || 'Unknown error');
        }

        testResults.native[agentType] = {
          status: 'PASSED',
          response: response.data
        };
        testResults.summary.passed++;
        console.log(`✅ Native ${agentType}: PASSED`);
        
      } catch (error) {
        testResults.native[agentType] = {
          status: 'FAILED',
          error: error.message
        };
        testResults.summary.failed++;
        testResults.summary.errors.push(`Native ${agentType}: ${error.message}`);
        console.log(`❌ Native ${agentType}: FAILED - ${error.message}`);
      }
    }

    // Generate comprehensive report
    const report = {
      ...testResults,
      success: testResults.summary.failed === 0,
      completedAt: new Date().toISOString(),
      recommendations: []
    };

    if (testResults.summary.failed > 0) {
      report.recommendations.push('Check OpenAI API key configuration and quota');
      report.recommendations.push('Verify Salesforce/HubSpot connection tokens');
      report.recommendations.push('Review edge function logs for detailed error information');
    }

    console.log(`🎯 Test Summary: ${testResults.summary.passed}/${testResults.summary.totalTests} passed`);
    
    return new Response(JSON.stringify(report), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('❌ Error in AI agent test runner:', error);
    return new Response(JSON.stringify({
      error: error.message,
      details: error.stack,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});