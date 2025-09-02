-- PROMPT 2: Create retrocompatible view for forms (400 error fix)
create or replace view public.general_contact_leads as
select
    id,
    full_name as "fullName",
    company,
    phone,
    email,
    country,
    company_size as "companySize", 
    referral,
    created_at
from public.contact_leads;

-- Grant permissions
grant usage on schema public to anon, authenticated;
grant select, insert on public.general_contact_leads to anon, authenticated;

-- Create INSERT rule to map view inserts to base table
create or replace rule general_contact_leads_insert as 
on insert to public.general_contact_leads
do instead insert into public.contact_leads (
    full_name, 
    company, 
    phone, 
    email, 
    country, 
    company_size, 
    referral
)
values (
    new."fullName", 
    new.company, 
    new.phone, 
    new.email, 
    new.country, 
    new."companySize", 
    new.referral
)
returning 
    id,
    full_name as "fullName",
    company,
    phone,
    email,
    country,
    company_size as "companySize",
    referral,
    created_at;

-- PROMPT 3: RLS Policies for anon insert (only for base tables)
alter table public.contact_leads enable row level security;

-- Policy for anon users to insert into contact_leads
create policy "anon_insert_contact_leads" on public.contact_leads
for insert to anon with check (
    email is not null and length(email) > 3
);

alter table public.form_submissions enable row level security;

-- Policy for anon users to insert into form_submissions  
create policy "anon_insert_form_submissions" on public.form_submissions
for insert to anon with check (
    email is not null and length(email) > 3
);