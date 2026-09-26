begin;
create table if not exists public.campaigns (
 id text primary key,
 owner_id uuid not null references auth.users(id) on delete cascade,
 title text not null check(char_length(title)<=200),
 data jsonb not null check(octet_length(data::text)<=150000),
 version integer not null default 1 check(version>0),
 updated_at timestamptz not null default now()
);
create index if not exists campaigns_owner_updated on public.campaigns(owner_id,updated_at desc);
alter table public.campaigns enable row level security;
revoke all on public.campaigns from anon;
grant select,insert,update,delete on public.campaigns to authenticated;
create policy campaigns_select on public.campaigns for select to authenticated using((select auth.uid())=owner_id);
create policy campaigns_insert on public.campaigns for insert to authenticated with check((select auth.uid())=owner_id);
create policy campaigns_update on public.campaigns for update to authenticated using((select auth.uid())=owner_id) with check((select auth.uid())=owner_id);
create policy campaigns_delete on public.campaigns for delete to authenticated using((select auth.uid())=owner_id);

create table if not exists public.ai_usage (
 bucket text not null,
 day date not null,
 requests integer not null default 0 check(requests>=0),
 primary key(bucket,day)
);
alter table public.ai_usage enable row level security;
revoke all on public.ai_usage from anon,authenticated;

-- Only the server service role can reserve quota. One transaction and one
-- lock protect both counters against parallel requests and multi-user races.
create or replace function public.reserve_ai_request(p_user uuid,p_user_limit integer,p_global_limit integer)
returns boolean language plpgsql security definer set search_path='' as $$
declare d date:=(now() at time zone 'utc')::date; n integer; g integer;
begin
 if p_user is null or p_user_limit<1 or p_global_limit<1 or p_user_limit>1000 or p_global_limit>1000 then
  raise exception 'Invalid quota parameters';
 end if;
 perform pg_advisory_xact_lock(872610412);
 select requests into n from public.ai_usage where bucket=p_user::text and day=d;
 select requests into g from public.ai_usage where bucket='global' and day=d;
 if coalesce(n,0)>=p_user_limit or coalesce(g,0)>=p_global_limit then return false; end if;
 insert into public.ai_usage(bucket,day,requests) values(p_user::text,d,1)
 on conflict(bucket,day) do update set requests=public.ai_usage.requests+1;
 insert into public.ai_usage(bucket,day,requests) values('global',d,1)
 on conflict(bucket,day) do update set requests=public.ai_usage.requests+1;
 return true;
end $$;
revoke all on function public.reserve_ai_request(uuid,integer,integer) from public,anon,authenticated;
grant execute on function public.reserve_ai_request(uuid,integer,integer) to service_role;
commit;
