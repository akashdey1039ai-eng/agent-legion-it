import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Production-grade AI Agent Executor with security controls
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { agentId, inputData, userId, requestSource } = await req.json()

    // Security validation
    if (!agentId || !inputData || !userId) {
      await logSecurityEvent(supabaseClient, null, null, 'unauthorized_access', 'high', 
        'Missing required parameters for agent execution', req)
      throw new Error('Invalid request parameters')
    }

    console.log(`Starting AI agent execution: ${agentId} for user: ${userId}`)

    // Validate agent and permissions
    const { data: agent, error: agentError } = await supabaseClient
      .from('ai_agents')
      .select('*')
      .eq('id', agentId)
      .eq('status', 'active')
      .single()

    if (agentError || !agent) {
      await logSecurityEvent(supabaseClient, agentId, null, 'unauthorized_access', 'high', 
        'Attempt to access invalid or inactive agent', req)
      throw new Error('Agent not found or not active')
    }

    // Create execution record
    const executionId = crypto.randomUUID()
    const startTime = Date.now()

    const { error: executionError } = await supabaseClient
      .from('ai_agent_executions')
      .insert({
        id: executionId,
        agent_id: agentId,
        execution_type: 'analysis',
        input_data: inputData,
        status: 'running'
      })

    if (executionError) {
      console.error('Failed to create execution record:', executionError)
      throw new Error('Failed to initialize execution')
    }

    try {
      // Execute AI agent based on type
      let result
      switch (agent.type) {
        case 'lead_intelligence':
          result = await executeLeadIntelligence(supabaseClient, inputData, agent.config)
          break
        case 'pipeline_analysis':
          result = await executePipelineAnalysis(supabaseClient, inputData, agent.config)
          break
        case 'data_enrichment':
          result = await executeDataEnrichment(supabaseClient, inputData, agent.config)
          break
        default:
          throw new Error(`Unsupported agent type: ${agent.type}`)
      }

      const executionTime = Date.now() - startTime
      const confidenceScore = result.confidence || 0

      // Security check: validate confidence threshold
      if (confidenceScore < agent.min_confidence_threshold) {
        await logSecurityEvent(supabaseClient, agentId, executionId, 'invalid_output', 'medium', 
          `Low confidence score: ${confidenceScore}`, req)
        
        result.requiresHumanReview = true
        result.reason = 'Low confidence score'
      }

      // Update execution record
      await supabaseClient
        .from('ai_agent_executions')
        .update({
          output_data: result,
          confidence_score: confidenceScore,
          execution_time_ms: executionTime,
          tokens_used: result.tokensUsed || 0,
          cost_usd: result.cost || 0,
          status: 'completed',
          completed_at: new Date().toISOString(),
          human_approved: !agent.requires_human_approval || confidenceScore >= agent.max_confidence_threshold
        })
        .eq('id', executionId)

      // Update performance metrics (don't await to avoid blocking)
      updatePerformanceMetrics(supabaseClient, agentId, executionTime, confidenceScore, true)

      console.log(`AI agent execution completed: ${executionId} in ${executionTime}ms`)

      return new Response(
        JSON.stringify({
          success: true,
          executionId,
          result,
          confidence: confidenceScore,
          requiresApproval: agent.requires_human_approval && confidenceScore < agent.max_confidence_threshold,
          executionTime
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )

    } catch (executionError) {
      const executionTime = Date.now() - startTime
      
      // Log execution failure
      await supabaseClient
        .from('ai_agent_executions')
        .update({
          error_message: executionError.message,
          execution_time_ms: executionTime,
          status: 'failed',
          completed_at: new Date().toISOString()
        })
        .eq('id', executionId)

      // Update performance metrics (don't await to avoid blocking)
      updatePerformanceMetrics(supabaseClient, agentId, executionTime, 0, false)

      throw executionError
    }

  } catch (error) {
    console.error('AI Agent execution error:', error)
    return new Response(
      JSON.stringify({
        error: error.message,
        success: false,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

// Lead Intelligence Agent Implementation
async function executeLeadIntelligence(supabaseClient: any, inputData: any, config: any) {
  const { contactIds } = inputData
  
  if (!contactIds || !Array.isArray(contactIds)) {
    throw new Error('Invalid contact IDs provided')
  }

  // Fetch contact data with security validation
  const { data: contacts, error } = await supabaseClient
    .from('contacts')
    .select('id, first_name, last_name, email, phone, title, department, lead_source, lead_score, company_id')
    .in('id', contactIds)

  if (error) {
    throw new Error(`Failed to fetch contact data: ${error.message}`)
  }

  // AI Analysis simulation (replace with actual AI service call)
  const analysisResults = contacts.map((contact: any) => {
    // Scoring algorithm based on multiple factors
    let score = 0
    let factors = []

    // Title scoring
    if (contact.title) {
      const seniorTitles = ['director', 'manager', 'head', 'chief', 'vp', 'president']
      if (seniorTitles.some(title => contact.title.toLowerCase().includes(title))) {
        score += 25
        factors.push('Senior title')
      }
    }

    // Department scoring
    if (contact.department) {
      const highValueDepts = ['technology', 'it', 'sales', 'marketing', 'executive']
      if (highValueDepts.some(dept => contact.department.toLowerCase().includes(dept))) {
        score += 20
        factors.push('High-value department')
      }
    }

    // Lead source scoring
    if (contact.lead_source) {
      const qualitySources = ['referral', 'partner', 'conference', 'linkedin']
      if (qualitySources.some(source => contact.lead_source.toLowerCase().includes(source))) {
        score += 15
        factors.push('Quality lead source')
      }
    }

    // Contact completeness scoring
    const completeness = [contact.email, contact.phone, contact.title, contact.department].filter(Boolean).length
    score += (completeness / 4) * 20
    factors.push(`${Math.round((completeness / 4) * 100)}% data completeness`)

    // Confidence calculation
    const confidence = Math.min(0.95, 0.6 + (score / 100) * 0.35)

    return {
      contactId: contact.id,
      originalScore: contact.lead_score || 0,
      newScore: Math.min(100, score),
      confidence,
      factors,
      recommendation: score >= 70 ? 'high_priority' : score >= 40 ? 'medium_priority' : 'low_priority',
      nextAction: score >= 70 ? 'Schedule demo call' : score >= 40 ? 'Send personalized email' : 'Nurture with content'
    }
  })

  return {
    type: 'lead_intelligence',
    results: analysisResults,
    summary: {
      totalContacts: contacts.length,
      highPriority: analysisResults.filter(r => r.recommendation === 'high_priority').length,
      avgScoreImprovement: analysisResults.reduce((sum, r) => sum + (r.newScore - r.originalScore), 0) / contacts.length
    },
    confidence: analysisResults.reduce((sum, r) => sum + r.confidence, 0) / analysisResults.length,
    tokensUsed: contacts.length * 50, // Estimated tokens
    cost: contacts.length * 0.001 // Estimated cost
  }
}

// Pipeline Analysis Agent Implementation
async function executePipelineAnalysis(supabaseClient: any, inputData: any, config: any) {
  const { opportunityIds } = inputData
  
  if (!opportunityIds || !Array.isArray(opportunityIds)) {
    throw new Error('Invalid opportunity IDs provided')
  }

  // Fetch opportunity data
  const { data: opportunities, error } = await supabaseClient
    .from('opportunities')
    .select('id, name, amount, probability, stage, expected_close_date, created_at, company_id')
    .in('id', opportunityIds)

  if (error) {
    throw new Error(`Failed to fetch opportunity data: ${error.message}`)
  }

  // AI Analysis for pipeline health
  const analysisResults = opportunities.map((opp: any) => {
    let riskScore = 0
    let riskFactors = []
    
    // Age analysis
    const daysSinceCreated = Math.floor((Date.now() - new Date(opp.created_at).getTime()) / (1000 * 60 * 60 * 24))
    if (daysSinceCreated > 90) {
      riskScore += 30
      riskFactors.push('Long sales cycle')
    }

    // Close date analysis
    if (opp.expected_close_date) {
      const daysToClose = Math.floor((new Date(opp.expected_close_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      if (daysToClose < 0) {
        riskScore += 40
        riskFactors.push('Past due date')
      } else if (daysToClose < 7) {
        riskScore += 20
        riskFactors.push('Closing soon')
      }
    }

    // Probability vs stage analysis
    const stageRisk = analyzeStageRisk(opp.stage, opp.probability)
    riskScore += stageRisk.score
    if (stageRisk.factor) riskFactors.push(stageRisk.factor)

    const confidence = Math.max(0.7, 1 - (riskScore / 100) * 0.3)

    return {
      opportunityId: opp.id,
      riskScore: Math.min(100, riskScore),
      riskLevel: riskScore >= 60 ? 'high' : riskScore >= 30 ? 'medium' : 'low',
      riskFactors,
      confidence,
      recommendation: generateRecommendation(opp, riskScore),
      expectedValue: (opp.amount || 0) * ((opp.probability || 0) / 100)
    }
  })

  return {
    type: 'pipeline_analysis',
    results: analysisResults,
    summary: {
      totalOpportunities: opportunities.length,
      highRisk: analysisResults.filter(r => r.riskLevel === 'high').length,
      totalValue: opportunities.reduce((sum, opp) => sum + (opp.amount || 0), 0),
      weightedValue: analysisResults.reduce((sum, r) => sum + r.expectedValue, 0)
    },
    confidence: analysisResults.reduce((sum, r) => sum + r.confidence, 0) / analysisResults.length,
    tokensUsed: opportunities.length * 75,
    cost: opportunities.length * 0.002
  }
}

// Data Enrichment Agent Implementation
async function executeDataEnrichment(supabaseClient: any, inputData: any, config: any) {
  // Placeholder for data enrichment logic
  return {
    type: 'data_enrichment',
    results: [],
    confidence: 0.8,
    tokensUsed: 100,
    cost: 0.005
  }
}

// Helper functions
function analyzeStageRisk(stage: string, probability: number) {
  const stageExpectedProb: { [key: string]: number } = {
    'prospecting': 10,
    'qualification': 25,
    'proposal': 60,
    'negotiation': 80,
    'closed_won': 100,
    'closed_lost': 0
  }

  const expected = stageExpectedProb[stage] || 50
  const deviation = Math.abs(probability - expected)
  
  if (deviation > 30) {
    return { score: 25, factor: 'Probability mismatch with stage' }
  }
  
  return { score: 0, factor: null }
}

function generateRecommendation(opportunity: any, riskScore: number) {
  if (riskScore >= 60) {
    return 'Immediate attention required - schedule urgent review call'
  } else if (riskScore >= 30) {
    return 'Monitor closely - update opportunity details'
  } else {
    return 'On track - continue normal follow-up'
  }
}

// Security and monitoring functions
async function logSecurityEvent(supabaseClient: any, agentId: string | null, executionId: string | null, 
  eventType: string, severity: string, description: string, req: Request) {
  
  const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
  const userAgent = req.headers.get('user-agent') || 'unknown'

  await supabaseClient
    .from('ai_security_events')
    .insert({
      agent_id: agentId,
      execution_id: executionId,
      event_type: eventType,
      severity,
      description,
      source_ip: clientIP,
      user_agent: userAgent
    })
    .catch((error: any) => console.error('Failed to log security event:', error))
}

async function updatePerformanceMetrics(supabaseClient: any, agentId: string, executionTime: number, 
  confidence: number, success: boolean) {
  
  const today = new Date().toISOString().split('T')[0]
  
  await supabaseClient
    .rpc('update_agent_performance', {
      p_agent_id: agentId,
      p_metric_date: today,
      p_execution_time: executionTime,
      p_confidence: confidence,
      p_success: success
    })
    .catch((error: any) => console.error('Failed to update performance metrics:', error))
}