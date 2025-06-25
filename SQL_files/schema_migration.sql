-- Migration script for existing databases
-- Run this if you already have a db_408 database but need to update the schema
-- Usage: psql -U postgres -d db_408 -f schema_migration.sql

-- Add missing columns to comments table
ALTER TABLE comments 
ADD COLUMN IF NOT EXISTS parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;

-- Rename user_id to created_by in comments table (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'comments' AND column_name = 'user_id') THEN
        ALTER TABLE comments RENAME COLUMN user_id TO created_by;
    END IF;
END $$;

-- Create media table if it doesn't exist
CREATE TABLE IF NOT EXISTS media (
    id UUID PRIMARY KEY,
    media_type_id UUID REFERENCES media_types(id) ON DELETE CASCADE,
    title VARCHAR NOT NULL,
    description TEXT,
    author VARCHAR,
    release_year INTEGER,
    genre VARCHAR,
    image_url VARCHAR,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
);

-- Update events table structure
-- First, add new columns
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS location VARCHAR,
ADD COLUMN IF NOT EXISTS max_participants INTEGER,
ADD COLUMN IF NOT EXISTS current_participants INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;

-- Handle event date column migration
DO $$
BEGIN
    -- If we have start_time and end_time, rename start_time to event_date
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'events' AND column_name = 'start_time') THEN
        ALTER TABLE events RENAME COLUMN start_time TO event_date;
        -- Drop end_time if it exists (our model only uses one date)
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'events' AND column_name = 'end_time') THEN
            ALTER TABLE events DROP COLUMN end_time;
        END IF;
    END IF;
END $$;

-- Update notifications table structure
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS title VARCHAR,
ADD COLUMN IF NOT EXISTS reference_type VARCHAR;

-- Rename columns in notifications if they exist
DO $$
BEGIN
    -- Rename message to content
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'notifications' AND column_name = 'message') THEN
        ALTER TABLE notifications RENAME COLUMN message TO content;
    END IF;
    
    -- Rename related_id to reference_id
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'notifications' AND column_name = 'related_id') THEN
        ALTER TABLE notifications RENAME COLUMN related_id TO reference_id;
    END IF;
END $$;

-- Make title NOT NULL in notifications (add default first)
UPDATE notifications SET title = 'Notification' WHERE title IS NULL;
ALTER TABLE notifications ALTER COLUMN title SET NOT NULL;

-- Drop ai_analyses table if it exists (no corresponding model)
DROP TABLE IF EXISTS ai_analyses;

-- Insert sample media types if they don't exist
INSERT INTO media_types (id, name, description) 
SELECT '550e8400-e29b-41d4-a716-446655440001', 'Movie', 'Films and movies'
WHERE NOT EXISTS (SELECT 1 FROM media_types WHERE name = 'Movie');

INSERT INTO media_types (id, name, description) 
SELECT '550e8400-e29b-41d4-a716-446655440002', 'Series', 'TV series and shows'
WHERE NOT EXISTS (SELECT 1 FROM media_types WHERE name = 'Series');

INSERT INTO media_types (id, name, description) 
SELECT '550e8400-e29b-41d4-a716-446655440003', 'Book', 'Books and novels'
WHERE NOT EXISTS (SELECT 1 FROM media_types WHERE name = 'Book');

INSERT INTO media_types (id, name, description) 
SELECT '550e8400-e29b-41d4-a716-446655440004', 'Anime', 'Anime series and movies'
WHERE NOT EXISTS (SELECT 1 FROM media_types WHERE name = 'Anime');

\echo 'Schema migration completed successfully!';
