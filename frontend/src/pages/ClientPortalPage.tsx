import { useEffect, useState, useCallback } from "react";
import { listTickets } from "../api/tickets";
import type { TicketResponse } from "../api/tickets";
import { useAuth } from "../contexts/AuthContext";
import { StatusBadge, PriorityBadge } from "../components/StatusBadge";
import TicketWizard from "../components/TicketWizard";
import { useNavigate } from "react-router-dom";
import {
  CreditCard, ShieldCheck, Globe, Monitor, Lightbulb, HelpCircle,
  Plus, ArrowRight,
} from "lucide-react";

const categories = [
  { name: "Billing", icon: CreditCard, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
  { name: "Auth", icon: ShieldCheck, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10" },
  { name: "API", icon: Globe, color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-500/10" },
  { name: "UI", icon: Monitor, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-500/10" },
  { name: "Feature", icon: Lightbulb, color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-500/10" },
  { name: "Other", icon: HelpCircle, color: "text-gray-600 dark:text-gray-400", bg: "bg-gray-100 dark:bg-zinc-800" },
];

export default function ClientPortalPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<TicketResponse[]>([]);
  const [wizardCategory, setWizardCategory] = useState<string | null>(null);
  const [error, setError] = useState("");

  const loadTickets = useCallback(async () => {
    try {
      const response = await listTickets({ size: 10, sortBy: "createdAt", direction: "DESC" });
      setTickets(response.data.tickets);
    } catch {
      setError("Failed to load tickets");
    }
  }, []);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const stats = {
    open: tickets.filter((t) => t.status === "OPEN").length,
    inProgress: tickets.filter((t) => t.status === "IN_PROGRESS" || t.status === "WAITING").length,
    resolved: tickets.filter((t) => t.status === "RESOLVED" || t.status === "CLOSED").length,
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {error && <div className="text-sm text-red-600 dark:text-red-400">{error}</div>}

      <div className="text-center pt-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">
          Hi {user?.displayName?.split(" ")[0]}, how can we help?
        </h1>
        <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
          Select a topic or browse your existing tickets
        </p>
      </div>

      <div className="flex items-center justify-center gap-6">
        <StatPill label="Open" count={stats.open} color="text-blue-600 dark:text-blue-400" />
        <StatPill label="In Progress" count={stats.inProgress} color="text-amber-600 dark:text-amber-400" />
        <StatPill label="Resolved" count={stats.resolved} color="text-emerald-600 dark:text-emerald-400" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {categories.map(({ name, icon: Icon, color, bg }) => (
          <button
            key={name}
            onClick={() => setWizardCategory(name)}
            className="card p-5 flex flex-col items-center gap-3 hover:border-indigo-300 dark:hover:border-indigo-500/40 hover:shadow-sm transition-all group cursor-pointer text-center"
          >
            <div className={`p-3 rounded-lg ${bg} transition-colors`}>
              <Icon size={22} className={color} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-zinc-100">{name}</p>
              <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Create request <ArrowRight size={10} />
              </p>
            </div>
          </button>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-zinc-100">Recent Tickets</h2>
          <button
            onClick={() => setWizardCategory("Other")}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium flex items-center gap-1"
          >
            <Plus size={12} /> New Request
          </button>
        </div>

        {tickets.length > 0 ? (
          <div className="card divide-y divide-gray-100 dark:divide-zinc-800">
            {tickets.map((ticket) => (
              <button
                key={ticket.id}
                onClick={() => navigate(`/tickets/${ticket.id}`)}
                className="w-full flex items-center gap-4 px-4 py-3 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors text-left"
              >
                <span className="text-xs text-gray-400 dark:text-zinc-500 tabular-nums w-6">#{ticket.id}</span>
                <span className="flex-1 text-sm text-gray-900 dark:text-zinc-100 font-medium truncate">{ticket.title}</span>
                <StatusBadge value={ticket.status} />
                <PriorityBadge value={ticket.priority} />
                <span className="text-xs text-gray-400 dark:text-zinc-500 tabular-nums hidden sm:block">
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="card p-8 text-center">
            <p className="text-sm text-gray-400 dark:text-zinc-500">No tickets yet</p>
            <p className="text-xs text-gray-400 dark:text-zinc-600 mt-1">Select a topic above to create your first request</p>
          </div>
        )}
      </div>

      {wizardCategory && (
        <TicketWizard
          initialCategory={wizardCategory}
          onClose={() => setWizardCategory(null)}
          onCreated={() => { setWizardCategory(null); loadTickets(); }}
        />
      )}
    </div>
  );
}

function StatPill({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`text-lg font-bold tabular-nums ${color}`}>{count}</span>
      <span className="text-xs text-gray-500 dark:text-zinc-400">{label}</span>
    </div>
  );
}
