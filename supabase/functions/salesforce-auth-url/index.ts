import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// PKCE helper functions
function generateCodeVerifier(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return btoa(String.fromCharCode.apply(null, Array.from(array)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(digest))))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
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

    // Generate PKCE code verifier and challenge
    const codeVerifier = generateCodeVerifier()
    const codeChallenge = await generateCodeChallenge(codeVerifier)

    // Store the code verifier temporarily (we'll need it in the callback)
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    await supabaseClient
      .from('oauth_states')
      .upsert({
        state: userId,
        code_verifier: codeVerifier,
        expires_at: new Date(Date.now() + 600000).toISOString() // 10 minutes
      })

    // Build the OAuth URL with PKCE
    const authUrl = new URL('https://login.salesforce.com/services/oauth2/authorize')
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('client_id', clientId)
    authUrl.searchParams.set('redirect_uri', `${supabaseUrl}/functions/v1/salesforce-auth`)
    authUrl.searchParams.set('scope', 'api refresh_token offline_access')
    authUrl.searchParams.set('state', userId)
    authUrl.searchParams.set('code_challenge', codeChallenge)
    authUrl.searchParams.set('code_challenge_method', 'S256')

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