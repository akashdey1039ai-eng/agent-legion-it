-- Clean up expired Salesforce tokens for the user
DELETE FROM salesforce_tokens WHERE user_id = '118f896c-99bc-44a1-a1a0-82c7e9ed02bd';