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
                         created_at TIMESTAMP NOT NULL,
                         updated_at TIMESTAMP
);

CREATE TABLE comments (
                          id UUID PRIMARY KEY,
                          thread_id UUID REFERENCES threads(id) ON DELETE CASCADE,
                          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                          content TEXT NOT NULL,
                          created_at TIMESTAMP NOT NULL
);

CREATE TABLE events (
                        id UUID PRIMARY KEY,
                        club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
                        title VARCHAR NOT NULL,
                        description TEXT,
                        start_time TIMESTAMP NOT NULL,
                        end_time TIMESTAMP NOT NULL,
                        created_by UUID REFERENCES users(id) ON DELETE CASCADE,
                        created_at TIMESTAMP NOT NULL
);

CREATE TABLE notifications (
                               id UUID PRIMARY KEY,
                               user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                               type VARCHAR NOT NULL, -- comment, event, AI, etc.
                               message TEXT,
                               related_id UUID,
                               is_read BOOLEAN DEFAULT FALSE,
                               created_at TIMESTAMP NOT NULL
);

CREATE TABLE ai_analyses (
                             id UUID PRIMARY KEY,
                             user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                             type VARCHAR NOT NULL, -- summary, quiz, sentiment, recommendation
                             input_data TEXT,
                             result_data TEXT,
                             created_at TIMESTAMP NOT NULL
);

CREATE TABLE user_clubs (
                            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                            club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
                            joined_at TIMESTAMP NOT NULL,
                            PRIMARY KEY (user_id, club_id)
);