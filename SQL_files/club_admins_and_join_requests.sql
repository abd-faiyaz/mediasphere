-- Migration for club admins and join requests system

-- Table for club admins (owner + up to 3 admins)
create table if not exists club_admins (
   id         serial primary key,
   club_id    integer not null
      references clubs ( id )
         on delete cascade,
   user_id    integer not null
      references users ( id )
         on delete cascade,
   role       varchar(10) not null check ( role in ( 'owner',
                                               'admin' ) ),
   created_at timestamp default now(),
   unique ( club_id,
            user_id )
);

-- Table for join requests
create table if not exists club_join_requests (
   id           serial primary key,
   club_id      integer not null
      references clubs ( id )
         on delete cascade,
   user_id      integer not null
      references users ( id )
         on delete cascade,
   requested_at timestamp default now(),
   status       varchar(10) not null default 'pending' check ( status in ( 'pending',
                                                                     'accepted',
                                                                     'denied' ) ),
   decision_by  integer
      references users ( id ),
   decision_at  timestamp,
   deny_reason  varchar(300)
);

-- Indexes for performance
create index if not exists idx_club_admins_club_id on
   club_admins (
      club_id
   );
create index if not exists idx_club_join_requests_club_id on
   club_join_requests (
      club_id
   );