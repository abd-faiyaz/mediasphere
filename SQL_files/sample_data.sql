-- Sample data for MediaSphere application
-- Run this after setting up the schema
-- Usage: psql -U postgres -d db_408 -f sample_data.sql

-- Insert sample users
INSERT INTO users (id, email, username, role, is_email_verified, created_at) VALUES
    ('550e8400-e29b-41d4-a716-446655440101', 'admin@mediasphere.com', 'admin', 'admin', true, NOW()),
    ('550e8400-e29b-41d4-a716-446655440102', 'john.doe@example.com', 'johndoe', 'user', true, NOW()),
    ('550e8400-e29b-41d4-a716-446655440103', 'jane.smith@example.com', 'janesmith', 'user', true, NOW()),
    ('550e8400-e29b-41d4-a716-446655440104', 'moderator@mediasphere.com', 'moderator', 'moderator', true, NOW());

-- Insert sample media
INSERT INTO media (id, media_type_id, title, description, author, release_year, genre, created_at) VALUES
    ('550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440001', 'The Matrix', 'A computer hacker learns from mysterious rebels about the true nature of his reality.', 'The Wachowskis', 1999, 'Sci-Fi', NOW()),
    ('550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440002', 'Breaking Bad', 'A chemistry teacher turned methamphetamine manufacturer.', 'Vince Gilligan', 2008, 'Drama', NOW()),
    ('550e8400-e29b-41d4-a716-446655440203', '550e8400-e29b-41d4-a716-446655440003', 'Dune', 'Set in the distant future amidst a feudal interstellar society.', 'Frank Herbert', 1965, 'Sci-Fi', NOW()),
    ('550e8400-e29b-41d4-a716-446655440204', '550e8400-e29b-41d4-a716-446655440004', 'Attack on Titan', 'Humanity fights for survival against giant humanoid Titans.', 'Hajime Isayama', 2009, 'Action', NOW());

-- Insert sample clubs
INSERT INTO clubs (id, media_type_id, name, description, created_by, created_at) VALUES
    ('550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440001', 'Sci-Fi Movie Club', 'Discussing the best science fiction movies of all time.', '550e8400-e29b-41d4-a716-446655440101', NOW()),
    ('550e8400-e29b-41d4-a716-446655440302', '550e8400-e29b-41d4-a716-446655440002', 'TV Series Discussion', 'Weekly discussions about popular TV series.', '550e8400-e29b-41d4-a716-446655440102', NOW()),
    ('550e8400-e29b-41d4-a716-446655440303', '550e8400-e29b-41d4-a716-446655440003', 'Book Club', 'Monthly book reading and discussion group.', '550e8400-e29b-41d4-a716-446655440103', NOW()),
    ('550e8400-e29b-41d4-a716-446655440304', '550e8400-e29b-41d4-a716-446655440004', 'Anime Enthusiasts', 'For anime lovers to discuss their favorite series.', '550e8400-e29b-41d4-a716-446655440104', NOW());

-- Insert user_club memberships
INSERT INTO user_clubs (user_id, club_id, joined_at) VALUES
    ('550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440301', NOW()),
    ('550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440301', NOW()),
    ('550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440302', NOW()),
    ('550e8400-e29b-41d4-a716-446655440103', '550e8400-e29b-41d4-a716-446655440303', NOW()),
    ('550e8400-e29b-41d4-a716-446655440104', '550e8400-e29b-41d4-a716-446655440304', NOW());

-- Insert sample threads
INSERT INTO threads (id, club_id, title, content, created_by, view_count, comment_count, created_at) VALUES
    ('550e8400-e29b-41d4-a716-446655440401', '550e8400-e29b-41d4-a716-446655440301', 'Best Sci-Fi Movies of 2024', 'What are your favorite science fiction movies released this year?', '550e8400-e29b-41d4-a716-446655440101', 15, 3, NOW()),
    ('550e8400-e29b-41d4-a716-446655440402', '550e8400-e29b-41d4-a716-446655440302', 'Breaking Bad vs Better Call Saul', 'Which series do you think is better and why?', '550e8400-e29b-41d4-a716-446655440102', 22, 7, NOW()),
    ('550e8400-e29b-41d4-a716-446655440403', '550e8400-e29b-41d4-a716-446655440303', 'Dune Discussion', 'Thoughts on the new Dune movie adaptation?', '550e8400-e29b-41d4-a716-446655440103', 8, 2, NOW());

-- Insert sample comments
INSERT INTO comments (id, thread_id, created_by, content, created_at) VALUES
    ('550e8400-e29b-41d4-a716-446655440501', '550e8400-e29b-41d4-a716-446655440401', '550e8400-e29b-41d4-a716-446655440102', 'I really enjoyed the latest Dune movie!', NOW()),
    ('550e8400-e29b-41d4-a716-446655440502', '550e8400-e29b-41d4-a716-446655440401', '550e8400-e29b-41d4-a716-446655440103', 'The Matrix still holds up as the best sci-fi movie ever.', NOW()),
    ('550e8400-e29b-41d4-a716-446655440503', '550e8400-e29b-41d4-a716-446655440402', '550e8400-e29b-41d4-a716-446655440104', 'Both are excellent, but Breaking Bad has the edge for me.', NOW());

-- Insert sample events
INSERT INTO events (id, club_id, title, description, event_date, location, created_by, max_participants, current_participants, created_at) VALUES
    ('550e8400-e29b-41d4-a716-446655440601', '550e8400-e29b-41d4-a716-446655440301', 'Sci-Fi Movie Marathon', 'Join us for a night of classic sci-fi movies!', NOW() + INTERVAL '7 days', 'Community Center Room A', '550e8400-e29b-41d4-a716-446655440101', 20, 5, NOW()),
    ('550e8400-e29b-41d4-a716-446655440602', '550e8400-e29b-41d4-a716-446655440303', 'Book Club Meeting', 'Monthly discussion of our current book selection.', NOW() + INTERVAL '14 days', 'Local Library Meeting Room', '550e8400-e29b-41d4-a716-446655440103', 15, 8, NOW());

-- Insert sample notifications
INSERT INTO notifications (id, user_id, title, content, type, reference_id, reference_type, created_at) VALUES
    ('550e8400-e29b-41d4-a716-446655440701', '550e8400-e29b-41d4-a716-446655440102', 'New Comment', 'Someone replied to your thread about sci-fi movies.', 'thread_reply', '550e8400-e29b-41d4-a716-446655440401', 'thread', NOW()),
    ('550e8400-e29b-41d4-a716-446655440702', '550e8400-e29b-41d4-a716-446655440103', 'Event Reminder', 'Book club meeting is tomorrow!', 'event_reminder', '550e8400-e29b-41d4-a716-446655440602', 'event', NOW());

\echo 'Sample data inserted successfully!';
