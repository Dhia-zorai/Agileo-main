// AppShell — 3-column wrapper centered in shell card.
import { ReactNode } from "react";
import { Sidebar, MobileBottomNav } from "./Sidebar";
import { RightPanel } from "./RightPanel";

export function AppShell({ children, hideRight }: { children: ReactNode; hideRight?: boolean }) {
  return (
    <div className="min-h-screen agileo-shell p-0 sm:p-4 md:p-6">
      <div className="bg-card rounded-none sm:rounded-[20px] shadow-none sm:shadow-shell flex h-[100dvh] sm:h-[calc(100dvh-3rem)] overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">{children}</main>
        {!hideRight && <RightPanel />}
      </div>
      <MobileBottomNav />
    </div>
  );
}
