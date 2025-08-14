import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔍 Lead Intelligence Agent Starting...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'); 
    
    // Get OpenAI API key with detailed debugging
    const envVars = Deno.env.toObject();
    const openAIApiKey = envVars.OPENAI_API_KEY;
    
    console.log('🔧 Detailed environment check:', {
      supabaseUrl: !!supabaseUrl,
      supabaseServiceKey: !!supabaseServiceKey,
      keyExists: 'OPENAI_API_KEY' in envVars,
      keyValue: openAIApiKey,
      keyType: typeof openAIApiKey,
      keyLength: openAIApiKey ? openAIApiKey.length : 0,
      keyTrimmed: openAIApiKey ? openAIApiKey.trim() : null,
      keyValid: !!(openAIApiKey && openAIApiKey.trim().length > 0)
    });

    if (!openAIApiKey || !openAIApiKey.trim()) {
      const errorMsg = 'OpenAI API key not accessible';
      const envKeys = Object.keys(Deno.env.toObject());
      console.error(errorMsg, { envKeys });
      return new Response(JSON.stringify({ 
        error: errorMsg, 
        success: false,
        timestamp: new Date().toISOString(),
        debug: { envKeys }
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    
    const { leadData, platform } = await req.json();
    
    if (!leadData) {
      throw new Error('Lead data is required');
    }

    console.log('📊 Analyzing lead:', { 
      name: `${leadData.first_name} ${leadData.last_name}`,
      email: leadData.email,
      platform 
    });

    // Prepare the prompt for AI analysis
    const leadInfo = `
Lead Information:
- Name: ${leadData.first_name} ${leadData.last_name}
- Email: ${leadData.email}
- Title: ${leadData.title || 'Not specified'}
- Company: ${leadData.company || 'Not specified'}
- Department: ${leadData.department || 'Not specified'}
- Phone: ${leadData.phone || 'Not specified'}
- Lead Source: ${leadData.lead_source || 'Not specified'}
- Current Status: ${leadData.status || 'new'}
- Lead Score: ${leadData.lead_score || 0}
- Platform: ${platform}
`;

    const systemPrompt = `You are an expert lead intelligence analyst. Analyze the provided lead data and provide a comprehensive assessment including:

1. Lead Score (0-100)
2. Priority Level (Low/Medium/High/Critical)
3. Key Insights (3-5 bullet points)
4. Recommended Actions (3-4 specific next steps)
5. Risk Factors (potential challenges or concerns)
6. Opportunity Assessment (potential value and likelihood)
7. Summary (2-3 sentences overview)

Provide your response in valid JSON format with these exact keys: leadScore, priorityLevel, keyInsights, recommendedActions, riskFactors, opportunityAssessment, summary.`;

    console.log('🤖 Sending request to OpenAI...');
    
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: leadInfo }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${openAIResponse.status} - ${errorText}`);
    }

    const openAIResult = await openAIResponse.json();
    console.log('✅ OpenAI response received');

    const aiAnalysis = openAIResult.choices[0].message.content;
    
    // Parse the AI response
    let analysisResult;
    try {
      analysisResult = JSON.parse(aiAnalysis);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiAnalysis);
      throw new Error('Failed to parse AI analysis result');
    }

    // Store the analysis in the database
    const { error: dbError } = await supabase
      .from('ai_agent_executions')
      .insert({
        agent_id: crypto.randomUUID(),
        execution_type: 'lead_analysis',
        input_data: { leadData, platform },
        output_data: analysisResult,
        status: 'completed',
        completed_at: new Date().toISOString(),
        confidence_score: 0.8,
        execution_time_ms: 1000,
        tokens_used: openAIResult.usage?.total_tokens || 0
      });

    if (dbError) {
      console.error('Database error:', dbError);
    }

    console.log('🎯 Analysis completed successfully');

    return new Response(JSON.stringify({
      success: true,
      analysis: analysisResult,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Lead analysis error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});