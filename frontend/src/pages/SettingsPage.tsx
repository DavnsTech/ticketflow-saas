import { useEffect, useState, useCallback } from "react";
import {
  listAllCategories,
  createCategory,
  updateCategory,
  toggleCategory,
  setCategoryAgents,
  listAllCategoryFields,
  createCustomField,
  toggleCustomField,
  deleteCustomField,
} from "../api/categories";
import type { CategoryResponse, CustomFieldResponse } from "../api/categories";
import { listUsers } from "../api/users";
import type { UserResponse } from "../api/users";
import { Settings, Plus, ChevronDown, ChevronUp, Trash2, ToggleLeft, ToggleRight, Users } from "lucide-react";

const PRESET_COLORS = ["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#6366f1", "#ec4899", "#6b7280"];
const FIELD_TYPES = ["TEXT", "SELECT", "URL", "NUMBER"];

export default function SettingsPage() {
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [agents, setAgents] = useState<UserResponse[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCategories = useCallback(async () => {
    try {
      const response = await listAllCategories();
      setCategories(response.data);
    } catch {
      setError("Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAgents = useCallback(async () => {
    try {
      const response = await listUsers();
      setAgents(response.data.filter((u) => u.role === "AGENT" || u.role === "ADMIN"));
    } catch {
      setError("Failed to load agents");
    }
  }, []);

  useEffect(() => {
    loadCategories();
    loadAgents();
  }, [loadCategories, loadAgents]);

  function handleToggleExpand(categoryId: number) {
    setExpandedId(expandedId === categoryId ? null : categoryId);
  }

  async function handleToggleCategory(categoryId: number) {
    await toggleCategory(categoryId);
    loadCategories();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-5 h-5 border-2 border-indigo-600 dark:border-indigo-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && <div className="text-sm text-red-600 dark:text-red-400">{error}</div>}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100 flex items-center gap-2">
            <Settings size={20} /> Settings
          </h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">Manage categories and custom fields</p>
        </div>
        <button onClick={() => setShowAddForm(true)} className="btn-primary text-xs flex items-center gap-1.5">
          <Plus size={14} /> Add Category
        </button>
      </div>

      {showAddForm && (
        <CategoryForm
          agents={[]}
          onSave={async (payload) => {
            await createCategory(payload);
            setShowAddForm(false);
            loadCategories();
          }}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      <div className="space-y-3">
        {categories.map((category) => (
          <div key={category.id} className="card overflow-hidden">
            <CategoryHeader
              category={category}
              expanded={expandedId === category.id}
              onToggleExpand={() => handleToggleExpand(category.id)}
              onToggleActive={() => handleToggleCategory(category.id)}
            />
            {expandedId === category.id && (
              <CategoryDetail
                category={category}
                agents={agents}
                onUpdated={loadCategories}
              />
            )}
          </div>
        ))}

        {categories.length === 0 && !showAddForm && (
          <div className="card p-5 text-center text-sm text-gray-400 dark:text-zinc-500">
            No categories yet. Create one to get started.
          </div>
        )}
      </div>
    </div>
  );
}

function CategoryHeader({
  category,
  expanded,
  onToggleExpand,
  onToggleActive,
}: {
  category: CategoryResponse;
  expanded: boolean;
  onToggleExpand: () => void;
  onToggleActive: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <button onClick={onToggleExpand} className="flex items-center gap-3 flex-1 text-left">
        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: category.color || "#6b7280" }} />
        <div>
          <span className="text-sm font-medium text-gray-900 dark:text-zinc-100">{category.name}</span>
          {category.description && (
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">{category.description}</p>
          )}
        </div>
      </button>
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400 dark:text-zinc-500 flex items-center gap-1">
          <Users size={12} /> {category.agentIds.length}
        </span>
        <span
          className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
            category.active
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
              : "bg-gray-100 text-gray-500 dark:bg-zinc-800 dark:text-zinc-500"
          }`}
        >
          {category.active ? "Active" : "Inactive"}
        </span>
        <button
          onClick={onToggleActive}
          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 transition-colors"
          title={category.active ? "Deactivate" : "Activate"}
        >
          {category.active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
        </button>
        <button onClick={onToggleExpand} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>
    </div>
  );
}

function CategoryDetail({
  category,
  agents,
  onUpdated,
}: {
  category: CategoryResponse;
  agents: UserResponse[];
  onUpdated: () => void;
}) {
  const [fields, setFields] = useState<CustomFieldResponse[]>([]);
  const [showFieldForm, setShowFieldForm] = useState(false);

  const loadFields = useCallback(async () => {
    try {
      const response = await listAllCategoryFields(category.id);
      setFields(response.data);
    } catch {
      /* fields may not exist yet */
    }
  }, [category.id]);

  useEffect(() => {
    loadFields();
  }, [loadFields]);

  return (
    <div className="border-t border-gray-100 dark:border-zinc-800 px-4 py-4 space-y-5">
      <CategoryForm
        initialValues={category}
        agents={agents}
        assignedAgentIds={category.agentIds}
        onSave={async (payload) => {
          await updateCategory(category.id, payload);
          onUpdated();
        }}
        onAgentsChange={async (agentIds) => {
          await setCategoryAgents(category.id, agentIds);
          onUpdated();
        }}
      />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold text-gray-700 dark:text-zinc-300 uppercase tracking-wider">Custom Fields</h4>
          <button
            onClick={() => setShowFieldForm(true)}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <Plus size={12} /> Add field
          </button>
        </div>

        {showFieldForm && (
          <CustomFieldForm
            onSave={async (payload) => {
              await createCustomField(category.id, payload);
              setShowFieldForm(false);
              loadFields();
            }}
            onCancel={() => setShowFieldForm(false)}
          />
        )}

        {fields.length > 0 && (
          <div className="space-y-1">
            {fields.map((field) => (
              <FieldRow key={field.id} field={field} onUpdated={loadFields} />
            ))}
          </div>
        )}

        {fields.length === 0 && !showFieldForm && (
          <p className="text-xs text-gray-400 dark:text-zinc-500">No custom fields for this category.</p>
        )}
      </div>
    </div>
  );
}

function CategoryForm({
  initialValues,
  agents,
  assignedAgentIds,
  onSave,
  onCancel,
  onAgentsChange,
}: {
  initialValues?: CategoryResponse;
  agents: UserResponse[];
  assignedAgentIds?: number[];
  onSave: (payload: { name: string; description?: string; color?: string; icon?: string }) => Promise<void>;
  onCancel?: () => void;
  onAgentsChange?: (agentIds: number[]) => Promise<void>;
}) {
  const [name, setName] = useState(initialValues?.name ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [color, setColor] = useState(initialValues?.color ?? "#3b82f6");
  const [icon, setIcon] = useState(initialValues?.icon ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await onSave({ name, description: description || undefined, color, icon: icon || undefined });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="label">Name</label>
          <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label className="label">Icon</label>
          <input className="input-field" value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="e.g. bug, server" />
        </div>
      </div>

      <div>
        <label className="label">Description</label>
        <input className="input-field" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

      <div>
        <label className="label">Color</label>
        <ColorPicker value={color} onChange={setColor} />
      </div>

      {agents.length > 0 && onAgentsChange && (
        <AgentSelector agents={agents} assignedIds={assignedAgentIds ?? []} onChange={onAgentsChange} />
      )}

      <div className="flex justify-end gap-2">
        {onCancel && (
          <button type="button" onClick={onCancel} className="px-3 py-1.5 text-xs text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-md transition-colors">
            Cancel
          </button>
        )}
        <button type="submit" disabled={saving} className="btn-primary text-xs">
          {saving ? "Saving..." : initialValues ? "Update" : "Create"}
        </button>
      </div>
    </form>
  );
}

function ColorPicker({ value, onChange }: { value: string; onChange: (color: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      {PRESET_COLORS.map((presetColor) => (
        <button
          key={presetColor}
          type="button"
          onClick={() => onChange(presetColor)}
          className={`w-6 h-6 rounded-full border-2 transition-transform ${
            value === presetColor ? "border-gray-900 dark:border-zinc-100 scale-110" : "border-transparent hover:scale-110"
          }`}
          style={{ backgroundColor: presetColor }}
        />
      ))}
    </div>
  );
}

function AgentSelector({
  agents,
  assignedIds,
  onChange,
}: {
  agents: UserResponse[];
  assignedIds: number[];
  onChange: (agentIds: number[]) => Promise<void>;
}) {
  async function handleToggle(agentId: number) {
    const updated = assignedIds.includes(agentId)
      ? assignedIds.filter((id) => id !== agentId)
      : [...assignedIds, agentId];
    await onChange(updated);
  }

  return (
    <div>
      <label className="label flex items-center gap-1.5">
        <Users size={12} /> Assigned Agents
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mt-1">
        {agents.map((agent) => (
          <label
            key={agent.id}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors"
          >
            <input
              type="checkbox"
              checked={assignedIds.includes(agent.id)}
              onChange={() => handleToggle(agent.id)}
              className="rounded border-gray-300 dark:border-zinc-600 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-gray-700 dark:text-zinc-300">{agent.displayName}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function CustomFieldForm({
  onSave,
  onCancel,
}: {
  onSave: (payload: { name: string; label: string; fieldType?: string; required?: boolean; options?: string; placeholder?: string }) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [label, setLabel] = useState("");
  const [fieldType, setFieldType] = useState("TEXT");
  const [required, setRequired] = useState(false);
  const [options, setOptions] = useState("");
  const [placeholder, setPlaceholder] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await onSave({
        name,
        label,
        fieldType,
        required,
        options: fieldType === "SELECT" ? options : undefined,
        placeholder: placeholder || undefined,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="label">Name</label>
          <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} required placeholder="field_name" />
        </div>
        <div>
          <label className="label">Label</label>
          <input className="input-field" value={label} onChange={(e) => setLabel(e.target.value)} required placeholder="Display Label" />
        </div>
        <div>
          <label className="label">Type</label>
          <select className="input-field" value={fieldType} onChange={(e) => setFieldType(e.target.value)}>
            {FIELD_TYPES.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="label">Placeholder</label>
          <input className="input-field" value={placeholder} onChange={(e) => setPlaceholder(e.target.value)} />
        </div>
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-zinc-300 cursor-pointer">
            <input
              type="checkbox"
              checked={required}
              onChange={(e) => setRequired(e.target.checked)}
              className="rounded border-gray-300 dark:border-zinc-600 text-indigo-600 focus:ring-indigo-500"
            />
            Required field
          </label>
        </div>
      </div>

      {fieldType === "SELECT" && (
        <div>
          <label className="label">Options (one per line)</label>
          <textarea
            className="input-field"
            rows={3}
            value={options}
            onChange={(e) => setOptions(e.target.value)}
            placeholder={"Option 1\nOption 2\nOption 3"}
          />
        </div>
      )}

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="px-3 py-1.5 text-xs text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-md transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={saving} className="btn-primary text-xs">
          {saving ? "Saving..." : "Add Field"}
        </button>
      </div>
    </form>
  );
}

function FieldRow({ field, onUpdated }: { field: CustomFieldResponse; onUpdated: () => void }) {
  async function handleToggle() {
    await toggleCustomField(field.id);
    onUpdated();
  }

  async function handleDelete() {
    await deleteCustomField(field.id);
    onUpdated();
  }

  return (
    <div className="flex items-center justify-between px-3 py-2 rounded-md bg-gray-50 dark:bg-zinc-800/50">
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-900 dark:text-zinc-100 font-medium">{field.label}</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-200 dark:bg-zinc-700 text-gray-600 dark:text-zinc-400 font-mono">
          {field.fieldType}
        </span>
        {field.required && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 font-medium">
            Required
          </span>
        )}
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={handleToggle}
          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 transition-colors"
          title={field.active ? "Deactivate" : "Activate"}
        >
          {field.active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
        </button>
        <button
          onClick={handleDelete}
          className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition-colors"
          title="Delete field"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
