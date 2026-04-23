export const PROJECT_COLORS = [
  { name: "Violet", value: "#7c3aed" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Orange", value: "#f97316" },
  { name: "Emerald", value: "#10b981" },
  { name: "Red", value: "#ef4444" },
];

export const initials = (name?: string | null) => {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
};

export const PRIORITY_BAR: Record<string, string> = {
  HIGH: "#ef4444",
  MED: "#f97316",
  LOW: "#3b82f6",
};

export const STATUS_LABEL: Record<string, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  IN_REVIEW: "In Review",
  DONE: "Done",
};
