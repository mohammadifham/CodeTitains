# Backend (FastAPI + Mistral)

This service provides a chat endpoint for your dashboard.

## 1. Create and activate a virtual environment

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
```

## 2. Install dependencies

```bash
pip install -r requirements.txt
```

## 3. Configure environment

```bash
cp .env.example .env
```

Set `MISTRAL_API_KEY` in `.env`.

For non-chat transformer models (Hugging Face Inference API), set:

- `HUGGINGFACE_API_KEY`
- `HUGGINGFACE_MODEL` (default: `facebook/bart-large-mnli`)

Optional for message persistence in Supabase:

- Set `SUPABASE_URL`
- Set `SUPABASE_SERVICE_ROLE_KEY`
- Optionally set `SUPABASE_MESSAGES_TABLE` (default: `chat_messages`)
- Optionally set `SUPABASE_INCIDENTS_TABLE` (default: `incidents`)
- Optionally set `SUPABASE_REQUESTS_TABLE` (default: `requests`)
- Optionally set `SUPABASE_RESOURCES_TABLE` (default: `resources`)
- Optionally set `SUPABASE_ALLOCATIONS_TABLE` (default: `allocations`)

Create table in Supabase SQL editor:

You can copy from `backend/sql/schema.sql`.

```sql
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
('Shelter Capacity Risk', 'Medium', 'North shelter nearing full occupancy in 4 hours.', 'monitoring', 'North Shelter')
on conflict do nothing;

insert into public.requests (title, priority, description, status)
values
('Deploy 2 medical units to Hospital District', 'Critical', 'Immediate field trauma support request.', 'open'),
('Dispatch 500 food kits to East Relief Camp', 'High', 'Camp inventory below 24-hour threshold.', 'in_progress'),
('Send 3 water tankers to Riverside Zone', 'High', 'Potable water outage due to contamination.', 'open')
on conflict do nothing;

insert into public.resources (name, category, available_units, total_units, status)
values
('Ambulance Fleet A', 'medical', 4, 8, 'limited'),
('Rescue Team Alpha', 'team', 2, 3, 'available'),
('Water Tanker Unit', 'transport', 3, 5, 'available'),
('Food Kit Warehouse', 'food', 1200, 1500, 'available')
on conflict do nothing;
```

## 4. Run the API

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## 5. Test endpoint

```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Flood reported near Sector 7. What should we do first?","session_id":"demo-session-1"}'
```

With chat history context:

```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "We already sent 2 ambulance units. What next?",
    "history": [
      {"role": "user", "content": "Flood reported near Sector 7. What should we do first?"},
      {"role": "assistant", "content": "Prioritize rescue access routes, triage zones, and med staging near high-density blocks."}
    ]
  }'
```

Health check:

```bash
curl http://localhost:8000/health
```

Dashboard endpoint:

```bash
curl http://localhost:8000/api/dashboard-data
```

Model inference endpoints (Hugging Face):

```bash
curl -X POST http://localhost:8000/api/models/incident-severity \
  -H "Content-Type: application/json" \
  -d '{"text":"Flash flood with trapped families, blocked roads and rising water in 4 neighborhoods."}'
```

```bash
curl -X POST http://localhost:8000/api/models/request-priority \
  -H "Content-Type: application/json" \
  -d '{"text":"Need oxygen cylinders for ICU within 30 minutes."}'
```

Create allocation:

```bash
curl -X POST http://localhost:8000/api/allocations \
  -H "Content-Type: application/json" \
  -d '{"resource_id":1,"request_id":1,"units":2,"status":"pending"}'
```
