-- Create Memberships Table
create table if not exists memberships (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  price numeric not null,
  duration_days integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for memberships
alter table memberships enable row level security;
create policy "Public access" on memberships for all using (true);

-- Create Payments Table
create table if not exists payments (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid references clients(id) on delete cascade,
  amount numeric not null,
  date timestamp with time zone default timezone('utc'::text, now()) not null,
  concept text,
  method text default 'Efectivo',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for payments
alter table payments enable row level security;
create policy "Public access" on payments for all using (true);

-- Insert default memberships
insert into memberships (name, price, duration_days) values
('Mensual', 15000, 30),
('Trimestral', 38900, 90),
('Anual', 120000, 365);
