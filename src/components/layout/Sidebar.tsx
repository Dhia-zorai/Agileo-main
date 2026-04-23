// Sidebar — icon-only nav, active = filled black circle with white icon.
import { NavLink, useLocation } from "react-router-dom";
import { Home, Folders, Kanban, CheckSquare, MessagesSquare, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", icon: Home, label: "Dashboard", end: true },
  { to: "/projects", icon: Folders, label: "Projects" },
  { to: "/board", icon: Kanban, label: "Board" },
  { to: "/my-tasks", icon: CheckSquare, label: "My Tasks" },
  { to: "/chat", icon: MessagesSquare, label: "Chat" },
  { to: "/reports", icon: BarChart3, label: "Reports" },
];

export function Sidebar() {
  const { pathname } = useLocation();

  return (
    <aside className="hidden md:flex w-16 shrink-0 flex-col items-center py-5 gap-3 bg-card border-r border-border">
      <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-extrabold text-lg mb-3">
        A
      </div>
      {NAV.map(({ to, icon: Icon, label, end }) => {
        const active = end ? pathname === to : pathname.startsWith(to);
        return (
          <NavLink
            key={to}
            to={to}
            end={end}
            title={label}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center transition-all",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted",
            )}
          >
            <Icon className="w-5 h-5" />
          </NavLink>
        );
      })}
    </aside>
  );
}

export function MobileBottomNav() {
  const { pathname } = useLocation();
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-card border-t border-border flex justify-around py-2 px-2">
      {NAV.slice(0, 5).map(({ to, icon: Icon, label, end }) => {
        const active = end ? pathname === to : pathname.startsWith(to);
        return (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={cn(
              "flex flex-col items-center gap-0.5 px-3 py-1 rounded-full text-[10px]",
              active ? "text-foreground" : "text-muted-foreground",
            )}
          >
            <div
              className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center",
                active && "bg-primary text-primary-foreground",
              )}
            >
              <Icon className="w-4 h-4" />
            </div>
            <span>{label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
