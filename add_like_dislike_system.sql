-- Create thread_dislikes table for dislike functionality
CREATE TABLE IF NOT EXISTS thread_dislikes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(thread_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_thread_dislikes_thread_id ON thread_dislikes(thread_id);
CREATE INDEX IF NOT EXISTS idx_thread_dislikes_user_id ON thread_dislikes(user_id);

-- Create comment_likes table for comment like functionality
CREATE TABLE IF NOT EXISTS comment_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(comment_id, user_id)
);

-- Create indexes for comment likes
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user_id ON comment_likes(user_id);

-- Add like_count column to comments table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'like_count') THEN
        ALTER TABLE comments ADD COLUMN like_count INTEGER NOT NULL DEFAULT 0;
    END IF;
END $$;
