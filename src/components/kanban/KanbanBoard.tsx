// US5 — Kanban board with @dnd-kit, drag-to-status persistence.
import { useState, useMemo } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  DragOverlay,
  useDraggable,
  useDroppable,
  closestCorners,
} from "@dnd-kit/core";
import { Plus, AlertTriangle, Trash2 } from "lucide-react";
import { useTasks, type Task } from "@/hooks/useTasks";
import { useMembers, type Member } from "@/hooks/useMembers";
import { type Task } from "@/hooks/useTasks";
import { Avatar } from "@/components/Avatar";
import { SlidePanel } from "@/components/SlidePanel";
import { TaskForm } from "@/components/tasks/TaskForm";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { PRIORITY_BAR, STATUS_LABEL } from "@/lib/colors";
import { format, isValid, parseISO } from "date-fns";
import { ConfirmDialog } from "@/components/ConfirmDialog";

const COLUMNS: Task["status"][] = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"];

export function KanbanBoard({ projectId }: { projectId: string }) {
  const { data: tasks, loading, updateStatus, reload: reloadTasks, remove: removeTask } = useTasks(projectId);
  const { data: members } = useMembers(projectId);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [addStatus, setAddStatus] = useState<Task["status"] | null>(null);
  const [confirmTaskId, setConfirmTaskId] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

   const memberById = useMemo(() => {
     const m: Record<string, Profile> = {};
     members.forEach((mb) => mb.profile && (m[mb.user_id] = mb.profile));
     return m;
   }, [members]);

  const byStatus = useMemo(() => {
    const map: Record<string, Task[]> = { TODO: [], IN_PROGRESS: [], IN_REVIEW: [], DONE: [] };
    tasks.forEach((t) => map[t.status]?.push(t));
    return map;
  }, [tasks]);

  const onStart = (e: DragStartEvent) => setActiveId(String(e.active.id));
  const onEnd = (e: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;
    const newStatus = String(over.id) as Task["status"];
    const task = tasks.find((t) => t.id === active.id);
    if (!task || !COLUMNS.includes(newStatus) || task.status === newStatus) return;
    updateStatus(task.id, newStatus);
  };

  const activeTask = tasks.find((t) => t.id === activeId);

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={onStart} onDragEnd={onEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-1 px-1">
          {COLUMNS.map((status) => (
            <Column
              key={status}
              status={status}
              tasks={byStatus[status]}
              memberById={memberById}
              onAdd={() => setAddStatus(status)}
              onCardDelete={setConfirmTaskId}
            />
          ))}
        </div>
        <DragOverlay>
          {activeTask && <TaskCardView task={activeTask} member={memberById[activeTask.assignee_id ?? ""]} dragging />}
        </DragOverlay>
      </DndContext>

      <SlidePanel
        open={addStatus !== null}
        onClose={() => setAddStatus(null)}
        title={`New task — ${addStatus ? STATUS_LABEL[addStatus] : ""}`}
      >
        {addStatus && (
          <TaskForm projectId={projectId} defaultStatus={addStatus} onDone={() => {
            setAddStatus(null);
            reloadTasks();
          }} />
        )}
      </SlidePanel>

      <ConfirmDialog
        open={!!confirmTaskId}
        onOpenChange={(v) => !v && setConfirmTaskId(null)}
        title="Delete task?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => confirmTaskId && removeTask(confirmTaskId)}
      />
    </>
  );
}

function Column({ status, tasks, memberById, onAdd, onCardDelete }: {
   status: Task["status"]; tasks: Task[]; memberById: Record<string, Member | null>; onAdd: () => void; onCardDelete: (id: string) => void;
}) {
  const { isOver, setNodeRef } = useDroppable({ id: status });
  const wip = tasks.length > 5;

  return (
    <div
      ref={setNodeRef}
      className={`shrink-0 w-72 sm:w-80 bg-shell rounded-2xl p-3 flex flex-col gap-3 transition-colors ${isOver ? "ring-2 ring-primary" : ""}`}
    >
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">{STATUS_LABEL[status]}</h3>
          <span className="text-xs bg-card rounded-full w-6 h-6 flex items-center justify-center font-medium">
            {tasks.length}
          </span>
          {wip && (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-orange bg-tint-amber rounded-full px-2 py-0.5">
              <AlertTriangle className="w-3 h-3" /> WIP
            </span>
          )}
        </div>
        <button
          onClick={onAdd}
          className="w-7 h-7 rounded-full hover:bg-card flex items-center justify-center text-muted-foreground"
          aria-label="Add task"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="flex flex-col gap-2 min-h-[40px]">
        {tasks.map((t) => (
          <DraggableTask
            key={t.id}
            task={t}
            member={memberById[t.assignee_id ?? ""]}
            onDelete={() => onCardDelete(t.id)}
          />
        ))}
        {tasks.length === 0 && (
          <div className="text-xs text-muted-foreground text-center py-6">Drop tasks here</div>
        )}
      </div>
    </div>
  );
}

function DraggableTask({ task, member, onDelete }: { task: Task; member?: Member | null; onDelete: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: task.id });
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={isDragging ? "opacity-30" : ""}
    >
      <TaskCardView task={task} member={member} onDelete={onDelete} />
    </div>
  );
}

function TaskCardView({ task, member, dragging, onDelete }: { task: Task; member?: Member | null; dragging?: boolean; onDelete?: () => void }) {
  const due = task.due_date ? parseISO(task.due_date) : null;
  return (
    <article
      className={`relative bg-card rounded-2xl p-3 pl-4 cursor-grab active:cursor-grabbing select-none group ${dragging ? "shadow-shell rotate-2" : "shadow-card"}`}
    >
      <span
        className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full"
        style={{ backgroundColor: PRIORITY_BAR[task.priority] }}
      />
      <h4 className="font-medium text-sm mb-2 leading-snug">{task.title}</h4>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          {member ? (
            <Avatar name={member.name} color={member.avatar_color} size="xs" />
          ) : (
            <span className="w-6 h-6 rounded-full bg-muted ring-2 ring-card" />
          )}
          {!!task.story_points && (
            <span className="bg-muted text-foreground rounded-full px-2 py-0.5 text-[10px] font-semibold">
              {task.story_points} pts
            </span>
          )}
        </div>
        {due && isValid(due) && (
          <span className="text-[10px]">{format(due, "MMM d")}</span>
        )}
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete?.();
        }}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 w-7 h-7 rounded-full hover:bg-muted text-muted-foreground hover:text-destructive flex items-center justify-center transition-opacity"
        aria-label="Delete task"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </article>
  );
}
