// Contact Analysis Agent (Lead Intelligence, Customer Sentiment, Customer Segmentation)
async function executeContactAnalysisAgent(supabaseClient: any, agentType: string, enableActions: boolean, openaiApiKey: string, hubspotAPI: any) {
  console.log(`🎯 Executing ${agentType} agent on HubSpot contacts`)
  
  let contacts;
  if (hubspotAPI) {
    // Real HubSpot API call
    const contactsResponse = await hubspotAPI.getContacts(20);
    contacts = contactsResponse.results || [];
  } else {
    // Fallback simulation
    contacts = generateMockContacts(10);
  }

  if (!contacts || contacts.length === 0) {
    return {
      analysis: 'No contacts found for analysis',
      confidence: 0,
      actionsExecuted: 0,
      recordCount: 0
    }
  }

  console.log(`📊 Analyzing ${contacts.length} HubSpot contacts with AI`)

  // AI-Powered Analysis using OpenAI
  const analysisResults = []
  let actionsExecuted = 0

  for (const contact of contacts.slice(0, 5)) { // Limit to 5 for demo
    // Create AI prompt based on agent type
    let aiPrompt = ''
    
    switch (agentType) {
      case 'lead-intelligence':
        aiPrompt = createLeadIntelligencePrompt(contact);
        break;
      case 'customer-sentiment':
        aiPrompt = createSentimentAnalysisPrompt(contact);
        break;
      case 'customer-segmentation':
        aiPrompt = createSegmentationPrompt(contact);
        break;
      default:
        aiPrompt = createGenericAnalysisPrompt(contact, agentType);
    }

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
            { role: 'system', content: `You are an expert CRM AI that provides actionable insights for ${agentType}.` },
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
        // Fallback analysis
        aiAnalysis = generateFallbackAnalysis(agentType, contact)
      }

      // Execute Actions if enabled and API available
      const actions = []
      if (enableActions && hubspotAPI) {
        try {
          // Update contact in HubSpot based on AI analysis
          const updateProperties: any = {};
          
          if (agentType === 'lead-intelligence' && aiAnalysis.newScore) {
            updateProperties.hs_lead_status = aiAnalysis.priority === 'High' ? 'QUALIFIED' : 'OPEN';
            updateProperties.notes_last_contacted = `AI Analysis (${new Date().toLocaleDateString()}): ${aiAnalysis.reasoning}`;
          }
          
          if (agentType === 'customer-sentiment' && aiAnalysis.sentimentScore) {
            updateProperties.notes_last_contacted = `Sentiment: ${aiAnalysis.sentiment} (${aiAnalysis.sentimentScore})`;
          }

          if (Object.keys(updateProperties).length > 0) {
            await hubspotAPI.updateContact(contact.id, updateProperties);
            actions.push(`✅ Updated HubSpot contact properties`);
            actionsExecuted++;
          }

          // Create follow-up task for high priority items
          if (aiAnalysis.priority === 'High' || (aiAnalysis.sentimentScore && aiAnalysis.sentimentScore < -0.5)) {
            const taskProperties = {
              hs_task_subject: `AI: Follow up with ${contact.properties?.firstname || ''} ${contact.properties?.lastname || ''}`,
              hs_task_body: `AI Analysis: ${aiAnalysis.reasoning}\n\nRecommended Actions:\n${aiAnalysis.recommendedActions?.join('\n') || 'Follow up required'}`,
              hs_task_status: 'NOT_STARTED',
              hs_task_priority: 'HIGH',
              hs_task_type: 'CALL'
            };
            
            await hubspotAPI.createTask(taskProperties);
            actions.push(`✅ Created high-priority follow-up task in HubSpot`);
            actionsExecuted++;
          }

        } catch (hubspotError) {
          console.error('HubSpot action failed:', hubspotError);
          actions.push(`❌ HubSpot error: ${hubspotError.message}`)
        }
      }

      analysisResults.push({
        contactId: contact.id,
        name: `${contact.properties?.firstname || ''} ${contact.properties?.lastname || ''}`.trim() || 'Unknown',
        email: contact.properties?.email || 'No email',
        analysis: aiAnalysis,
        confidence: 0.91,
        actionsExecuted: actions
      })

    } catch (aiError) {
      console.error('AI analysis failed for contact:', contact.id, aiError)
      // Fallback analysis
      analysisResults.push({
        contactId: contact.id,
        name: `${contact.properties?.firstname || ''} ${contact.properties?.lastname || ''}`.trim() || 'Unknown',
        email: contact.properties?.email || 'No email',
        analysis: generateFallbackAnalysis(agentType, contact),
        confidence: 0.60,
        actionsExecuted: []
      })
    }
  }

  return {
    insights: analysisResults,
    analysis: analysisResults,
    confidence: analysisResults.length > 0 ? analysisResults.reduce((sum, r) => sum + r.confidence, 0) / analysisResults.length : 0,
    actionsExecuted,
    recordCount: contacts.length,
    recordsAnalyzed: analysisResults.length
  }
}

