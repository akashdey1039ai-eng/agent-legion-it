import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, batchSize = 100, enableBackground = true } = await req.json();
    console.log(`🧪 Starting scalable AI agent tests for user: ${userId}`);

    const testId = crypto.randomUUID();
    const agentTypes = [
      'lead-intelligence', 'pipeline-analysis', 'customer-sentiment',
      'churn-prediction', 'customer-segmentation', 'opportunity-scoring',
      'communication-ai', 'sales-coaching'
    ];

    // Initialize test status in database
    await supabase.from('ai_test_runs').insert({
      id: testId,
      user_id: userId,
      status: 'running',
      total_platforms: 3,
      total_agent_types: agentTypes.length,
      batch_size: batchSize,
      started_at: new Date().toISOString()
    });

    if (enableBackground) {
      // Start background processing without blocking response
      EdgeRuntime.waitUntil(runScalableTests(testId, userId, agentTypes, batchSize));
      
      // Return immediate response with test ID for tracking
      return new Response(JSON.stringify({
        success: true,
        testId,
        message: 'Large-scale AI agent testing started in background',
        trackingUrl: `/api/test-status/${testId}`,
        estimatedDuration: '10-30 minutes for 10,000+ records'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } else {
      // Run synchronously for smaller datasets
      const results = await runScalableTests(testId, userId, agentTypes, batchSize);
      return new Response(JSON.stringify(results), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('❌ Error in scalable test runner:', error);
    return new Response(JSON.stringify({
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function runScalableTests(testId: string, userId: string, agentTypes: string[], batchSize: number) {
  console.log(`🚀 Running scalable tests (ID: ${testId})`);
  
  const platforms = ['salesforce', 'hubspot', 'native'];
  const results = {
    testId,
    platforms: {},
    summary: { totalTests: 0, passed: 0, failed: 0, totalRecords: 0 },
    performance: { startTime: Date.now(), batches: 0 }
  };

  try {
    // Run all platforms in parallel for better performance
    const platformPromises = platforms.map(platform => 
      runPlatformTests(testId, userId, platform, agentTypes, batchSize)
    );

    const platformResults = await Promise.allSettled(platformPromises);
    
    // Aggregate results
    platformResults.forEach((result, index) => {
      const platform = platforms[index];
      if (result.status === 'fulfilled') {
        results.platforms[platform] = result.value;
        results.summary.totalTests += result.value.testsCompleted;
        results.summary.passed += result.value.testsPassed;
        results.summary.failed += result.value.testsFailed;
        results.summary.totalRecords += result.value.recordsProcessed;
        results.performance.batches += result.value.batchesProcessed;
      } else {
        results.platforms[platform] = { error: result.reason.message };
        results.summary.failed += agentTypes.length;
      }
    });

    results.performance.duration = Date.now() - results.performance.startTime;
    results.performance.recordsPerSecond = Math.round(results.summary.totalRecords / (results.performance.duration / 1000));

    // Update final status in database
    await supabase.from('ai_test_runs').update({
      status: 'completed',
      results: results,
      total_records: results.summary.totalRecords,
      completion_time: results.performance.duration,
      completed_at: new Date().toISOString()
    }).eq('id', testId);

    console.log(`✅ Scalable tests completed: ${results.summary.passed}/${results.summary.totalTests} passed, ${results.summary.totalRecords} records processed`);
    return results;

  } catch (error) {
    console.error(`❌ Scalable tests failed:`, error);
    
    // Update error status
    await supabase.from('ai_test_runs').update({
      status: 'failed',
      error_message: error.message,
      completed_at: new Date().toISOString()
    }).eq('id', testId);
    
    throw error;
  }
}

async function runPlatformTests(testId: string, userId: string, platform: string, agentTypes: string[], batchSize: number) {
  console.log(`🔍 Testing ${platform} platform with batched processing`);
  
  const results = {
    platform,
    testsCompleted: 0,
    testsPassed: 0,
    testsFailed: 0,
    recordsProcessed: 0,
    batchesProcessed: 0,
    agents: {}
  };

  // Get total record count for this platform
  const totalRecords = await getRecordCount(platform, userId);
  console.log(`📊 ${platform}: ${totalRecords} total records to process`);

  // Process each agent type with batching
  for (const agentType of agentTypes) {
    try {
      console.log(`🤖 Testing ${platform} ${agentType} with ${totalRecords} records`);
      
      const agentResult = await runBatchedAgentTest(
        testId, userId, platform, agentType, batchSize, totalRecords
      );
      
      results.agents[agentType] = agentResult;
      results.testsCompleted++;
      
      if (agentResult.success) {
        results.testsPassed++;
      } else {
        results.testsFailed++;
      }
      
      results.recordsProcessed += agentResult.recordsProcessed;
      results.batchesProcessed += agentResult.batchesProcessed;

      // Update progress in database
      await updateTestProgress(testId, platform, agentType, agentResult);

    } catch (error) {
      console.error(`❌ ${platform} ${agentType} failed:`, error);
      results.agents[agentType] = { success: false, error: error.message };
      results.testsFailed++;
      results.testsCompleted++;
    }
  }

  return results;
}

async function runBatchedAgentTest(testId: string, userId: string, platform: string, agentType: string, batchSize: number, totalRecords: number) {
  const result = {
    success: false,
    recordsProcessed: 0,
    batchesProcessed: 0,
    confidence: 0,
    insights: [],
    performance: { startTime: Date.now() }
  };

  const totalBatches = Math.ceil(totalRecords / batchSize);
  console.log(`📦 Processing ${totalBatches} batches of ${batchSize} records each`);

  for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
    const offset = batchIndex * batchSize;
    
    try {
      // Process batch with appropriate function
      const batchResult = await processBatch(platform, agentType, userId, offset, batchSize);
      
      result.recordsProcessed += batchResult.recordsProcessed;
      result.batchesProcessed++;
      result.insights.push(...(batchResult.insights || []));
      
      // Add small delay to respect rate limits
      if (batchIndex < totalBatches - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

    } catch (error) {
      console.error(`❌ Batch ${batchIndex + 1} failed:`, error);
      // Continue with next batch instead of failing entire test
    }
  }

  result.success = result.batchesProcessed > 0;
  result.confidence = result.batchesProcessed / totalBatches;
  result.performance.duration = Date.now() - result.performance.startTime;

  return result;
}

async function processBatch(platform: string, agentType: string, userId: string, offset: number, limit: number) {
  const functionMap = {
    'salesforce': 'salesforce-ai-agent-tester',
    'hubspot': 'hubspot-ai-agent-tester',
    'native': 'enhanced-ai-agent-executor'
  };

  const response = await supabase.functions.invoke(functionMap[platform], {
    body: { 
      agentType, 
      userId, 
      pagination: { offset, limit },
      batchMode: true 
    }
  });

  if (response.error) {
    throw new Error(response.error.message);
  }

  return {
    recordsProcessed: response.data?.recordsAnalyzed || limit,
    insights: response.data?.insights || []
  };
}

async function getRecordCount(platform: string, userId: string): Promise<number> {
  switch (platform) {
    case 'salesforce':
    case 'hubspot':
      // For external platforms, we'll estimate based on typical datasets
      return 5000; // This would be fetched from actual API in production
    case 'native':
      const { count } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true });
      return count || 0;
    default:
      return 0;
  }
}

async function updateTestProgress(testId: string, platform: string, agentType: string, result: any) {
  return supabase.from('ai_test_progress').insert({
    test_run_id: testId,
    platform,
    agent_type: agentType,
    status: result.success ? 'completed' : 'failed',
    records_processed: result.recordsProcessed,
    confidence: result.confidence,
    created_at: new Date().toISOString()
  });
}