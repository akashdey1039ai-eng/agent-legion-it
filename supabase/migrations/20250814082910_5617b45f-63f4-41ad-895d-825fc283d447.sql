-- Clean up all expired OAuth states (they expire after a certain time)
DELETE FROM oauth_states WHERE expires_at < NOW();