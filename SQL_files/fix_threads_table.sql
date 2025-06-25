-- Add missing columns to threads table
-- Run this if you have existing data you want to preserve

ALTER TABLE threads 
ADD COLUMN view_count INTEGER NOT NULL DEFAULT 0;

ALTER TABLE threads 
ADD COLUMN comment_count INTEGER NOT NULL DEFAULT 0;

ALTER TABLE threads 
ADD COLUMN is_pinned BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE threads 
ADD COLUMN is_locked BOOLEAN NOT NULL DEFAULT FALSE;

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'threads' 
ORDER BY ordinal_position;