// Deal Analysis Agent (Pipeline Analysis, Opportunity Scoring)
async function executeDealAnalysisAgent(supabaseClient: any, agentType: string, enableActions: boolean, openaiApiKey: string, hubspotAPI: any) {
  console.log(`💰 Executing ${agentType} agent on HubSpot deals`)
  
  let deals;
  if (hubspotAPI) {
    // Real HubSpot API call
    const dealsResponse = await hubspotAPI.getDeals(20);
    deals = dealsResponse.results || [];
  } else {
    // Fallback simulation
    deals = generateMockDeals(10);
  }

  if (!deals || deals.length === 0) {
    return {
      analysis: 'No deals found for analysis',
      confidence: 0,
      actionsExecuted: 0,
      recordCount: 0
    }
  }

  console.log(`📈 Analyzing ${deals.length} HubSpot deals with AI`)

  const analysisResults = []
  let actionsExecuted = 0

  for (const deal of deals.slice(0, 5)) { // Limit to 5 for demo
    let aiPrompt = ''
    
    switch (agentType) {
      case 'pipeline-analysis':
        aiPrompt = createPipelineAnalysisPrompt(deal);
        break;
      case 'opportunity-scoring':
        aiPrompt = createOpportunityAnalysisPrompt(deal);
        break;
      default:
        aiPrompt = createGenericDealPrompt(deal, agentType);
    }

    try {
      // Call OpenAI for deal analysis
      const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4.1-2025-04-14',
          messages: [
            { role: 'system', content: `You are an expert sales AI that provides actionable insights for ${agentType}.` },
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
        aiAnalysis = generateFallbackDealAnalysis(agentType, deal)
      }

      // Execute Actions if enabled
      const actions = []
      if (enableActions && hubspotAPI) {
        try {
          const updateProperties: any = {};
          
          if (agentType === 'pipeline-analysis' && aiAnalysis.riskLevel) {
            updateProperties.notes_last_contacted = `Pipeline Risk: ${aiAnalysis.riskLevel} - ${aiAnalysis.reasoning}`;
          }
          
          if (agentType === 'opportunity-scoring' && aiAnalysis.score) {
            updateProperties.hs_deal_score = aiAnalysis.score;
            updateProperties.notes_last_contacted = `Opportunity Score: ${aiAnalysis.score}/100 - ${aiAnalysis.reasoning}`;
          }

          if (Object.keys(updateProperties).length > 0) {
            await hubspotAPI.updateDeal(deal.id, updateProperties);
            actions.push(`✅ Updated HubSpot deal properties`);
            actionsExecuted++;
          }

        } catch (hubspotError) {
          console.error('HubSpot deal action failed:', hubspotError);
          actions.push(`❌ HubSpot error: ${hubspotError.message}`)
        }
      }

      analysisResults.push({
        dealId: deal.id,
        name: deal.properties?.dealname || 'Unknown Deal',
        amount: deal.properties?.amount || 0,
        analysis: aiAnalysis,
        confidence: 0.88,
        actionsExecuted: actions
      })

    } catch (aiError) {
      console.error('AI analysis failed for deal:', deal.id, aiError)
      analysisResults.push({
        dealId: deal.id,
        name: deal.properties?.dealname || 'Unknown Deal',
        amount: deal.properties?.amount || 0,
        analysis: generateFallbackDealAnalysis(agentType, deal),
        confidence: 0.55,
        actionsExecuted: []
      })
    }
  }

  return {
    insights: analysisResults,
    analysis: analysisResults,
    confidence: analysisResults.length > 0 ? analysisResults.reduce((sum, r) => sum + r.confidence, 0) / analysisResults.length : 0,
    actionsExecuted,
    recordCount: deals.length,
    recordsAnalyzed: analysisResults.length
  }
}

