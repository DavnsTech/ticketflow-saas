import { useEffect, useState, useCallback } from "react";
import { listTickets } from "../api/tickets";
import type { TicketResponse } from "../api/tickets";
import { listCategories } from "../api/categories";
import type { CategoryResponse } from "../api/categories";
import { StatusBadge } from "../components/StatusBadge";
import TicketWizard from "../components/TicketWizard";
import { useNavigate } from "react-router-dom";
import { Plus, Loader2 } from "lucide-react";

interface SelectedCategory {
  id: number;
  name: string;
  color: string;
}

export default function ClientPortalPage() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<TicketResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [wizardCategory, setWizardCategory] = useState<SelectedCategory | null>(null);
  const [error, setError] = useState("");
  const [loadingCategories, setLoadingCategories] = useState(true);

  const loadTickets = useCallback(async () => {
    try {
      const response = await listTickets({ size: 20, sortBy: "createdAt", direction: "DESC" });
      setTickets(response.data.tickets);
    } catch {
      setError("Failed to load requests");
    }
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      const response = await listCategories();
      setCategories(response.data);
    } catch {
      setError("Failed to load categories");
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  useEffect(() => {
    loadTickets();
    loadCategories();
  }, [loadTickets, loadCategories]);

  const stats = {
    open: tickets.filter((t) => t.status === "OPEN").length,
    inProgress: tickets.filter((t) => t.status === "IN_PROGRESS" || t.status === "WAITING").length,
    resolved: tickets.filter((t) => t.status === "RESOLVED" || t.status === "CLOSED").length,
  };

  function handleCategoryClick(category: CategoryResponse) {
    setWizardCategory({ id: category.id, name: category.name, color: category.color });
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {error && <div className="text-sm text-red-600 dark:text-red-400">{error}</div>}

      <div className="text-center pt-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">Support Center</h1>
        <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">How can we help you today?</p>
      </div>

      <div className="flex items-center justify-center gap-6">
        <StatPill label="Open Requests" count={stats.open} color="text-blue-600 dark:text-blue-400" />
        <StatPill label="In Progress" count={stats.inProgress} color="text-amber-600 dark:text-amber-400" />
        <StatPill label="Resolved" count={stats.resolved} color="text-emerald-600 dark:text-emerald-400" />
      </div>

      <div>
        <h2 className="text-sm font-semibold text-gray-900 dark:text-zinc-100 mb-3">Choose a topic</h2>
        {loadingCategories ? (
          <div className="flex justify-center py-8">
            <Loader2 size={20} className="animate-spin text-gray-400" />
          </div>
        ) : categories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category)}
                className="card p-5 flex items-start gap-3 hover:border-indigo-300 dark:hover:border-indigo-500/40 hover:shadow-sm transition-all cursor-pointer text-left"
              >
                <span
                  className="mt-1 w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: category.color || "#6366f1" }}
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-zinc-100">{category.name}</p>
                  {category.description && (
                    <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5 line-clamp-2">
                      {category.description}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="card p-6 text-center">
            <p className="text-sm text-gray-400 dark:text-zinc-500">No categories available</p>
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-zinc-100">My Requests</h2>
          {categories.length > 0 && (
            <button
              onClick={() => handleCategoryClick(categories[0])}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium flex items-center gap-1"
            >
              <Plus size={12} /> New Request
            </button>
          )}
        </div>

        {tickets.length > 0 ? (
          <div className="card divide-y divide-gray-100 dark:divide-zinc-800">
            {tickets.map((ticket) => (
              <button
                key={ticket.id}
                onClick={() => navigate(`/tickets/${ticket.id}`)}
                className="w-full flex items-center gap-4 px-4 py-3 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors text-left"
              >
                <span className="flex-1 text-sm text-gray-900 dark:text-zinc-100 font-medium truncate">
                  {ticket.title}
                </span>
                <StatusBadge value={ticket.status} />
                {ticket.category && (
                  <span className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 dark:text-zinc-400">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: ticket.categoryColor || "#6366f1" }}
                    />
                    {ticket.category}
                  </span>
                )}
                <span className="text-xs text-gray-400 dark:text-zinc-500 tabular-nums hidden sm:block">
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="card p-8 text-center">
            <p className="text-sm text-gray-400 dark:text-zinc-500">No requests yet</p>
            <p className="text-xs text-gray-400 dark:text-zinc-600 mt-1">
              Select a topic above to create your first request
            </p>
          </div>
        )}
      </div>

      {wizardCategory && (
        <TicketWizard
          category={wizardCategory}
          onClose={() => setWizardCategory(null)}
          onCreated={() => {
            setWizardCategory(null);
            loadTickets();
          }}
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
