// Sprints tab — list sprints, create/edit/delete, set active.
import { useState } from "react";
import { useSprints, type Sprint } from "@/hooks/useSprints";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SlidePanel } from "@/components/SlidePanel";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EmptyState } from "@/components/EmptyState";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Plus, Flag, Calendar, Target, Trash2 } from "lucide-react";

type Props = { projectId: string };

export function SprintsTab({ projectId }: Props) {
  const { data: sprints, loading, create, update, remove } = useSprints(projectId);
  const [formOpen, setFormOpen] = useState(false);
  const [editSprint, setEditSprint] = useState<Sprint | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Sprints ({sprints.length})</h2>
        <Button onClick={() => { setEditSprint(null); setFormOpen(true); }} className="rounded-full">
          <Plus className="w-4 h-4" /> New sprint
        </Button>
      </div>

      {sprints.length === 0 ? (
        <EmptyState
          icon={Flag}
          title="No sprints yet"
          description="Create sprints to organize your work into time-boxed iterations."
          action={<Button onClick={() => setFormOpen(true)} className="rounded-full"><Plus className="w-4 h-4" /> New sprint</Button>}
        />
      ) : (
        <div className="grid gap-3">
          {sprints.map((sprint) => (
            <SprintCard
              key={sprint.id}
              sprint={sprint}
              onEdit={() => { setEditSprint(sprint); setFormOpen(true); }}
              onDelete={() => setDeleteId(sprint.id)}
              onSetActive={() => update(sprint.id, { status: "active" })}
            />
          ))}
        </div>
      )}

      <SlidePanel open={formOpen} onClose={() => { setFormOpen(false); setEditSprint(null); }} title={editSprint ? "Edit sprint" : "New sprint"}>
        <SprintForm
          projectId={projectId}
          sprint={editSprint}
          onDone={() => { setFormOpen(false); setEditSprint(null); }}
          onSubmit={editSprint ? (input) => update(editSprint.id, input) : create}
        />
      </SlidePanel>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(v) => !v && setDeleteId(null)}
        title="Delete sprint?"
        description="Tasks in this sprint will be moved to the backlog."
        confirmLabel="Delete"
        onConfirm={() => deleteId && remove(deleteId)}
      />
    </div>
  );
}

function SprintCard({ sprint, onEdit, onDelete, onSetActive }: { sprint: Sprint; onEdit: () => void; onDelete: () => void; onSetActive: () => void }) {
  const statusColors = {
    planned: "bg-muted text-muted-foreground",
    active: "bg-tint-green text-emerald",
    completed: "bg-tint-blue text-blue",
  };

  return (
    <div className="bg-card rounded-2xl p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold">{sprint.name}</h3>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[sprint.status]}`}>
              {sprint.status}
            </span>
          </div>
          {sprint.goal && <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{sprint.goal}</p>}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {sprint.start_date && (
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {sprint.start_date}</span>
            )}
            {sprint.end_date && (
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {sprint.end_date}</span>
            )}
            {sprint.capacity > 0 && (
              <span className="flex items-center gap-1"><Target className="w-3 h-3" /> {sprint.capacity} pts</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {sprint.status !== "active" && (
            <Button variant="ghost" size="icon" onClick={onSetActive} title="Set as active">
              <Flag className="w-4 h-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={onEdit} title="Edit">
            <Target className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete} title="Delete" className="text-muted-foreground hover:text-destructive">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function SprintForm({ projectId, sprint, onDone, onSubmit }: { projectId: string; sprint: Sprint | null; onDone: () => void; onSubmit: (input: { name: string; goal?: string; start_date?: string; end_date?: string; capacity?: number }) => Promise<Sprint | null> }) {
  const [name, setName] = useState(sprint?.name ?? "");
  const [goal, setGoal] = useState(sprint?.goal ?? "");
  const [startDate, setStartDate] = useState(sprint?.start_date ?? "");
  const [endDate, setEndDate] = useState(sprint?.end_date ?? "");
  const [capacity, setCapacity] = useState(String(sprint?.capacity ?? 0));
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    const result = await onSubmit({
      name,
      goal: goal || undefined,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
      capacity: parseInt(capacity) || 0,
    });
    setBusy(false);
    if (result) onDone();
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="s-name">Sprint name</Label>
        <Input id="s-name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Sprint 1" className="h-11 rounded-xl" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="s-goal">Goal</Label>
        <Textarea id="s-goal" value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="What do we want to achieve?" rows={2} className="rounded-xl" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="s-start">Start date</Label>
          <Input id="s-start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-11 rounded-xl" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="s-end">End date</Label>
          <Input id="s-end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-11 rounded-xl" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="s-capacity">Capacity (story points)</Label>
        <Input id="s-capacity" type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} className="h-11 rounded-xl" />
      </div>
      <Button type="submit" disabled={busy || !name.trim()} className="w-full rounded-full">
        {busy ? "Saving..." : sprint ? "Update sprint" : "Create sprint"}
      </Button>
    </form>
  );
}