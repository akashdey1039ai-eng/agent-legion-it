import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { userId } = await req.json()

    if (!userId) {
      throw new Error('User ID is required')
    }

    console.log('Building Salesforce OAuth URL for user:', userId)

    // Get environment variables
    const clientId = Deno.env.get('SALESFORCE_CLIENT_ID')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')

    if (!clientId) {
      throw new Error('Salesforce Client ID not configured')
    }

    if (!supabaseUrl) {
      throw new Error('Supabase URL not configured')
    }

    // Build the OAuth URL
    const authUrl = new URL('https://login.salesforce.com/services/oauth2/authorize')
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('client_id', clientId)
    authUrl.searchParams.set('redirect_uri', `${supabaseUrl}/functions/v1/salesforce-auth`)
    authUrl.searchParams.set('scope', 'api refresh_token offline_access')
    authUrl.searchParams.set('state', userId)

    console.log('Generated OAuth URL:', authUrl.toString())

    return new Response(
      JSON.stringify({
        success: true,
        authUrl: authUrl.toString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Auth URL generation error:', error)
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