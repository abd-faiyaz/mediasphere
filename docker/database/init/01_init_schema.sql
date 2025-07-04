-- Database initialization script for Docker
-- This runs automatically when PostgreSQL container starts for the first time

-- Create the database if it doesn't exist
SELECT 'CREATE DATABASE db_408'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'db_408')\gexec

-- Switch to the database
\c db_408;

-- Create tables
CREATE TABLE IF NOT EXISTS media_types (
    id UUID PRIMARY KEY,
    name VARCHAR NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    password_hash VARCHAR,
    username VARCHAR NOT NULL,
    role VARCHAR NOT NULL,
    profile_pic VARCHAR,
    clerk_user_id VARCHAR,
    oauth_provider VARCHAR,
    oauth_provider_id VARCHAR,
    is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    first_name VARCHAR,
    last_name VARCHAR,
    oauth_profile_picture VARCHAR,
    last_oauth_sync TIMESTAMP,
    primary_auth_method VARCHAR,
    last_login_at TIMESTAMP,
    last_login_method VARCHAR,
    account_created_via VARCHAR,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    UNIQUE(clerk_user_id),
    UNIQUE(oauth_provider, oauth_provider_id)
);

CREATE TABLE IF NOT EXISTS clubs (
    id UUID PRIMARY KEY,
    media_type_id UUID REFERENCES media_types(id) ON DELETE CASCADE,
    name VARCHAR NOT NULL,
    description TEXT,
    created_by UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS media (
    id UUID PRIMARY KEY,
    media_type_id UUID REFERENCES media_types(id) ON DELETE CASCADE,
    title VARCHAR NOT NULL,
    description TEXT,
    author VARCHAR,
    release_year INTEGER,
    genre VARCHAR,
    image_url VARCHAR,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS threads (
    id UUID PRIMARY KEY,
    club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
    created_by UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR NOT NULL,
    content TEXT,
    view_count INTEGER NOT NULL DEFAULT 0,
    comment_count INTEGER NOT NULL DEFAULT 0,
    like_count INTEGER NOT NULL DEFAULT 0,
    dislike_count INTEGER NOT NULL DEFAULT 0,
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    is_locked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY,
    thread_id UUID REFERENCES threads(id) ON DELETE CASCADE,
    created_by UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY,
    club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
    created_by UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR NOT NULL,
    description TEXT,
    event_date TIMESTAMP NOT NULL,
    location VARCHAR,
    max_participants INTEGER,
    current_participants INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR NOT NULL,
    content TEXT,
    type VARCHAR NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    reference_id UUID,
    reference_type VARCHAR,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_clubs (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
    joined_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, club_id)
);

CREATE TABLE IF NOT EXISTS club_leave_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    reason TEXT,
    left_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance on club_leave_logs
CREATE INDEX IF NOT EXISTS idx_club_leave_logs_club_id ON club_leave_logs (club_id);
CREATE INDEX IF NOT EXISTS idx_club_leave_logs_user_id ON club_leave_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_club_leave_logs_left_at ON club_leave_logs (left_at);

-- Insert default media types
INSERT INTO media_types (id, name, description) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Movie', 'Films and movies'),
('550e8400-e29b-41d4-a716-446655440002', 'Series', 'TV series and shows'),
('550e8400-e29b-41d4-a716-446655440003', 'Book', 'Books and novels'),
('550e8400-e29b-41d4-a716-446655440004', 'Anime', 'Anime series and movies')
ON CONFLICT (id) DO NOTHING;
