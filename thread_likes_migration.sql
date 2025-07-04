-- Migration script to add like_count and dislike_count columns to threads table
-- Run this on existing databases to add the new functionality

-- Add like_count column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'threads' AND column_name = 'like_count') THEN
        ALTER TABLE threads ADD COLUMN like_count INTEGER NOT NULL DEFAULT 0;
    END IF;
END $$;

-- Add dislike_count column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'threads' AND column_name = 'dislike_count') THEN
        ALTER TABLE threads ADD COLUMN dislike_count INTEGER NOT NULL DEFAULT 0;
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_threads_like_count ON threads(like_count);
CREATE INDEX IF NOT EXISTS idx_threads_dislike_count ON threads(dislike_count);

-- Update any existing threads to have 0 likes and dislikes (in case the columns existed but had NULL values)
UPDATE threads SET like_count = 0 WHERE like_count IS NULL;
UPDATE threads SET dislike_count = 0 WHERE dislike_count IS NULL;

COMMIT;
