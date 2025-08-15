-- Update the ai_agents type check constraint to include the hyphenated version
ALTER TABLE ai_agents DROP CONSTRAINT ai_agents_type_check;

ALTER TABLE ai_agents ADD CONSTRAINT ai_agents_type_check 
CHECK (type = ANY (ARRAY[
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
  'sales-intelligence'::text
]));