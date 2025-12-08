-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Workout Plans Table (Create this first because clients reference it)
create table plans (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  duration text,
  level text check (level in ('Principiante', 'Intermedio', 'Avanzado')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Clients Table
create table clients (
  id uuid default uuid_generate_v4() primary key,
  first_name text not null,
  last_name text not null,
  email text unique not null,
  phone text,
  status text check (status in ('active', 'debtor', 'inactive')) default 'active',
  membership_type text not null,
  start_date date default current_date,
  end_date date not null,
  photo_url text,
  debt numeric default 0,
  plan_id uuid references plans(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Exercises Table
create table exercises (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  muscle_group text not null,
  video_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Plan Exercises (Junction Table)
create table plan_exercises (
  id uuid default uuid_generate_v4() primary key,
  plan_id uuid references plans(id) on delete cascade,
  exercise_id uuid references exercises(id) on delete cascade,
  sets integer default 3,
  reps text default '10-12',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Attendance Table
create table attendance (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid references clients(id) on delete cascade,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null,
  access_granted boolean default true,
  notes text
);

-- Row Level Security (RLS)
alter table clients enable row level security;
alter table exercises enable row level security;
alter table plans enable row level security;
alter table plan_exercises enable row level security;
alter table attendance enable row level security;

-- Create policies to allow public access (for demo purposes)
create policy "Public access" on clients for all using (true);
create policy "Public access" on exercises for all using (true);
create policy "Public access" on plans for all using (true);
create policy "Public access" on plan_exercises for all using (true);
create policy "Public access" on attendance for all using (true);
