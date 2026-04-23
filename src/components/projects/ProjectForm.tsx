// US1 — Create Project form in a SlidePanel.
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PROJECT_COLORS } from "@/lib/colors";
import { useProjects } from "@/hooks/useProjects";

type Props = { onDone: () => void };

export function ProjectForm({ onDone }: Props) {
  const { create } = useProjects();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(PROJECT_COLORS[0].value);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const row = await create({ name, description, color });
    setBusy(false);
    if (row) onDone();
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="p-name">Project name</Label>
        <Input id="p-name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Agileo Platform" className="h-11 rounded-xl" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="p-desc">Description</Label>
        <Textarea id="p-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What's this project about?" rows={3} className="rounded-xl" />
      </div>
      <div className="space-y-2">
        <Label>Color</Label>
        <div className="flex gap-2">
          {PROJECT_COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setColor(c.value)}
              className="w-9 h-9 rounded-full ring-2 ring-offset-2 transition-all"
              style={{
                backgroundColor: c.value,
                // @ts-ignore custom prop
                "--tw-ring-color": color === c.value ? c.value : "transparent",
              } as React.CSSProperties}
              aria-label={c.name}
            />
          ))}
        </div>
      </div>
      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={busy || !name} className="rounded-full flex-1">
          {busy ? "Creating…" : "Create project"}
        </Button>
      </div>
    </form>
  );
}
