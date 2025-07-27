-- Migration script to add last_activity_at column to threads table
-- This supports the infinite scroll feed trending algorithm

-- Add the last_activity_at column
ALTER TABLE threads 
ADD COLUMN last_activity_at TIMESTAMP;

-- Set initial values for existing threads
-- Use updated_at if available, otherwise created_at
UPDATE threads 
SET last_activity_at = COALESCE(updated_at, created_at)
WHERE last_activity_at IS NULL;

-- Create index for better performance on feed queries
CREATE INDEX IF NOT EXISTS idx_threads_last_activity_at ON threads(last_activity_at DESC);

-- Create composite index for trending queries
CREATE INDEX IF NOT EXISTS idx_threads_trending ON threads(club_id, last_activity_at DESC, like_count DESC, comment_count DESC);

-- Create index for view count queries
CREATE INDEX IF NOT EXISTS idx_threads_view_count ON threads(view_count DESC);

-- Display confirmation
SELECT 'Migration completed: Added last_activity_at column and indexes to threads table' as status;
