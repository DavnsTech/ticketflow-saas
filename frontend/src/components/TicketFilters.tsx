import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { listCategories } from "../api/categories";
import type { CategoryResponse } from "../api/categories";

interface TicketFiltersProps {
  status: string;
  priority: string;
  search: string;
  categoryId: string;
  onStatusChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
}

const statuses = ["", "OPEN", "IN_PROGRESS", "WAITING", "RESOLVED", "CLOSED"];
const priorities = ["", "LOW", "MEDIUM", "HIGH", "URGENT"];

export default function TicketFilters({
  status,
  priority,
  search,
  categoryId,
  onStatusChange,
  onPriorityChange,
  onSearchChange,
  onCategoryChange,
}: TicketFiltersProps) {
  const [categories, setCategories] = useState<CategoryResponse[]>([]);

  useEffect(() => {
    listCategories()
      .then((response) => setCategories(response.data))
      .catch(() => setCategories([]));
  }, []);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px] max-w-xs">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500" />
        <input
          type="text"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search tickets..."
          className="input-field pl-9"
        />
      </div>

      <select
        value={status}
        onChange={(event) => onStatusChange(event.target.value)}
        className="input-field w-auto min-w-[140px]"
      >
        <option value="">All Statuses</option>
        {statuses.filter(Boolean).map((s) => (
          <option key={s} value={s}>{s.replace("_", " ")}</option>
        ))}
      </select>

      <select
        value={priority}
        onChange={(event) => onPriorityChange(event.target.value)}
        className="input-field w-auto min-w-[140px]"
      >
        <option value="">All Priorities</option>
        {priorities.filter(Boolean).map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>

      <select
        value={categoryId}
        onChange={(event) => onCategoryChange(event.target.value)}
        className="input-field w-auto min-w-[140px]"
      >
        <option value="">All Categories</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
    </div>
  );
}
