-- MVP schema (no RLS). Add RLS/policies before handling sensitive data.
create extension if not exists pgcrypto;

create table if not exists communities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  guidelines text,
  guidelines_url text,
  guidelines_text text,
  letterhead text,
  logo_path text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_communities_updated on communities;
create trigger trg_communities_updated
before update on communities
for each row execute procedure set_updated_at();
