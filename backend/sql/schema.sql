create table if not exists public.chat_messages (
  id bigint generated always as identity primary key,
  session_id text not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_chat_messages_session_id
  on public.chat_messages(session_id, created_at);

create table if not exists public.incidents (
  id bigint generated always as identity primary key,
  title text not null,
  severity text not null check (severity in ('Critical', 'High', 'Medium', 'Low')),
  description text not null,
  status text not null default 'active' check (status in ('active', 'monitoring', 'resolved')),
  location text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.requests (
  id bigint generated always as identity primary key,
  title text not null,
  priority text not null check (priority in ('Critical', 'High', 'Medium', 'Low')),
  description text not null,
  status text not null default 'open' check (status in ('open', 'in_progress', 'fulfilled')),
  created_at timestamptz not null default now()
);

create table if not exists public.resources (
  id bigint generated always as identity primary key,
  name text not null,
  category text not null default 'other' check (category in ('medical', 'rescue', 'food', 'transport', 'team', 'other')),
  available_units integer not null default 0,
  total_units integer not null default 0,
  status text not null default 'available' check (status in ('available', 'limited', 'depleted')),
  created_at timestamptz not null default now()
);

create table if not exists public.allocations (
  id bigint generated always as identity primary key,
  resource_id bigint not null references public.resources(id) on delete cascade,
  request_id bigint not null references public.requests(id) on delete cascade,
  units integer not null check (units > 0),
  status text not null default 'pending' check (status in ('pending', 'in_transit', 'completed')),
  created_at timestamptz not null default now()
);

create index if not exists idx_incidents_created_at on public.incidents(created_at desc);
create index if not exists idx_requests_created_at on public.requests(created_at desc);
create index if not exists idx_resources_created_at on public.resources(created_at desc);
create index if not exists idx_allocations_created_at on public.allocations(created_at desc);

insert into public.incidents (title, severity, description, status, location)
values
('Downtown Flooding', 'Critical', 'Major water logging and blocked evacuation routes.', 'active', 'Downtown Sector 4'),
('Medical Supply Gap', 'High', 'Hospital district requesting urgent trauma kits.', 'active', 'Hospital District'),
('Shelter Capacity Risk', 'Medium', 'North shelter nearing full occupancy in 4 hours.', 'monitoring', 'North Shelter');

insert into public.requests (title, priority, description, status)
values
('Deploy 2 medical units to Hospital District', 'Critical', 'Immediate field trauma support request.', 'open'),
('Dispatch 500 food kits to East Relief Camp', 'High', 'Camp inventory below 24-hour threshold.', 'in_progress'),
('Send 3 water tankers to Riverside Zone', 'High', 'Potable water outage due to contamination.', 'open');

insert into public.resources (name, category, available_units, total_units, status)
values
('Ambulance Fleet A', 'medical', 4, 8, 'limited'),
('Rescue Team Alpha', 'team', 2, 3, 'available'),
('Water Tanker Unit', 'transport', 3, 5, 'available'),
('Food Kit Warehouse', 'food', 1200, 1500, 'available');
