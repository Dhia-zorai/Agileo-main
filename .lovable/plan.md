

# AGILEO — Phase 1 (US1–US5)

A Scrum project management dashboard with auth, projects, kanban, and personal task views. Built on Lovable Cloud + Tailwind, matching the AGILEO visual spec.

## What's in Phase 1

**User Stories shipped now:**
- US1 — Create a project
- US2 — Invite members
- US3 — Create tasks
- US4 — View my tasks
- US5 — Change task status (drag & drop)

**Deferred to Phase 2:** Dashboard charts (US6), Chat (US7), File sharing (US8), Backlog/Stories full table, Sprints lifecycle, Reports (Burndown/Velocity).

## Auth & Users
- Email/password sign up + sign in (Lovable Cloud)
- `/auth` page with Sign In / Sign Up tabs
- `profiles` table auto-created on signup (name, avatar_color, role)
- All app routes protected; redirect to `/auth` when signed out
- "Current user" everywhere = the logged-in profile

## Database (Lovable Cloud / Postgres + RLS)
- `profiles` — id (→auth.users), name, email, avatar_color, role
- `user_roles` — separate table with `app_role` enum (admin / scrum_master / developer / product_owner)
- `projects` — id, name, description, color, status, owner_id, created_at
- `project_members` — project_id, user_id (join table for US2)
- `sprints` — id, project_id, name, goal, start/end_date, capacity, status
- `tasks` — id, project_id, sprint_id, title, description, assignee_id, status (TODO/IN_PROGRESS/IN_REVIEW/DONE), priority (HIGH/MED/LOW), story_points, due_date, sort_order
- RLS: members can read project data; only members can mutate; only owner/scrum_master can delete project

## Visual System (Tailwind tokens matching AGILEO spec)
- Shell `#e8e8ed`, app card 20px radius, big soft shadow, centered
- Cards white, 20px radius, 24px padding, subtle shadow
- Plus Jakarta Sans (Google Fonts)
- Palette: violet `#7c3aed`, blue `#3b82f6`, orange `#f97316`, emerald `#10b981`, red `#ef4444`, tints amber/blue/green
- Active pill: black `#111827` bg, white text, fully rounded
- All colors wired as HSL CSS variables → Tailwind theme tokens

## Layout
- **AppShell** — 3 columns: 64px sidebar | main | 280px right panel
- **Sidebar** — icon-only, logo top, 6 lucide icons (Home, Folders, Kanban, CheckSquare, MessagesSquare, BarChart3), active = filled black circle with white icon
- **TopBar** — pill filter tabs + search + avatar dropdown (sign out)
- **RightPanel** — recent activity + quick stats card
- Mobile <768px: sidebar collapses to bottom nav

## Pages

**`/auth`** — sign in / sign up forms, brand panel left

**`/` Dashboard** — stat cards (projects, my open tasks, in progress, done this week) + MyTasksPanel preview (Today/Tomorrow toggle, tinted sub-cards) + SprintProgress placeholder bars. Charts come in Phase 2.

**`/projects`** — project card grid; each card shows color stripe, name, member avatars, task count. "+ New Project" opens SlidePanel form (US1).

**`/projects/:id`** — project detail with tabs:
- **Board** — Kanban with @dnd-kit, 4 columns, draggable TaskCards (left accent bar by priority, avatar chip, points badge, due date). WIP warning if column >5. Drop persists via update (US5). "+ Add task" per column opens TaskForm SlidePanel (US3).
- **Members** — member list + Invite SlidePanel (pick from existing users by email, US2). Remove with ConfirmDialog.
- (Backlog / Sprints / Chat / Reports tabs visible but show "Coming soon" empty state in Phase 1)

**`/my-tasks`** — tasks assigned to me, filter chips Today / This Week / Overdue (US4)

## Reusable Primitives
Card, Button (primary/ghost/danger/icon), Badge, Avatar (initials + color), SlidePanel (420px right, ESC + overlay close), ConfirmDialog, Toast (sonner, top-right, 3s), ProgressBar, EmptyState, LoadingSpinner.

## Data Layer
- Hooks: `useProjects`, `useTasks`, `useMembers`, `useProfile` — each returns `{ data, loading, error }` + CRUD via Supabase client
- Realtime subscription on `tasks` table so kanban updates live across users
- Every mutation: optimistic update + toast (green success / red error)
- Every list: loading spinner + empty state + error retry

## Seed Data
On first run, a "Seed demo data" button on the empty Projects page inserts:
- 2 projects: "Agileo Platform" (violet), "E-Commerce Redesign" (blue)
- 1 active sprint per project
- 12 tasks spread across all 4 kanban columns, assigned to current user + invited demo profiles

## Conventions
- Plain JavaScript per your spec — `.jsx` files (no TypeScript in feature code; shadcn primitives stay as-is)
- Each component header comment cites its User Story (e.g. `// US3 — Create Tasks`)
- All deletes go through ConfirmDialog
- Mobile responsive throughout

## Out of scope (Phase 2)
DonutChart (pure SVG), BurndownChart, VelocityChart, ChatPanel with polling, BacklogTable + UserStoryForm + MoSCoW, full Sprints lifecycle (start/complete/burndown), file uploads on tasks.

