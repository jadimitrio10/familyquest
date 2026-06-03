-- ============================================================
-- FamilyQuest Database Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Families
create table if not exists fq_families (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  code       text unique not null,
  created_at timestamptz default now()
);

-- Members
create table if not exists fq_members (
  id             text primary key,
  family_id      uuid references fq_families(id) on delete cascade,
  name           text not null,
  emoji          text default '👤',
  photo_data_url text,
  bg_color       text,
  text_color     text,
  bar_color      text,
  role           text check (role in ('adult','child')) default 'child',
  created_at     timestamptz default now()
);

-- Tasks
create table if not exists fq_tasks (
  id           text primary key,
  family_id    uuid references fq_families(id) on delete cascade,
  title        text not null,
  emoji        text default '✅',
  member_id    text,
  done         boolean default false,
  type         text check (type in ('fixed','once')) default 'once',
  priority     text default 'medium',
  due_date     text,
  notes        text,
  start_time   text,
  end_time     text,
  all_day      boolean default true,
  days_of_week integer[],
  points       integer default 10,
  created_at   timestamptz default now()
);

-- Task completions (per day)
create table if not exists fq_task_completions (
  id        text primary key,  -- "{taskId}:{date}"
  family_id uuid references fq_families(id) on delete cascade,
  completed boolean default false,
  updated_at timestamptz default now()
);

-- Calendar events
create table if not exists fq_calendar_events (
  id         text primary key,
  family_id  uuid references fq_families(id) on delete cascade,
  title      text not null,
  emoji      text,
  member_id  text,
  date       text not null,
  start_time text,
  end_time   text,
  all_day    boolean default true,
  completed  boolean default false,
  recurrence text,
  created_at timestamptz default now()
);

-- Family events (header strip)
create table if not exists fq_family_events (
  id        text primary key,
  family_id uuid references fq_families(id) on delete cascade,
  title     text not null,
  emoji     text,
  date      text not null,
  end_date  text,
  color     text,
  created_at timestamptz default now()
);

-- Points balances
create table if not exists fq_points_balances (
  member_id text not null,
  family_id uuid references fq_families(id) on delete cascade,
  balance   integer default 0,
  primary key (member_id, family_id)
);

-- Points transactions
create table if not exists fq_points_transactions (
  id         text primary key,
  family_id  uuid references fq_families(id) on delete cascade,
  member_id  text not null,
  amount     integer not null,
  reason     text,
  emoji      text,
  created_at timestamptz default now()
);

-- Rewards
create table if not exists fq_rewards (
  id          text primary key,
  family_id   uuid references fq_families(id) on delete cascade,
  title       text not null,
  emoji       text default '🎁',
  points_cost integer default 50,
  is_active   boolean default true,
  created_at  timestamptz default now()
);

-- Settings
create table if not exists fq_settings (
  family_id     uuid primary key references fq_families(id) on delete cascade,
  settings      jsonb default '{}',
  calendar_prefs jsonb default '{}',
  updated_at    timestamptz default now()
);

-- ============================================================
-- DISABLE Row Level Security (public app, no auth)
-- ============================================================
alter table fq_families            disable row level security;
alter table fq_members             disable row level security;
alter table fq_tasks               disable row level security;
alter table fq_task_completions    disable row level security;
alter table fq_calendar_events     disable row level security;
alter table fq_family_events       disable row level security;
alter table fq_points_balances     disable row level security;
alter table fq_points_transactions disable row level security;
alter table fq_rewards             disable row level security;
alter table fq_settings            disable row level security;
