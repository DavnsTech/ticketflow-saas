import { useState } from "react";
import { createTicket, updateTicket } from "../api/tickets";
import type { TicketResponse } from "../api/tickets";
import { X } from "lucide-react";

interface TicketFormProps {
  ticket?: TicketResponse;
  onClose: () => void;
  onSaved: () => void;
}

export default function TicketForm({ ticket, onClose, onSaved }: TicketFormProps) {
  const [title, setTitle] = useState(ticket?.title ?? "");
  const [description, setDescription] = useState(ticket?.description ?? "");
  const [priority, setPriority] = useState(ticket?.priority ?? "MEDIUM");
  const [category, setCategory] = useState(ticket?.category ?? "");
  const [tagInput, setTagInput] = useState(ticket?.tags.join(", ") ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEdit = !!ticket;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    setLoading(true);
    setError("");

    const tags = tagInput.split(",").map((t) => t.trim()).filter(Boolean);

    try {
      if (isEdit) {
        await updateTicket(ticket.id, { title, description, priority, category: category || null, tags });
      } else {
        await createTicket({ title, description, priority, category: category || undefined, tags });
      }
      onSaved();
    } catch {
      setError("Failed to save ticket");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 dark:bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="card w-full max-w-lg mx-4 shadow-2xl dark:shadow-black/40">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-zinc-800">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-100">
            {isEdit ? "Edit Ticket" : "New Ticket"}
          </h3>
          <button onClick={onClose} className="p-1 text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-3 py-2 rounded-md border border-red-200 dark:border-red-500/20">
              {error}
            </div>
          )}

          <div>
            <label className="label">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="input-field" autoFocus />
          </div>

          <div>
            <label className="label">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="input-field resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)} className="input-field">
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
            <div>
              <label className="label">Category</label>
              <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Billing" className="input-field" />
            </div>
          </div>

          <div>
            <label className="label">Tags</label>
            <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="Comma-separated" className="input-field" />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? "Saving..." : isEdit ? "Update" : "Create Ticket"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
