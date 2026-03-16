import type { PriorityCount } from "../api/dashboard";

const barColors: Record<string, string> = {
  LOW: "bg-sky-400 dark:bg-sky-500",
  MEDIUM: "bg-blue-500 dark:bg-blue-400",
  HIGH: "bg-orange-500 dark:bg-orange-400",
  URGENT: "bg-red-500 dark:bg-red-400",
};

const dotColors: Record<string, string> = {
  LOW: "bg-sky-400",
  MEDIUM: "bg-blue-500",
  HIGH: "bg-orange-500",
  URGENT: "bg-red-500",
};

export default function PriorityChart({ data }: { data: PriorityCount[] }) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-100">Priority Distribution</h3>
        <span className="text-xs text-gray-400 dark:text-zinc-500">{total} total</span>
      </div>
      <div className="space-y-3">
        {data.map(({ priority, count }) => (
          <div key={priority} className="flex items-center gap-3">
            <div className="flex items-center gap-2 w-20">
              <span className={`w-2 h-2 rounded-full ${dotColors[priority] ?? "bg-gray-400"}`} />
              <span className="text-xs font-medium text-gray-600 dark:text-zinc-400">{priority}</span>
            </div>
            <div className="flex-1 bg-gray-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${barColors[priority] ?? "bg-gray-400"}`}
                style={{ width: `${(count / maxCount) * 100}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-gray-700 dark:text-zinc-300 w-6 text-right tabular-nums">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
