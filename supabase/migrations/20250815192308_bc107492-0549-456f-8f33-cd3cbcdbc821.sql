-- Drop the existing constraint and add a new one with Customer Intelligence agent types
ALTER TABLE ai_agents DROP CONSTRAINT ai_agents_type_check;

-- Add updated constraint that includes all existing types plus our new Customer Intelligence types
ALTER TABLE ai_agents ADD CONSTRAINT ai_agents_type_check CHECK (
  type = ANY (ARRAY[
    'lead_intelligence'::text, 
    'lead-intelligence'::text, 
    'pipeline_analysis'::text, 
    'pipeline-analysis'::text, 
    'data_enrichment'::text, 
    'data-enrichment'::text, 
    'data_sync'::text, 
    'data-sync'::text, 
    'conversational'::text, 
    'sales_intelligence'::text, 
    'sales-intelligence'::text,
    -- New Customer Intelligence agent types
    'customer-sentiment'::text,
    'churn-prediction'::text,
    'customer-segmentation'::text
  ])
);