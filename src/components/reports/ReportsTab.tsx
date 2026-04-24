// Reports tab — burndown chart, velocity, team stats.
import { useMemo } from "react";
import { useSprints, type Sprint } from "@/hooks/useSprints";
import { useTasks, type Task } from "@/hooks/useTasks";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { EmptyState } from "@/components/EmptyState";
import { PRIORITY_BAR } from "@/lib/colors";
import { BarChart3, TrendingUp, CheckCircle2, Clock, Target } from "lucide-react";
import { format, parseISO, eachDayOfInterval, isValid } from "date-fns";

type Props = { projectId: string };

export function ReportsTab({ projectId }: Props) {
  const { data: sprints, loading: sprintsLoading } = useSprints(projectId);
  const { data: tasks, loading: tasksLoading } = useTasks(projectId);

  const completedSprints = sprints.filter((s) => s.status === "completed");
  const activeSprint = sprints.find((s) => s.status === "active");

  const stats = useMemo(() => {
    const totalTasks = tasks.length;
    const completed = tasks.filter((t) => t.status === "DONE").length;
    const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS").length;
    const totalPoints = tasks.reduce((sum, t) => sum + (t.story_points || 0), 0);
    const completedPoints = tasks.filter((t) => t.status === "DONE").reduce((sum, t) => sum + (t.story_points || 0), 0);
    return { totalTasks, completed, inProgress, totalPoints, completedPoints };
  }, [tasks]);

  if (sprintsLoading || tasksLoading) {
    return <LoadingSpinner />;
  }

  if (!sprints.length) {
    return (
      <EmptyState
        icon={BarChart3}
        title="No reports yet"
        description="Create sprints to see burndown charts and velocity metrics."
      />
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Reports</h2>

      {/* Overview stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<CheckCircle2 className="w-4 h-4" />} label="Completed" value={stats.completed} sublabel={`of ${stats.totalTasks} tasks`} tint="bg-tint-green" />
        <StatCard icon={<Clock className="w-4 h-4" />} label="In Progress" value={stats.inProgress} sublabel="tasks" tint="bg-tint-amber" />
        <StatCard icon={<Target className="w-4 h-4" />} label="Story Points" value={stats.completedPoints} sublabel={`of ${stats.totalPoints}`} tint="bg-tint-blue" />
        <StatCard icon={<TrendingUp className="w-4 h-4" />} label="Sprints" value={completedSprints.length} sublabel="completed" tint="bg-tint-violet" />
      </div>

      {/* Active sprint burndown */}
      {activeSprint && (
        <div className="bg-card rounded-2xl p-6 shadow-card">
          <h3 className="font-semibold mb-4">Active Sprint: {activeSprint.name}</h3>
          <SprintBurndown sprint={activeSprint} tasks={tasks} />
        </div>
      )}

      {/* Sprint history */}
      {completedSprints.length > 0 && (
        <div className="bg-card rounded-2xl p-6 shadow-card">
          <h3 className="font-semibold mb-4">Sprint History</h3>
          <div className="space-y-3">
            {completedSprints.map((sprint) => {
              const sprintTasks = tasks.filter((t) => t.sprint_id === sprint.id);
              const completed = sprintTasks.filter((t) => t.status === "DONE").length;
              const points = sprintTasks.reduce((sum, t) => sum + (t.story_points || 0), 0);
              return (
                <div key={sprint.id} className="flex items-center justify-between p-3 bg-muted rounded-xl">
                  <div>
                    <div className="font-medium">{sprint.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {sprint.start_date} - {sprint.end_date}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{completed}/{sprintTasks.length} tasks</div>
                    <div className="text-xs text-muted-foreground">{points} pts</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Priority breakdown */}
      <div className="bg-card rounded-2xl p-6 shadow-card">
        <h3 className="font-semibold mb-4">Task Priority</h3>
        <div className="space-y-2">
          {(["HIGH", "MED", "LOW"] as const).map((priority) => {
            const count = tasks.filter((t) => t.priority === priority).length;
            const pct = stats.totalTasks ? Math.round((count / stats.totalTasks) * 100) : 0;
            return (
              <div key={priority}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{priority}</span>
                  <span className="text-muted-foreground">{count} ({pct}%)</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, backgroundColor: PRIORITY_BAR[priority] }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sublabel, tint }: { icon: React.ReactNode; label: string; value: number; sublabel: string; tint: string }) {
  return (
    <div className="bg-card rounded-2xl p-4 shadow-card">
      <div className={`w-9 h-9 rounded-full ${tint} flex items-center justify-center mb-3`}>{icon}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-[10px] text-muted-foreground">{sublabel}</div>
    </div>
  );
}

function SprintBurndown({ sprint, tasks }: { sprint: Sprint; tasks: Task[] }) {
  const burndownData = useMemo(() => {
    if (!sprint.start_date || !sprint.end_date) return null;

    const start = parseISO(sprint.start_date);
    const end = parseISO(sprint.end_date);

    if (!isValid(start) || !isValid(end)) return null;

    const days = eachDayOfInterval({ start, end });
    const totalPoints = tasks.filter((t) => t.sprint_id === sprint.id).reduce((sum, t) => sum + (t.story_points || 0), 0);
    const idealDaily = totalPoints / days.length;

    return days.map((day, idx) => {
      const dayTasks = tasks.filter((t) => {
        if (t.sprint_id !== sprint.id) return false;
        if (t.status === "DONE" && t.updated_at) {
          const updated = parseISO(t.updated_at);
          return isValid(updated) && updated <= day;
        }
        return false;
      });
      const completedPoints = dayTasks.reduce((sum, t) => sum + (t.story_points || 0), 0);
      const remaining = totalPoints - completedPoints;
      const idealRemaining = Math.max(0, totalPoints - idealDaily * (idx + 1));

      return {
        date: format(day, "MMM d"),
        remaining,
        ideal: Math.round(idealRemaining),
      };
    });
  }, [sprint, tasks]);

  if (!burndownData) {
    return <p className="text-sm text-muted-foreground">Set sprint dates to see burndown chart.</p>;
  }

  const maxPoints = Math.max(...burndownData.map((d) => Math.max(d.remaining, d.ideal)));

  return (
    <div className="space-y-4">
      <div className="h-48 flex items-end gap-1">
        {burndownData.map((day, idx) => {
          const actualHeight = maxPoints > 0 ? (day.remaining / maxPoints) * 100 : 0;
          const idealHeight = maxPoints > 0 ? (day.ideal / maxPoints) * 100 : 0;
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex flex-col items-center gap-0.5">
                <div
                  className="w-full bg-blue rounded-t"
                  style={{ height: `${actualHeight}%`, minHeight: day.remaining > 0 ? "4px" : "0" }}
                />
                <div
                  className="w-full bg-muted rounded-t opacity-50"
                  style={{ height: `${idealHeight}%`, minHeight: "2px" }}
                />
              </div>
              <span className="text-[8px] text-muted-foreground rotate-45 origin-left">{day.date}</span>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue rounded" />
          <span>Actual</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-muted rounded" />
          <span>Ideal</span>
        </div>
      </div>
    </div>
  );
}