import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SalesforceRecord {
  Id: string
  [key: string]: any
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { objectType, userId, direction = 'from_salesforce' } = await req.json()

    if (!objectType || !userId) {
      throw new Error('objectType and userId are required')
    }

    console.log(`Starting ${direction} sync for ${objectType}`)

    // Get stored Salesforce tokens
    const { data: tokenData, error: tokenError } = await supabaseClient
      .from('salesforce_tokens')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()

    if (tokenError || !tokenData) {
      throw new Error('Salesforce authentication required. Please authenticate first.')
    }

    // Create sync log entry
    const { data: logEntry, error: logError } = await supabaseClient
      .from('salesforce_sync_log')
      .insert({
        object_type: objectType,
        operation: 'sync',
        sync_direction: direction,
        status: 'pending',
      })
      .select()
      .single()

    if (logError) {
      console.error('Failed to create sync log:', logError)
    }

    const syncId = logEntry?.id

    try {
      if (direction === 'from_salesforce') {
        await syncFromSalesforce(supabaseClient, tokenData, objectType, syncId)
      } else {
        await syncToSalesforce(supabaseClient, tokenData, objectType, syncId)
      }

      // Update sync log as completed
      if (syncId) {
        await supabaseClient
          .from('salesforce_sync_log')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
          })
          .eq('id', syncId)
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: `${objectType} sync completed successfully`,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )

    } catch (syncError) {
      console.error('Sync error:', syncError)
      
      // Update sync log with error
      if (syncId) {
        await supabaseClient
          .from('salesforce_sync_log')
          .update({
            status: 'failed',
            error_message: syncError.message,
            completed_at: new Date().toISOString(),
          })
          .eq('id', syncId)
      }

      throw syncError
    }

  } catch (error) {
    console.error('Salesforce sync error:', error)
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

async function syncFromSalesforce(supabaseClient: any, tokenData: any, objectType: string, syncId?: string) {
  const objectMap: Record<string, { soql: string, table: string, fieldMapping: Record<string, string> }> = {
    account: {
      soql: 'SELECT Id, Name, Industry, Website, Phone, BillingAddress, BillingCity, BillingState, BillingCountry, Description, AnnualRevenue FROM Account',
      table: 'companies',
      fieldMapping: {
        'Id': 'salesforce_id',
        'Name': 'name',
        'Industry': 'industry',
        'Website': 'website',
        'Phone': 'phone',
        'BillingAddress': 'address',
        'BillingCity': 'city',
        'BillingState': 'state',
        'BillingCountry': 'country',
        'Description': 'description',
        'AnnualRevenue': 'revenue',
      }
    },
    contact: {
      soql: 'SELECT Id, FirstName, LastName, Email, Phone, Title, Department, LeadSource FROM Contact',
      table: 'contacts',
      fieldMapping: {
        'Id': 'salesforce_id',
        'FirstName': 'first_name',
        'LastName': 'last_name',
        'Email': 'email',
        'Phone': 'phone',
        'Title': 'title',
        'Department': 'department',
        'LeadSource': 'lead_source',
      }
    },
    opportunity: {
      soql: 'SELECT Id, Name, Description, StageName, Amount, Probability, CloseDate FROM Opportunity',
      table: 'opportunities',
      fieldMapping: {
        'Id': 'salesforce_id',
        'Name': 'name',
        'Description': 'description',
        'StageName': 'stage',
        'Amount': 'amount',
        'Probability': 'probability',
        'CloseDate': 'expected_close_date',
      }
    },
  }

  const config = objectMap[objectType.toLowerCase()]
  if (!config) {
    throw new Error(`Unsupported object type: ${objectType}`)
  }

  console.log(`Fetching ${objectType} records from Salesforce`)

  // Query Salesforce
  const salesforceResponse = await fetch(
    `${tokenData.instance_url}/services/data/v58.0/query?q=${encodeURIComponent(config.soql)}`,
    {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      },
    }
  )

  if (!salesforceResponse.ok) {
    const errorText = await salesforceResponse.text()
    throw new Error(`Salesforce query failed: ${errorText}`)
  }

  const salesforceData = await salesforceResponse.json()
  const records = salesforceData.records as SalesforceRecord[]

  console.log(`Found ${records.length} ${objectType} records in Salesforce`)

  // Transform and upsert records
  for (const record of records) {
    const transformedRecord: Record<string, any> = {
      last_sync_at: new Date().toISOString(),
    }

    // Map Salesforce fields to our database fields
    for (const [sfField, dbField] of Object.entries(config.fieldMapping)) {
      if (record[sfField] !== undefined && record[sfField] !== null) {
        transformedRecord[dbField] = record[sfField]
      }
    }

    // Upsert record
    const { error: upsertError } = await supabaseClient
      .from(config.table)
      .upsert(transformedRecord, {
        onConflict: 'salesforce_id',
      })

    if (upsertError) {
      console.error(`Failed to upsert ${objectType} record:`, upsertError)
    }
  }

  console.log(`Successfully synced ${records.length} ${objectType} records`)
}

async function syncToSalesforce(supabaseClient: any, tokenData: any, objectType: string, syncId?: string) {
  // Implementation for syncing from our database to Salesforce
  // This is a placeholder for future implementation
  console.log(`Sync to Salesforce for ${objectType} not yet implemented`)
  throw new Error('Sync to Salesforce not yet implemented')
}