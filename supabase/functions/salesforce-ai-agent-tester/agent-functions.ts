import { SalesforceContact, SalesforceOpportunity } from './index.ts';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

export async function analyzeLeadIntelligence(contacts: SalesforceContact[]) {
  console.log('🧠 Analyzing lead intelligence with AI...');
  
  const prompt = `Analyze lead intelligence for these real Salesforce contacts with advanced scoring and qualification.

Contacts data:
${JSON.stringify(contacts.slice(0, 10), null, 2)}

For each contact, provide:
1. Lead score (0-100)
2. Qualification level (MQL/SQL/hot/warm/cold)
3. Buying intent signals
4. Demographics scoring
5. Behavioral scoring
6. Recommended routing
7. Confidence level (0-1)

Return as a JSON array with detailed lead intelligence analysis.`;

  return await callOpenAI(prompt, 'lead intelligence');
}

export async function analyzePipelineAnalysis(opportunities: SalesforceOpportunity[]) {
  console.log('📊 Analyzing pipeline with AI...');
  
  const prompt = `Analyze pipeline health and forecasting for these real Salesforce opportunities.

Opportunities data:
${JSON.stringify(opportunities.slice(0, 10), null, 2)}

Provide pipeline analysis including:
1. Revenue forecast accuracy
2. Stage progression analysis
3. Deal velocity metrics
4. Pipeline health score
5. Risk assessment per opportunity
6. Recommended actions
7. Win probability predictions
8. Confidence level (0-1)

Return as a JSON array with detailed pipeline analysis.`;

  return await callOpenAI(prompt, 'pipeline analysis');
}

export async function analyzeOpportunityScoring(opportunities: SalesforceOpportunity[]) {
  console.log('🎯 Analyzing opportunity scoring with AI...');
  
  const prompt = `Analyze and score these real Salesforce opportunities for prioritization.

Opportunities data:
${JSON.stringify(opportunities.slice(0, 10), null, 2)}

For each opportunity, provide:
1. Opportunity score (0-100)
2. Win probability
3. Deal health indicators
4. Competitive risk assessment
5. Revenue impact
6. Recommended actions
7. Priority level
8. Confidence level (0-1)

Return as a JSON array with detailed opportunity scoring.`;

  return await callOpenAI(prompt, 'opportunity scoring');
}

export async function analyzeCommunicationAI(contacts: SalesforceContact[]) {
  console.log('📧 Analyzing communication optimization with AI...');
  
  const prompt = `Analyze communication patterns and optimization for these real Salesforce contacts.

Contacts data:
${JSON.stringify(contacts.slice(0, 10), null, 2)}

For each contact, provide:
1. Optimal communication channel
2. Best send times
3. Content personalization recommendations
4. Engagement likelihood
5. Message tone suggestions
6. Follow-up cadence
7. Response prediction
8. Confidence level (0-1)

Return as a JSON array with detailed communication analysis.`;

  return await callOpenAI(prompt, 'communication optimization');
}

export async function analyzeSalesCoaching(opportunities: SalesforceOpportunity[]) {
  console.log('⭐ Analyzing sales coaching with AI...');
  
  const prompt = `Analyze sales performance and coaching opportunities from these real Salesforce opportunities.

Opportunities data:
${JSON.stringify(opportunities.slice(0, 10), null, 2)}

Provide coaching analysis including:
1. Performance metrics
2. Skill gap identification
3. Coaching recommendations
4. Best practice examples
5. Improvement areas
6. Goal setting suggestions
7. Training priorities
8. Confidence level (0-1)

Return as a JSON array with detailed sales coaching analysis.`;

  return await callOpenAI(prompt, 'sales coaching');
}

async function callOpenAI(prompt: string, analysisType: string) {
  try {
    console.log(`🤖 Calling OpenAI API for ${analysisType}...`);
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key is not configured');
    }

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
            content: `You are an expert CRM analyst specializing in ${analysisType}. Analyze real Salesforce data and provide actionable insights in JSON format.` 
          },
          { role: 'user', content: prompt }
        ],
        max_completion_tokens: 2000
      }),
    });

    console.log(`📡 OpenAI API response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ OpenAI API error (${response.status}):`, errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ OpenAI API response received');

    // Properly check if the response has the expected structure
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('❌ Unexpected OpenAI response structure:', JSON.stringify(data, null, 2));
      throw new Error('Unexpected OpenAI response structure');
    }

    const analysis = data.choices[0].message.content;
    
    if (!analysis) {
      console.error('❌ No content in OpenAI response');
      throw new Error('No content returned from OpenAI');
    }

    console.log(`✅ ${analysisType} analysis completed`);
    return analysis;

  } catch (error) {
    console.error(`❌ Error in callOpenAI for ${analysisType}:`, error);
    
    // Return a fallback response instead of crashing
    return {
      error: true,
      message: `Failed to analyze ${analysisType}: ${error.message}`,
      fallback_analysis: `Unable to perform AI analysis for ${analysisType} due to API issues. Please check OpenAI configuration.`,
      confidence: 0,
      timestamp: new Date().toISOString()
    };
  }
}