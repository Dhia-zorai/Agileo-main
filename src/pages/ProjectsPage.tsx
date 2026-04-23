// US1 — Projects grid page.
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Folders } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { useMembers } from "@/hooks/useMembers";
import { AppShell } from "@/components/layout/AppShell";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/button";
import { SlidePanel } from "@/components/SlidePanel";
import { ProjectForm } from "@/components/projects/ProjectForm";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { EmptyState } from "@/components/EmptyState";

export default function ProjectsPage() {
  const { data, loading, reload: reloadProjects } = useProjects();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <AppShell>
      <TopBar
        title="Projects"
        right={
          <Button onClick={() => setOpen(true)} className="rounded-full">
            <Plus className="w-4 h-4" /> New project
          </Button>
        }
      />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {loading ? (
          <LoadingSpinner />
        ) : data.length === 0 ? (
          <EmptyState
            icon={Folders}
            title="No projects yet"
            description="Create your first project to start managing sprints and tasks."
            action={<Button onClick={() => setOpen(true)} className="rounded-full"><Plus className="w-4 h-4" /> New project</Button>}
          />
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((p) => (
              <ProjectCard key={p.id} project={p} onClick={() => navigate(`/projects/${p.id}`)} />
            ))}
          </div>
        )}
      </div>

      <SlidePanel open={open} onClose={() => setOpen(false)} title="New project">
        <ProjectForm onDone={() => {
          setOpen(false);
          reloadProjects();
        }} />
      </SlidePanel>
    </AppShell>
  );
}

function ProjectCard({ project, onClick }: { project: any; onClick: () => void }) {
  const { data: members } = useMembers(project.id);
  return (
    <button
      onClick={onClick}
      className="text-left bg-card rounded-[20px] shadow-card p-5 hover:shadow-shell transition-shadow group relative overflow-hidden"
    >
      <span className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: project.color }} />
      <h3 className="font-semibold text-base mb-1 pl-2 group-hover:translate-x-0.5 transition-transform">{project.name}</h3>
      <p className="text-xs text-muted-foreground line-clamp-2 mb-4 pl-2 min-h-[32px]">
        {project.description || "No description"}
      </p>
      <div className="flex items-center justify-between pl-2">
        <div className="flex -space-x-2">
          {members.slice(0, 4).map((m) => (
            <div
              key={m.id}
              className="w-7 h-7 rounded-full ring-2 ring-card flex items-center justify-center text-[10px] font-semibold text-white"
              style={{ backgroundColor: m.profile?.avatar_color ?? "#999" }}
            >
              {m.profile?.name?.[0] ?? "?"}
            </div>
          ))}
          {members.length > 4 && (
            <div className="w-7 h-7 rounded-full bg-muted ring-2 ring-card flex items-center justify-center text-[10px] font-semibold">
              +{members.length - 4}
            </div>
          )}
        </div>
        <span className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground">
          {project.status}
        </span>
      </div>
    </button>
  );
}
