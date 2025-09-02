-- PROMPT 3: RLS Policies for anon insert (simplified approach)
alter table public.contact_leads enable row level security;

-- Drop existing conflicting policies if they exist
drop policy if exists "anon_insert_contact_leads" on public.contact_leads;

-- Policy for anon users to insert into contact_leads
create policy "anon_insert_contact_leads" on public.contact_leads
for insert to anon with check (
    email is not null and length(email) > 3 and
    full_name is not null and length(full_name) > 1 and
    company is not null and length(company) > 1
);

alter table public.form_submissions enable row level security;

-- Drop existing conflicting policies if they exist  
drop policy if exists "anon_insert_form_submissions" on public.form_submissions;

-- Policy for anon users to insert into form_submissions  
create policy "anon_insert_form_submissions" on public.form_submissions
for insert to anon with check (
    email is not null and length(email) > 3
);