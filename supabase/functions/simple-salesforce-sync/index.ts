import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Get user from auth header
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      throw new Error('Authorization header required')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)
    
    if (userError || !user) {
      throw new Error('Invalid authentication token')
    }

    console.log('User authenticated:', user.id)

    // Get request body safely
    let requestBody = {}
    try {
      const text = await req.text()
      console.log('Raw request body:', text)
      if (text) {
        requestBody = JSON.parse(text)
      }
    } catch (err) {
      console.error('Request body parsing error:', err)
      // Use default if no body provided
    }
    
    const dataType = requestBody.dataType || 'contacts'
    console.log('Sync request for:', dataType)

    // Get Salesforce token
    const { data: tokenData, error: tokenError } = await supabaseClient
      .from('salesforce_tokens')
      .select('*')
      .eq('user_id', user.id)
      .gt('expires_at', new Date().toISOString())
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (tokenError || !tokenData) {
      throw new Error('No valid Salesforce token found. Please reconnect your Salesforce account.')
    }

    console.log('Valid Salesforce token found')

    // Test Salesforce connection
    const testResponse = await fetch(`${tokenData.instance_url}/services/data/v58.0/`, {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    })

    if (!testResponse.ok) {
      throw new Error('Salesforce connection failed. Please reconnect your account.')
    }

    let syncResult = { recordsProcessed: 0, recordsUpdated: 0 }

    // Sync based on data type
    switch (dataType) {
      case 'contacts':
        syncResult = await syncContacts(supabaseClient, tokenData, user.id)
        break
      case 'companies':
        syncResult = await syncCompanies(supabaseClient, tokenData, user.id)
        break
      case 'deals':
        syncResult = await syncDeals(supabaseClient, tokenData, user.id)
        break
      default:
        throw new Error(`Unsupported data type: ${dataType}`)
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Successfully synced ${syncResult.recordsUpdated} ${dataType} records`,
      ...syncResult
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Sync error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

async function syncContacts(supabaseClient: any, tokenData: any, userId: string) {
  console.log('Syncing contacts...')
  
  const query = "SELECT Id, FirstName, LastName, Email, Phone, Title, Department FROM Contact WHERE Email != null LIMIT 50"
  
  const response = await fetch(
    `${tokenData.instance_url}/services/data/v58.0/query?q=${encodeURIComponent(query)}`,
    {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      },
    }
  )

  if (!response.ok) {
    throw new Error(`Salesforce query failed: ${response.status}`)
  }

  const data = await response.json()
  const records = data.records || []
  
  console.log(`Found ${records.length} contacts`)
  
  let recordsUpdated = 0
  
  for (const record of records) {
    try {
      const contactData = {
        salesforce_id: record.Id,
        first_name: record.FirstName || 'Unknown',
        last_name: record.LastName || 'Unknown',
        email: record.Email,
        phone: record.Phone || null,
        title: record.Title || null,
        department: record.Department || null,
        owner_id: userId,
        last_sync_at: new Date().toISOString(),
      }

      const { error } = await supabaseClient
        .from('contacts')
        .upsert(contactData, { onConflict: 'salesforce_id' })

      if (!error) {
        recordsUpdated++
      } else {
        console.error('Contact upsert error:', error)
      }
    } catch (err) {
      console.error('Contact processing error:', err)
    }
  }

  return { recordsProcessed: records.length, recordsUpdated }
}

async function syncCompanies(supabaseClient: any, tokenData: any, userId: string) {
  console.log('Syncing companies...')
  
  const query = "SELECT Id, Name, Industry, Website, Phone, BillingCity, BillingState, BillingCountry FROM Account LIMIT 50"
  
  const response = await fetch(
    `${tokenData.instance_url}/services/data/v58.0/query?q=${encodeURIComponent(query)}`,
    {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      },
    }
  )

  if (!response.ok) {
    throw new Error(`Salesforce query failed: ${response.status}`)
  }

  const data = await response.json()
  const records = data.records || []
  
  console.log(`Found ${records.length} companies`)
  
  let recordsUpdated = 0
  
  for (const record of records) {
    try {
      const companyData = {
        salesforce_id: record.Id,
        name: record.Name || 'Unknown Company',
        industry: record.Industry || null,
        website: record.Website || null,
        phone: record.Phone || null,
        city: record.BillingCity || null,
        state: record.BillingState || null,
        country: record.BillingCountry || null,
        assigned_user_id: userId,
        last_sync_at: new Date().toISOString(),
      }

      const { error } = await supabaseClient
        .from('companies')
        .upsert(companyData, { onConflict: 'salesforce_id' })

      if (!error) {
        recordsUpdated++
      } else {
        console.error('Company upsert error:', error)
      }
    } catch (err) {
      console.error('Company processing error:', err)
    }
  }

  return { recordsProcessed: records.length, recordsUpdated }
}

async function syncDeals(supabaseClient: any, tokenData: any, userId: string) {
  console.log('Syncing deals...')
  
  const query = "SELECT Id, Name, StageName, Amount, Probability, CloseDate FROM Opportunity LIMIT 50"
  
  const response = await fetch(
    `${tokenData.instance_url}/services/data/v58.0/query?q=${encodeURIComponent(query)}`,
    {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      },
    }
  )

  if (!response.ok) {
    throw new Error(`Salesforce query failed: ${response.status}`)
  }

  const data = await response.json()
  const records = data.records || []
  
  console.log(`Found ${records.length} deals`)
  
  let recordsUpdated = 0
  
  for (const record of records) {
    try {
      const dealData = {
        salesforce_id: record.Id,
        name: record.Name || 'Unknown Deal',
        stage: record.StageName || 'prospecting',
        amount: record.Amount || null,
        probability: record.Probability || 10,
        expected_close_date: record.CloseDate || null,
        assigned_user_id: userId,
        last_sync_at: new Date().toISOString(),
      }

      const { error } = await supabaseClient
        .from('deals')
        .upsert(dealData, { onConflict: 'salesforce_id' })

      if (!error) {
        recordsUpdated++
      } else {
        console.error('Deal upsert error:', error)
      }
    } catch (err) {
      console.error('Deal processing error:', err)
    }
  }

  return { recordsProcessed: records.length, recordsUpdated }
}