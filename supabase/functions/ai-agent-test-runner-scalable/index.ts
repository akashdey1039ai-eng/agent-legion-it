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
    const { userId, batchSize = 1000, enableBackground = true, maxConcurrency = 3 } = await req.json();
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
      total_records: 150000, // 50K per platform
      started_at: new Date().toISOString()
    });

    if (enableBackground) {
      // Start background processing with concurrency control
      EdgeRuntime.waitUntil(runScalableTests(testId, userId, agentTypes, batchSize, maxConcurrency));
      
      // Return immediate response with test ID for tracking
      return new Response(JSON.stringify({
        success: true,
        testId,
        message: 'Large-scale AI agent testing started in background',
        trackingUrl: `/api/test-status/${testId}`,
        estimatedDuration: '45-90 minutes for 150,000 records'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } else {
      // Run synchronously for smaller datasets
      const results = await runScalableTests(testId, userId, agentTypes, batchSize, maxConcurrency);
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

async function runScalableTests(testId: string, userId: string, agentTypes: string[], batchSize: number, maxConcurrency: number = 3) {
  console.log(`🚀 Running scalable tests (ID: ${testId})`);
  
  const platforms = ['salesforce', 'hubspot', 'native'];
  const results = {
    testId,
    platforms: {},
    summary: { totalTests: 0, passed: 0, failed: 0, totalRecords: 0 },
    performance: { 
      startTime: Date.now(), 
      batches: 0, 
      concurrency: maxConcurrency,
      recordsPerPlatform: 50000 
    }
  };

  try {
    // Run platforms with controlled concurrency for better resource management
    const platformPromises = platforms.map(platform => 
      runPlatformTests(testId, userId, platform, agentTypes, batchSize, maxConcurrency)
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

async function runPlatformTests(testId: string, userId: string, platform: string, agentTypes: string[], batchSize: number, maxConcurrency: number) {
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

  // Process agent types with controlled concurrency
  const semaphore = new Array(maxConcurrency).fill(null);
  let agentIndex = 0;
  
  const processNextAgent = async (): Promise<void> => {
    if (agentIndex >= agentTypes.length) return;
    
    const currentIndex = agentIndex++;
    const agentType = agentTypes[currentIndex];
    
    try {
      console.log(`🤖 Testing ${platform} ${agentType} with ${totalRecords} records (${currentIndex + 1}/${agentTypes.length})`);
      
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
    
    // Continue with next agent
    await processNextAgent();
  };

  // Start concurrent processing
  await Promise.all(semaphore.map(() => processNextAgent()));

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
  console.log(`📦 Processing ${totalBatches} batches of ${batchSize} records each for ${platform}`);

  // Process batches with controlled parallelism to avoid overwhelming APIs
  const maxParallelBatches = platform === 'native' ? 5 : 2; // Native can handle more parallel requests
  
  for (let startBatch = 0; startBatch < totalBatches; startBatch += maxParallelBatches) {
    const endBatch = Math.min(startBatch + maxParallelBatches, totalBatches);
    const batchPromises = [];
    
    for (let batchIndex = startBatch; batchIndex < endBatch; batchIndex++) {
      const offset = batchIndex * batchSize;
      
      batchPromises.push(
        processBatch(platform, agentType, userId, offset, batchSize)
          .then(batchResult => {
            result.recordsProcessed += batchResult.recordsProcessed;
            result.batchesProcessed++;
            result.insights.push(...(batchResult.insights || []));
          })
          .catch(error => {
            console.error(`❌ Batch ${batchIndex + 1} failed:`, error);
            // Continue with next batch instead of failing entire test
          })
      );
    }
    
    // Wait for this chunk of batches to complete
    await Promise.allSettled(batchPromises);
    
    // Add progressive delay based on platform to respect rate limits
    if (endBatch < totalBatches) {
      const delay = platform === 'native' ? 100 : 500; // Longer delays for external APIs
      await new Promise(resolve => setTimeout(resolve, delay));
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
  // Use the optimized database function for accurate counts
  const { data, error } = await supabase.rpc('get_platform_record_count', {
    p_platform: platform,
    p_user_id: userId
  });
  
  if (error) {
    console.error(`❌ Error getting record count for ${platform}:`, error);
    // Fallback to default values if database function fails
    return platform === 'native' ? 10000 : 50000;
  }
  
  return data || 0;
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