// Helper functions for AI prompts
function createLeadIntelligencePrompt(contact: any): string {
  return `
Analyze this HubSpot lead and provide scoring and recommendations:

Lead Data:
- Name: ${contact.properties?.firstname || ''} ${contact.properties?.lastname || ''}
- Email: ${contact.properties?.email || 'Unknown'}
- Company: ${contact.properties?.company || 'Unknown'}
- Job Title: ${contact.properties?.jobtitle || 'Unknown'}
- Lifecycle Stage: ${contact.properties?.lifecyclestage || 'Unknown'}
- Lead Status: ${contact.properties?.hs_lead_status || 'Unknown'}

Provide analysis in JSON format:
{
  "score": number (0-100),
  "priority": "High|Medium|Low",
  "reasoning": "explanation",
  "recommendedActions": ["action1", "action2"],
  "nextSteps": "specific next steps"
}`;
}

function createSentimentAnalysisPrompt(contact: any): string {
  return `
Analyze the sentiment and engagement level of this HubSpot contact:

Contact Data:
- Name: ${contact.properties?.firstname || ''} ${contact.properties?.lastname || ''}
- Lifecycle Stage: ${contact.properties?.lifecyclestage || 'Unknown'}
- Last Activity: ${contact.properties?.notes_last_contacted || 'No recent activity'}

Analyze sentiment and provide JSON response:
{
  "sentimentScore": number (-1 to 1),
  "sentiment": "Positive|Neutral|Negative",
  "engagementLevel": "High|Medium|Low",
  "reasoning": "explanation",
  "recommendedActions": ["action1", "action2"]
}`;
}

function createSegmentationPrompt(contact: any): string {
  return `
Segment this HubSpot contact based on behavior and characteristics:

Contact Data:
- Name: ${contact.properties?.firstname || ''} ${contact.properties?.lastname || ''}
- Company: ${contact.properties?.company || 'Unknown'}
- Job Title: ${contact.properties?.jobtitle || 'Unknown'}
- Lifecycle Stage: ${contact.properties?.lifecyclestage || 'Unknown'}

Provide segmentation in JSON format:
{
  "segment": "Enterprise|SMB|Startup|Individual",
  "persona": "Decision Maker|Influencer|User|Researcher",
  "buyingStage": "Awareness|Consideration|Decision",
  "reasoning": "explanation",
  "recommendedApproach": "personalized approach strategy"
}`;
}

function createPipelineAnalysisPrompt(deal: any): string {
  return `
Analyze this HubSpot deal for pipeline health and forecasting:

Deal Data:
- Name: ${deal.properties?.dealname || 'Unknown'}
- Amount: $${deal.properties?.amount || 0}
- Stage: ${deal.properties?.dealstage || 'Unknown'}
- Close Date: ${deal.properties?.closedate || 'Unknown'}
- Description: ${deal.properties?.description || 'No description'}

Provide analysis in JSON format:
{
  "winProbability": number (0-100),
  "riskLevel": "Low|Medium|High",
  "forecastCategory": "Commit|Best Case|Pipeline",
  "reasoning": "detailed analysis",
  "recommendedActions": ["action1", "action2"]
}`;
}

function createOpportunityAnalysisPrompt(deal: any): string {
  return `
Score this HubSpot opportunity and assess its potential:

Deal Data:
- Name: ${deal.properties?.dealname || 'Unknown'}
- Amount: $${deal.properties?.amount || 0}
- Stage: ${deal.properties?.dealstage || 'Unknown'}
- Pipeline: ${deal.properties?.pipeline || 'Unknown'}

Provide scoring in JSON format:
{
  "score": number (0-100),
  "tier": "Tier 1|Tier 2|Tier 3",
  "competitivePosition": "Strong|Moderate|Weak",
  "reasoning": "detailed analysis",
  "riskFactors": ["risk1", "risk2"],
  "opportunities": ["opportunity1", "opportunity2"]
}`;
}

// Generic and fallback functions
function createGenericAnalysisPrompt(contact: any, agentType: string): string {
  return `
Analyze this HubSpot contact for ${agentType}:

Contact: ${contact.properties?.firstname || ''} ${contact.properties?.lastname || ''}
Company: ${contact.properties?.company || 'Unknown'}
Email: ${contact.properties?.email || 'Unknown'}

Provide analysis in JSON format with relevant insights for ${agentType}.`;
}

