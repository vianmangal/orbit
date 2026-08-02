create table public.game_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  game_slug text not null,
  play_date date not null,
  status text not null default 'started'
    check (status in ('started', 'completed')),
  opened_at timestamptz not null default now(),
  completed_at timestamptz,
  primary key (user_id, game_slug, play_date)
);

create index game_progress_user_status_date_idx
  on public.game_progress (user_id, status, play_date desc);

create table public.game_preferences (
  user_id uuid not null references auth.users(id) on delete cascade,
  game_slug text not null,
  position integer not null check (position >= 0),
  hidden boolean not null default false,
  primary key (user_id, game_slug),
  unique (user_id, position)
);

alter table public.game_progress enable row level security;
alter table public.game_preferences enable row level security;

revoke all on table public.game_progress from anon;
revoke all on table public.game_preferences from anon;
grant select, insert, update, delete on table public.game_progress to authenticated;
grant select, insert, update, delete on table public.game_preferences to authenticated;

create policy "Players can read their own progress"
  on public.game_progress for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Players can add their own progress"
  on public.game_progress for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Players can update their own progress"
  on public.game_progress for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Players can delete their own progress"
  on public.game_progress for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "Players can read their own preferences"
  on public.game_preferences for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Players can add their own preferences"
  on public.game_preferences for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Players can update their own preferences"
  on public.game_preferences for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Players can delete their own preferences"
  on public.game_preferences for delete to authenticated
  using ((select auth.uid()) = user_id);

create or replace function public.replace_game_preferences(items jsonb)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  if jsonb_typeof(items) <> 'array' or jsonb_array_length(items) > 50 then
    raise exception 'Invalid preferences payload';
  end if;

  delete from public.game_preferences
  where user_id = current_user_id;

  insert into public.game_preferences (user_id, game_slug, position, hidden)
  select
    current_user_id,
    item ->> 'game_slug',
    (item ->> 'position')::integer,
    coalesce((item ->> 'hidden')::boolean, false)
  from jsonb_array_elements(items) as item;
end;
$$;

revoke all on function public.replace_game_preferences(jsonb) from public;
revoke all on function public.replace_game_preferences(jsonb) from anon;
grant execute on function public.replace_game_preferences(jsonb) to authenticated;
