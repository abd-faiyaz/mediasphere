-- Create event_interests table for tracking user interest in events
create table if not exists event_interests (
   id         uuid primary key default gen_random_uuid(),
   event_id   uuid not null
      references events ( id )
         on delete cascade,
   user_id    uuid not null
      references users ( id )
         on delete cascade,
   created_at timestamp not null default current_timestamp,
   unique ( event_id,
            user_id )
);

-- Create indexes for better performance
create index if not exists idx_event_interests_event_id on
   event_interests (
      event_id
   );
create index if not exists idx_event_interests_user_id on
   event_interests (
      user_id
   );
create index if not exists idx_event_interests_created_at on
   event_interests (
      created_at
   );

-- Add some sample interests if events exist
-- (This will only work if you have existing events and users)
-- INSERT INTO event_interests (event_id, user_id) 
-- SELECT e.id, u.id 
-- FROM events e, users u 
-- WHERE u.username IN ('testuser', 'admin') 
-- AND e.title IS NOT NULL 
-- LIMIT 3;