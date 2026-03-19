
create table public.slide_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Default',
  template_data jsonb not null,
  is_default boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  created_by uuid references auth.users(id) on delete set null
);

alter table public.slide_templates enable row level security;

create policy "Authenticated users can manage slide templates"
  on public.slide_templates for all to authenticated using (true) with check (true);
