-- Create a function to handle AI agent test logging without UUID constraints
CREATE OR REPLACE FUNCTION public.log_ai_agent_test(
  p_agent_type text,
  p_platform text,
  p_user_id uuid,
  p_records_processed integer,
  p_confidence numeric,
  p_status text,
  p_test_run_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  log_id uuid;
BEGIN
  -- Create a test progress entry
  INSERT INTO public.ai_test_progress (
    test_run_id,
    agent_type,
    platform,
    records_processed,
    confidence,
    status,
    created_at,
    updated_at
  ) VALUES (
    COALESCE(p_test_run_id, gen_random_uuid()),
    p_agent_type,
    p_platform,
    p_records_processed,
    p_confidence,
    p_status,
    now(),
    now()
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$function$