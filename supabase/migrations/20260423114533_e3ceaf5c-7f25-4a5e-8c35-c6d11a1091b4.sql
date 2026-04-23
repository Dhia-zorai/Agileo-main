
-- ============ ENUMS ============
create type public.app_role as enum ('admin','scrum_master','developer','product_owner');
create type public.task_status as enum ('TODO','IN_PROGRESS','IN_REVIEW','DONE');
create type public.task_priority as enum ('HIGH','MED','LOW');
create type public.project_status as enum ('active','archived');
create type public.sprint_status as enum ('planned','active','completed');

-- ============ PROFILES ============
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  avatar_color text not null default '#7c3aed',
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "Profiles readable by authenticated"
  on public.profiles for select to authenticated using (true);
create policy "Users update own profile"
  on public.profiles for update to authenticated using (auth.uid() = id);
create policy "Users insert own profile"
  on public.profiles for insert to authenticated with check (auth.uid() = id);

-- ============ USER ROLES ============
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "Users read own roles"
  on public.user_roles for select to authenticated using (auth.uid() = user_id);
create policy "Users insert own role"
  on public.user_roles for insert to authenticated with check (auth.uid() = user_id);

-- ============ AUTO PROFILE TRIGGER ============
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  colors text[] := array['#7c3aed','#3b82f6','#f97316','#10b981','#ef4444'];
begin
  insert into public.profiles (id, name, email, avatar_color)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)),
    new.email,
    colors[1 + floor(random()*5)::int]
  );
  insert into public.user_roles (user_id, role) values (new.id, 'developer');
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============ PROJECTS ============
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  color text not null default '#7c3aed',
  status project_status not null default 'active',
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.projects enable row level security;

-- ============ PROJECT MEMBERS ============
create table public.project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (project_id, user_id)
);
alter table public.project_members enable row level security;

-- security definer to break recursion
create or replace function public.is_project_member(_project_id uuid, _user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.project_members
    where project_id = _project_id and user_id = _user_id
  ) or exists (
    select 1 from public.projects where id = _project_id and owner_id = _user_id
  )
$$;

create policy "Members or owner can read project"
  on public.projects for select to authenticated
  using (owner_id = auth.uid() or public.is_project_member(id, auth.uid()));
create policy "Authenticated can create project"
  on public.projects for insert to authenticated with check (owner_id = auth.uid());
create policy "Owner can update project"
  on public.projects for update to authenticated using (owner_id = auth.uid());
create policy "Owner can delete project"
  on public.projects for delete to authenticated using (owner_id = auth.uid());

create policy "Members can read project_members"
  on public.project_members for select to authenticated
  using (public.is_project_member(project_id, auth.uid()));
create policy "Owner can add members"
  on public.project_members for insert to authenticated
  with check (exists (select 1 from public.projects where id = project_id and owner_id = auth.uid()));
create policy "Owner can remove members"
  on public.project_members for delete to authenticated
  using (exists (select 1 from public.projects where id = project_id and owner_id = auth.uid()));

-- ============ SPRINTS ============
create table public.sprints (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  goal text,
  start_date date,
  end_date date,
  capacity int default 0,
  status sprint_status not null default 'planned',
  created_at timestamptz not null default now()
);
alter table public.sprints enable row level security;

create policy "Members read sprints"
  on public.sprints for select to authenticated
  using (public.is_project_member(project_id, auth.uid()));
create policy "Members write sprints"
  on public.sprints for insert to authenticated
  with check (public.is_project_member(project_id, auth.uid()));
create policy "Members update sprints"
  on public.sprints for update to authenticated
  using (public.is_project_member(project_id, auth.uid()));
create policy "Members delete sprints"
  on public.sprints for delete to authenticated
  using (public.is_project_member(project_id, auth.uid()));

-- ============ TASKS ============
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  sprint_id uuid references public.sprints(id) on delete set null,
  title text not null,
  description text,
  assignee_id uuid references auth.users(id) on delete set null,
  status task_status not null default 'TODO',
  priority task_priority not null default 'MED',
  story_points int default 0,
  due_date date,
  sort_order int not null default 0,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);
alter table public.tasks enable row level security;

create policy "Members read tasks"
  on public.tasks for select to authenticated
  using (public.is_project_member(project_id, auth.uid()));
create policy "Members create tasks"
  on public.tasks for insert to authenticated
  with check (public.is_project_member(project_id, auth.uid()) and created_by = auth.uid());
create policy "Members update tasks"
  on public.tasks for update to authenticated
  using (public.is_project_member(project_id, auth.uid()));
create policy "Members delete tasks"
  on public.tasks for delete to authenticated
  using (public.is_project_member(project_id, auth.uid()));

-- realtime
alter publication supabase_realtime add table public.tasks;
alter table public.tasks replica identity full;
