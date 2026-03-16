import { useNavigate } from "react-router-dom";
import type { TicketResponse } from "../api/tickets";
import { StatusBadge, PriorityBadge } from "./StatusBadge";
import { getInitials } from "../utils";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

interface TicketTableProps {
  tickets: TicketResponse[];
  sortBy: string;
  direction: string;
  onSort: (field: string) => void;
}

function SortIcon({ field, sortBy, direction }: { field: string; sortBy: string; direction: string }) {
  if (sortBy !== field) return <ChevronsUpDown size={12} className="text-gray-300 dark:text-zinc-600" />;
  return direction === "ASC"
    ? <ChevronUp size={12} className="text-indigo-600 dark:text-indigo-400" />
    : <ChevronDown size={12} className="text-indigo-600 dark:text-indigo-400" />;
}

function SortableHeader({ field, label, sortBy, direction, onSort }: { field: string; label: string; sortBy: string; direction: string; onSort: (f: string) => void }) {
  return (
    <th
      className="px-4 py-3 font-medium cursor-pointer select-none hover:text-gray-700 dark:hover:text-zinc-300 transition-colors"
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1">
        {label}
        <SortIcon field={field} sortBy={sortBy} direction={direction} />
      </div>
    </th>
  );
}

export default function TicketTable({ tickets, sortBy, direction, onSort }: TicketTableProps) {
  const navigate = useNavigate();

  return (
    <div className="card overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 dark:bg-zinc-800/50 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
            <th className="px-4 py-3 font-medium w-16">#</th>
            <th className="px-4 py-3 font-medium">Title</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <SortableHeader field="priority" label="Priority" sortBy={sortBy} direction={direction} onSort={onSort} />
            <th className="px-4 py-3 font-medium">Assignee</th>
            <SortableHeader field="createdAt" label="Created" sortBy={sortBy} direction={direction} onSort={onSort} />
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr
              key={ticket.id}
              onClick={() => navigate(`/tickets/${ticket.id}`)}
              className="border-t border-gray-100 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors"
            >
              <td className="px-4 py-3 text-gray-400 dark:text-zinc-500 tabular-nums text-xs">{ticket.id}</td>
              <td className="px-4 py-3 text-gray-900 dark:text-zinc-100 font-medium">{ticket.title}</td>
              <td className="px-4 py-3"><StatusBadge value={ticket.status} /></td>
              <td className="px-4 py-3"><PriorityBadge value={ticket.priority} /></td>
              <td className="px-4 py-3">
                {ticket.assigneeName ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-zinc-700 flex items-center justify-center text-[9px] font-semibold text-gray-600 dark:text-zinc-300">
                      {getInitials(ticket.assigneeName)}
                    </div>
                    <span className="text-gray-600 dark:text-zinc-400">{ticket.assigneeName}</span>
                  </div>
                ) : (
                  <span className="text-gray-400 dark:text-zinc-600">—</span>
                )}
              </td>
              <td className="px-4 py-3 text-gray-500 dark:text-zinc-400 tabular-nums text-xs">
                {new Date(ticket.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
          {tickets.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-12 text-center text-gray-400 dark:text-zinc-500">No tickets found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
