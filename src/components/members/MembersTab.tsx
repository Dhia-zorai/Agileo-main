// US2 — Members tab with invite slide panel + remove confirmation.
import { useState } from "react";
import { UserPlus, Trash2, Users } from "lucide-react";
import { useMembers } from "@/hooks/useMembers";
import { useProject } from "@/hooks/useProjects";
import { useAuth } from "@/hooks/useAuth";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SlidePanel } from "@/components/SlidePanel";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EmptyState } from "@/components/EmptyState";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export function MembersTab({ projectId }: { projectId: string }) {
  const { user } = useAuth();
  const { data: project } = useProject(projectId);
  const { data: members, loading, invite, remove } = useMembers(projectId);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const isOwner = project?.owner_id === user?.id;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const ok = await invite(email);
    setBusy(false);
    if (ok) {
      setEmail("");
      setInviteOpen(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Team members ({members.length})</h2>
        {isOwner && (
          <Button onClick={() => setInviteOpen(true)} className="rounded-full">
            <UserPlus className="w-4 h-4" /> Invite member
          </Button>
        )}
      </div>

      {members.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No members yet"
          description="Invite collaborators by their email."
          action={isOwner ? <Button onClick={() => setInviteOpen(true)} className="rounded-full"><UserPlus className="w-4 h-4" /> Invite</Button> : undefined}
        />
      ) : (
        <ul className="space-y-2">
          {members.map((m) => (
            <li key={m.id} className="flex items-center gap-3 bg-card rounded-2xl p-3 shadow-card">
              <Avatar name={m.profile?.name} color={m.profile?.avatar_color} size="md" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{m.profile?.name ?? "Unknown"}</div>
                <div className="text-xs text-muted-foreground truncate">{m.profile?.email}</div>
              </div>
              {project?.owner_id === m.user_id && (
                <span className="text-[10px] uppercase tracking-wide bg-tint-violet text-violet rounded-full px-2 py-1 font-semibold">
                  Owner
                </span>
              )}
              {isOwner && project?.owner_id !== m.user_id && (
                <button
                  onClick={() => setConfirmId(m.id)}
                  className="w-9 h-9 rounded-full hover:bg-muted text-muted-foreground hover:text-destructive flex items-center justify-center"
                  aria-label="Remove member"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <SlidePanel open={inviteOpen} onClose={() => setInviteOpen(false)} title="Invite member">
        <form onSubmit={submit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="invite-email">Email address</Label>
            <Input
              id="invite-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teammate@company.com"
              required
              className="h-11 rounded-xl"
            />
            <p className="text-xs text-muted-foreground">The user must already have an AGILEO account.</p>
          </div>
          <Button type="submit" disabled={busy || !email} className="w-full rounded-full">
            {busy ? "Adding…" : "Add to project"}
          </Button>
        </form>
      </SlidePanel>

      <ConfirmDialog
        open={!!confirmId}
        onOpenChange={(v) => !v && setConfirmId(null)}
        title="Remove member?"
        description="They'll lose access to this project."
        confirmLabel="Remove"
        onConfirm={() => confirmId && remove(confirmId)}
      />
    </div>
  );
}
