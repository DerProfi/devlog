-- Add criteria column for success criteria with target values
ALTER TABLE goals ADD COLUMN criteria JSONB DEFAULT '[]';

-- Example criteria structure:
-- [
--   { "id": "uuid", "title": "3 PRs mergen", "target_value": 3, "current_value": 0 },
--   { "id": "uuid", "title": "5 Unit Tests schreiben", "target_value": 5, "current_value": 2 }
-- ]
