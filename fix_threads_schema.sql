-- Fix missing columns in threads table
-- Run this to add missing columns that exist in the Thread model but not in the database

-- Add missing columns to threads table (PostgreSQL syntax)
-- Add like_count column if it doesn't exist
ALTER TABLE threads ADD COLUMN like_count INTEGER NOT NULL DEFAULT 0;

-- Add dislike_count column if it doesn't exist  
ALTER TABLE threads ADD COLUMN dislike_count INTEGER NOT NULL DEFAULT 0;

-- Verify the threads table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'threads' 
ORDER BY ordinal_position;

-- Create thread_images table if it doesn't exist
CREATE TABLE IF NOT EXISTS thread_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    image_name VARCHAR(255),
    file_size BIGINT,
    content_type VARCHAR(100),
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index for thread_images if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_thread_images_thread_id ON thread_images(thread_id);

-- Show final table structure
\d threads
\d thread_images
