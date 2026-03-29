
-- AI Agents system tables

-- Table: ai_agents
create table public.ai_agents (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  system_prompt text not null,
  model text default 'claude-sonnet-4-20250514',
  temperature numeric default 0.3,
  tools text[] default '{}',
  is_active boolean default true,
  agent_type text check (agent_type in ('conversational', 'automated', 'hybrid')) default 'conversational',
  schedule text,
  max_tokens integer default 4096,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  created_by uuid references auth.users(id)
);

alter table public.ai_agents enable row level security;

create policy "Admins manage agents" on public.ai_agents
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- Table: ai_agent_conversations
create table public.ai_agent_conversations (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references public.ai_agents(id) on delete cascade,
  user_id uuid references auth.users(id),
  messages jsonb not null default '[]',
  summary text,
  status text default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.ai_agent_conversations enable row level security;

create policy "Users manage own conversations" on public.ai_agent_conversations
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Updated_at trigger for ai_agents
create or replace function public.update_ai_agents_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_ai_agents_updated_at
  before update on public.ai_agents
  for each row execute function public.update_ai_agents_updated_at();

-- Updated_at trigger for ai_agent_conversations
create trigger update_ai_agent_conversations_updated_at
  before update on public.ai_agent_conversations
  for each row execute function public.update_ai_agents_updated_at();
