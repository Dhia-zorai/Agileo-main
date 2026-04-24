// Backlog tab — list tasks not in any sprint, assign to sprint.
import { useState, useMemo } from "react";
import { useTasks, type Task } from "@/hooks/useTasks";
import { useSprints, type Sprint } from "@/hooks/useSprints";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { EmptyState } from "@/components/EmptyState";
import { PRIORITY_BAR, STATUS_LABEL } from "@/lib/colors";
import { format, parseISO, isValid } from "date-fns";
import { Layers, Calendar, User } from "lucide-react";

type Props = { projectId: string };

export function BacklogTab({ projectId }: Props) {
  const { data: tasks, loading: tasksLoading, update } = useTasks(projectId);
  const { data: sprints, loading: sprintsLoading } = useSprints(projectId);
  const [filterSprint, setFilterSprint] = useState<string>("all");

  const backlogTasks = useMemo(() => {
    return tasks.filter((t) => !t.sprint_id);
  }, [tasks]);

  const sprintTasks = useMemo(() => {
    if (filterSprint === "all") return tasks.filter((t) => t.sprint_id);
    return tasks.filter((t) => t.sprint_id === filterSprint);
  }, [tasks, filterSprint]);

  const assignToSprint = async (taskId: string, sprintId: string | null) => {
    await update(taskId, { sprint_id: sprintId });
  };

  if (tasksLoading || sprintsLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Backlog ({backlogTasks.length})</h2>
        <Select value={filterSprint} onValueChange={setFilterSprint}>
          <SelectTrigger className="w-48 rounded-xl"><SelectValue placeholder="Filter by sprint" /></SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="all">All sprints</SelectItem>
            {sprints.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {backlogTasks.length === 0 && sprintTasks.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No tasks in backlog"
          description="Create tasks to start planning your sprints."
        />
      ) : (
        <div className="space-y-6">
          {/* Backlog section */}
          {backlogTasks.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Unassigned (Backlog)</h3>
              <div className="space-y-2">
                {backlogTasks.map((task) => (
                  <BacklogTaskCard
                    key={task.id}
                    task={task}
                    sprints={sprints}
                    onAssign={(sprintId) => assignToSprint(task.id, sprintId)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Sprint tasks section */}
          {filterSprint !== "all" && sprintTasks.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                {sprints.find((s) => s.id === filterSprint)?.name}
              </h3>
              <div className="space-y-2">
                {sprintTasks.map((task) => (
                  <BacklogTaskCard
                    key={task.id}
                    task={task}
                    sprints={sprints}
                    onAssign={(sprintId) => assignToSprint(task.id, sprintId)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function BacklogTaskCard({ task, sprints, onAssign }: { task: Task; sprints: Sprint[]; onAssign: (sprintId: string | null) => void }) {
  const due = task.due_date ? parseISO(task.due_date) : null;

  return (
    <div className="bg-card rounded-2xl p-4 shadow-card flex items-center gap-4">
      <div className="w-1 self-stretch rounded-full" style={{ backgroundColor: PRIORITY_BAR[task.priority] }} />
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm truncate">{task.title}</h4>
        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Layers className="w-3 h-3" /> {STATUS_LABEL[task.status]}</span>
          {task.story_points && <span className="bg-muted px-2 py-0.5 rounded-full">{task.story_points} pts</span>}
          {due && isValid(due) && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {format(due, "MMM d")}</span>}
        </div>
      </div>
      <Select value={task.sprint_id ?? "none"} onValueChange={(v) => onAssign(v === "none" ? null : v)}>
        <SelectTrigger className="w-40 rounded-xl">
          <SelectValue placeholder="Assign to sprint" />
        </SelectTrigger>
        <SelectContent className="rounded-xl">
          <SelectItem value="none">Backlog</SelectItem>
          {sprints.map((s) => (
            <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}