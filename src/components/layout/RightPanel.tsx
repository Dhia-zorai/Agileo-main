// RightPanel — recent activity + quick stats card.
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { CheckCircle2, Clock, ListTodo } from "lucide-react";

type Stats = { open: number; inProgress: number; done: number };

export function RightPanel() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({ open: 0, inProgress: 0, done: 0 });
  const [recent, setRecent] = useState<{ title: string; status: string; created_at: string }[]>([]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("tasks")
        .select("title, status, created_at, assignee_id")
        .order("created_at", { ascending: false })
        .limit(20);
      const all = data ?? [];
      const mine = all.filter((t: any) => t.assignee_id === user.id);
      setStats({
        open: mine.filter((t: any) => t.status === "TODO").length,
        inProgress: mine.filter((t: any) => t.status === "IN_PROGRESS").length,
        done: mine.filter((t: any) => t.status === "DONE").length,
      });
      setRecent(all.slice(0, 5));
    };
    load();
    const ch = supabase
      .channel("right-panel-tasks")
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, load)
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [user]);

  return (
    <aside className="hidden xl:flex w-[280px] shrink-0 flex-col gap-4 p-5 bg-shell">
      {/* Quick stats */}
      <div className="agileo-card">
        <h3 className="text-sm font-semibold mb-4">Your week</h3>
        <div className="space-y-3">
          <StatRow icon={<ListTodo className="w-4 h-4" />} label="Open" value={stats.open} tint="bg-tint-blue" />
          <StatRow icon={<Clock className="w-4 h-4" />} label="In progress" value={stats.inProgress} tint="bg-tint-amber" />
          <StatRow icon={<CheckCircle2 className="w-4 h-4" />} label="Done" value={stats.done} tint="bg-tint-green" />
        </div>
      </div>

      {/* Activity */}
      <div className="agileo-card flex-1 min-h-0">
        <h3 className="text-sm font-semibold mb-4">Recent activity</h3>
        {recent.length === 0 ? (
          <p className="text-xs text-muted-foreground">No activity yet.</p>
        ) : (
          <ul className="space-y-3">
            {recent.map((r, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-violet mt-1.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate">{r.title}</p>
                  <p className="text-[10px] text-muted-foreground">{r.status.replace("_", " ")}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}

function StatRow({ icon, label, value, tint }: { icon: React.ReactNode; label: string; value: number; tint: string }) {
  return (
    <div className={`flex items-center justify-between rounded-2xl px-3 py-2.5 ${tint}`}>
      <div className="flex items-center gap-2 text-xs font-medium">
        {icon}
        {label}
      </div>
      <span className="font-bold text-base tabular-nums">{value}</span>
    </div>
  );
}
