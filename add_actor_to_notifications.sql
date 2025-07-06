-- Add actor_id column to notifications table to track who performed the action
-- This enables Facebook-like notifications showing both the actor and recipient

-- Add the actor_id column to the notifications table
alter table notifications add column actor_id

uuid;

-- Add foreign key constraint to link to users table  
alter table notifications
   add constraint fk_notifications_actor_id
      foreign key ( actor_id )
         references users ( id )
            on delete cascade;

-- Create index for better performance when querying by actor
create index idx_notifications_actor_id on
   notifications (
      actor_id
   );

-- Update existing notifications to set actor_id to null (they won't have actor info)
-- New notifications will have proper actor information