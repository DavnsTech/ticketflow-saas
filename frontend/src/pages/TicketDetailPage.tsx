import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTicket, getComments } from "../api/tickets";
import type { TicketResponse, CommentResponse } from "../api/tickets";
import TicketInfo from "../components/TicketInfo";
import CommentList from "../components/CommentList";
import CommentForm from "../components/CommentForm";
import { StatusBadge, PriorityBadge } from "../components/StatusBadge";
import { ArrowLeft } from "lucide-react";

export default function TicketDetailPage() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<TicketResponse | null>(null);
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [error, setError] = useState("");

  const loadTicket = useCallback(async () => {
    if (!ticketId) return;
    try {
      const response = await getTicket(Number(ticketId));
      setTicket(response.data);
    } catch {
      setError("Failed to load ticket");
    }
  }, [ticketId]);

  const loadComments = useCallback(async () => {
    if (!ticketId) return;
    try {
      const response = await getComments(Number(ticketId));
      setComments(response.data);
    } catch {
      setError("Failed to load comments");
    }
  }, [ticketId]);

  useEffect(() => {
    loadTicket();
    loadComments();
  }, [loadTicket, loadComments]);

  if (!ticket) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-5 h-5 border-2 border-indigo-600 dark:border-indigo-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {error && <div className="text-sm text-red-600 dark:text-red-400">{error}</div>}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/tickets")}
          className="p-1.5 rounded-md text-gray-400 dark:text-zinc-500 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-600 dark:hover:text-zinc-300 transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-zinc-400">
          <span>Tickets</span>
          <span>/</span>
          <span className="text-gray-900 dark:text-zinc-100 font-medium">#{ticket.id}</span>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-2">
          <StatusBadge value={ticket.status} />
          <PriorityBadge value={ticket.priority} />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-zinc-100 leading-tight">{ticket.title}</h2>
      </div>

      {ticket.description && (
        <div className="card p-5">
          <p className="text-sm text-gray-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">{ticket.description}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
            Activity ({comments.length})
          </h3>
          <CommentList comments={comments} />
          <CommentForm ticketId={ticket.id} onCommentAdded={loadComments} />
        </div>

        <div>
          <TicketInfo ticket={ticket} onUpdate={loadTicket} />
        </div>
      </div>
    </div>
  );
}
