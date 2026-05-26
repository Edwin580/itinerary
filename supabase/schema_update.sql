-- 1. Delete the old table
drop table if exists days;

-- 2. Create the new table with the correct columns
create table days (
  id         text        primary key,
  sort_order integer     not null default 0,
  day        text        not null,
  date       text        not null,
  title      text        not null,
  subtitle   text        not null,
  blurb      text        not null,
  slots      jsonb       not null default '[]'::jsonb,
  events     jsonb       not null default '{}'::jsonb,
  created_at timestamptz default now()
);

-- 3. Disable RLS (as specified in your setup)
alter table days disable row level security;

-- 4. Force the Supabase API cache to refresh immediately
NOTIFY pgrst, 'reload schema';