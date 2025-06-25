-- MediaSphere Sample Data Initialization
-- This script inserts sample data for development and testing

-- Insert sample media types
INSERT INTO media_types (id, name, description) VALUES
    (gen_random_uuid(), 'Movie', 'Feature films and documentaries'),
    (gen_random_uuid(), 'TV Series', 'Television series and shows'),
    (gen_random_uuid(), 'Book', 'Books, novels, and literature'),
    (gen_random_uuid(), 'Anime', 'Japanese animation series and films'),
    (gen_random_uuid(), 'Manga', 'Japanese comics and graphic novels'),
    (gen_random_uuid(), 'Video Game', 'Video games and interactive media')
ON CONFLICT DO NOTHING;

-- Insert sample users (for development only)
DO $$
DECLARE
    user1_id UUID := gen_random_uuid();
    user2_id UUID := gen_random_uuid();
    user3_id UUID := gen_random_uuid();
    admin_id UUID := gen_random_uuid();
BEGIN
    INSERT INTO users (id, email, username, role, first_name, last_name, is_email_verified, primary_auth_method, account_created_via, created_at) VALUES
        (admin_id, 'admin@mediasphere.com', 'admin', 'admin', 'System', 'Administrator', true, 'local', 'system', CURRENT_TIMESTAMP),
        (user1_id, 'john.doe@example.com', 'johndoe', 'user', 'John', 'Doe', true, 'local', 'local', CURRENT_TIMESTAMP),
        (user2_id, 'jane.smith@example.com', 'janesmith', 'user', 'Jane', 'Smith', true, 'oauth', 'google', CURRENT_TIMESTAMP),
        (user3_id, 'mike.wilson@example.com', 'mikewilson', 'moderator', 'Mike', 'Wilson', true, 'local', 'local', CURRENT_TIMESTAMP)
    ON CONFLICT (email) DO NOTHING;

    -- Insert sample clubs
    INSERT INTO clubs (id, media_type_id, name, description, created_by, created_at) 
    SELECT 
        gen_random_uuid(),
        mt.id,
        'Sci-Fi ' || mt.name || ' Club',
        'Discussion club for science fiction ' || lower(mt.name) || 's',
        admin_id,
        CURRENT_TIMESTAMP
    FROM media_types mt
    WHERE mt.name IN ('Movie', 'TV Series', 'Book')
    ON CONFLICT DO NOTHING;

    -- Insert sample anime club
    INSERT INTO clubs (id, media_type_id, name, description, created_by, created_at)
    SELECT 
        gen_random_uuid(),
        mt.id,
        'Studio Ghibli Appreciation Society',
        'Dedicated to discussing and analyzing Studio Ghibli films',
        user1_id,
        CURRENT_TIMESTAMP
    FROM media_types mt
    WHERE mt.name = 'Anime'
    LIMIT 1
    ON CONFLICT DO NOTHING;

END $$;

-- Log sample data creation
\echo 'MediaSphere sample data inserted successfully!'
\echo 'Note: This includes sample users for development. Remove in production.'
