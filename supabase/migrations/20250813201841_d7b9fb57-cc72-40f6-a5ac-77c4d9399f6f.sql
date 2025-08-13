-- Fix search_path for security
CREATE OR REPLACE FUNCTION public.update_agent_performance(
  p_agent_id UUID,
  p_metric_date DATE,
  p_execution_time INTEGER,
  p_confidence DECIMAL(3,2),
  p_success BOOLEAN
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.ai_performance_metrics (
    agent_id, 
    metric_date, 
    total_executions, 
    successful_executions, 
    failed_executions,
    avg_execution_time_ms,
    avg_confidence_score
  ) VALUES (
    p_agent_id,
    p_metric_date,
    1,
    CASE WHEN p_success THEN 1 ELSE 0 END,
    CASE WHEN p_success THEN 0 ELSE 1 END,
    p_execution_time,
    p_confidence
  )
  ON CONFLICT (agent_id, metric_date) 
  DO UPDATE SET
    total_executions = ai_performance_metrics.total_executions + 1,
    successful_executions = ai_performance_metrics.successful_executions + 
      CASE WHEN p_success THEN 1 ELSE 0 END,
    failed_executions = ai_performance_metrics.failed_executions + 
      CASE WHEN p_success THEN 0 ELSE 1 END,
    avg_execution_time_ms = (
      (ai_performance_metrics.avg_execution_time_ms * ai_performance_metrics.total_executions + p_execution_time) / 
      (ai_performance_metrics.total_executions + 1)
    ),
    avg_confidence_score = (
      (COALESCE(ai_performance_metrics.avg_confidence_score, 0) * ai_performance_metrics.total_executions + p_confidence) / 
      (ai_performance_metrics.total_executions + 1)
    );
END;
$$;