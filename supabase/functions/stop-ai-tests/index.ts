import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface StopTestsRequest {
  userId?: string;
  testRunId?: string; // Optional: stop specific test run
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🛑 Stop AI tests request received');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Verify the user
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Invalid authentication');
    }

    const requestBody: StopTestsRequest = await req.json().catch(() => ({}));
    const userId = requestBody.userId || user.id;

    console.log(`🛑 Stopping tests for user: ${userId}`);

    // Find all running test runs for the user
    const { data: runningTests, error: fetchError } = await supabase
      .from('ai_test_runs')
      .select('id, status, started_at')
      .eq('user_id', userId)
      .eq('status', 'running');

    if (fetchError) {
      console.error('❌ Error fetching running tests:', fetchError);
      throw fetchError;
    }

    if (!runningTests || runningTests.length === 0) {
      console.log('ℹ️ No running tests found');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No running tests found',
          stoppedCount: 0
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    console.log(`🔍 Found ${runningTests.length} running tests to stop`);

    // Stop specific test run if specified
    if (requestBody.testRunId) {
      const specificTest = runningTests.find(test => test.id === requestBody.testRunId);
      if (specificTest) {
        const { error: stopError } = await supabase
          .from('ai_test_runs')
          .update({ 
            status: 'cancelled',
            completed_at: new Date().toISOString(),
            completion_time: Date.now() - new Date(specificTest.started_at).getTime()
          })
          .eq('id', requestBody.testRunId);

        if (stopError) {
          console.error('❌ Error stopping specific test:', stopError);
          throw stopError;
        }

        console.log(`✅ Stopped specific test: ${requestBody.testRunId}`);
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Test stopped successfully',
            stoppedCount: 1,
            testRunId: requestBody.testRunId
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        );
      }
    }

    // Stop all running tests for the user
    const testIds = runningTests.map(test => test.id);
    const currentTime = new Date().toISOString();

    // Update all running tests to cancelled
    const { error: updateError } = await supabase
      .from('ai_test_runs')
      .update({ 
        status: 'cancelled',
        completed_at: currentTime,
        completion_time: Date.now() - new Date(runningTests[0].started_at).getTime()
      })
      .in('id', testIds);

    if (updateError) {
      console.error('❌ Error updating test runs:', updateError);
      throw updateError;
    }

    // Update any running progress records to cancelled
    const { error: progressError } = await supabase
      .from('ai_test_progress')
      .update({ status: 'cancelled' })
      .in('test_run_id', testIds)
      .eq('status', 'processing');

    if (progressError) {
      console.error('⚠️ Warning: Error updating progress records:', progressError);
      // Don't throw here, as the main tests are already stopped
    }

    // Update any running batches to cancelled
    const { error: batchError } = await supabase
      .from('ai_test_batches')
      .update({ 
        status: 'cancelled',
        completed_at: currentTime
      })
      .in('test_run_id', testIds)
      .in('status', ['pending', 'running']);

    if (batchError) {
      console.error('⚠️ Warning: Error updating batch records:', batchError);
      // Don't throw here, as the main tests are already stopped
    }

    console.log(`✅ Successfully stopped ${runningTests.length} test runs`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully stopped ${runningTests.length} running tests`,
        stoppedCount: runningTests.length,
        stoppedTestIds: testIds
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('❌ Error stopping tests:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to stop tests'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});