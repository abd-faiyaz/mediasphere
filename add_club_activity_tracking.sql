-- Add activity tracking columns to clubs table
alter table clubs add column last_activity_at

timestamp;

alter table clubs add column last_thread_created_at

timestamp;

-- Update existing clubs with current timestamp for last_activity_at
update clubs
   set
   last_activity_at = created_at
 where last_activity_at is null;

-- Optionally, you can also set last_thread_created_at based on latest thread creation
-- This query finds the latest thread for each club and updates the club's last_thread_created_at
update clubs
   set
   last_thread_created_at = (
      select max(t.created_at)
        from threads t
       where t.club_id = clubs.id
   )
 where exists (
   select 1
     from threads t
    where t.club_id = clubs.id
);