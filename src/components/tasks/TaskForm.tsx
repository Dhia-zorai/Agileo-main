// US3 — Create Task form in SlidePanel.
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTasks, type Task } from "@/hooks/useTasks";
import { useMembers } from "@/hooks/useMembers";

type Props = {
  projectId: string;
  defaultStatus: Task["status"];
  onDone: () => void;
};

export function TaskForm({ projectId, defaultStatus, onDone }: Props) {
  const { create } = useTasks(projectId);
  const { data: members } = useMembers(projectId);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("MED");
  const [points, setPoints] = useState<string>("3");
  const [assignee, setAssignee] = useState<string>("none");
  const [dueDate, setDueDate] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const row = await create({
      title,
      description,
      status: defaultStatus,
      priority,
      story_points: parseInt(points) || 0,
      assignee_id: assignee === "none" ? null : assignee,
      due_date: dueDate || null,
    });
    setBusy(false);
    if (row) onDone();
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="t-title">Title</Label>
        <Input id="t-title" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Implement login flow" className="h-11 rounded-xl" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="t-desc">Description</Label>
        <Textarea id="t-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="rounded-xl" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Priority</Label>
          <Select value={priority} onValueChange={(v) => setPriority(v as any)}>
            <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="MED">Medium</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Story points</Label>
          <Select value={points} onValueChange={setPoints}>
            <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent className="rounded-xl">
              {["1","2","3","5","8","13"].map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Assignee</Label>
        <Select value={assignee} onValueChange={setAssignee}>
          <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="none">Unassigned</SelectItem>
            {members.map((m) => (
              <SelectItem key={m.user_id} value={m.user_id}>
                {m.profile?.name ?? m.user_id}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="t-due">Due date</Label>
        <Input id="t-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="h-11 rounded-xl" />
      </div>

      <Button type="submit" disabled={busy || !title} className="w-full rounded-full">
        {busy ? "Creating…" : "Create task"}
      </Button>
    </form>
  );
}
