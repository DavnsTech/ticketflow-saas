import { useState, useEffect } from "react";
import { createTicket, updateTicket } from "../api/tickets";
import type { TicketResponse } from "../api/tickets";
import { listCategories } from "../api/categories";
import type { CategoryResponse } from "../api/categories";
import { X } from "lucide-react";
import { useI18n } from "../contexts/I18nContext";

interface TicketFormProps {
  ticket?: TicketResponse;
  onClose: () => void;
  onSaved: () => void;
}

export default function TicketForm({ ticket, onClose, onSaved }: TicketFormProps) {
  const { t } = useI18n();
  const [title, setTitle] = useState(ticket?.title ?? "");
  const [description, setDescription] = useState(ticket?.description ?? "");
  const [priority, setPriority] = useState(ticket?.priority ?? "MEDIUM");
  const [categoryId, setCategoryId] = useState<string>(ticket?.categoryId?.toString() ?? "");
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [tagInput, setTagInput] = useState(ticket?.tags.join(", ") ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEdit = !!ticket;

  useEffect(() => {
    listCategories()
      .then((response) => setCategories(response.data))
      .catch(() => setCategories([]));
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) {
      setError(t("tickets.titleRequired"));
      return;
    }
    if (!categoryId) {
      setError(t("tickets.categoryRequired"));
      return;
    }

    setLoading(true);
    setError("");

    const tags = tagInput.split(",").map((tag) => tag.trim()).filter(Boolean);

    try {
      if (isEdit) {
        await updateTicket(ticket.id, { title, description, priority, categoryId: Number(categoryId), tags });
      } else {
        await createTicket({ title, description, priority, categoryId: Number(categoryId), tags });
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
            {isEdit ? t("tickets.editTicket") : t("tickets.newTicket")}
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
            <label className="label">{t("tickets.titleLabel")}</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="input-field" autoFocus />
          </div>

          <div>
            <label className="label">{t("tickets.descriptionLabel")}</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="input-field resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">{t("tickets.priority")}</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)} className="input-field">
                <option value="LOW">{t("wizard.low")}</option>
                <option value="MEDIUM">{t("wizard.medium")}</option>
                <option value="HIGH">{t("wizard.high")}</option>
                <option value="URGENT">{t("wizard.urgent")}</option>
              </select>
            </div>
            <div>
              <label className="label">{t("tickets.category")}</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="input-field">
                <option value="">{t("tickets.selectCategory")}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label">{t("tickets.tags")}</label>
            <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder={t("tickets.tagsPlaceholder")} className="input-field" />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">{t("common.cancel")}</button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? t("tickets.saving") : isEdit ? t("tickets.update") : t("tickets.createTicket")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
