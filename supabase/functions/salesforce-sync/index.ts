import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SalesforceRecord {
  Id: string
  [key: string]: any
}

interface RequestBody {
  objectType?: string
  userId?: string
  direction?: string
  intelligent?: boolean
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

    // Parse request body with better error handling
    let body: RequestBody = {}
    const contentType = req.headers.get('content-type') || ''
    
    try {
      if (contentType.includes('application/json')) {
        const rawBody = await req.text()
        console.log('Raw request body:', rawBody)
        
        if (rawBody.trim()) {
          body = JSON.parse(rawBody)
          console.log('Parsed request body:', JSON.stringify(body, null, 2))
        } else {
          console.log('Empty request body received')
        }
      } else {
        console.log('Non-JSON content type:', contentType)
      }
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError)
      const fallbackText = await req.text().catch(() => '')
      console.log('Raw body that failed to parse:', fallbackText)
    }

    const { objectType, direction = 'from_salesforce', intelligent = false } = body

    console.log('Extracted parameters:', { objectType, direction, intelligent })

    // Extract userId from JWT token
    const authHeader = req.headers.get('authorization')
    let userId = body.userId

    if (!userId && authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '')
        console.log('Attempting to extract user from token...')
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)
        if (user && !userError) {
          userId = user.id
          console.log('Extracted userId from token:', userId)
        } else {
          console.log('Failed to extract user from token:', userError)
        }
      } catch (e) {
        console.log('Token extraction error:', e)
      }
    }

    if (!objectType) {
      console.error('Missing objectType parameter. Body received:', JSON.stringify(body, null, 2))
      throw new Error('objectType is required. Received body: ' + JSON.stringify(body))
    }

    if (!userId) {
      console.error('Missing userId. Auth header:', authHeader ? 'present' : 'missing')
      throw new Error('User authentication required')
    }

    console.log(`Starting ${direction} sync for ${objectType} (userId: ${userId}, intelligent: ${intelligent})`)

    // Check if token exists and is valid
    const { data: tokenData, error: tokenError } = await supabaseClient
      .from('salesforce_tokens')
      .select('*')
      .eq('user_id', userId)
      .gt('expires_at', new Date().toISOString())
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (tokenError) {
      console.error('Token query error:', tokenError)
      throw new Error('Failed to check Salesforce authentication')
    }

    if (!tokenData) {
      throw new Error('Valid Salesforce authentication not found. Please connect your Salesforce account first.')
    }

    console.log('Valid Salesforce token found, proceeding with sync...')

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
      let result
      if (direction === 'from_salesforce' || direction === 'from') {
        result = await syncFromSalesforce(supabaseClient, tokenData, objectType, syncId, userId)
      } else {
        result = await syncToSalesforce(supabaseClient, tokenData, objectType, syncId)
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
          recordsProcessed: result?.recordsProcessed || 0,
          recordsUpdated: result?.recordsUpdated || 0,
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
        error: error.message || 'An unexpected error occurred',
        success: false,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

async function syncFromSalesforce(supabaseClient: any, tokenData: any, objectType: string, syncId?: string, userId?: string) {
  const objectMap: Record<string, { soql: string, table: string, fieldMapping: Record<string, string>, ownerField?: string }> = {
    accounts: {
      soql: 'SELECT Id, Name, Industry, Website, Phone, BillingAddress, BillingCity, BillingState, BillingCountry, Description, AnnualRevenue, NumberOfEmployees FROM Account LIMIT 100',
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
        'AnnualRevenue': 'annual_revenue',
        'NumberOfEmployees': 'employee_count',
      },
      ownerField: 'assigned_user_id'
    },
    companies: {
      soql: 'SELECT Id, Name, Industry, Website, Phone, BillingAddress, BillingCity, BillingState, BillingCountry, Description, AnnualRevenue, NumberOfEmployees FROM Account LIMIT 100',
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
        'AnnualRevenue': 'annual_revenue',
        'NumberOfEmployees': 'employee_count',
      },
      ownerField: 'assigned_user_id'
    },
    contacts: {
      soql: 'SELECT Id, FirstName, LastName, Email, Phone, Title, Department, LeadSource FROM Contact WHERE Email != null LIMIT 100',
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
      },
      ownerField: 'owner_id'
    },
    leads: {
      soql: 'SELECT Id, FirstName, LastName, Email, Phone, Title, Company, Industry, LeadSource, Status, Rating FROM Lead WHERE Email != null LIMIT 100',
      table: 'leads',
      fieldMapping: {
        'Id': 'salesforce_id',
        'FirstName': 'first_name',
        'LastName': 'last_name',
        'Email': 'email',
        'Phone': 'phone',
        'Title': 'title',
        'Company': 'company',
        'Industry': 'industry',
        'LeadSource': 'lead_source',
        'Status': 'status',
        'Rating': 'rating',
      },
      ownerField: 'assigned_user_id'
    },
    deals: {
      soql: 'SELECT Id, Name, Description, StageName, Amount, Probability, CloseDate FROM Opportunity LIMIT 100',
      table: 'deals',
      fieldMapping: {
        'Id': 'salesforce_id',
        'Name': 'name',
        'Description': 'description',
        'StageName': 'stage',
        'Amount': 'amount',
        'Probability': 'probability',
        'CloseDate': 'expected_close_date',
      },
      ownerField: 'assigned_user_id'
    },
    opportunities: {
      soql: 'SELECT Id, Name, Description, StageName, Amount, Probability, CloseDate FROM Opportunity LIMIT 100',
      table: 'opportunities',
      fieldMapping: {
        'Id': 'salesforce_id',
        'Name': 'name',
        'Description': 'description',
        'StageName': 'stage',
        'Amount': 'amount',
        'Probability': 'probability',
        'CloseDate': 'expected_close_date',
      },
      ownerField: 'owner_id'
    },
  }

  const config = objectMap[objectType.toLowerCase()]
  if (!config) {
    throw new Error(`Unsupported object type: ${objectType}. Supported types: ${Object.keys(objectMap).join(', ')}`)
  }

  console.log(`Fetching ${objectType} records from Salesforce using query: ${config.soql}`)

  // Test token validity first
  const testResponse = await fetch(`${tokenData.instance_url}/services/data/v58.0/`, {
    headers: {
      'Authorization': `Bearer ${tokenData.access_token}`,
      'Content-Type': 'application/json',
    },
  })

  if (!testResponse.ok) {
    throw new Error(`Salesforce token invalid or expired. Status: ${testResponse.status}`)
  }

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
    console.error('Salesforce query failed:', errorText)
    throw new Error(`Salesforce query failed (${salesforceResponse.status}): ${errorText}`)
  }

  const salesforceData = await salesforceResponse.json()
  
  if (!salesforceData.records) {
    throw new Error('No records property in Salesforce response')
  }

  const records = salesforceData.records as SalesforceRecord[]
  console.log(`Found ${records.length} ${objectType} records in Salesforce`)

  if (records.length === 0) {
    console.log(`No records found for ${objectType}`)
    return { recordsProcessed: 0, recordsUpdated: 0 }
  }

  let recordsUpdated = 0
  const batchSize = 10

  // Process records in batches
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize)
    
    for (const record of batch) {
      try {
        const transformedRecord: Record<string, any> = {
          last_sync_at: new Date().toISOString(),
        }

        // Add owner/assigned user if available
        if (config.ownerField && userId) {
          transformedRecord[config.ownerField] = userId
        }

        // Map Salesforce fields to our database fields
        for (const [sfField, dbField] of Object.entries(config.fieldMapping)) {
          const value = record[sfField]
          if (value !== undefined && value !== null && value !== '') {
            // Handle different data types
            if (typeof value === 'string') {
              transformedRecord[dbField] = value.trim()
            } else if (typeof value === 'number') {
              transformedRecord[dbField] = value
            } else if (value instanceof Date || (typeof value === 'string' && value.includes('-'))) {
              // Handle dates
              transformedRecord[dbField] = value
            } else {
              transformedRecord[dbField] = value
            }
          }
        }

        // Skip if required fields are missing
        const requiredFields = config.table === 'contacts' || config.table === 'leads' ? ['email', 'first_name', 'last_name'] : ['name']
        const hasRequiredFields = requiredFields.every(field => transformedRecord[field])
        
        if (!hasRequiredFields) {
          console.log(`Skipping record due to missing required fields:`, transformedRecord)
          continue
        }

        console.log(`Upserting ${config.table} record:`, JSON.stringify(transformedRecord, null, 2))

        // Upsert record
        const { data: upsertData, error: upsertError } = await supabaseClient
          .from(config.table)
          .upsert(transformedRecord, {
            onConflict: 'salesforce_id',
            ignoreDuplicates: false
          })
          .select()

        if (upsertError) {
          console.error(`Failed to upsert ${objectType} record (${record.Id}):`, upsertError)
          
          // Try without the problematic fields if it's a constraint error
          if (upsertError.message.includes('constraint') || upsertError.message.includes('violates')) {
            console.log('Retrying with minimal data due to constraint error...')
            const minimalRecord = {
              salesforce_id: record.Id,
              last_sync_at: new Date().toISOString(),
            }
            
            // Add essential fields only
            if (config.table === 'contacts' || config.table === 'leads') {
              minimalRecord['first_name'] = record.FirstName || 'Unknown'
              minimalRecord['last_name'] = record.LastName || 'Unknown'
              minimalRecord['email'] = record.Email
              if (config.ownerField && userId) {
                minimalRecord[config.ownerField] = userId
              }
            } else {
              minimalRecord['name'] = record.Name || 'Unknown'
              if (config.ownerField && userId) {
                minimalRecord[config.ownerField] = userId
              }
            }
            
            const { error: retryError } = await supabaseClient
              .from(config.table)
              .upsert(minimalRecord, { onConflict: 'salesforce_id' })
              
            if (!retryError) {
              recordsUpdated++
              console.log('Minimal record inserted successfully')
            } else {
              console.error('Retry also failed:', retryError)
            }
          }
        } else {
          recordsUpdated++
          console.log(`Successfully upserted ${config.table} record`)
        }

        // Small delay to prevent overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 50))

      } catch (recordError) {
        console.error(`Error processing individual record:`, recordError)
      }
    }
  }

  console.log(`Successfully processed ${records.length} ${objectType} records, updated ${recordsUpdated}`)
  return { recordsProcessed: records.length, recordsUpdated }
}

async function syncToSalesforce(supabaseClient: any, tokenData: any, objectType: string, syncId?: string) {
  // Implementation for syncing from our database to Salesforce
  // This is a placeholder for future implementation
  console.log(`Sync to Salesforce for ${objectType} not yet implemented`)
  throw new Error('Sync to Salesforce not yet implemented')
}