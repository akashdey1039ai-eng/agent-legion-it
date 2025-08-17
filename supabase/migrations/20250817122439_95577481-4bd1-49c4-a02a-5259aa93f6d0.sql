-- Stop all running AI test runs for user
UPDATE ai_test_runs 
SET 
  status = 'cancelled',
  completed_at = NOW(),
  completion_time = EXTRACT(EPOCH FROM (NOW() - started_at)) * 1000
WHERE user_id = '118f896c-99bc-44a1-a1a0-82c7e9ed02bd' 
  AND status = 'running';

-- Update any running progress records to cancelled
UPDATE ai_test_progress 
SET status = 'cancelled'
WHERE test_run_id IN (
  SELECT id FROM ai_test_runs 
  WHERE user_id = '118f896c-99bc-44a1-a1a0-82c7e9ed02bd'
) AND status = 'processing';

-- Update any running batches to cancelled  
UPDATE ai_test_batches
SET 
  status = 'cancelled',
  completed_at = NOW()
WHERE test_run_id IN (
  SELECT id FROM ai_test_runs 
  WHERE user_id = '118f896c-99bc-44a1-a1a0-82c7e9ed02bd'
) AND status IN ('pending', 'running');