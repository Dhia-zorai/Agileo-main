// Project detail with tabs: Board, Backlog, Sprints, Members, Chat, Reports.
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useProject, useProjects } from "@/hooks/useProjects";
import { useAuth } from "@/hooks/useAuth";
import { AppShell } from "@/components/layout/AppShell";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { MembersTab } from "@/components/members/MembersTab";
import { SprintsTab } from "@/components/sprints/SprintsTab";
import { BacklogTab } from "@/components/backlog/BacklogTab";
import { ReportsTab } from "@/components/reports/ReportsTab";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Construction } from "lucide-react";

const TABS = [
  { label: "Board", value: "board" },
  { label: "Backlog", value: "backlog" },
  { label: "Sprints", value: "sprints" },
  { label: "Members", value: "members" },
  { label: "Chat", value: "chat" },
  { label: "Reports", value: "reports" },
];

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: project, loading } = useProject(id);
  const { remove } = useProjects();
  const [tab, setTab] = useState("board");
  const [confirmDel, setConfirmDel] = useState(false);

  if (loading) {
    return <AppShell><LoadingSpinner /></AppShell>;
  }
  if (!project || !id) {
    return (
      <AppShell>
        <EmptyState title="Project not found" description="This project may have been deleted or you don't have access." />
      </AppShell>
    );
  }

  const isOwner = project.owner_id === user?.id;

  return (
    <AppShell>
      <TopBar
        title={project.name}
        tabs={TABS}
        activeTab={tab}
        onTab={setTab}
        right={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate("/projects")} className="rounded-full" aria-label="Back">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            {isOwner && (
              <Button variant="ghost" size="icon" onClick={() => setConfirmDel(true)} className="rounded-full text-destructive" aria-label="Delete project">
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        }
      />
      {/* mobile tab bar */}
      <div className="sm:hidden overflow-x-auto border-b border-border bg-card">
        <div className="flex gap-1 p-2">
          {TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`px-3 h-8 text-xs rounded-full whitespace-nowrap ${tab === t.value ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {tab === "board" && <KanbanBoard projectId={id} />}
        {tab === "backlog" && <BacklogTab projectId={id} />}
        {tab === "sprints" && <SprintsTab projectId={id} />}
        {tab === "members" && <MembersTab projectId={id} />}
        {tab === "reports" && <ReportsTab projectId={id} />}
        {tab === "chat" && (
          <EmptyState icon={Construction} title="Coming in Phase 2" description="The chat view ships in the next release." />
        )}
      </div>

      <ConfirmDialog
        open={confirmDel}
        onOpenChange={setConfirmDel}
        title="Delete project?"
        description="This permanently removes the project and all its tasks and members."
        confirmLabel="Delete project"
        onConfirm={async () => {
          await remove(id);
          navigate("/projects");
        }}
      />
    </AppShell>
  );
}
