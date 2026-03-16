import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  accent: string;
}

export default function StatCard({ label, value, icon, trend, accent }: StatCardProps) {
  return (
    <div className="card p-5 flex items-start justify-between">
      <div>
        <p className="text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">{label}</p>
        <p className={`text-2xl font-bold mt-1 tracking-tight ${accent}`}>{value}</p>
        {trend && (
          <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">{trend}</p>
        )}
      </div>
      <div className="p-2 rounded-md bg-gray-50 dark:bg-zinc-800 text-gray-400 dark:text-zinc-500">
        {icon}
      </div>
    </div>
  );
}
