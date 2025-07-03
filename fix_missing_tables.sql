-- Add missing tables for activity tracking and achievements
-- Run this after the main schema

-- Activity logs table for tracking user and club activities
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    club_id UUID REFERENCES clubs(id) ON DELETE SET NULL,
    activity_type VARCHAR NOT NULL, -- 'member_joined', 'thread_created', 'event_created', 'comment_posted', etc.
    description TEXT NOT NULL,
    reference_id UUID, -- ID of the related object (thread, event, etc.)
    reference_type VARCHAR, -- 'thread', 'event', 'comment', etc.
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- User achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_type VARCHAR NOT NULL, -- 'first_post', 'active_member', 'discussion_starter', etc.
    title VARCHAR NOT NULL,
    description TEXT,
    icon VARCHAR,
    earned_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, achievement_type)
);

-- User statistics table for caching calculated stats
CREATE TABLE IF NOT EXISTS user_statistics (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    threads_created INTEGER NOT NULL DEFAULT 0,
    comments_posted INTEGER NOT NULL DEFAULT 0,
    events_attended INTEGER NOT NULL DEFAULT 0,
    clubs_joined INTEGER NOT NULL DEFAULT 0,
    likes_received INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Club statistics table for caching calculated stats
CREATE TABLE IF NOT EXISTS club_statistics (
    club_id UUID PRIMARY KEY REFERENCES clubs(id) ON DELETE CASCADE,
    total_members INTEGER NOT NULL DEFAULT 0,
    active_discussions INTEGER NOT NULL DEFAULT 0,
    total_events INTEGER NOT NULL DEFAULT 0,
    total_comments INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Thread likes table for tracking thread likes
CREATE TABLE IF NOT EXISTS thread_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID REFERENCES threads(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(thread_id, user_id)
);

-- Comment likes table for tracking comment likes
CREATE TABLE IF NOT EXISTS comment_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(comment_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_club_id ON activity_logs(club_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_thread_likes_thread_id ON thread_likes(thread_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON comment_likes(comment_id);

-- Insert some initial achievements
INSERT INTO user_achievements (user_id, achievement_type, title, description, icon) 
SELECT u.id, 'welcome', 'Welcome to MediaSphere!', 'Joined the community', '🎉'
FROM users u
WHERE NOT EXISTS (
    SELECT 1 FROM user_achievements ua 
    WHERE ua.user_id = u.id AND ua.achievement_type = 'welcome'
)
ON CONFLICT (user_id, achievement_type) DO NOTHING;
