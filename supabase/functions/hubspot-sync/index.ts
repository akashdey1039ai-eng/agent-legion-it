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
  console.log('=== HubSpot Sync Function Started ===')
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request')
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Processing sync request')
    
    // Safely parse request body
    let requestBody = {}
    try {
      const text = await req.text()
      console.log('Raw request body:', text)
      if (text) {
        requestBody = JSON.parse(text)
      }
    } catch (err) {
      console.error('Request body parsing error:', err)
      // Use defaults if no body provided
    }
    
    const { objectType = 'contacts', direction = 'from', dataType } = requestBody
    // Support both objectType and dataType for compatibility
    const actualObjectType = objectType || dataType || 'contacts'
    
    console.log(`Sync request for objectType: ${actualObjectType}, direction: ${direction}`)
    
    if (!actualObjectType) {
      console.error('Missing objectType parameter')
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
    
    console.log('Verifying user authentication')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) {
      console.error('Authentication failed:', userError)
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const userId = user.id
    console.log(`User authenticated: ${userId}`)

    // Get HubSpot tokens
    console.log('Fetching HubSpot tokens')
    const { data: tokenData, error: tokenError } = await supabase
      .from('hubspot_tokens')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (tokenError || !tokenData) {
      console.error('No HubSpot tokens found for user:', userId, tokenError)
      return new Response(JSON.stringify({ error: 'HubSpot not connected' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Check if token is expired and try to refresh if needed
    let currentToken = tokenData
    if (new Date(tokenData.expires_at) <= new Date()) {
      console.log('HubSpot token expired, attempting refresh...')
      try {
        currentToken = await refreshHubSpotToken(supabase, tokenData, userId)
        console.log('Token refreshed successfully')
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError)
        return new Response(JSON.stringify({ 
          error: 'HubSpot token expired and refresh failed. Please reconnect your HubSpot account.' 
        }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    console.log(`Starting HubSpot ${actualObjectType} sync for user: ${userId}`)

    // Create sync log entry
    console.log('Creating sync log entry')
    const { data: logEntry, error: logError } = await supabase
      .from('hubspot_sync_log')
      .insert({
        object_type: actualObjectType,
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
        await syncFromHubSpot(supabase, currentToken.access_token, actualObjectType, userId)
      } else {
        throw new Error('Sync to HubSpot not yet implemented')
      }

      // Update sync log to completed
      await supabase
        .from('hubspot_sync_log')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', logEntry.id)

      console.log(`HubSpot ${actualObjectType} sync completed successfully`)

      return new Response(JSON.stringify({ 
        success: true,
        message: `${actualObjectType} sync completed successfully`,
        recordsProcessed: 0,
        recordsUpdated: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })

    } catch (syncError) {
      console.error(`HubSpot ${actualObjectType} sync failed:`, syncError)
      
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
    console.error('Error in HubSpot sync function:', error)
    return new Response(JSON.stringify({ 
      error: 'Internal server error', 
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

async function refreshHubSpotToken(supabase: any, tokenData: any, userId: string) {
  console.log('Refreshing HubSpot token...')
  
  const hubspotClientId = Deno.env.get('HUBSPOT_CLIENT_ID')!
  const hubspotClientSecret = Deno.env.get('HUBSPOT_CLIENT_SECRET')!
  
  const response = await fetch('https://api.hubapi.com/oauth/v1/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: hubspotClientId,
      client_secret: hubspotClientSecret,
      refresh_token: tokenData.refresh_token,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Token refresh failed:', errorText)
    throw new Error(`Token refresh failed: ${response.status} ${errorText}`)
  }

  const tokenResponse = await response.json()
  
  // Update token in database
  const newExpiresAt = new Date(Date.now() + (tokenResponse.expires_in * 1000)).toISOString()
  
  const { data: updatedToken, error } = await supabase
    .from('hubspot_tokens')
    .update({
      access_token: tokenResponse.access_token,
      refresh_token: tokenResponse.refresh_token || tokenData.refresh_token,
      expires_at: newExpiresAt,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error('Failed to update token in database:', error)
    throw new Error('Failed to update refreshed token')
  }

  return updatedToken
}

async function syncFromHubSpot(supabase: any, accessToken: string, objectType: string, userId: string) {
  console.log(`Starting sync from HubSpot for ${objectType}`)
  
  const objectMappings = {
    'contacts': {
      hubspotEndpoint: 'contacts',
      table: 'contacts',
      properties: [
        'firstname', 'lastname', 'email', 'phone', 'jobtitle', 
        'lifecyclestage', 'createdate', 'lastmodifieddate'
      ],
      fieldMapping: {
        firstname: 'first_name',
        lastname: 'last_name',
        email: 'email',
        phone: 'phone',
        jobtitle: 'title',
        lifecyclestage: 'status'
      },
      statusMapping: {
        'subscriber': 'new',
        'lead': 'new', 
        'marketingqualifiedlead': 'qualified',
        'salesqualifiedlead': 'qualified',
        'opportunity': 'working',
        'customer': 'converted',
        'evangelist': 'converted',
        'other': 'new'
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
        hubspot_id: record.id, // Store HubSpot ID for tracking
        salesforce_id: record.id, // Also store in salesforce_id for consistency
        last_sync_at: new Date().toISOString(),
        owner_id: userId // Assign to the current user
      }

      // Add assigned_user_id only for companies and deals, not contacts
      if (objectType === 'companies' || objectType === 'deals') {
        transformed.assigned_user_id = userId
      }

    // Apply field mappings
    for (const [hubspotField, localField] of Object.entries(mapping.fieldMapping)) {
      const value = record.properties[hubspotField]
      if (value !== null && value !== undefined) {
        // Special handling for status field with mapping
        if (localField === 'status' && mapping.statusMapping) {
          transformed[localField] = mapping.statusMapping[value] || 'new'
        } else {
          transformed[localField] = value
        }
      }
    }

    return transformed
  })

  if (transformedRecords.length > 0) {
    console.log(`Upserting ${transformedRecords.length} records to ${mapping.table}`)
    console.log('Sample record:', JSON.stringify(transformedRecords[0], null, 2))
    
    // For contacts, handle email conflicts by updating existing records
    if (objectType === 'contacts') {
      // First, try to update existing records by email
      for (const record of transformedRecords) {
        const { error } = await supabase
          .from(mapping.table)
          .upsert(record, { 
            onConflict: 'email',
            ignoreDuplicates: false 
          })
        
        if (error) {
          console.error('Database upsert error for record:', record, error)
          // If email conflict still fails, try by salesforce_id only
          const { error: salesforceError } = await supabase
            .from(mapping.table)
            .upsert(record, { 
              onConflict: 'salesforce_id',
              ignoreDuplicates: false 
            })
          
          if (salesforceError) {
            console.error('Failed to upsert record even by salesforce_id:', salesforceError)
            throw new Error(`Database upsert failed: ${salesforceError.message}`)
          }
        }
      }
    } else {
      // For non-contact objects, use salesforce_id conflict resolution
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
    }

    console.log(`Successfully synced ${transformedRecords.length} ${objectType} records`)
  } else {
    console.log(`No ${objectType} records to sync`)
  }
}