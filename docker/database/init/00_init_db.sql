-- Initialize the database
-- This script runs before the main schema

-- Ensure we're connected to the right database
SELECT 'CREATE DATABASE db_408' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'db_408')\gexec

-- Connect to the database
\c db_408;

-- Create user if not exists (for compatibility)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'postgres') THEN
        CREATE USER postgres WITH SUPERUSER;
    END IF;
END
$$;
