// Dashboard — stat cards + my tasks panel + sprint progress placeholder.
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Folders, ListTodo, Loader2, CheckCircle2 } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { useMyTasks } from "@/hooks/useTasks";
import { useAuth } from "@/hooks/useAuth";
import { AppShell } from "@/components/layout/AppShell";
import { TopBar } from "@/components/layout/TopBar";
import { format, parseISO, isToday, addDays, isValid } from "date-fns";
import { PRIORITY_BAR } from "@/lib/colors";

export default function DashboardPage() {
  const { profile } = useAuth();
  const { data: projects } = useProjects();
  const { data: myTasks } = useMyTasks();
  const navigate = useNavigate();
  const [when, setWhen] = useState<"today" | "tomorrow">("today");

  const open = myTasks.filter((t) => t.status === "TODO").length;
  const inProgress = myTasks.filter((t) => t.status === "IN_PROGRESS").length;
  const done = myTasks.filter((t) => t.status === "DONE").length;

  const tomorrow = addDays(new Date(), 1);
  const filtered = myTasks.filter((t) => {
    if (!t.due_date) return false;
    const d = parseISO(t.due_date);
    if (!isValid(d)) return false;
    return when === "today" ? isToday(d) : d.toDateString() === tomorrow.toDateString();
  });

  return (
    <AppShell>
      <TopBar title={`Hi ${profile?.name?.split(" ")[0] ?? "there"} 👋`} />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard icon={<Folders className="w-4 h-4" />} label="Projects" value={projects.length} tint="bg-tint-violet" accent="text-violet" />
          <StatCard icon={<ListTodo className="w-4 h-4" />} label="My open" value={open} tint="bg-tint-blue" accent="text-blue" />
          <StatCard icon={<Loader2 className="w-4 h-4" />} label="In progress" value={inProgress} tint="bg-tint-amber" accent="text-orange" />
          <StatCard icon={<CheckCircle2 className="w-4 h-4" />} label="Done" value={done} tint="bg-tint-green" accent="text-emerald" />
        </div>

        {/* My tasks panel */}
        <div className="agileo-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">My tasks</h2>
            <div className="flex gap-1 bg-muted rounded-full p-1 text-xs">
              {(["today", "tomorrow"] as const).map((w) => (
                <button
                  key={w}
                  onClick={() => setWhen(w)}
                  className={`px-3 h-7 rounded-full font-medium ${when === w ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
                >
                  {w[0].toUpperCase() + w.slice(1)}
                </button>
              ))}
            </div>
          </div>
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Nothing scheduled. Enjoy the calm.</p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.slice(0, 6).map((t, i) => {
                const tints = ["bg-tint-amber", "bg-tint-blue", "bg-tint-green"];
                const tint = tints[i % 3];
                return (
                  <article key={t.id} onClick={() => navigate(`/projects/${t.project_id}`)}
                    className={`relative ${tint} rounded-2xl p-3 pl-4 cursor-pointer hover:scale-[1.01] transition-transform`}
                  >
                    <span className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full" style={{ backgroundColor: PRIORITY_BAR[t.priority] }} />
                    <h4 className="font-medium text-sm leading-snug mb-1">{t.title}</h4>
                    <p className="text-[10px] text-muted-foreground">
                      {t.due_date && format(parseISO(t.due_date), "EEE, MMM d")}
                    </p>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* Sprint progress placeholder */}
        <div className="agileo-card">
          <h2 className="font-semibold mb-4">Project progress</h2>
          {projects.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Create a project to see progress here.</p>
          ) : (
            <ul className="space-y-3">
              {projects.slice(0, 4).map((p, i) => {
                const progressColors = ["bg-violet", "bg-blue", "bg-orange", "bg-emerald"];
                const pct = Math.round(((i + 1) * 23) % 100);
                return (
                  <li key={p.id}>
                    <div className="flex justify-between mb-1.5 text-xs">
                      <span className="font-medium">{p.name}</span>
                      <span className="text-muted-foreground tabular-nums">{pct}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full ${progressColors[i % 4]} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function StatCard({ icon, label, value, tint, accent }: { icon: React.ReactNode; label: string; value: number; tint: string; accent: string }) {
  return (
    <div className="agileo-card">
      <div className={`w-9 h-9 rounded-full ${tint} ${accent} flex items-center justify-center mb-3`}>{icon}</div>
      <div className="text-2xl font-bold tabular-nums">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
