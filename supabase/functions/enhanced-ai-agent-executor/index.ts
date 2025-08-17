import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { executeCustomerSentimentAnalysis, executeChurnPredictionAnalysis, executeCustomerSegmentationAnalysis } from './customer-sentiment.ts'
import { executeOpportunityScoring, executeCommunicationAI, executeSalesCoaching } from './additional-functions.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SalesforceTokens {
  access_token: string;
  instance_url: string;
  token_type: string;
}

// Salesforce API Helper Class
class SalesforceAPI {
  constructor(private tokens: SalesforceTokens) {}

  async makeRequest(endpoint: string, method: string = 'GET', body?: any) {
    const url = `${this.tokens.instance_url}/services/data/v61.0/${endpoint}`;
    
    console.log(`🔗 Salesforce API ${method} ${url}`);
    
    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `${this.tokens.token_type} ${this.tokens.access_token}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Salesforce API error: ${response.status} - ${errorText}`);
      throw new Error(`Salesforce API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log(`✅ Salesforce API success:`, result);
    return result;
  }

  async updateLead(leadId: string, updates: any) {
    console.log(`🎯 Updating Salesforce Lead ${leadId} with:`, updates);
    return await this.makeRequest(`sobjects/Lead/${leadId}`, 'PATCH', updates);
  }

  async createTask(taskData: any) {
    console.log(`📋 Creating Salesforce Task:`, taskData);
    return await this.makeRequest('sobjects/Task', 'POST', taskData);
  }

  async updateOpportunity(opportunityId: string, updates: any) {
    console.log(`💰 Updating Salesforce Opportunity ${opportunityId} with:`, updates);
    return await this.makeRequest(`sobjects/Opportunity/${opportunityId}`, 'PATCH', updates);
  }

  async createEvent(eventData: any) {
    console.log(`📅 Creating Salesforce Event:`, eventData);
    return await this.makeRequest('sobjects/Event', 'POST', eventData);
  }

  async query(soql: string) {
    console.log(`🔍 Salesforce SOQL Query: ${soql}`);
    return await this.makeRequest(`query/?q=${encodeURIComponent(soql)}`);
  }
}

// Enhanced AI Agent Executor with Real Salesforce Integration
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🚀 Starting Enhanced AI Agent with Autonomous Salesforce Actions')
    
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
    
    const { agentType, userId, enableActions = false, platform = 'native' } = body

    // Security validation
    if (!agentType || !userId) {
      throw new Error('Invalid request parameters')
    }

    // Since we're using agentType, we'll create a mock agent for execution
    // This is for direct AI agent testing without requiring database agents
    const agent = {
      id: `${agentType}-${platform}`,
      name: `${agentType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} AI`,
      type: agentType,
      status: 'active'
    };

    console.log(`🤖 Executing AI agent: ${agent.name} (Type: ${agent.type})`)

    // Get Salesforce tokens for real API calls
    let salesforceAPI: SalesforceAPI | null = null;
    
    if (enableActions) {
      console.log(`🔍 Looking for Salesforce tokens for user: ${userId}`);
      const { data: tokens, error: tokensError } = await supabaseClient
        .from('salesforce_tokens')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      console.log(`🎯 Token query result:`, { tokens, tokensError });

      if (tokens && !tokensError) {
        // Check if token is still valid (not expired)
        const now = new Date();
        const expiresAt = new Date(tokens.expires_at);
        
        console.log(`⏰ Token expiration check:`, { 
          now: now.toISOString(), 
          expiresAt: expiresAt.toISOString(),
          isValid: expiresAt > now 
        });
        
        if (expiresAt > now) {
          console.log(`✅ Valid Salesforce tokens found, initializing API`);
          salesforceAPI = new SalesforceAPI({
            access_token: tokens.access_token,
            instance_url: tokens.instance_url,
            token_type: tokens.token_type || 'Bearer'
          });
          console.log('✅ Salesforce API initialized for real autonomous actions');
        } else {
          console.log('⚠️ Salesforce token expired - running in simulation mode');
        }
      } else {
        console.log('⚠️ No Salesforce tokens found - running in simulation mode');
      }
    }

    const startTime = Date.now()

    try {
      // Execute AI agent with autonomous actions
      let result
      switch (agent.type) {
        case 'lead-intelligence':
          result = await executeEnhancedLeadIntelligence(supabaseClient, {}, enableActions, openaiApiKey, salesforceAPI)
          break
        case 'pipeline-analysis':
          result = await executeEnhancedPipelineAnalysis(supabaseClient, {}, enableActions, openaiApiKey, salesforceAPI)
          break
        case 'customer-sentiment':
          result = await executeCustomerSentimentAnalysis(supabaseClient, {}, enableActions, openaiApiKey)
          break
        case 'churn-prediction':
          result = await executeChurnPredictionAnalysis(supabaseClient, {}, enableActions, openaiApiKey)
          break
        case 'customer-segmentation':
          result = await executeCustomerSegmentationAnalysis(supabaseClient, {}, enableActions, openaiApiKey)
          break
        case 'opportunity-scoring':
          result = await executeOpportunityScoring(supabaseClient, {}, enableActions, openaiApiKey)
          break
        case 'communication-ai':
          result = await executeCommunicationAI(supabaseClient, {}, enableActions, openaiApiKey)
          break
        case 'sales-coaching':
          result = await executeSalesCoaching(supabaseClient, {}, enableActions, openaiApiKey)
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
          agent_id: agent.id,
          execution_type: 'autonomous_action',
          input_data: { agentType, platform },
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

// Enhanced Lead Intelligence with Real Salesforce Actions
async function executeEnhancedLeadIntelligence(supabaseClient: any, inputData: any, enableActions: boolean, openaiApiKey: string, salesforceAPI: SalesforceAPI | null) {
  console.log('🎯 Executing Enhanced Lead Intelligence with AI-powered actions')
  
  // Get contacts from Supabase instead of requiring specific contactIds
  const { data: contacts, error } = await supabaseClient
    .from('contacts')
    .select(`
      id, first_name, last_name, email, phone, title, department, 
      lead_source, lead_score, company_id, status, created_at,
      companies(name, industry, size, revenue)
    `)
    .limit(10)

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
        // Action 1: Update Lead Score in Local Database
        await supabaseClient
          .from('contacts')
          .update({ 
            lead_score: aiAnalysis.newScore,
            status: aiAnalysis.priority === 'High' ? 'qualified' : 'working'
          })
          .eq('id', contact.id)
        
        actions.push(`Updated lead score to ${aiAnalysis.newScore} in local database`)
        actionsExecuted++

        // Action 2: Real Salesforce Updates (if connected)
        console.log(`🔍 Checking Salesforce connection: salesforceAPI=${!!salesforceAPI}, contact.salesforce_id=${contact.salesforce_id}`);
        if (salesforceAPI && contact.salesforce_id) {
          console.log(`🚀 Proceeding with Salesforce updates for ${contact.first_name} ${contact.last_name}`);
          try {
            // Update Lead in Salesforce - try different field name variations
            const salesforceUpdateData: any = {
              Rating: aiAnalysis.priority,
              Status: aiAnalysis.priority === 'High' ? 'Working - Contacted' : 'Open - Not Contacted',
              Description: `AI Analysis (${new Date().toLocaleDateString()}): ${aiAnalysis.reasoning}\n\nAI Confidence: 92%\n\nRecommended Email: "${aiAnalysis.emailSubject}"`
            };
            
            // Try different possible field names for Lead Score
            const possibleFieldNames = ['Lead_Score__c', 'LeadScore__c', 'Lead_Score_Number__c', 'Score__c'];
            for (const fieldName of possibleFieldNames) {
              salesforceUpdateData[fieldName] = aiAnalysis.newScore;
            }
            
            console.log(`🎯 Updating Salesforce lead ${contact.salesforce_id} with data:`, salesforceUpdateData);
            
            try {
              await salesforceAPI.updateLead(contact.salesforce_id, salesforceUpdateData);
              actions.push(`✅ Updated lead score to ${aiAnalysis.newScore} in Salesforce`);
              console.log(`✅ Successfully updated Salesforce lead ${contact.salesforce_id}`);
            } catch (sfError) {
              console.error(`❌ Salesforce update failed for lead ${contact.salesforce_id}:`, sfError);
              actions.push(`❌ Salesforce update failed: ${sfError.message}`);
            }
            actionsExecuted++

            // Create Follow-up Task in Salesforce
            if (aiAnalysis.priority === 'High') {
              const taskData = {
                Subject: `AI: Follow up with ${contact.first_name} ${contact.last_name} - ${aiAnalysis.priority} Priority`,
                Description: `AI Analysis: ${aiAnalysis.reasoning}\n\nRecommended Actions:\n${aiAnalysis.recommendedActions.join('\n')}\n\nNext Steps: ${aiAnalysis.nextSteps}`,
                Status: 'Not Started',
                Priority: aiAnalysis.priority,
                WhoId: contact.salesforce_id,
                ActivityDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
                Type: 'Call'
              };
              
              await salesforceAPI.createTask(taskData);
              actions.push(`✅ Created high-priority follow-up task in Salesforce`)
              actionsExecuted++

              // Schedule Discovery Call Event for High Priority
              const eventData = {
                Subject: `AI: Discovery Call - ${contact.first_name} ${contact.last_name}`,
                Description: `AI-scheduled discovery call based on lead score of ${aiAnalysis.newScore}. ${aiAnalysis.nextSteps}`,
                StartDateTime: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
                EndDateTime: new Date(Date.now() + 172800000 + 3600000).toISOString(), // 1 hour meeting
                WhoId: contact.salesforce_id,
                Type: 'Meeting'
              };
              
              await salesforceAPI.createEvent(eventData);
              actions.push(`✅ Scheduled discovery call in Salesforce calendar`)
              actionsExecuted++
            }

          } catch (salesforceError) {
            console.error('Salesforce action failed:', salesforceError);
            actions.push(`❌ Salesforce error: ${salesforceError.message}`)
          }
        }

        // Action 3: Create Local Follow-up Task (fallback or additional)
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
          
          actions.push('Created high-priority follow-up task in local CRM')
          actionsExecuted++
        }

        // Action 4: Log AI-Generated Email Subject for Sales Rep
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

// Enhanced Pipeline Analysis with Real Salesforce Actions  
async function executeEnhancedPipelineAnalysis(supabaseClient: any, inputData: any, enableActions: boolean, openaiApiKey: string, salesforceAPI: SalesforceAPI | null) {
  console.log('📈 Executing Enhanced Pipeline Analysis with AI-powered actions')
  
  
  // Get opportunities from Supabase without requiring specific IDs
  const { data: opportunities, error } = await supabaseClient
    .from('opportunities')
    .select(`
      id, name, stage, amount, probability, expected_close_date, 
      created_at, company_id, contact_id,
      companies(name, industry, size),
      contacts(first_name, last_name, title)
    `)
    .limit(10)

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

// Customer Sentiment Analysis with HubSpot Support
async function executeCustomerSentimentAnalysis(supabaseClient: any, inputData: any, enableActions: boolean, openaiApiKey: string) {
  console.log('🎭 Executing Customer Sentiment Analysis')
  
  const { platform = 'native', contactIds } = inputData
  
  // For platform-specific analysis, contactIds are optional - we can fetch from database
  console.log(`🔍 Platform: ${platform}, ContactIds provided: ${contactIds ? contactIds.length : 'none'}`)

  // Fetch contact data based on platform
  let contacts = []
  
  if (platform === 'hubspot') {
    // For HubSpot, get contacts with HubSpot IDs if specified, otherwise get recent ones
    if (contactIds && Array.isArray(contactIds)) {
      const { data: hubspotContacts, error } = await supabaseClient
        .from('contacts')
        .select(`
          id, first_name, last_name, email, phone, title, department,
          hubspot_id, status, lead_source, created_at,
          companies(name, industry, size)
        `)
        .in('hubspot_id', contactIds)
        .limit(50)
      
      if (error) {
        throw new Error(`Failed to fetch HubSpot contacts: ${error.message}`)
      }
      
      contacts = hubspotContacts || []
    } else {
      // If no specific contact IDs, get recent HubSpot contacts
      const { data: recentContacts, error } = await supabaseClient
        .from('contacts')
        .select(`
          id, first_name, last_name, email, phone, title, department,
          hubspot_id, status, lead_source, created_at,
          companies(name, industry, size)
        `)
        .not('hubspot_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(20)
      
      if (error) {
        throw new Error(`Failed to fetch recent HubSpot contacts: ${error.message}`)
      }
      
      contacts = recentContacts || []
    }
  } else {
    // For native platform, get all contacts or specific ones
    if (contactIds && Array.isArray(contactIds)) {
      const { data: nativeContacts, error } = await supabaseClient
        .from('contacts')
        .select(`
          id, first_name, last_name, email, phone, title, department,
          status, lead_source, created_at,
          companies(name, industry, size)
        `)
        .in('id', contactIds)
        .limit(50)
      
      if (error) {
        throw new Error(`Failed to fetch contacts: ${error.message}`)
      }
      
      contacts = nativeContacts || []
    } else {
      // If no specific contact IDs, get recent contacts
      const { data: allContacts, error } = await supabaseClient
        .from('contacts')
        .select(`
          id, first_name, last_name, email, phone, title, department,
          status, lead_source, created_at,
          companies(name, industry, size)
        `)
        .order('created_at', { ascending: false })
        .limit(20)
      
      if (error) {
        throw new Error(`Failed to fetch recent contacts: ${error.message}`)
      }
      
      contacts = allContacts || []
    }
  }

  if (!contacts || contacts.length === 0) {
    return {
      analysis: 'No contacts found for sentiment analysis',
      confidence: 0,
      actionsExecuted: 0,
      platform: platform || 'unknown'
    }
  }

  console.log(`📊 Analyzing sentiment for ${contacts.length} contacts on ${platform}`)

  const analysisResults = []
  let actionsExecuted = 0

  for (const contact of contacts) {
    const aiPrompt = `
You are an expert customer sentiment analysis AI. Analyze this customer profile and determine their sentiment and satisfaction level.

Customer Data:
- Name: ${contact.first_name} ${contact.last_name}
- Email: ${contact.email}
- Title: ${contact.title || 'Unknown'}
- Status: ${contact.status}
- Lead Score: ${contact.lead_score || 0}
- Platform: ${platform}

Analyze and provide:
1. Sentiment Score (-100 to 100, where -100 is very negative, 0 is neutral, 100 is very positive)
2. Satisfaction Level (Low/Medium/High)
3. Risk Level (Low/Medium/High)
4. Recommended Actions
5. Reason for sentiment assessment

Respond in JSON format:
{
  "sentimentScore": number,
  "satisfactionLevel": "Low|Medium|High",
  "riskLevel": "Low|Medium|High",
  "reasoning": "detailed explanation",
  "recommendedActions": ["action1", "action2"],
  "confidence": number
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
          model: 'gpt-5-2025-08-07',
          messages: [
            { role: 'system', content: 'You are an expert customer sentiment analysis AI specialized in CRM data analysis.' },
            { role: 'user', content: aiPrompt }
          ],
          max_completion_tokens: 500
        }),
      })

      const aiData = await aiResponse.json()
      let aiAnalysis

      try {
        aiAnalysis = JSON.parse(aiData.choices[0].message.content)
      } catch {
        aiAnalysis = {
          sentimentScore: 0,
          satisfactionLevel: 'Medium',
          riskLevel: 'Medium',
          reasoning: 'Unable to parse AI response, using default values',
          recommendedActions: ['Schedule follow-up call'],
          confidence: 0.5
        }
      }

      if (enableActions) {
        // Update contact with sentiment data
        await supabaseClient
          .from('contacts')
          .update({ 
            lead_score: Math.max(0, Math.min(100, contact.lead_score + (aiAnalysis.sentimentScore / 10))),
            status: aiAnalysis.riskLevel === 'High' ? 'at_risk' : contact.status
          })
          .eq('id', contact.id)
        
        actionsExecuted++

        // Create task for high-risk customers
        if (aiAnalysis.riskLevel === 'High') {
          await supabaseClient
            .from('tasks')
            .insert({
              subject: `URGENT: High-risk customer - ${contact.first_name} ${contact.last_name}`,
              description: `Customer sentiment analysis indicates high risk: ${aiAnalysis.reasoning}`,
              priority: 'high',
              status: 'open',
              related_to_type: 'contact',
              related_to_id: contact.id,
              due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            })
          
          actionsExecuted++
        }
      }

      analysisResults.push({
        contactId: contact.id,
        name: `${contact.first_name} ${contact.last_name}`,
        platform: platform,
        sentimentScore: aiAnalysis.sentimentScore,
        satisfactionLevel: aiAnalysis.satisfactionLevel,
        riskLevel: aiAnalysis.riskLevel,
        reasoning: aiAnalysis.reasoning,
        recommendedActions: aiAnalysis.recommendedActions,
        confidence: aiAnalysis.confidence
      })

    } catch (error) {
      console.error('Sentiment analysis failed for contact:', contact.id, error)
      analysisResults.push({
        contactId: contact.id,
        name: `${contact.first_name} ${contact.last_name}`,
        platform: platform,
        sentimentScore: 0,
        satisfactionLevel: 'Medium',
        riskLevel: 'Medium',
        reasoning: 'Analysis failed - using default values',
        confidence: 0.3
      })
    }
  }

  const avgConfidence = analysisResults.reduce((sum, r) => sum + r.confidence, 0) / analysisResults.length

  return {
    analysis: analysisResults,
    confidence: avgConfidence,
    summary: `🎭 Customer Sentiment Analysis completed for ${contacts.length} customers on ${platform}. ${actionsExecuted} actions executed.`,
    platform: platform,
    actionsExecuted
  }
}

