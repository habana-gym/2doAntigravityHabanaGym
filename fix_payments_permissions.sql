-- Create payments table if it doesn't exist
create table if not exists payments (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid references clients(id) on delete cascade,
  amount numeric not null,
  concept text not null,
  date timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table payments enable row level security;

-- Drop existing policy if any to avoid conflicts
drop policy if exists "Public access" on payments;

-- Create full access policy
create policy "Public access" on payments for all using (true);
