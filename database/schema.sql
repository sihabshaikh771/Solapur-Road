-- Run this in your Supabase SQL editor

-- Users table
create table public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  password_hash text,
  avatar_url text,
  total_points integer default 0,
  reports_count integer default 0,
  created_at timestamptz default now()
);

-- Reports table
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  lat decimal(9,6) not null,
  lng decimal(9,6) not null,
  area_name text default 'Solapur',
  condition text check (condition in ('good', 'medium', 'poor', 'dangerous')) not null,
  description text,
  media_url text,
  media_type text check (media_type in ('image', 'video')),
  upvotes integer default 0,
  created_at timestamptz default now()
);

-- Leaderboard cache
create table public.leaderboard_cache (
  user_id uuid primary key references public.users(id) on delete cascade,
  weekly_points integer default 0,
  monthly_points integer default 0,
  all_time_points integer default 0,
  updated_at timestamptz default now()
);

-- Indexes
create index idx_reports_lat_lng on public.reports(lat, lng);
create index idx_reports_condition on public.reports(condition);
create index idx_reports_user_id on public.reports(user_id);
create index idx_leaderboard_all_time on public.leaderboard_cache(all_time_points desc);

-- Function to add points
create or replace function add_points(p_user_id uuid, p_points integer)
returns void as $$
begin
  update public.users set total_points = total_points + p_points where id = p_user_id;
  update public.leaderboard_cache
    set all_time_points = all_time_points + p_points,
        monthly_points = monthly_points + p_points,
        weekly_points = weekly_points + p_points,
        updated_at = now()
    where user_id = p_user_id;
end;
$$ language plpgsql;

-- Function to upvote report
create or replace function upvote_report(report_id uuid)
returns void as $$
begin
  update public.reports set upvotes = upvotes + 1 where id = report_id;
end;
$$ language plpgsql;

-- Storage bucket (run in Supabase dashboard > Storage)
-- Create bucket named: road-reports
-- Set to public
-- Allow: image/jpeg, image/png, image/webp, video/mp4, video/quicktime, video/webm
-- Max file size: 52428800 (50MB)
