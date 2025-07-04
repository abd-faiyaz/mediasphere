-- Create thread_images table for storing thread image metadata
create table if not exists thread_images (
   id           uuid primary key default gen_random_uuid(),
   thread_id    uuid not null
      references threads ( id )
         on delete cascade,
   image_url    varchar(500) not null,
   image_name   varchar(255),
   file_size    bigint,
   content_type varchar(100),
   uploaded_at  timestamp not null default current_timestamp
);

-- Create index for faster queries
create index if not exists idx_thread_images_thread_id on
   thread_images (
      thread_id
   );