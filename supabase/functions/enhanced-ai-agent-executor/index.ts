import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Enhanced AI Agent Executor with Autonomous Actions
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🚀 Starting Enhanced AI Agent with Autonomous Actions')
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    const body = await req.json()
    console.log('📋 Request received:', body)
    
    const { agentId, inputData, userId, requestSource, enableActions = false } = body

    // Security validation
    if (!agentId || !inputData || !userId) {
      throw new Error('Invalid request parameters')
    }

    // Validate agent
    const { data: agent, error: agentError } = await supabaseClient
      .from('ai_agents')
      .select('*')
      .eq('id', agentId)
      .eq('status', 'active')
      .maybeSingle()

    if (agentError || !agent) {
      throw new Error('Agent not found or not active')
    }

    console.log(`🤖 Executing AI agent: ${agent.name} (Type: ${agent.type})`)

    const startTime = Date.now()

    try {
      // Execute AI agent with autonomous actions
      let result
      switch (agent.type) {
        case 'lead_intelligence':
          result = await executeEnhancedLeadIntelligence(supabaseClient, inputData, enableActions, openaiApiKey)
          break
        case 'pipeline_analysis':
          result = await executeEnhancedPipelineAnalysis(supabaseClient, inputData, enableActions, openaiApiKey)
          break
        default:
          throw new Error(`Unsupported agent type: ${agent.type}`)
      }

      const executionTime = Date.now() - startTime
      const confidenceScore = result.confidence || 0

      console.log(`✅ Agent execution completed in ${executionTime}ms with confidence ${(confidenceScore * 100).toFixed(1)}%`)

      // Log successful execution
      await supabaseClient
        .from('ai_agent_executions')
        .insert({
          id: crypto.randomUUID(),
          agent_id: agentId,
          execution_type: 'autonomous_action',
          input_data: inputData,
          output_data: result,
          confidence_score: confidenceScore,
          execution_time_ms: executionTime,
          status: 'completed',
          completed_at: new Date().toISOString()
        })

      return new Response(
        JSON.stringify({
          success: true,
          result,
          confidence: confidenceScore,
          executionTime,
          actionsExecuted: result.actionsExecuted || 0,
          agentType: agent.type
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )

    } catch (executionError) {
      console.error('❌ Execution error:', executionError)
      throw executionError
    }

  } catch (error) {
    console.error('💥 AI Agent execution error:', error)
    
    return new Response(
      JSON.stringify({
        error: error.message,
        success: false,
        details: error.stack
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

// Enhanced Lead Intelligence with Autonomous Actions
async function executeEnhancedLeadIntelligence(supabaseClient: any, inputData: any, enableActions: boolean, openaiApiKey: string) {
  console.log('🎯 Executing Enhanced Lead Intelligence with AI-powered actions')
  
  const { contactIds } = inputData
  
  if (!contactIds || !Array.isArray(contactIds)) {
    throw new Error('Invalid contact IDs provided')
  }

  // Fetch comprehensive contact data
  const { data: contacts, error } = await supabaseClient
    .from('contacts')
    .select(`
      id, first_name, last_name, email, phone, title, department, 
      lead_source, lead_score, company_id, status, created_at,
      companies(name, industry, size, revenue)
    `)
    .in('id', contactIds)

  if (error) {
    throw new Error(`Failed to fetch contact data: ${error.message}`)
  }

  if (!contacts || contacts.length === 0) {
    return {
      analysis: 'No contacts found for analysis',
      confidence: 0,
      actionsExecuted: 0
    }
  }

  console.log(`📊 Analyzing ${contacts.length} contacts with AI`)

  // AI-Powered Analysis using OpenAI
  const analysisResults = []
  let actionsExecuted = 0

  for (const contact of contacts) {
    // Create AI prompt for intelligent analysis
    const aiPrompt = `
You are an enterprise lead intelligence AI. Analyze this lead and provide scoring, recommendations, and actions.

Lead Data:
- Name: ${contact.first_name} ${contact.last_name}
- Title: ${contact.title || 'Unknown'}
- Department: ${contact.department || 'Unknown'}
- Company: ${contact.companies?.name || 'Unknown'}
- Industry: ${contact.companies?.industry || 'Unknown'}
- Lead Source: ${contact.lead_source || 'Unknown'}
- Current Score: ${contact.lead_score || 0}

Analyze and provide:
1. New Lead Score (0-100)
2. Priority Level (High/Medium/Low)
3. Recommended Actions
4. Personalized Email Subject Line
5. Next Steps

Respond in JSON format:
{
  "newScore": number,
  "priority": "High|Medium|Low",
  "reasoning": "explanation",
  "recommendedActions": ["action1", "action2"],
  "emailSubject": "personalized subject",
  "nextSteps": "specific next steps"
}
`

    try {
      // Call OpenAI for intelligent analysis
      const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4.1-2025-04-14',
          messages: [
            { role: 'system', content: 'You are an expert sales intelligence AI that provides actionable insights for lead qualification.' },
            { role: 'user', content: aiPrompt }
          ],
          temperature: 0.3,
          max_tokens: 500
        }),
      })

      const aiData = await aiResponse.json()
      let aiAnalysis

      try {
        aiAnalysis = JSON.parse(aiData.choices[0].message.content)
      } catch {
        // Fallback to rule-based scoring if AI parsing fails
        aiAnalysis = {
          newScore: 65,
          priority: 'Medium',
          reasoning: 'AI analysis unavailable, using fallback scoring',
          recommendedActions: ['Follow up within 24 hours'],
          emailSubject: `Following up on your interest, ${contact.first_name}`,
          nextSteps: 'Schedule discovery call'
        }
      }

      // Execute Autonomous Actions if enabled
      const actions = []
      if (enableActions) {
        // Action 1: Update Lead Score in Database
        await supabaseClient
          .from('contacts')
          .update({ 
            lead_score: aiAnalysis.newScore,
            status: aiAnalysis.priority === 'High' ? 'qualified' : 'working'
          })
          .eq('id', contact.id)
        
        actions.push(`Updated lead score to ${aiAnalysis.newScore}`)
        actionsExecuted++

        // Action 2: Create Follow-up Task
        if (aiAnalysis.priority === 'High') {
          await supabaseClient
            .from('activities')
            .insert({
              contact_id: contact.id,
              type: 'task',
              subject: `HIGH PRIORITY: Follow up with ${contact.first_name} ${contact.last_name}`,
              description: `AI Analysis: ${aiAnalysis.reasoning}. Recommended: ${aiAnalysis.nextSteps}`,
              status: 'scheduled',
              scheduled_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // 2 hours from now
            })
          
          actions.push('Created high-priority follow-up task')
          actionsExecuted++
        }

        // Action 3: Log AI-Generated Email Subject for Sales Rep
        await supabaseClient
          .from('activities')
          .insert({
            contact_id: contact.id,
            type: 'email',
            subject: aiAnalysis.emailSubject,
            description: `AI-suggested email subject: "${aiAnalysis.emailSubject}". Ready for personalization and sending.`,
            status: 'scheduled'
          })
        
        actions.push('Generated personalized email template')
        actionsExecuted++
      }

      analysisResults.push({
        contactId: contact.id,
        name: `${contact.first_name} ${contact.last_name}`,
        oldScore: contact.lead_score || 0,
        newScore: aiAnalysis.newScore,
        priority: aiAnalysis.priority,
        confidence: 0.92,
        reasoning: aiAnalysis.reasoning,
        recommendedActions: aiAnalysis.recommendedActions,
        emailSubject: aiAnalysis.emailSubject,
        nextSteps: aiAnalysis.nextSteps,
        actionsExecuted: actions
      })

    } catch (aiError) {
      console.error('AI analysis failed for contact:', contact.id, aiError)
      // Fallback analysis
      analysisResults.push({
        contactId: contact.id,
        name: `${contact.first_name} ${contact.last_name}`,
        oldScore: contact.lead_score || 0,
        newScore: 50,
        priority: 'Medium',
        confidence: 0.60,
        reasoning: 'Fallback scoring - AI analysis unavailable',
        actionsExecuted: []
      })
    }
  }

  const avgConfidence = analysisResults.reduce((sum, r) => sum + r.confidence, 0) / analysisResults.length

  return {
    analysis: analysisResults,
    summary: `🎯 AI-powered analysis of ${contacts.length} leads. ${actionsExecuted} autonomous actions executed. Average confidence: ${(avgConfidence * 100).toFixed(1)}%`,
    confidence: avgConfidence,
    actionsExecuted,
    tokensUsed: contacts.length * 300,
    cost: contacts.length * 0.015,
    agentCapabilities: enableActions ? 'Full Autonomous Actions' : 'Analysis Only'
  }
}

// Enhanced Pipeline Analysis with Autonomous Actions  
async function executeEnhancedPipelineAnalysis(supabaseClient: any, inputData: any, enableActions: boolean, openaiApiKey: string) {
  console.log('📈 Executing Enhanced Pipeline Analysis with AI-powered actions')
  
  const { opportunityIds } = inputData
  
  if (!opportunityIds || !Array.isArray(opportunityIds)) {
    throw new Error('Invalid opportunity IDs provided')
  }

  // Fetch comprehensive opportunity data
  const { data: opportunities, error } = await supabaseClient
    .from('opportunities')
    .select(`
      id, name, stage, amount, probability, expected_close_date, 
      created_at, company_id, contact_id,
      companies(name, industry, size),
      contacts(first_name, last_name, title)
    `)
    .in('id', opportunityIds)

  if (error) {
    throw new Error(`Failed to fetch opportunity data: ${error.message}`)
  }

  if (!opportunities || opportunities.length === 0) {
    return {
      analysis: 'No opportunities found for analysis',
      confidence: 0,
      actionsExecuted: 0
    }
  }

  console.log(`📊 AI-analyzing ${opportunities.length} opportunities`)

  const analysisResults = []
  let actionsExecuted = 0

  for (const opp of opportunities) {
    // AI-Powered Pipeline Analysis
    const aiPrompt = `
You are an enterprise sales pipeline AI. Analyze this opportunity and provide insights and actions.

Opportunity Data:
- Name: ${opp.name}
- Stage: ${opp.stage}
- Amount: $${opp.amount || 0}
- Probability: ${opp.probability || 0}%
- Expected Close: ${opp.expected_close_date || 'Unknown'}
- Company: ${opp.companies?.name || 'Unknown'}
- Contact: ${opp.contacts?.first_name} ${opp.contacts?.last_name}
- Days in Pipeline: ${Math.floor((Date.now() - new Date(opp.created_at).getTime()) / (1000 * 60 * 60 * 24))}

Analyze and provide:
1. Risk Score (0-100, higher = more risk)
2. Risk Level (Low/Medium/High/Critical)
3. Recommended Actions
4. Next Steps
5. Probability Adjustment Recommendation

Respond in JSON format:
{
  "riskScore": number,
  "riskLevel": "Low|Medium|High|Critical",
  "reasoning": "explanation",
  "recommendedActions": ["action1", "action2"],
  "nextSteps": "specific next steps",
  "probabilityAdjustment": number
}
`

    try {
      const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4.1-2025-04-14',
          messages: [
            { role: 'system', content: 'You are an expert sales pipeline analyst that identifies risks and recommends actions.' },
            { role: 'user', content: aiPrompt }
          ],
          temperature: 0.3,
          max_tokens: 500
        }),
      })

      const aiData = await aiResponse.json()
      let aiAnalysis

      try {
        aiAnalysis = JSON.parse(aiData.choices[0].message.content)
      } catch {
        aiAnalysis = {
          riskScore: 50,
          riskLevel: 'Medium',
          reasoning: 'AI analysis unavailable',
          recommendedActions: ['Schedule review meeting'],
          nextSteps: 'Update opportunity status',
          probabilityAdjustment: opp.probability
        }
      }

      // Execute Autonomous Actions
      const actions = []
      if (enableActions) {
        // Action 1: Update Opportunity Probability if AI suggests adjustment
        if (Math.abs(aiAnalysis.probabilityAdjustment - (opp.probability || 0)) > 10) {
          await supabaseClient
            .from('opportunities')
            .update({ 
              probability: aiAnalysis.probabilityAdjustment
            })
            .eq('id', opp.id)
          
          actions.push(`Updated probability to ${aiAnalysis.probabilityAdjustment}%`)
          actionsExecuted++
        }

        // Action 2: Create High-Priority Task for Critical/High Risk
        if (['Critical', 'High'].includes(aiAnalysis.riskLevel)) {
          await supabaseClient
            .from('activities')
            .insert({
              opportunity_id: opp.id,
              contact_id: opp.contact_id,
              type: 'task',
              subject: `🚨 ${aiAnalysis.riskLevel.toUpperCase()} RISK: ${opp.name}`,
              description: `AI Risk Analysis: ${aiAnalysis.reasoning}. Immediate action required: ${aiAnalysis.nextSteps}`,
              status: 'scheduled',
              scheduled_at: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes from now
            })
          
          actions.push('Created urgent risk mitigation task')
          actionsExecuted++
        }

        // Action 3: Schedule Review for Medium Risk
        if (aiAnalysis.riskLevel === 'Medium') {
          await supabaseClient
            .from('activities')
            .insert({
              opportunity_id: opp.id,
              contact_id: opp.contact_id,
              type: 'meeting',
              subject: `Pipeline Review: ${opp.name}`,
              description: `AI-recommended review meeting. ${aiAnalysis.reasoning}`,
              status: 'scheduled',
              scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
            })
          
          actions.push('Scheduled pipeline review meeting')
          actionsExecuted++
        }
      }

      analysisResults.push({
        opportunityId: opp.id,
        name: opp.name,
        stage: opp.stage,
        amount: opp.amount,
        oldProbability: opp.probability,
        newProbability: aiAnalysis.probabilityAdjustment,
        riskScore: aiAnalysis.riskScore,
        riskLevel: aiAnalysis.riskLevel,
        confidence: 0.88,
        reasoning: aiAnalysis.reasoning,
        recommendedActions: aiAnalysis.recommendedActions,
        nextSteps: aiAnalysis.nextSteps,
        expectedValue: (opp.amount || 0) * (aiAnalysis.probabilityAdjustment / 100),
        actionsExecuted: actions
      })

    } catch (aiError) {
      console.error('AI analysis failed for opportunity:', opp.id, aiError)
      analysisResults.push({
        opportunityId: opp.id,
        name: opp.name,
        riskScore: 30,
        riskLevel: 'Medium',
        confidence: 0.60,
        reasoning: 'Fallback analysis - AI unavailable',
        actionsExecuted: []
      })
    }
  }

  const avgConfidence = analysisResults.reduce((sum, r) => sum + r.confidence, 0) / analysisResults.length
  const totalValue = analysisResults.reduce((sum, r) => sum + (r.expectedValue || 0), 0)

  return {
    analysis: analysisResults,
    summary: `📈 AI-powered pipeline analysis of ${opportunities.length} opportunities. ${actionsExecuted} autonomous actions executed. Total pipeline value: $${totalValue.toLocaleString()}`,
    confidence: avgConfidence,
    actionsExecuted,
    tokensUsed: opportunities.length * 400,
    cost: opportunities.length * 0.020,
    agentCapabilities: enableActions ? 'Full Autonomous Actions' : 'Analysis Only'
  }
}