function generateFallbackAnalysis(agentType: string, contact: any) {
  const baseName = `${contact.properties?.firstname || ''} ${contact.properties?.lastname || ''}`.trim() || 'Unknown';
  
  switch (agentType) {
    case 'lead-intelligence':
      return {
        score: Math.floor(Math.random() * 40) + 60,
        priority: 'Medium',
        reasoning: `${baseName} shows moderate engagement based on profile data`,
        recommendedActions: ['Follow up within 48 hours', 'Send personalized content'],
        nextSteps: 'Schedule discovery call'
      };
    case 'customer-sentiment':
      return {
        sentimentScore: (Math.random() - 0.5) * 2,
        sentiment: 'Neutral',
        engagementLevel: 'Medium',
        reasoning: `No recent interaction data available for ${baseName}`,
        recommendedActions: ['Reach out to gauge satisfaction', 'Send survey']
      };
    default:
      return {
        analysis: `Basic analysis completed for ${baseName}`,
        confidence: 0.5,
        recommendedActions: ['Further analysis needed']
      };
  }
}

function generateFallbackDealAnalysis(agentType: string, deal: any) {
  const dealName = deal.properties?.dealname || 'Unknown Deal';
  
  switch (agentType) {
    case 'pipeline-analysis':
      return {
        winProbability: Math.floor(Math.random() * 60) + 40,
        riskLevel: 'Medium',
        forecastCategory: 'Best Case',
        reasoning: `${dealName} requires further qualification`,
        recommendedActions: ['Update deal stage', 'Schedule next steps meeting']
      };
    case 'opportunity-scoring':
      return {
        score: Math.floor(Math.random() * 30) + 70,
        tier: 'Tier 2',
        competitivePosition: 'Moderate',
        reasoning: `${dealName} shows good potential based on available data`,
        riskFactors: ['Limited stakeholder engagement'],
        opportunities: ['Expand solution scope', 'Accelerate timeline']
      };
    default:
      return {
        analysis: `Basic analysis completed for ${dealName}`,
        confidence: 0.6,
        recommendedActions: ['Continue monitoring progress']
      };
  }
}

// Mock data generators for fallback
function generateMockContacts(count: number) {
  const contacts = [];
  const firstNames = ['John', 'Jane', 'Bob', 'Alice', 'Charlie', 'Diana'];
  const lastNames = ['Smith', 'Johnson', 'Brown', 'Davis', 'Wilson', 'Miller'];
  const companies = ['TechCorp', 'InnovateCo', 'DataSystems', 'CloudVentures', 'AIStartup'];
  
  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    contacts.push({
      id: `mock-contact-${i}`,
      properties: {
        firstname: firstName,
        lastname: lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${companies[Math.floor(Math.random() * companies.length)].toLowerCase()}.com`,
        company: companies[Math.floor(Math.random() * companies.length)],
        jobtitle: ['CEO', 'CTO', 'VP Sales', 'Director', 'Manager'][Math.floor(Math.random() * 5)],
        lifecyclestage: ['lead', 'marketingqualifiedlead', 'salesqualifiedlead', 'opportunity'][Math.floor(Math.random() * 4)]
      }
    });
  }
  return contacts;
}

function generateMockDeals(count: number) {
  const deals = [];
  const dealNames = ['Enterprise License', 'Cloud Migration', 'AI Implementation', 'Data Platform', 'Security Upgrade'];
  
  for (let i = 0; i < count; i++) {
    deals.push({
      id: `mock-deal-${i}`,
      properties: {
        dealname: `${dealNames[Math.floor(Math.random() * dealNames.length)]} - ${i + 1}`,
        amount: (Math.floor(Math.random() * 500) + 50) * 1000,
        dealstage: ['appointmentscheduled', 'qualifiedtobuy', 'presentationscheduled', 'decisionmakerboughtin', 'contractsent'][Math.floor(Math.random() * 5)],
        pipeline: 'sales-pipeline',
        closedate: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
    });
  }
  return deals;
}

// Export functions for use in main file
if (typeof module !== 'undefined') {
  module.exports = {
    executeContactAnalysisAgent,
    executeDealAnalysisAgent
  };
}