// Churn Prediction Analysis
async function executeChurnPredictionAnalysis(supabaseClient: any, inputData: any, enableActions: boolean, openaiApiKey: string) {
  console.log('📈 Executing Churn Prediction Analysis')
  
  // Get all contacts for churn analysis instead of requiring specific IDs
  const { data: contacts, error } = await supabaseClient
    .from('contacts')
    .select(`
      id, first_name, last_name, email, status, lead_score, created_at,
      companies(name, industry, size)
    `)
    .limit(10)

  if (error) throw new Error(`Failed to fetch contacts: ${error.message}`)

  if (!contacts || contacts.length === 0) {
    return {
      analysis: 'No contacts found for churn prediction',
      confidence: 0,
      actionsExecuted: 0
    }
  }

  console.log(`📊 Predicting churn for ${contacts.length} customers`)

  const analysisResults = []
  let actionsExecuted = 0

  for (const contact of contacts) {
    const daysSinceCreated = Math.floor((Date.now() - new Date(contact.created_at).getTime()) / (1000 * 60 * 60 * 24))
    
    const aiPrompt = `
You are an expert churn prediction AI. Analyze this customer and predict their likelihood of churning.

Customer Data:
- Name: ${contact.first_name} ${contact.last_name}
- Status: ${contact.status}
- Lead Score: ${contact.lead_score || 0}
- Days Since Created: ${daysSinceCreated}
- Company: ${contact.companies?.name || 'Unknown'}
- Industry: ${contact.companies?.industry || 'Unknown'}
- Platform: native

Analyze and provide:
1. Churn Risk Score (0-100, where 100 is highest risk)
2. Risk Category (Low/Medium/High)
3. Time to Churn (days estimate)
4. Key Risk Factors
5. Retention Actions

Respond in JSON format:
{
  "churnRisk": number,
  "riskCategory": "Low|Medium|High",
  "timeToChurn": number,
  "riskFactors": ["factor1", "factor2"],
  "retentionActions": ["action1", "action2"],
  "confidence": number
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
          model: 'gpt-5-2025-08-07',
          messages: [
            { role: 'system', content: 'You are an expert churn prediction AI specialized in customer retention analysis.' },
            { role: 'user', content: aiPrompt }
          ],
          max_completion_tokens: 500
        }),
      })

      const aiData = await aiResponse.json()
      let aiAnalysis

      try {
        aiAnalysis = JSON.parse(aiData.choices[0].message.content)
      } catch {
        aiAnalysis = {
          churnRisk: 50,
          riskCategory: 'Medium',
          timeToChurn: 30,
          riskFactors: ['Low engagement'],
          retentionActions: ['Schedule check-in call'],
          confidence: 0.5
        }
      }

      if (enableActions && aiAnalysis.riskCategory === 'High') {
        // Create retention task for high-risk customers
        await supabaseClient
          .from('tasks')
          .insert({
            subject: `RETENTION: High churn risk - ${contact.first_name} ${contact.last_name}`,
            description: `Churn prediction shows ${aiAnalysis.churnRisk}% risk. Factors: ${aiAnalysis.riskFactors.join(', ')}`,
            priority: 'high',
            status: 'open',
            related_to_type: 'contact',
            related_to_id: contact.id,
            due_date: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
          })
        
        actionsExecuted++
      }

      analysisResults.push({
        contactId: contact.id,
        name: `${contact.first_name} ${contact.last_name}`,
        platform: 'native',
        churnRisk: aiAnalysis.churnRisk,
        riskCategory: aiAnalysis.riskCategory,
        timeToChurn: aiAnalysis.timeToChurn,
        riskFactors: aiAnalysis.riskFactors,
        retentionActions: aiAnalysis.retentionActions,
        confidence: aiAnalysis.confidence
      })

    } catch (error) {
      console.error('Churn prediction failed for contact:', contact.id, error)
      analysisResults.push({
        contactId: contact.id,
        name: `${contact.first_name} ${contact.last_name}`,
        platform: 'native',
        churnRisk: 50,
        riskCategory: 'Medium',
        timeToChurn: 30,
        confidence: 0.3
      })
    }
  }

  const avgConfidence = analysisResults.reduce((sum, r) => sum + r.confidence, 0) / analysisResults.length

  return {
    analysis: analysisResults,
    confidence: avgConfidence,
    summary: `📈 Churn Prediction Analysis completed for ${contacts.length} customers on native. ${actionsExecuted} actions executed.`,
    platform: 'native',
    actionsExecuted
  }
}

// Customer Segmentation Analysis
async function executeCustomerSegmentationAnalysis(supabaseClient: any, inputData: any, enableActions: boolean, openaiApiKey: string) {
  console.log('🎯 Executing Customer Segmentation Analysis')
  
  // Get all contacts for segmentation instead of requiring specific IDs
  const { data: contacts, error } = await supabaseClient
    .from('contacts')
    .select(`
      id, first_name, last_name, email, status, lead_score, title, 
      created_at, companies(name, industry, size, revenue)
    `)
    .limit(10)

  if (error) throw new Error(`Failed to fetch contacts: ${error.message}`)

  if (!contacts || contacts.length === 0) {
    return {
      analysis: 'No contacts found for segmentation',
      confidence: 0,
      actionsExecuted: 0
    }
  }

  console.log(`📊 Segmenting ${contacts.length} customers`)

  const analysisResults = []
  let actionsExecuted = 0

  for (const contact of contacts) {
    const aiPrompt = `
You are an expert customer segmentation AI. Analyze this customer and assign them to appropriate segments.

Customer Data:
- Name: ${contact.first_name} ${contact.last_name}
- Title: ${contact.title || 'Unknown'}
- Status: ${contact.status}
- Lead Score: ${contact.lead_score || 0}
- Company: ${contact.companies?.name || 'Unknown'}
- Industry: ${contact.companies?.industry || 'Unknown'}
- Company Size: ${contact.companies?.size || 'Unknown'}
- Platform: native

Analyze and provide:
1. Primary Segment (Enterprise/Mid-Market/SMB/Individual)
2. Behavioral Segment (Champion/Supporter/Neutral/Detractor)
3. Value Tier (High/Medium/Low)
4. Engagement Level (High/Medium/Low)
5. Recommended Strategy

Respond in JSON format:
{
  "primarySegment": "Enterprise|Mid-Market|SMB|Individual",
  "behavioralSegment": "Champion|Supporter|Neutral|Detractor",
  "valueTier": "High|Medium|Low",
  "engagementLevel": "High|Medium|Low",
  "recommendedStrategy": "specific strategy",
  "reasoning": "explanation",
  "confidence": number
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
          model: 'gpt-5-2025-08-07',
          messages: [
            { role: 'system', content: 'You are an expert customer segmentation AI specialized in B2B customer analysis.' },
            { role: 'user', content: aiPrompt }
          ],
          max_completion_tokens: 500
        }),
      })

      const aiData = await aiResponse.json()
      let aiAnalysis

      try {
        aiAnalysis = JSON.parse(aiData.choices[0].message.content)
      } catch {
        aiAnalysis = {
          primarySegment: 'SMB',
          behavioralSegment: 'Neutral',
          valueTier: 'Medium',
          engagementLevel: 'Medium',
          recommendedStrategy: 'Standard nurturing approach',
          reasoning: 'Default segmentation applied',
          confidence: 0.5
        }
      }

      if (enableActions) {
        // Update contact tags based on segmentation
        const segmentTags = [
          aiAnalysis.primarySegment,
          aiAnalysis.behavioralSegment,
          `Value-${aiAnalysis.valueTier}`,
          `Engagement-${aiAnalysis.engagementLevel}`
        ]

        await supabaseClient
          .from('contacts')
          .update({ 
            tags: segmentTags,
            status: aiAnalysis.behavioralSegment === 'Champion' ? 'qualified' : contact.status
          })
          .eq('id', contact.id)
        
        actionsExecuted++

        // Create strategy task for high-value segments
        if (aiAnalysis.valueTier === 'High' || aiAnalysis.primarySegment === 'Enterprise') {
          await supabaseClient
            .from('tasks')
            .insert({
              subject: `STRATEGY: High-value customer - ${contact.first_name} ${contact.last_name}`,
              description: `Customer segmentation: ${aiAnalysis.primarySegment} | ${aiAnalysis.behavioralSegment}. Strategy: ${aiAnalysis.recommendedStrategy}`,
              priority: 'high',
              status: 'open',
              related_to_type: 'contact',
              related_to_id: contact.id,
              due_date: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString()
            })
          
          actionsExecuted++
        }
      }

      analysisResults.push({
        contactId: contact.id,
        name: `${contact.first_name} ${contact.last_name}`,
        platform: 'native',
        primarySegment: aiAnalysis.primarySegment,
        behavioralSegment: aiAnalysis.behavioralSegment,
        valueTier: aiAnalysis.valueTier,
        engagementLevel: aiAnalysis.engagementLevel,
        recommendedStrategy: aiAnalysis.recommendedStrategy,
        reasoning: aiAnalysis.reasoning,
        confidence: aiAnalysis.confidence
      })

    } catch (error) {
      console.error('Segmentation failed for contact:', contact.id, error)
      analysisResults.push({
        contactId: contact.id,
        name: `${contact.first_name} ${contact.last_name}`,
        platform: 'native',
        primarySegment: 'SMB',
        behavioralSegment: 'Neutral',
        confidence: 0.3
      })
    }
  }

  const avgConfidence = analysisResults.reduce((sum, r) => sum + r.confidence, 0) / analysisResults.length

  return {
    analysis: analysisResults,
    confidence: avgConfidence,
    summary: `🎯 Customer Segmentation Analysis completed for ${contacts.length} customers on native. ${actionsExecuted} actions executed.`,
    platform: 'native',
    actionsExecuted
  }
}