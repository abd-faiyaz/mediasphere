-- Complete database reset script
-- WARNING: This will delete ALL data in your database
-- Only use if you want to start completely fresh

-- Drop all tables in correct order (reverse of dependencies)
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS threads CASCADE;
DROP TABLE IF EXISTS user_clubs CASCADE;
DROP TABLE IF EXISTS clubs CASCADE;
DROP TABLE IF EXISTS media CASCADE;
DROP TABLE IF EXISTS media_types CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Recreate all tables with correct schema
-- (This will use the updated schema from 01_schema_setup.sql)
-- You should run the updated 01_schema_setup.sql after this
