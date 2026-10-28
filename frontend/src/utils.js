export const STATUSES = [
  { key: "TODO", label: "To do", color: "var(--todo)" },
  { key: "IN_PROGRESS", label: "In progress", color: "var(--prog)" },
  { key: "COMPLETED", label: "Done", color: "var(--done)" },
];

export const PRIORITIES = [
  { key: "LOW", label: "Low", color: "var(--low)" },
  { key: "MEDIUM", label: "Medium", color: "var(--med)" },
  { key: "HIGH", label: "High", color: "var(--high)" },
];

const PALETTE = ["#0f766e", "#6366f1", "#db2777", "#d97706", "#0284c7", "#9333ea", "#ea580c", "#475569"];

export const colorFor = (id) => PALETTE[id % PALETTE.length];

export const initials = (name) =>
  (name || "?")
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

export const fmtDate = (d) =>
  new Date(d).toLocaleDateString(undefined, { day: "numeric", month: "short" });

export const fmtFull = (d) =>
  new Date(d).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

export const isLate = (t) =>
  t.due_date && t.status !== "COMPLETED" && new Date(t.due_date + "T23:59:59") < new Date();

export const blankToNull = (v) => (v && v.trim() ? v.trim() : null);

export const isAdminUser = (user) => user?.role === "ADMIN";

// Admins can move any task; employees only the tasks assigned to them.
export const canChangeStatus = (user, task) =>
  isAdminUser(user) || task.assigned_to === user?.id;
