import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Salesforce Export Function Started...');
    
    const requestBody = await req.json() as {
      leadData: any;
      analysis: AnalysisResult;
      platform: string;
    };
    
    const { leadData, analysis, platform } = requestBody;
    console.log('📊 Processing export for lead:', leadData?.first_name, leadData?.last_name);
    console.log('📋 Request body keys:', Object.keys(requestBody));

    // Validate required fields
    if (!leadData || !analysis) {
      console.error('❌ Missing required fields:', { leadData: !!leadData, analysis: !!analysis });
      return new Response(JSON.stringify({ error: 'Missing leadData or analysis' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the auth header to verify the user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('❌ No authorization header found');
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    console.log('🔐 Verifying user authentication');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      console.error('❌ Authentication failed:', userError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = user.id;
    console.log(`✅ User authenticated: ${userId}`);

    // Get Salesforce tokens (most recent valid token)
    console.log('🔑 Fetching Salesforce tokens');
    const { data: tokenData, error: tokenError } = await supabase
      .from('salesforce_tokens')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (tokenError || !tokenData) {
      console.error('❌ No Salesforce tokens found for user:', userId, tokenError);
      return new Response(JSON.stringify({ error: 'Salesforce not connected' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if token is expired and refresh if needed
    if (new Date(tokenData.expires_at) <= new Date()) {
      console.log('🔄 Token expired, attempting refresh...');
      
      if (!tokenData.refresh_token) {
        console.error('❌ No refresh token available for user:', userId);
        return new Response(JSON.stringify({ error: 'Salesforce token expired - please reconnect' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Refresh the token
      const clientId = Deno.env.get('SALESFORCE_CLIENT_ID');
      const clientSecret = Deno.env.get('SALESFORCE_CLIENT_SECRET');
      
      try {
        const refreshResponse = await fetch(`${tokenData.instance_url}/services/oauth2/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            grant_type: 'refresh_token',
            client_id: clientId!,
            client_secret: clientSecret!,
            refresh_token: tokenData.refresh_token,
          }),
        });

        if (!refreshResponse.ok) {
          const errorText = await refreshResponse.text();
          console.error('❌ Token refresh failed:', errorText);
          return new Response(JSON.stringify({ error: 'Failed to refresh Salesforce token - please reconnect' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const refreshData = await refreshResponse.json();
        
        // Update the token in database
        const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString(); // 1 hour from now
        
        const { error: updateError } = await supabase
          .from('salesforce_tokens')
          .update({
            access_token: refreshData.access_token,
            expires_at: expiresAt,
            updated_at: new Date().toISOString(),
          })
          .eq('id', tokenData.id);

        if (updateError) {
          console.error('❌ Failed to update refreshed token:', updateError);
          return new Response(JSON.stringify({ error: 'Failed to save refreshed token' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Update tokenData with new access token
        tokenData.access_token = refreshData.access_token;
        console.log('✅ Token refreshed successfully');
        
      } catch (error) {
        console.error('❌ Token refresh error:', error);
        return new Response(JSON.stringify({ error: 'Token refresh failed - please reconnect' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    console.log('📤 Starting export to Salesforce...');

    // Create analysis note content
    const noteContent = `AI LEAD ANALYSIS RESULTS
━━━━━━━━━━━━━━━━━━━━━━━━━━

Lead Score: ${analysis.leadScore}/100
Priority: ${analysis.priorityLevel}
Revenue Potential: ${analysis.opportunityAssessment.revenuePotential}
Timeline: ${analysis.opportunityAssessment.timeline}
Confidence: ${analysis.opportunityAssessment.confidence}

SUMMARY:
${analysis.summary}

KEY INSIGHTS:
${analysis.keyInsights.map((insight, i) => `${i + 1}. ${insight}`).join('\n')}

RECOMMENDED ACTIONS:
${analysis.recommendedActions.map((action, i) => `${i + 1}. ${action}`).join('\n')}

${analysis.riskFactors.length > 0 ? `RISK FACTORS:\n${analysis.riskFactors.map((risk, i) => `${i + 1}. ${risk}`).join('\n')}` : ''}

Generated by AI Lead Intelligence Agent
━━━━━━━━━━━━━━━━━━━━━━━━━━`;

    // Find the contact/lead in Salesforce
    if (!leadData.salesforce_id) {
      return new Response(JSON.stringify({ error: 'Salesforce ID is required for export' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('🔍 Updating Salesforce record:', leadData.salesforce_id);

    // Determine if it's a Lead or Contact based on salesforce_type
    const objectType = leadData.salesforce_type === 'contact' ? 'Contact' : 'Lead';
    const scoreField = objectType === 'Lead' ? 'Rating' : 'Lead_Score__c';

    // Update the lead/contact with analysis results
    const updateUrl = `${tokenData.instance_url}/services/data/v60.0/sobjects/${objectType}/${leadData.salesforce_id}`;
    
    // Prepare update data based on object type
    const updateData: any = {
      Description: noteContent
    };

    // Add lead score field based on object type
    if (objectType === 'Lead') {
      updateData.Rating = analysis.priorityLevel; // Hot, Warm, Cold mapping
    } else {
      updateData.Lead_Score__c = analysis.leadScore; // Custom field for Contacts
    }

    const updateResponse = await fetch(updateUrl, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData)
    });

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error('❌ Salesforce update error:', errorText);
      throw new Error(`Failed to update Salesforce record: ${updateResponse.status}`);
    }

    console.log('✅ Salesforce record updated successfully');

    // Create a Task (activity) for the analysis
    const taskUrl = `${tokenData.instance_url}/services/data/v60.0/sobjects/Task`;
    const taskData = {
      Subject: `AI Lead Analysis - Score: ${analysis.leadScore}`,
      Description: noteContent,
      Status: 'Completed',
      Priority: analysis.priorityLevel,
      ActivityDate: new Date().toISOString().split('T')[0],
      Type: 'Other'
    };

    // Link to the appropriate record
    if (objectType === 'Lead') {
      taskData.WhoId = leadData.salesforce_id;
    } else {
      taskData.WhoId = leadData.salesforce_id;
    }

    const taskResponse = await fetch(taskUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData)
    });

    if (!taskResponse.ok) {
      const errorText = await taskResponse.text();
      console.error('⚠️ Salesforce task creation warning (record still updated):', errorText);
      // Don't fail the whole operation if task creation fails
    } else {
      const taskResult = await taskResponse.json();
      console.log('✅ Task created in Salesforce:', taskResult.id);
    }

    console.log('🎉 Export to Salesforce completed successfully');

    return new Response(JSON.stringify({
      success: true,
      message: 'Analysis exported to Salesforce successfully',
      recordId: leadData.salesforce_id,
      objectType: objectType
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('💥 FULL ERROR DETAILS:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      error: error
    });
    
    return new Response(JSON.stringify({ 
      error: 'Export failed', 
      details: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});