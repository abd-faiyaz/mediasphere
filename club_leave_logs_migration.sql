-- Create club_leave_logs table to store reasons when users leave clubs
create table if not exists club_leave_logs (
   id      uuid primary key,
   user_id uuid not null
      references users ( id )
         on delete cascade,
   club_id uuid not null
      references clubs ( id )
         on delete cascade,
   reason  text,
   left_at timestamp not null default now()
);

-- Create indexes for better performance
create index if not exists idx_club_leave_logs_club_id on
   club_leave_logs (
      club_id
   );
create index if not exists idx_club_leave_logs_user_id on
   club_leave_logs (
      user_id
   );
create index if not exists idx_club_leave_logs_left_at on
   club_leave_logs (
      left_at
   );

-- Add comment to explain the table purpose
comment on table club_leave_logs is
   'Stores the reasons and timestamps when users leave clubs for analytics and improvement purposes';
comment on column club_leave_logs.reason is
   'Optional reason provided by user when leaving the club';
comment on column club_leave_logs.left_at is
   'Timestamp when the user left the club';