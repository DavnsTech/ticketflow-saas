const statusStyles: Record<string, string> = {
  OPEN: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 ring-blue-600/10 dark:ring-blue-400/20",
  IN_PROGRESS: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 ring-amber-600/10 dark:ring-amber-400/20",
  WAITING: "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400 ring-violet-600/10 dark:ring-violet-400/20",
  RESOLVED: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 ring-emerald-600/10 dark:ring-emerald-400/20",
  CLOSED: "bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-400 ring-gray-500/10 dark:ring-zinc-400/20",
};

const priorityStyles: Record<string, string> = {
  LOW: "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400 ring-sky-600/10 dark:ring-sky-400/20",
  MEDIUM: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 ring-blue-600/10 dark:ring-blue-400/20",
  HIGH: "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400 ring-orange-600/10 dark:ring-orange-400/20",
  URGENT: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 ring-red-600/10 dark:ring-red-400/20",
};

const statusDot: Record<string, string> = {
  OPEN: "bg-blue-500",
  IN_PROGRESS: "bg-amber-500",
  WAITING: "bg-violet-500",
  RESOLVED: "bg-emerald-500",
  CLOSED: "bg-gray-400 dark:bg-zinc-500",
};

export function StatusBadge({ value }: { value: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium ring-1 ring-inset ${statusStyles[value] ?? statusStyles.CLOSED}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${statusDot[value] ?? "bg-gray-400"}`} />
      {value.replace("_", " ")}
    </span>
  );
}

export function PriorityBadge({ value }: { value: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ring-1 ring-inset ${priorityStyles[value] ?? priorityStyles.MEDIUM}`}>
      {value}
    </span>
  );
}

export function RoleBadge({ value }: { value: string }) {
  const styles: Record<string, string> = {
    ADMIN: "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 ring-purple-600/10 dark:ring-purple-400/20",
    AGENT: "bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400 ring-teal-600/10 dark:ring-teal-400/20",
    USER: "bg-gray-50 text-gray-600 dark:bg-zinc-800 dark:text-zinc-400 ring-gray-500/10 dark:ring-zinc-400/20",
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ring-1 ring-inset ${styles[value] ?? styles.USER}`}>
      {value}
    </span>
  );
}
