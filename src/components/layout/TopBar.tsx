// TopBar — pill tabs + search + avatar dropdown.
import { Search, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Avatar } from "@/components/Avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { ReactNode } from "react";

type Props = {
  title?: string;
  tabs?: { label: string; value: string }[];
  activeTab?: string;
  onTab?: (v: string) => void;
  right?: ReactNode;
};

export function TopBar({ title, tabs, activeTab, onTab, right }: Props) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="flex items-center gap-3 px-4 sm:px-6 h-16 border-b border-border bg-card">
      {title && <h1 className="font-bold text-lg sm:text-xl mr-2 truncate">{title}</h1>}

      {tabs && tabs.length > 0 && (
        <div className="hidden sm:flex items-center gap-1 bg-muted rounded-full p-1">
          {tabs.map((t) => (
            <button
              key={t.value}
              onClick={() => onTab?.(t.value)}
              className={`px-4 h-8 text-xs font-medium rounded-full transition-colors ${
                activeTab === t.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1" />

      {right}

      <div className="hidden lg:flex items-center gap-2 bg-muted rounded-full px-3 h-9 w-56">
        <Search className="w-4 h-4 text-muted-foreground" />
        <input
          placeholder="Search…"
          className="bg-transparent outline-none text-sm flex-1 placeholder:text-muted-foreground"
        />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 hover:bg-muted rounded-full p-1 pr-2 transition-colors">
          <Avatar name={profile?.name} color={profile?.avatar_color} size="sm" />
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground hidden sm:block" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="rounded-2xl w-56">
          <DropdownMenuLabel>
            <div className="text-sm font-semibold">{profile?.name}</div>
            <div className="text-xs text-muted-foreground font-normal">{profile?.email}</div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={async () => {
              await signOut();
              navigate("/auth", { replace: true });
            }}
            className="rounded-lg text-destructive focus:text-destructive"
          >
            <LogOut className="w-4 h-4 mr-2" /> Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
