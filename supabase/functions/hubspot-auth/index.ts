import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, state } = await req.json()
    
    if (!code || !state) {
      return new Response(JSON.stringify({ error: 'Missing code or state' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verify the state and get user_id
    const { data: stateData, error: stateError } = await supabase
      .from('oauth_states')
      .select('*')
      .eq('state', state)
      .single()

    if (stateError || !stateData) {
      console.error('Invalid state:', stateError)
      return new Response(JSON.stringify({ error: 'Invalid state' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Check if state has expired
    if (new Date(stateData.expires_at) < new Date()) {
      return new Response(JSON.stringify({ error: 'State expired' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const userId = stateData.code_verifier
    const clientId = Deno.env.get('HUBSPOT_CLIENT_ID')
    const clientSecret = Deno.env.get('HUBSPOT_CLIENT_SECRET')
    
    if (!clientId || !clientSecret) {
      console.error('HubSpot credentials not configured')
      return new Response(JSON.stringify({ error: 'HubSpot not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const redirectUri = `https://39ed96a2-ffc6-48c5-9851-b801787f8221.lovableproject.com/hubspot-callback`

    // Exchange code for tokens
    const tokenResponse = await fetch('https://api.hubapi.com/oauth/v1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        code: code,
      }),
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('HubSpot token exchange failed:', errorText)
      return new Response(JSON.stringify({ error: 'Token exchange failed' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const tokenData = await tokenResponse.json()
    console.log('HubSpot token exchange successful')

    // Calculate expiry time
    const expiresAt = new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString()

    // Store tokens in database
    const { error: tokenError } = await supabase
      .from('hubspot_tokens')
      .upsert({
        user_id: userId,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: expiresAt,
        token_type: tokenData.token_type || 'Bearer',
        instance_url: 'https://api.hubapi.com', // HubSpot API base URL
      }, {
        onConflict: 'user_id'
      })

    if (tokenError) {
      console.error('Error storing HubSpot tokens:', tokenError)
      return new Response(JSON.stringify({ error: 'Failed to store tokens' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Clean up the OAuth state
    await supabase
      .from('oauth_states')
      .delete()
      .eq('state', state)

    console.log('HubSpot authentication completed for user:', userId)

    return new Response(JSON.stringify({ 
      success: true,
      message: 'HubSpot authentication successful'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in HubSpot auth:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})