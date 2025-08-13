import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Simplified AI Agent Executor for testing
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting AI agent execution request')
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    console.log('Supabase client created')

    const body = await req.json()
    console.log('Request body received:', body)
    
    const { agentId, inputData, userId, requestSource } = body

    // Security validation
    if (!agentId || !inputData || !userId) {
      console.error('Invalid request parameters:', { agentId, inputData, userId })
      throw new Error('Invalid request parameters')
    }

    console.log(`Starting AI agent execution: ${agentId} for user: ${userId}`)

    // Validate agent and permissions
    const { data: agent, error: agentError } = await supabaseClient
      .from('ai_agents')
      .select('*')
      .eq('id', agentId)
      .eq('status', 'active')
      .maybeSingle()

    if (agentError) {
      console.error('Agent fetch error:', agentError)
      throw new Error('Failed to fetch agent')
    }

    if (!agent) {
      console.error('Agent not found or not active')
      throw new Error('Agent not found or not active')
    }

    console.log('Agent validated:', agent.type)

    const startTime = Date.now()

    try {
      // Execute AI agent based on type
      let result
      switch (agent.type) {
        case 'lead_intelligence':
          result = await executeLeadIntelligence(supabaseClient, inputData)
          break
        case 'pipeline_analysis':
          result = await executePipelineAnalysis(supabaseClient, inputData)
          break
        default:
          throw new Error(`Unsupported agent type: ${agent.type}`)
      }

      const executionTime = Date.now() - startTime
      const confidenceScore = result.confidence || 0

      console.log(`AI agent execution completed in ${executionTime}ms with confidence ${confidenceScore}`)

      return new Response(
        JSON.stringify({
          success: true,
          result,
          confidence: confidenceScore,
          executionTime
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )

    } catch (executionError) {
      console.error('Execution error:', executionError)
      throw executionError
    }

  } catch (error) {
    console.error('AI Agent execution error:', error)
    console.error('Error stack:', error.stack)
    
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

// Lead Intelligence Agent Implementation
async function executeLeadIntelligence(supabaseClient: any, inputData: any) {
  console.log('Executing lead intelligence with input:', inputData)
  
  const { contactIds } = inputData
  
  if (!contactIds || !Array.isArray(contactIds)) {
    throw new Error('Invalid contact IDs provided')
  }

  // Fetch contact data
  const { data: contacts, error } = await supabaseClient
    .from('contacts')
    .select('id, first_name, last_name, email, phone, title, department, lead_source, lead_score, company_id')
    .in('id', contactIds)

  if (error) {
    console.error('Contact fetch error:', error)
    throw new Error(`Failed to fetch contact data: ${error.message}`)
  }

  console.log(`Fetched ${contacts?.length || 0} contacts`)

  if (!contacts || contacts.length === 0) {
    return {
      analysis: 'No contacts found for analysis',
      confidence: 0,
      tokensUsed: 10,
      cost: 0.001
    }
  }

  // Simple AI Analysis simulation
  const analysisResults = contacts.map((contact: any) => {
    let score = 50 // Base score
    let factors = []

    // Title scoring
    if (contact.title) {
      const seniorTitles = ['director', 'manager', 'head', 'chief', 'vp', 'president']
      if (seniorTitles.some(title => contact.title.toLowerCase().includes(title))) {
        score += 20
        factors.push('Senior title')
      }
    }

    // Department scoring
    if (contact.department) {
      const highValueDepts = ['sales', 'marketing', 'it', 'technology', 'engineering']
      if (highValueDepts.some(dept => contact.department.toLowerCase().includes(dept))) {
        score += 15
        factors.push('High-value department')
      }
    }

    // Lead source scoring
    if (contact.lead_source) {
      const premiumSources = ['referral', 'partner', 'web', 'webinar']
      if (premiumSources.some(source => contact.lead_source.toLowerCase().includes(source))) {
        score += 10
        factors.push('Premium lead source')
      }
    }

    // Completeness scoring
    const completeness = [contact.first_name, contact.last_name, contact.email, contact.phone, contact.title, contact.company_id]
      .filter(field => field != null).length / 6
    score += Math.round(completeness * 15)
    if (completeness > 0.8) factors.push('Complete profile')

    return {
      contactId: contact.id,
      name: `${contact.first_name} ${contact.last_name}`,
      newScore: Math.min(100, Math.max(0, score)),
      confidence: 0.85 + Math.random() * 0.1,
      recommendation: score > 75 ? 'High priority' : score > 50 ? 'Medium priority' : 'Low priority',
      factors
    }
  })

  const avgConfidence = analysisResults.reduce((sum, r) => sum + r.confidence, 0) / analysisResults.length

  return {
    analysis: analysisResults,
    summary: `Analyzed ${contacts.length} contacts with average confidence ${(avgConfidence * 100).toFixed(1)}%`,
    confidence: avgConfidence,
    tokensUsed: contacts.length * 150,
    cost: contacts.length * 0.002
  }
}

// Pipeline Analysis Agent Implementation
async function executePipelineAnalysis(supabaseClient: any, inputData: any) {
  console.log('Executing pipeline analysis with input:', inputData)
  
  const { opportunityIds } = inputData
  
  if (!opportunityIds || !Array.isArray(opportunityIds)) {
    throw new Error('Invalid opportunity IDs provided')
  }

  // Fetch opportunity data
  const { data: opportunities, error } = await supabaseClient
    .from('opportunities')
    .select('id, name, stage, amount, probability, expected_close_date, created_at, company_id')
    .in('id', opportunityIds)

  if (error) {
    console.error('Opportunity fetch error:', error)
    throw new Error(`Failed to fetch opportunity data: ${error.message}`)
  }

  console.log(`Fetched ${opportunities?.length || 0} opportunities`)

  if (!opportunities || opportunities.length === 0) {
    return {
      analysis: 'No opportunities found for analysis',
      confidence: 0,
      tokensUsed: 10,
      cost: 0.001
    }
  }

  // Simple pipeline analysis
  const analysisResults = opportunities.map((opp: any) => {
    let riskScore = 0
    let factors = []

    // Age analysis
    const createdDate = new Date(opp.created_at)
    const daysSinceCreated = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysSinceCreated > 90) {
      riskScore += 30
      factors.push('Long sales cycle')
    }

    // Close date analysis
    if (opp.expected_close_date) {
      const closeDate = new Date(opp.expected_close_date)
      const daysToClose = Math.floor((closeDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      
      if (daysToClose < 0) {
        riskScore += 40
        factors.push('Past due date')
      } else if (daysToClose < 30) {
        riskScore += 20
        factors.push('Closing soon')
      }
    }

    // Stage probability mismatch
    const stageExpectedProb = {
      'prospecting': 10,
      'qualification': 25,
      'needs_analysis': 40,
      'proposal': 60,
      'negotiation': 80,
      'closed_won': 100,
      'closed_lost': 0
    }

    const expected = stageExpectedProb[opp.stage] || 50
    const deviation = Math.abs((opp.probability || 0) - expected)
    
    if (deviation > 30) {
      riskScore += 25
      factors.push('Probability mismatch')
    }

    const riskLevel = riskScore >= 60 ? 'High' : riskScore >= 30 ? 'Medium' : 'Low'
    const recommendation = riskScore >= 60 ? 'Immediate attention required' : 
                          riskScore >= 30 ? 'Monitor closely' : 'On track'

    return {
      opportunityId: opp.id,
      name: opp.name,
      riskScore: Math.min(100, riskScore),
      riskLevel,
      recommendation,
      factors,
      expectedValue: (opp.amount || 0) * ((opp.probability || 0) / 100)
    }
  })

  const avgRisk = analysisResults.reduce((sum, r) => sum + r.riskScore, 0) / analysisResults.length
  const confidence = 0.75 + (Math.random() * 0.15)

  return {
    analysis: analysisResults,
    summary: `Analyzed ${opportunities.length} opportunities with average risk score ${avgRisk.toFixed(1)}`,
    confidence,
    tokensUsed: opportunities.length * 200,
    cost: opportunities.length * 0.003
  }
}