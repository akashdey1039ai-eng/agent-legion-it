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
    console.log(`🔍 Running diagnostics for user: ${userId}`);

    const diagnostics = {
      environment: {},
      openai: {},
      salesforce: {},
      hubspot: {},
      database: {},
      errors: []
    };

    // 1. Check environment variables
    console.log('📋 Checking environment variables...');
    diagnostics.environment = {
      supabase_url: !!Deno.env.get('SUPABASE_URL'),
      supabase_service_role_key: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
      openai_api_key: !!Deno.env.get('OPENAI_API_KEY'),
      openai_key_length: Deno.env.get('OPENAI_API_KEY')?.length || 0
    };

    // 2. Test OpenAI API
    console.log('🤖 Testing OpenAI API...');
    try {
      const openaiKey = Deno.env.get('OPENAI_API_KEY');
      if (!openaiKey) {
        throw new Error('OpenAI API key not found');
      }

      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: 'Hello, test message' }],
          max_tokens: 10
        }),
      });

      diagnostics.openai = {
        status: openaiResponse.status,
        ok: openaiResponse.ok,
        statusText: openaiResponse.statusText
      };

      if (!openaiResponse.ok) {
        const errorText = await openaiResponse.text();
        diagnostics.openai.error = errorText;
        diagnostics.errors.push(`OpenAI API error: ${openaiResponse.status} - ${errorText}`);
      } else {
        const data = await openaiResponse.json();
        diagnostics.openai.success = true;
        diagnostics.openai.model_used = data.model;
      }
    } catch (error) {
      diagnostics.openai.error = error.message;
      diagnostics.errors.push(`OpenAI test failed: ${error.message}`);
    }

    // 3. Check Salesforce tokens
    console.log('🔗 Checking Salesforce tokens...');
    try {
      const { data: salesforceTokens, error: sfError } = await supabase
        .from('salesforce_tokens')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);

      diagnostics.salesforce = {
        tokens_found: salesforceTokens?.length || 0,
        query_error: sfError?.message || null
      };

      if (salesforceTokens && salesforceTokens.length > 0) {
        const token = salesforceTokens[0];
        diagnostics.salesforce.token_expires_at = token.expires_at;
        diagnostics.salesforce.is_expired = new Date(token.expires_at) <= new Date();
        diagnostics.salesforce.instance_url = token.instance_url;
      } else {
        diagnostics.errors.push('No Salesforce tokens found for user');
      }
    } catch (error) {
      diagnostics.salesforce.error = error.message;
      diagnostics.errors.push(`Salesforce token check failed: ${error.message}`);
    }

    // 4. Check HubSpot tokens  
    console.log('🔗 Checking HubSpot tokens...');
    try {
      const { data: hubspotTokens, error: hsError } = await supabase
        .from('hubspot_tokens')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);

      diagnostics.hubspot = {
        tokens_found: hubspotTokens?.length || 0,
        query_error: hsError?.message || null
      };

      if (hubspotTokens && hubspotTokens.length > 0) {
        const token = hubspotTokens[0];
        diagnostics.hubspot.token_expires_at = token.expires_at;
        diagnostics.hubspot.is_expired = new Date(token.expires_at) <= new Date();
      } else {
        diagnostics.errors.push('No HubSpot tokens found for user');
      }
    } catch (error) {
      diagnostics.hubspot.error = error.message;
      diagnostics.errors.push(`HubSpot token check failed: ${error.message}`);
    }

    // 5. Test database connectivity
    console.log('📊 Testing database connectivity...');
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('id')
        .limit(1);

      diagnostics.database = {
        connectivity: !error,
        error: error?.message || null,
        sample_data_found: data?.length > 0
      };
    } catch (error) {
      diagnostics.database.error = error.message;
      diagnostics.errors.push(`Database test failed: ${error.message}`);
    }

    console.log('🎯 Diagnostics completed');
    console.log('📋 Summary:', JSON.stringify(diagnostics, null, 2));

    return new Response(JSON.stringify({
      success: diagnostics.errors.length === 0,
      diagnostics,
      summary: {
        total_errors: diagnostics.errors.length,
        critical_issues: diagnostics.errors,
        recommendations: generateRecommendations(diagnostics)
      },
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('❌ Error in diagnostics:', error);
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

function generateRecommendations(diagnostics: any): string[] {
  const recommendations = [];

  if (!diagnostics.environment.openai_api_key) {
    recommendations.push('Add OpenAI API key to Supabase secrets');
  }

  if (diagnostics.openai.error) {
    recommendations.push('Check OpenAI API key validity and quota');
  }

  if (diagnostics.salesforce.tokens_found === 0) {
    recommendations.push('Connect to Salesforce to enable Salesforce AI agents');
  }

  if (diagnostics.salesforce.is_expired) {
    recommendations.push('Refresh expired Salesforce token');
  }

  if (diagnostics.hubspot.tokens_found === 0) {
    recommendations.push('Connect to HubSpot to enable HubSpot AI agents');
  }

  if (diagnostics.hubspot.is_expired) {
    recommendations.push('Refresh expired HubSpot token');
  }

  if (!diagnostics.database.connectivity) {
    recommendations.push('Check database connection and RLS policies');
  }

  return recommendations;
}