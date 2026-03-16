import { useEffect, useState, useCallback } from "react";
import { listTickets } from "../api/tickets";
import type { TicketResponse } from "../api/tickets";
import TicketTable from "../components/TicketTable";
import TicketFilters from "../components/TicketFilters";
import TicketForm from "../components/TicketForm";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";

export default function TicketListPage() {
  const [tickets, setTickets] = useState<TicketResponse[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [direction, setDirection] = useState("DESC");
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  const loadTickets = useCallback(async () => {
    try {
      const response = await listTickets({
        status: status || undefined,
        priority: priority || undefined,
        page,
        sortBy,
        direction,
      });
      setTickets(response.data.tickets);
      setTotalPages(response.data.totalPages);
      setTotalElements(response.data.totalElements);
    } catch {
      setError("Failed to load tickets");
    }
  }, [status, priority, page, sortBy, direction]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  function handleSort(field: string) {
    if (sortBy === field) {
      setDirection(direction === "ASC" ? "DESC" : "ASC");
    } else {
      setSortBy(field);
      setDirection("DESC");
    }
  }

  const filteredTickets = search
    ? tickets.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()))
    : tickets;

  return (
    <div className="space-y-4">
      {error && <div className="text-sm text-red-600 dark:text-red-400">{error}</div>}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">Tickets</h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">{totalElements} total tickets</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          New Ticket
        </button>
      </div>

      <TicketFilters
        status={status}
        priority={priority}
        search={search}
        onStatusChange={(value) => { setStatus(value); setPage(0); }}
        onPriorityChange={(value) => { setPriority(value); setPage(0); }}
        onSearchChange={setSearch}
      />

      <TicketTable tickets={filteredTickets} sortBy={sortBy} direction={direction} onSort={handleSort} />

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500 dark:text-zinc-400">
            Page {page + 1} of {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 0}
              className="btn-secondary p-2"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages - 1}
              className="btn-secondary p-2"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <TicketForm
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); loadTickets(); }}
        />
      )}
    </div>
  );
}
