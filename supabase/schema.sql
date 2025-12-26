create table if not exists communities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  guidelines text,
  letterhead text,
  logo_url text,
  created_at timestamp default now()
);

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  community_id uuid references communities(id) on delete cascade,
  stripe_customer_id text,
  status text,
  created_at timestamp default now()
);
