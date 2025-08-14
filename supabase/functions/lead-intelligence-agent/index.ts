import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

console.log('Environment check:', {
  supabaseUrl: !!supabaseUrl,
  supabaseServiceKey: !!supabaseServiceKey,
  openAIApiKey: !!openAIApiKey
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    if (!openAIApiKey) {
      console.error('OpenAI API key not found in environment');
      throw new Error('OpenAI API key not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get user from token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Invalid token');
    }

    const { leadData, platform } = await req.json();

    console.log(`Analyzing lead from ${platform} for user: ${user.id}`);

    // Prepare lead data for AI analysis
    const leadAnalysisPrompt = `
You are an expert lead intelligence agent. Analyze the following lead data and provide comprehensive insights:

Lead Data:
${JSON.stringify(leadData, null, 2)}

Platform: ${platform}

Please provide:
1. Lead Score (0-100): Rate the lead quality
2. Priority Level: High, Medium, or Low
3. Key Insights: 3-5 bullet points about this lead
4. Recommended Actions: Specific next steps
5. Risk Factors: Potential concerns or obstacles
6. Opportunity Assessment: Revenue potential and timeline

Format your response as JSON with the following structure:
{
  "leadScore": number,
  "priorityLevel": "High" | "Medium" | "Low",
  "keyInsights": ["insight1", "insight2", ...],
  "recommendedActions": ["action1", "action2", ...],
  "riskFactors": ["risk1", "risk2", ...],
  "opportunityAssessment": {
    "revenuePotential": "estimate",
    "timeline": "timeframe",
    "confidence": "High" | "Medium" | "Low"
  },
  "summary": "brief overall assessment"
}
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [
          { 
            role: 'system', 
            content: 'You are a lead intelligence AI agent specialized in analyzing and scoring leads from CRM platforms. Provide actionable insights and accurate assessments.' 
          },
          { role: 'user', content: leadAnalysisPrompt }
        ],
        max_completion_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error status:', response.status);
      console.error('OpenAI API error response:', errorData);
      throw new Error(`OpenAI API error: ${response.status} - ${errorData}`);
    }

    const responseText = await response.text();
    console.log('OpenAI raw response:', responseText);

    if (!responseText.trim()) {
      throw new Error('Empty response from OpenAI API');
    }

    const aiResponse = JSON.parse(responseText);
    console.log('OpenAI parsed response:', JSON.stringify(aiResponse, null, 2));
    
    if (!aiResponse.choices || !aiResponse.choices[0] || !aiResponse.choices[0].message || !aiResponse.choices[0].message.content) {
      console.error('Invalid OpenAI response structure:', aiResponse);
      throw new Error('Invalid response structure from OpenAI');
    }

    const analysisResult = JSON.parse(aiResponse.choices[0].message.content);

    // Store the analysis result
    const { error: insertError } = await supabase
      .from('ai_agent_executions')
      .insert({
        agent_id: 'lead-intelligence-agent',
        user_id: user.id,
        input_data: { leadData, platform },
        output_data: analysisResult,
        execution_time_ms: Date.now(),
        confidence_score: analysisResult.opportunityAssessment.confidence === 'High' ? 0.9 : 
                         analysisResult.opportunityAssessment.confidence === 'Medium' ? 0.7 : 0.5,
        success: true
      });

    if (insertError) {
      console.error('Error storing execution result:', insertError);
    }

    console.log('Lead intelligence analysis completed successfully');

    return new Response(JSON.stringify({
      success: true,
      analysis: analysisResult,
      platform,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in lead-intelligence-agent:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});