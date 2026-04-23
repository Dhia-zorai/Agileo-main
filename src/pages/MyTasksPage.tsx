// US4 — My Tasks: filter chips Today / This Week / Overdue.
import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMyTasks } from "@/hooks/useTasks";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/layout/AppShell";
import { TopBar } from "@/components/layout/TopBar";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { EmptyState } from "@/components/EmptyState";
import { CheckSquare } from "lucide-react";
import { format, parseISO, isToday, isThisWeek, isPast, isValid } from "date-fns";
import { PRIORITY_BAR, STATUS_LABEL } from "@/lib/colors";

type Filter = "all" | "today" | "week" | "overdue";

const FILTERS: { label: string; value: Filter }[] = [
  { label: "All", value: "all" },
  { label: "Today", value: "today" },
  { label: "This Week", value: "week" },
  { label: "Overdue", value: "overdue" },
];

export default function MyTasksPage() {
  const navigate = useNavigate();
  const { data: tasks, loading } = useMyTasks();
  const [filter, setFilter] = useState<Filter>("all");
  const [projectMap, setProjectMap] = useState<Record<string, { name: string; color: string }>>({});

  useEffect(() => {
    if (tasks.length === 0) return;
    const ids = Array.from(new Set(tasks.map((t) => t.project_id)));
    supabase.from("projects").select("id, name, color").in("id", ids).then(({ data }) => {
      const m: Record<string, any> = {};
      (data ?? []).forEach((p: any) => (m[p.id] = p));
      setProjectMap(m);
    });
  }, [tasks]);

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (filter === "all") return true;
      if (!t.due_date) return false;
      const d = parseISO(t.due_date);
      if (!isValid(d)) return false;
      if (filter === "today") return isToday(d);
      if (filter === "week") return isThisWeek(d, { weekStartsOn: 1 });
      if (filter === "overdue") return isPast(d) && !isToday(d) && t.status !== "DONE";
      return true;
    });
  }, [tasks, filter]);

  return (
    <AppShell>
      <TopBar title="My Tasks" tabs={FILTERS} activeTab={filter} onTab={(v) => setFilter(v as Filter)} />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {loading ? (
          <LoadingSpinner />
        ) : filtered.length === 0 ? (
          <EmptyState icon={CheckSquare} title="Nothing due here" description="You're all caught up — go grab a coffee." />
        ) : (
          <ul className="space-y-2 max-w-3xl">
            {filtered.map((t) => {
              const proj = projectMap[t.project_id];
              const due = t.due_date ? parseISO(t.due_date) : null;
              return (
                <li
                  key={t.id}
                  onClick={() => navigate(`/projects/${t.project_id}`)}
                  className="relative bg-card rounded-2xl shadow-card p-4 pl-5 cursor-pointer hover:shadow-shell transition-shadow"
                >
                  <span className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full" style={{ backgroundColor: PRIORITY_BAR[t.priority] }} />
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{t.title}</h4>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        {proj && (
                          <span className="inline-flex items-center gap-1.5 text-[10px] text-muted-foreground">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: proj.color }} />
                            {proj.name}
                          </span>
                        )}
                        <span className="text-[10px] bg-muted rounded-full px-2 py-0.5 font-medium">
                          {STATUS_LABEL[t.status]}
                        </span>
                        {!!t.story_points && (
                          <span className="text-[10px] bg-muted rounded-full px-2 py-0.5 font-medium">
                            {t.story_points} pts
                          </span>
                        )}
                      </div>
                    </div>
                    {due && isValid(due) && (
                      <span className="text-xs text-muted-foreground shrink-0">{format(due, "MMM d")}</span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
