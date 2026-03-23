import type { TicketResponse } from "../api/tickets";
import { updateTicket } from "../api/tickets";
import { getInitials } from "../utils";
import { useI18n } from "../contexts/I18nContext";

const statuses = ["OPEN", "IN_PROGRESS", "WAITING", "RESOLVED", "CLOSED"];
const priorities = ["LOW", "MEDIUM", "HIGH", "URGENT"];

interface TicketInfoProps {
  ticket: TicketResponse;
  onUpdate: () => void;
}

export default function TicketInfo({ ticket, onUpdate }: TicketInfoProps) {
  const { t } = useI18n();

  async function handleChange(field: string, value: string) {
    await updateTicket(ticket.id, { [field]: value });
    onUpdate();
  }

  const customFieldEntries = Object.entries(ticket.customFields ?? {});

  return (
    <div className="card p-5 space-y-5">
      <h3 className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">{t("detail.details")}</h3>

      <Field label={t("detail.status")}>
        <select value={ticket.status} onChange={(e) => handleChange("status", e.target.value)} className="input-field text-xs py-1.5">
          {statuses.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
        </select>
      </Field>

      <Field label={t("detail.priority")}>
        <select value={ticket.priority} onChange={(e) => handleChange("priority", e.target.value)} className="input-field text-xs py-1.5">
          {priorities.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </Field>

      <Field label={t("detail.requester")}>
        <UserDisplay name={ticket.requesterName} />
      </Field>

      <Field label={t("detail.assignee")}>
        <UserDisplay name={ticket.assigneeName ?? t("detail.unassigned")} />
      </Field>

      <Field label={t("detail.category")}>
        {ticket.category ? (
          <span className="flex items-center gap-2 text-sm text-gray-900 dark:text-zinc-100">
            {ticket.categoryColor && (
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: ticket.categoryColor }} />
            )}
            {ticket.category}
          </span>
        ) : (
          <p className="text-sm text-gray-900 dark:text-zinc-100">&mdash;</p>
        )}
      </Field>

      <Field label={t("detail.created")}>
        <p className="text-xs text-gray-600 dark:text-zinc-400 tabular-nums">{new Date(ticket.createdAt).toLocaleString()}</p>
      </Field>

      {ticket.resolvedAt && (
        <Field label={t("detail.resolved")}>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 tabular-nums">{new Date(ticket.resolvedAt).toLocaleString()}</p>
        </Field>
      )}

      {ticket.tags.length > 0 && (
        <Field label={t("detail.tags")}>
          <div className="flex flex-wrap gap-1.5">
            {ticket.tags.map((tag) => (
              <span key={tag} className="px-2 py-0.5 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 rounded text-xs font-medium">
                {tag}
              </span>
            ))}
          </div>
        </Field>
      )}

      {customFieldEntries.length > 0 && (
        <>
          <div className="border-t border-gray-200 dark:border-zinc-800 pt-4">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-4">{t("detail.customFields")}</h3>
          </div>
          {customFieldEntries.map(([label, value]) => (
            <Field key={label} label={label}>
              <p className="text-sm text-gray-900 dark:text-zinc-100">{value || "\u2014"}</p>
            </Field>
          ))}
        </>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-medium text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">{label}</p>
      {children}
    </div>
  );
}

function UserDisplay({ name }: { name: string }) {
  const initials = getInitials(name);
  return (
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-[9px] font-semibold text-indigo-700 dark:text-indigo-400">
        {initials}
      </div>
      <span className="text-sm text-gray-900 dark:text-zinc-100">{name}</span>
    </div>
  );
}
