import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SalesforceTokenResponse {
  access_token: string
  refresh_token?: string
  instance_url: string
  id: string
  token_type: string
  issued_at: string
  signature: string
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

    // Extract code and state from URL parameters
    const url = new URL(req.url)
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state')
    const error = url.searchParams.get('error')

    console.log('Received callback with URL:', req.url)
    console.log('Code:', code)
    console.log('State:', state)
    console.log('Error:', error)

    if (error) {
      throw new Error(`Salesforce OAuth error: ${error}`)
    }

    if (!code) {
      throw new Error('Authorization code is required')
    }

    if (!state) {
      throw new Error('State parameter is required')
    }

    // Retrieve the code verifier for PKCE
    const { data: oauthState, error: stateError } = await supabaseClient
      .from('oauth_states')
      .select('code_verifier')
      .eq('state', state)
      .maybeSingle()

    if (stateError || !oauthState) {
      throw new Error('Invalid or expired OAuth state')
    }

    console.log('Exchanging authorization code for access token')

    // Exchange authorization code for access token with PKCE
    const tokenResponse = await fetch('https://login.salesforce.com/services/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: Deno.env.get('SALESFORCE_CLIENT_ID') ?? '',
          client_secret: Deno.env.get('SALESFORCE_CLIENT_SECRET') ?? '',
          redirect_uri: `${Deno.env.get('SUPABASE_URL')}/functions/v1/salesforce-auth`,
          code: code,
          code_verifier: oauthState.code_verifier,
        }),
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('Salesforce token exchange failed:', errorText)
      throw new Error(`Token exchange failed: ${errorText}`)
    }

    const tokenData: SalesforceTokenResponse = await tokenResponse.json()
    console.log('Successfully obtained Salesforce access token')

    // Store the tokens securely (in a real app, you'd encrypt these)
    const { error: upsertError } = await supabaseClient
      .from('salesforce_tokens')
      .upsert({
        user_id: state, // assuming state contains user_id
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        instance_url: tokenData.instance_url,
        token_type: tokenData.token_type,
        expires_at: new Date(Date.now() + 3600000), // 1 hour from now
        updated_at: new Date().toISOString(),
      })

    if (upsertError) {
      console.error('Error storing tokens:', upsertError)
      throw new Error('Failed to store authentication tokens')
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Salesforce authentication successful',
        instance_url: tokenData.instance_url,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Salesforce auth error:', error)
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