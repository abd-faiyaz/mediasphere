-- Simple sample data for MediaSphere Docker development
-- This replaces the complex sample data with predictable UUIDs

\c db_408;

-- Simple sample users with predictable UUIDs
INSERT INTO users (id, email, username, role, is_email_verified, created_at) VALUES
('00000000-0000-0000-0000-000000000001', 'admin@mediasphere.com', 'admin', 'admin', true, NOW()),
('00000000-0000-0000-0000-000000000002', 'john@example.com', 'john_doe', 'user', true, NOW()),
('00000000-0000-0000-0000-000000000003', 'jane@example.com', 'jane_smith', 'user', true, NOW())
ON CONFLICT (email) DO NOTHING;

-- Simple sample media with predictable UUIDs
INSERT INTO media (id, media_type_id, title, description, author, release_year, genre, created_at) VALUES
('10000000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440003', 'Harry Potter', 'A young wizard discovers his magical heritage', 'J.K. Rowling', 1997, 'Fantasy', NOW()),
('10000000-0000-0000-0000-000000000002', '550e8400-e29b-41d4-a716-446655440001', 'The Matrix', 'A computer programmer discovers reality is a simulation', 'The Wachowskis', 1999, 'Sci-Fi', NOW()),
('10000000-0000-0000-0000-000000000003', '550e8400-e29b-41d4-a716-446655440004', 'Attack on Titan', 'Humanity fights against giant humanoid creatures', 'Hajime Isayama', 2009, 'Action', NOW())
ON CONFLICT (id) DO NOTHING;

-- Simple sample clubs
INSERT INTO clubs (id, media_type_id, name, description, created_by, created_at) VALUES
('20000000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440003', 'Fantasy Book Club', 'Discussing the best fantasy novels and series', '00000000-0000-0000-0000-000000000001', NOW()),
('20000000-0000-0000-0000-000000000002', '550e8400-e29b-41d4-a716-446655440001', 'Sci-Fi Movie Enthusiasts', 'For lovers of science fiction cinema', '00000000-0000-0000-0000-000000000002', NOW()),
('20000000-0000-0000-0000-000000000003', '550e8400-e29b-41d4-a716-446655440004', 'Anime Discussion Group', 'Discuss the latest anime series and movies', '00000000-0000-0000-0000-000000000003', NOW())
ON CONFLICT (id) DO NOTHING;

-- Simple sample threads
INSERT INTO threads (id, club_id, created_by, title, content, view_count, comment_count, created_at) VALUES
('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'Favorite Harry Potter book?', 'Which book in the series is your favorite and why?', 15, 3, NOW()),
('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', 'Matrix trilogy ranking', 'Lets discuss the Matrix trilogy and rank them', 22, 5, NOW()),
('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Attack on Titan ending', 'What did everyone think about how the series ended?', 45, 12, NOW())
ON CONFLICT (id) DO NOTHING;
