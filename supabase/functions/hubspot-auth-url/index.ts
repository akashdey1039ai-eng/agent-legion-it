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

    const clientId = Deno.env.get('HUBSPOT_CLIENT_ID')
    if (!clientId) {
      console.error('HubSpot Client ID not configured')
      return new Response(JSON.stringify({ error: 'HubSpot not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Generate a random state for security
    const state = crypto.randomUUID()
    
    // Store state in database with expiration (valid for 10 minutes)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()
    
    const { error: stateError } = await supabase
      .from('oauth_states')
      .insert({
        state,
        code_verifier: user.id, // Use user ID as identifier
        expires_at: expiresAt
      })

    if (stateError) {
      console.error('Error storing OAuth state:', stateError)
      return new Response(JSON.stringify({ error: 'Failed to generate auth URL' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // HubSpot OAuth scopes - include contacts access for CRM integration
    const scopes = 'oauth crm.objects.contacts.read crm.objects.companies.read crm.objects.deals.read'

    const redirectUri = `https://39ed96a2-ffc6-48c5-9851-b801787f8221.lovableproject.com/hubspot-callback`
    
    const authUrl = `https://app.hubspot.com/oauth/authorize?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${scopes}&` +
      `state=${state}`

    console.log('Generated HubSpot auth URL:', authUrl)

    console.log('Generated HubSpot auth URL for user:', user.id)

    return new Response(JSON.stringify({ authUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error generating HubSpot auth URL:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})