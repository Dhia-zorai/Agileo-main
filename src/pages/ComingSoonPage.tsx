// "Coming soon" placeholder used for /board, /chat, /reports root entries.
import { LucideIcon, Construction } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { TopBar } from "@/components/layout/TopBar";
import { EmptyState } from "@/components/EmptyState";

type Props = { title: string; icon?: LucideIcon };

export default function ComingSoonPage({ title, icon }: Props) {
  return (
    <AppShell>
      <TopBar title={title} />
      <div className="flex-1 flex items-center justify-center p-6">
        <EmptyState
          icon={icon ?? Construction}
          title={`${title} ships in Phase 2`}
          description="We focused Phase 1 on auth, projects, kanban, and personal task views. This view is up next."
        />
      </div>
    </AppShell>
  );
}
