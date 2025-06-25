-- Fix users table schema to match User model
-- Run this to add missing columns to the users table
-- Usage: sudo -u postgres psql -d db_408 -f fix_users_table.sql

-- Add missing OAuth and user-related columns
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS oauth_provider VARCHAR,
ADD COLUMN IF NOT EXISTS oauth_provider_id VARCHAR,
ADD COLUMN IF NOT EXISTS primary_auth_method VARCHAR;

-- Add unique constraints for OAuth fields
DO $$
BEGIN
    -- Add unique constraint for clerk_user_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'users_clerk_user_id_key'
    ) THEN
        ALTER TABLE users ADD CONSTRAINT users_clerk_user_id_key UNIQUE(clerk_user_id);
    END IF;
    
    -- Add unique constraint for oauth provider combination if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'users_oauth_provider_oauth_provider_id_key'
    ) THEN
        ALTER TABLE users ADD CONSTRAINT users_oauth_provider_oauth_provider_id_key UNIQUE(oauth_provider, oauth_provider_id);
    END IF;
END $$;

-- Make password_hash nullable (for OAuth users)
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

\echo 'Users table schema fixed successfully!';
