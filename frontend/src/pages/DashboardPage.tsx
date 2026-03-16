import { useEffect, useState } from "react";
import { getStats, getByPriority, getByAgent } from "../api/dashboard";
import type { DashboardStats, PriorityCount, AgentStats } from "../api/dashboard";
import StatCard from "../components/StatCard";
import PriorityChart from "../components/PriorityChart";
import { getInitials } from "../utils";
import { Inbox, AlertCircle, Clock, CheckCircle, Timer } from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [priorities, setPriorities] = useState<PriorityCount[]>([]);
  const [agents, setAgents] = useState<AgentStats[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  async function loadData() {
    try {
      const [statsRes, priorityRes, agentRes] = await Promise.all([
        getStats(),
        getByPriority(),
        getByAgent(),
      ]);
      setStats(statsRes.data);
      setPriorities(priorityRes.data);
      setAgents(agentRes.data);
    } catch {
      setError("Failed to load dashboard data");
    }
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-5 h-5 border-2 border-indigo-600 dark:border-indigo-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && <div className="text-sm text-red-600 dark:text-red-400">{error}</div>}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">Dashboard</h2>
        <span className="text-xs text-gray-400 dark:text-zinc-500">Auto-refreshes every 30s</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <StatCard label="Total" value={stats.totalTickets} icon={<Inbox size={18} />} accent="text-gray-900 dark:text-zinc-100" />
        <StatCard label="Open" value={stats.openTickets} icon={<AlertCircle size={18} />} accent="text-blue-600 dark:text-blue-400" />
        <StatCard label="In Progress" value={stats.inProgressTickets} icon={<Clock size={18} />} accent="text-amber-600 dark:text-amber-400" />
        <StatCard label="Resolved Today" value={stats.resolvedToday} icon={<CheckCircle size={18} />} accent="text-emerald-600 dark:text-emerald-400" />
        <StatCard
          label="Avg Resolution"
          value={stats.averageResolutionTimeHours !== null ? `${stats.averageResolutionTimeHours.toFixed(1)}h` : "—"}
          icon={<Timer size={18} />}
          accent="text-violet-600 dark:text-violet-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PriorityChart data={priorities} />

        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-100 mb-4">Agent Workload</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                  <th className="text-left pb-3">Agent</th>
                  <th className="text-right pb-3">Assigned</th>
                  <th className="text-right pb-3">Resolved</th>
                  <th className="text-right pb-3">Rate</th>
                </tr>
              </thead>
              <tbody>
                {agents.map((agent) => (
                  <AgentRow key={agent.agentId} agent={agent} />
                ))}
                {agents.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-gray-400 dark:text-zinc-500 text-sm">
                      No agents assigned
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function AgentRow({ agent }: { agent: AgentStats }) {
  const rate = agent.totalAssigned > 0 ? Math.round((agent.resolved / agent.totalAssigned) * 100) : 0;
  const initials = getInitials(agent.agentName);

  return (
    <tr className="border-t border-gray-100 dark:border-zinc-800">
      <td className="py-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-[10px] font-semibold text-indigo-700 dark:text-indigo-400">
            {initials}
          </div>
          <span className="font-medium text-gray-900 dark:text-zinc-100">{agent.agentName}</span>
        </div>
      </td>
      <td className="py-3 text-right tabular-nums text-gray-600 dark:text-zinc-400">{agent.totalAssigned}</td>
      <td className="py-3 text-right tabular-nums text-gray-600 dark:text-zinc-400">{agent.resolved}</td>
      <td className="py-3 text-right">
        <span className={`text-xs font-semibold tabular-nums ${rate >= 70 ? "text-emerald-600 dark:text-emerald-400" : rate >= 40 ? "text-amber-600 dark:text-amber-400" : "text-gray-500 dark:text-zinc-400"}`}>
          {rate}%
        </span>
      </td>
    </tr>
  );
}
