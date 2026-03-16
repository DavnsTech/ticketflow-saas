import { useState } from "react";
import { addComment } from "../api/tickets";
import { useAuth } from "../contexts/AuthContext";
import { Send } from "lucide-react";

interface CommentFormProps {
  ticketId: number;
  onCommentAdded: () => void;
}

export default function CommentForm({ ticketId, onCommentAdded }: CommentFormProps) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [internal, setInternal] = useState(false);
  const [loading, setLoading] = useState(false);

  const canWriteInternal = user?.role === "ADMIN" || user?.role === "AGENT";

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    try {
      await addComment(ticketId, { content, internal });
      setContent("");
      setInternal(false);
      onCommentAdded();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-4 space-y-3">
      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="Write a comment..."
        rows={3}
        className="input-field resize-none"
      />

      <div className="flex items-center justify-between">
        {canWriteInternal ? (
          <label className="flex items-center gap-2 text-xs text-gray-500 dark:text-zinc-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={internal}
              onChange={(event) => setInternal(event.target.checked)}
              className="rounded border-gray-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500 dark:bg-zinc-800"
            />
            Internal note
          </label>
        ) : (
          <div />
        )}

        <button type="submit" disabled={loading || !content.trim()} className="btn-primary flex items-center gap-2 text-xs">
          <Send size={12} />
          {loading ? "Sending..." : "Comment"}
        </button>
      </div>
    </form>
  );
}
