import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface HubSpotRecord {
  id: string
  properties: Record<string, any>
  createdAt: string
  updatedAt: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { objectType, direction = 'from' } = await req.json()
    
    if (!objectType) {
      return new Response(JSON.stringify({ error: 'Missing objectType parameter' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get the auth header to verify the user
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const userId = user.id

    // Get HubSpot tokens
    const { data: tokenData, error: tokenError } = await supabase
      .from('hubspot_tokens')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (tokenError || !tokenData) {
      console.error('No HubSpot tokens found for user:', userId)
      return new Response(JSON.stringify({ error: 'HubSpot not connected' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Check if token is expired
    if (new Date(tokenData.expires_at) <= new Date()) {
      console.error('HubSpot token expired for user:', userId)
      return new Response(JSON.stringify({ error: 'HubSpot token expired' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log(`Starting HubSpot ${objectType} sync for user: ${userId}`)

    // Create sync log entry
    const { data: logEntry, error: logError } = await supabase
      .from('hubspot_sync_log')
      .insert({
        object_type: objectType,
        operation: 'sync',
        sync_direction: direction,
        status: 'pending'
      })
      .select()
      .single()

    if (logError) {
      console.error('Failed to create sync log:', logError)
      return new Response(JSON.stringify({ error: 'Failed to create sync log' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    try {
      if (direction === 'from') {
        await syncFromHubSpot(supabase, tokenData.access_token, objectType)
      } else {
        await syncToHubSpot(supabase, tokenData.access_token, objectType)
      }

      // Update sync log to completed
      await supabase
        .from('hubspot_sync_log')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', logEntry.id)

      console.log(`HubSpot ${objectType} sync completed successfully`)

      return new Response(JSON.stringify({ 
        success: true,
        message: `${objectType} sync completed successfully`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })

    } catch (syncError) {
      console.error(`HubSpot ${objectType} sync failed:`, syncError)
      
      // Update sync log to failed
      await supabase
        .from('hubspot_sync_log')
        .update({ 
          status: 'failed',
          error_message: syncError.message,
          completed_at: new Date().toISOString()
        })
        .eq('id', logEntry.id)

      return new Response(JSON.stringify({ 
        error: `Sync failed: ${syncError.message}`
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

  } catch (error) {
    console.error('Error in HubSpot sync:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

async function syncFromHubSpot(supabase: any, accessToken: string, objectType: string) {
  const objectMappings = {
    'contacts': {
      hubspotEndpoint: 'contacts',
      table: 'contacts',
      properties: [
        'firstname', 'lastname', 'email', 'phone', 'jobtitle', 
        'company', 'lifecyclestage', 'createdate', 'lastmodifieddate'
      ],
      fieldMapping: {
        firstname: 'first_name',
        lastname: 'last_name',
        email: 'email',
        phone: 'phone',
        jobtitle: 'title',
        lifecyclestage: 'status'
      }
    },
    'companies': {
      hubspotEndpoint: 'companies',
      table: 'companies',
      properties: [
        'name', 'domain', 'industry', 'phone', 'city', 'state', 
        'country', 'description', 'annualrevenue', 'createdate', 'lastmodifieddate'
      ],
      fieldMapping: {
        name: 'name',
        domain: 'website',
        industry: 'industry',
        phone: 'phone',
        city: 'city',
        state: 'state',
        country: 'country',
        description: 'description',
        annualrevenue: 'revenue'
      }
    },
    'deals': {
      hubspotEndpoint: 'deals',
      table: 'opportunities',
      properties: [
        'dealname', 'amount', 'dealstage', 'closedate', 'probability',
        'description', 'createdate', 'lastmodifieddate'
      ],
      fieldMapping: {
        dealname: 'name',
        amount: 'amount',
        dealstage: 'stage',
        closedate: 'expected_close_date',
        probability: 'probability',
        description: 'description'
      }
    }
  }

  const mapping = objectMappings[objectType]
  if (!mapping) {
    throw new Error(`Unsupported object type: ${objectType}`)
  }

  // Fetch data from HubSpot
  const url = `https://api.hubapi.com/crm/v3/objects/${mapping.hubspotEndpoint}?properties=${mapping.properties.join(',')}&limit=100`
  
  console.log(`Fetching from HubSpot URL: ${url}`)
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })

  console.log(`HubSpot API response status: ${response.status}`)

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`HubSpot API error details: ${errorText}`)
    throw new Error(`HubSpot API error: ${response.status} ${errorText}`)
  }

  const data = await response.json()
  const records = data.results || []

  console.log(`Fetched ${records.length} ${objectType} from HubSpot`)

  // Transform and upsert records
  const transformedRecords = records.map((record: HubSpotRecord) => {
    const transformed: any = {
      salesforce_id: record.id, // Store HubSpot ID in salesforce_id field for consistency
      last_sync_at: new Date().toISOString()
    }

    // Apply field mappings
    for (const [hubspotField, localField] of Object.entries(mapping.fieldMapping)) {
      const value = record.properties[hubspotField]
      if (value !== null && value !== undefined) {
        transformed[localField] = value
      }
    }

    return transformed
  })

  if (transformedRecords.length > 0) {
    console.log(`Upserting ${transformedRecords.length} records to ${mapping.table}`)
    console.log('Sample record:', JSON.stringify(transformedRecords[0], null, 2))
    
    const { error } = await supabase
      .from(mapping.table)
      .upsert(transformedRecords, { 
        onConflict: 'salesforce_id',
        ignoreDuplicates: false 
      })

    if (error) {
      console.error('Database upsert error details:', error)
      throw new Error(`Database upsert failed: ${error.message}`)
    }

    console.log(`Successfully synced ${transformedRecords.length} ${objectType} records`)
  } else {
    console.log(`No ${objectType} records to sync`)
  }
}

async function syncToHubSpot(supabase: any, accessToken: string, objectType: string) {
  // Placeholder for syncing data TO HubSpot
  console.log(`Syncing ${objectType} to HubSpot - not yet implemented`)
  throw new Error('Sync to HubSpot not yet implemented')
}