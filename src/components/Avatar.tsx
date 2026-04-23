// Avatar — initials chip with profile color.
import { cn } from "@/lib/utils";
import { initials } from "@/lib/colors";

type Props = {
  name?: string | null;
  color?: string | null;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
};

const SIZES = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
};

export function Avatar({ name, color, size = "sm", className }: Props) {
  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-semibold text-white shrink-0 ring-2 ring-white",
        SIZES[size],
        className,
      )}
      style={{ backgroundColor: color ?? "#7c3aed" }}
      title={name ?? ""}
    >
      {initials(name)}
    </div>
  );
}
