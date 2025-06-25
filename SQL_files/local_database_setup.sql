-- MediaSphere Local Database Setup
-- This script creates the database and applies the correct schema for local development
-- Run this with: psql -U postgres -f local_database_setup.sql

-- Create database (run this first)
CREATE DATABASE db_408;

-- Connect to the database
\c db_408;

-- Create tables with correct schema matching the model classes
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    password_hash VARCHAR, -- Made nullable for OAuth users
    username VARCHAR NOT NULL,
    role VARCHAR NOT NULL, -- e.g., admin, user, moderator
    profile_pic VARCHAR,
    
    -- OAuth and Clerk integration fields
    clerk_user_id VARCHAR,
    oauth_provider VARCHAR, -- 'local', 'google', 'facebook', 'clerk'
    oauth_provider_id VARCHAR,
    is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    first_name VARCHAR,
    last_name VARCHAR,
    oauth_profile_picture VARCHAR,
    last_oauth_sync TIMESTAMP,
    primary_auth_method VARCHAR, -- 'local', 'oauth', 'hybrid'
    last_login_at TIMESTAMP,
    last_login_method VARCHAR,
    account_created_via VARCHAR,
    
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    
    -- Add constraints for OAuth fields
    UNIQUE(clerk_user_id),
    UNIQUE(oauth_provider, oauth_provider_id)
);

CREATE TABLE media_types (
    id UUID PRIMARY KEY,
    name VARCHAR NOT NULL, -- Movie, Series, Book, Anime
    description TEXT
);

CREATE TABLE media (
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

CREATE TABLE clubs (
    id UUID PRIMARY KEY,
    media_type_id UUID REFERENCES media_types(id) ON DELETE CASCADE,
    name VARCHAR NOT NULL,
    description TEXT,
    created_by UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE threads (
    id UUID PRIMARY KEY,
    club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
    title VARCHAR NOT NULL,
    content TEXT,
    created_by UUID REFERENCES users(id) ON DELETE CASCADE,
    view_count INTEGER NOT NULL DEFAULT 0,
    comment_count INTEGER NOT NULL DEFAULT 0,
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    is_locked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
);

CREATE TABLE comments (
    id UUID PRIMARY KEY,
    thread_id UUID REFERENCES threads(id) ON DELETE CASCADE,
    created_by UUID REFERENCES users(id) ON DELETE CASCADE, -- Fixed: was user_id
    content TEXT NOT NULL,
    parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- Added
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP -- Added
);

CREATE TABLE events (
    id UUID PRIMARY KEY,
    club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
    title VARCHAR NOT NULL,
    description TEXT,
    event_date TIMESTAMP NOT NULL, -- Fixed: was start_time/end_time
    location VARCHAR, -- Added
    created_by UUID REFERENCES users(id) ON DELETE CASCADE,
    max_participants INTEGER, -- Added
    current_participants INTEGER NOT NULL DEFAULT 0, -- Added
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP -- Added
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR NOT NULL, -- Fixed: was missing
    content TEXT, -- Fixed: was message
    type VARCHAR NOT NULL, -- comment, event, AI, etc.
    is_read BOOLEAN DEFAULT FALSE,
    reference_id UUID, -- Fixed: was related_id
    reference_type VARCHAR, -- Added
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE user_clubs (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
    joined_at TIMESTAMP NOT NULL,
    PRIMARY KEY (user_id, club_id)
);

-- Insert some sample media types
INSERT INTO media_types (id, name, description) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'Movie', 'Films and movies'),
    ('550e8400-e29b-41d4-a716-446655440002', 'Series', 'TV series and shows'),
    ('550e8400-e29b-41d4-a716-446655440003', 'Book', 'Books and novels'),
    ('550e8400-e29b-41d4-a716-446655440004', 'Anime', 'Anime series and movies');

-- Log setup completion
\echo 'Local MediaSphere database setup completed successfully!';
