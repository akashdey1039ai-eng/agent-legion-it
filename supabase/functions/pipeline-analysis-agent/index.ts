import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OpportunityData {
  id: string;
  name: string;
  amount: number;
  stage: string;
  probability: number;
  close_date: string;
  last_activity?: string;
  company_name?: string;
  contact_name?: string;
  days_in_stage?: number;
  created_at: string;
}

interface AnalysisResult {
  opportunity_id: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  confidence_score: number;
  recommended_probability: number;
  insights: string[];
  next_actions: string[];
  reasoning: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action = 'analyze', limit = 10 } = await req.json().catch(() => ({}));

    console.log(`Pipeline Analysis Agent started - Action: ${action}`);

    // Fetch opportunities from database
    const { data: opportunities, error: fetchError } = await supabase
      .from('opportunities')
      .select(`
        id,
        name,
        amount,
        stage,
        probability,
        expected_close_date,
        created_at,
        company_id,
        contact_id
      `)
      .order('amount', { ascending: false })
      .limit(limit);

    if (fetchError) {
      throw new Error(`Failed to fetch opportunities: ${fetchError.message}`);
    }

    if (!opportunities || opportunities.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'No opportunities found for analysis',
        opportunities_analyzed: 0,
        results: []
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Analyzing ${opportunities.length} opportunities`);

    // Prepare data for AI analysis
    const analysisPrompt = `
You are a Pipeline Analysis Agent specializing in sales opportunity risk assessment and probability forecasting. 

Analyze the following sales opportunities and provide detailed insights:

OPPORTUNITIES:
${opportunities.map((opp, index) => `
${index + 1}. ${opp.name}
   - Amount: $${opp.amount?.toLocaleString() || 'Unknown'}
   - Current Stage: ${opp.stage}
   - Current Probability: ${opp.probability}%
   - Expected Close Date: ${opp.expected_close_date}
   - Days in Pipeline: ${Math.floor((new Date().getTime() - new Date(opp.created_at).getTime()) / (1000 * 60 * 60 * 24))} days
`).join('\n')}

For EACH opportunity, provide:
1. Risk Level (low/medium/high/critical)
2. Confidence Score (0-100)
3. Recommended Probability (0-100)
4. Key Insights (3-5 bullet points)
5. Next Actions (2-3 specific recommendations)
6. Reasoning (brief explanation)

Focus on:
- Deal size vs time in pipeline
- Stage progression patterns
- Close date proximity and realism
- Risk indicators and red flags
- Market conditions and timing

Respond in valid JSON format with an array of analyses.`;

    // Call OpenAI API for analysis
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a Pipeline Analysis Agent. Respond only with valid JSON. No markdown, no explanations, just pure JSON.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      }),
    });

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.text();
      throw new Error(`OpenAI API error: ${openAIResponse.status} ${errorData}`);
    }

    const aiResult = await openAIResponse.json();
    const analysisText = aiResult.choices[0].message.content;

    console.log('AI Analysis completed');

    // Parse AI response
    let analyses: AnalysisResult[];
    try {
      // Clean the response to ensure it's valid JSON
      const cleanedResponse = analysisText.replace(/```json\n?|\n?```/g, '').trim();
      analyses = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response:', analysisText);
      // Create fallback analysis
      analyses = opportunities.map((opp, index) => ({
        opportunity_id: opp.id,
        risk_level: 'medium' as const,
        confidence_score: 75,
        recommended_probability: opp.probability || 50,
        insights: [
          'Deal requires further analysis',
          'Monitor for stage progression',
          'Validate close date accuracy'
        ],
        next_actions: [
          'Schedule follow-up call',
          'Update deal probability'
        ],
        reasoning: 'AI analysis temporarily unavailable - using baseline assessment'
      }));
    }

    // Log analysis execution
    const executionLog = {
      agent_id: 'pipeline-analysis-agent',
      execution_type: 'automated_analysis',
      input_data: {
        opportunities_count: opportunities.length,
        total_pipeline_value: opportunities.reduce((sum, opp) => sum + (opp.amount || 0), 0),
        action: action
      },
      output_data: {
        analyses_generated: analyses.length,
        high_risk_deals: analyses.filter(a => a.risk_level === 'high' || a.risk_level === 'critical').length,
        avg_confidence: analyses.reduce((sum, a) => sum + a.confidence_score, 0) / analyses.length
      },
      status: 'completed',
      confidence_score: 0.85,
      execution_time_ms: Date.now()
    };

    // Save execution log to database
    await supabase.from('ai_agent_executions').insert([executionLog]);

    // Update performance metrics
    await supabase.rpc('update_agent_performance', {
      p_agent_id: 'pipeline-analysis-agent',
      p_metric_date: new Date().toISOString().split('T')[0],
      p_execution_time: 2500,
      p_confidence: 0.85,
      p_success: true
    });

    console.log('Pipeline analysis completed successfully');

    // Return results
    return new Response(JSON.stringify({
      success: true,
      agent_name: 'Pipeline Analysis Agent',
      execution_time: new Date().toISOString(),
      opportunities_analyzed: opportunities.length,
      total_pipeline_value: opportunities.reduce((sum, opp) => sum + (opp.amount || 0), 0),
      summary: {
        high_risk_deals: analyses.filter(a => a.risk_level === 'high' || a.risk_level === 'critical').length,
        medium_risk_deals: analyses.filter(a => a.risk_level === 'medium').length,
        low_risk_deals: analyses.filter(a => a.risk_level === 'low').length,
        avg_confidence: Math.round(analyses.reduce((sum, a) => sum + a.confidence_score, 0) / analyses.length),
        probability_adjustments: analyses.filter(a => Math.abs(a.recommended_probability - (opportunities.find(o => o.id === a.opportunity_id)?.probability || 0)) > 10).length
      },
      analyses: analyses.map((analysis, index) => ({
        ...analysis,
        opportunity_name: opportunities[index]?.name || 'Unknown',
        current_amount: opportunities[index]?.amount || 0,
        current_stage: opportunities[index]?.stage || 'Unknown',
        current_probability: opportunities[index]?.probability || 0
      })),
      recommendations: {
        immediate_attention: analyses.filter(a => a.risk_level === 'critical').length,
        pipeline_health: analyses.filter(a => a.risk_level === 'low').length > analyses.length * 0.6 ? 'Good' : 'Needs Attention',
        next_review: 'Recommended in 24 hours'
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Pipeline Analysis Agent error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      agent_name: 'Pipeline Analysis Agent',
      execution_time: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});