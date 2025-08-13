-- Rename the test agents to proper production names
UPDATE ai_agents 
SET name = 'Lead Intelligence Agent' 
WHERE name = 'Test Lead Intelligence Agent';

UPDATE ai_agents 
SET name = 'Pipeline Analysis Agent' 
WHERE name = 'Test Pipeline Analysis Agent';