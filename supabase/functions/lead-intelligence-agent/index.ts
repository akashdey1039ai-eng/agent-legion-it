import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Lead Intelligence Agent v3 Starting...');
    
    // Debug all environment variables
    console.log('🔍 All Deno.env variables:', Object.keys(Deno.env.toObject()));
    
    // Try different possible names for the API key
    let openAIApiKey = Deno.env.get('OPENAI_API_KEY') || 
                      Deno.env.get('OPENAI_KEY') || 
                      Deno.env.get('OPEN_AI_API_KEY');
    
    console.log('🔑 API Key Debug:', {
      OPENAI_API_KEY: !!Deno.env.get('OPENAI_API_KEY'),
      OPENAI_KEY: !!Deno.env.get('OPENAI_KEY'),
      OPEN_AI_API_KEY: !!Deno.env.get('OPEN_AI_API_KEY'),
      finalKey: !!openAIApiKey,
      keyLength: openAIApiKey?.length || 0,
      firstChars: openAIApiKey?.substring(0, 7) || 'missing'
    });

    const { leadData, platform, apiKey } = await req.json();
    console.log('📊 Processing lead:', leadData?.first_name, leadData?.last_name);
    
    // Use provided API key if environment key is not available
    if (!openAIApiKey && apiKey) {
      console.log('🔄 Using provided API key instead of environment variable');
      openAIApiKey = apiKey;
    }

    if (!openAIApiKey) {
      console.error('❌ OpenAI API key missing from both environment and request');
      return new Response(JSON.stringify({ 
        error: 'OpenAI API key not configured in environment and not provided in request',
        success: false
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create AI analysis request
    const prompt = `Analyze this sales lead and provide insights:
    
Name: ${leadData.first_name} ${leadData.last_name}
Email: ${leadData.email}
Title: ${leadData.title || 'Not specified'}
Company: ${leadData.company || 'Not specified'}
Status: ${leadData.status || 'new'}
Source: ${platform}

Provide a JSON response with:
- leadScore (0-100)
- priorityLevel ("Low", "Medium", "High", or "Critical")
- keyInsights (array of 3-4 insights)
- recommendedActions (array of 3-4 actions)
- riskFactors (array of potential risks)
- opportunityAssessment (brief text)
- summary (2-3 sentences)

Respond only with valid JSON.`;

    console.log('🤖 Calling OpenAI API...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'user', content: prompt }
        ],
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenAI API Error:', response.status, errorText);
      throw new Error(`OpenAI API failed: ${response.status}`);
    }

    const result = await response.json();
    const analysis = result.choices[0].message.content;
    
    console.log('✅ Got OpenAI response, parsing JSON...');
    
    let analysisData;
    try {
      analysisData = JSON.parse(analysis);
    } catch (e) {
      console.error('❌ JSON parse error:', e);
      // Fallback structured response
      analysisData = {
        leadScore: 75,
        priorityLevel: "Medium",
        keyInsights: ["Lead from " + platform, "Professional title: " + (leadData.title || "Unknown"), "Requires follow-up"],
        recommendedActions: ["Send personalized email", "Schedule call", "Add to nurture campaign"],
        riskFactors: ["Limited information available"],
        opportunityAssessment: "Standard lead with moderate potential",
        summary: `${leadData.first_name} ${leadData.last_name} is a ${leadData.title || 'professional'} lead from ${platform} that shows standard engagement potential.`
      };
    }

    console.log('🎯 Analysis complete!');

    return new Response(JSON.stringify({
      success: true,
      analysis: analysisData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Function error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});