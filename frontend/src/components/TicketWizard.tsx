import { useState, useEffect } from "react";
import { createTicket } from "../api/tickets";
import { getCategoryFields } from "../api/categories";
import type { CustomFieldResponse } from "../api/categories";
import { X, ArrowRight, ArrowLeft, Send, Loader2 } from "lucide-react";

interface TicketWizardProps {
  category: { id: number; name: string; color: string };
  onClose: () => void;
  onCreated: () => void;
}

const priorities = [
  { value: "LOW", label: "Low", description: "No rush", color: "border-sky-300 dark:border-sky-500/40 bg-sky-50 dark:bg-sky-500/5" },
  { value: "MEDIUM", label: "Medium", description: "Normal", color: "border-blue-300 dark:border-blue-500/40 bg-blue-50 dark:bg-blue-500/5" },
  { value: "HIGH", label: "High", description: "Important", color: "border-orange-300 dark:border-orange-500/40 bg-orange-50 dark:bg-orange-500/5" },
  { value: "URGENT", label: "Urgent", description: "Critical", color: "border-red-300 dark:border-red-500/40 bg-red-50 dark:bg-red-500/5" },
];

export default function TicketWizard({ category, onClose, onCreated }: TicketWizardProps) {
  const [step, setStep] = useState(1);
  const [priority, setPriority] = useState("MEDIUM");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [customFields, setCustomFields] = useState<CustomFieldResponse[]>([]);
  const [customFieldValues, setCustomFieldValues] = useState<Record<number, string>>({});
  const [loadingFields, setLoadingFields] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const hasCustomFields = customFields.length > 0;
  const totalSteps = hasCustomFields ? 3 : 2;
  const detailsStep = hasCustomFields ? 3 : 2;

  useEffect(() => {
    async function fetchFields() {
      try {
        const response = await getCategoryFields(category.id);
        setCustomFields(response.data);
      } catch {
        setCustomFields([]);
      } finally {
        setLoadingFields(false);
      }
    }
    fetchFields();
  }, [category.id]);

  function updateFieldValue(fieldId: number, value: string) {
    setCustomFieldValues((prev) => ({ ...prev, [fieldId]: value }));
  }

  function validateCustomFields(): boolean {
    for (const field of customFields) {
      if (!field.required) continue;
      const value = customFieldValues[field.id]?.trim();
      if (!value) {
        setError(`"${field.label}" is required`);
        return false;
      }
    }
    return true;
  }

  function handleNextFromCustomFields() {
    setError("");
    if (!validateCustomFields()) return;
    setStep(detailsStep);
  }

  function handleNextFromPriority() {
    setError("");
    setStep(hasCustomFields ? 2 : detailsStep);
  }

  async function handleSubmit() {
    if (!title.trim()) {
      setError("Please enter a title");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const fieldPayload: Record<number, string> = {};
      for (const [key, value] of Object.entries(customFieldValues)) {
        if (value.trim()) {
          fieldPayload[Number(key)] = value;
        }
      }

      await createTicket({
        title,
        description,
        priority,
        categoryId: category.id,
        customFieldValues: Object.keys(fieldPayload).length > 0 ? fieldPayload : undefined,
      });
      onCreated();
    } catch {
      setError("Failed to create ticket");
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 dark:bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="card w-full max-w-lg mx-4 shadow-2xl dark:shadow-black/40">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-100">New Request</h3>
            <span className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-zinc-400 bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: category.color || "#6366f1" }} />
              {category.name}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {!loadingFields && <StepIndicator current={step} total={totalSteps} />}
            <button onClick={onClose} className="p-1 text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-3 py-2 rounded-md border border-red-200 dark:border-red-500/20 mb-4">
              {error}
            </div>
          )}

          {loadingFields ? (
            <div className="flex justify-center py-8">
              <Loader2 size={20} className="animate-spin text-gray-400" />
            </div>
          ) : (
            <>
              {step === 1 && (
                <StepPriority priority={priority} onPriorityChange={setPriority} onNext={handleNextFromPriority} />
              )}

              {step === 2 && hasCustomFields && (
                <StepCustomFields
                  fields={customFields}
                  values={customFieldValues}
                  onChange={updateFieldValue}
                  onBack={() => { setError(""); setStep(1); }}
                  onNext={handleNextFromCustomFields}
                />
              )}

              {step === detailsStep && (
                <StepDetails
                  title={title}
                  description={description}
                  onTitleChange={setTitle}
                  onDescriptionChange={setDescription}
                  onBack={() => { setError(""); setStep(hasCustomFields ? 2 : 1); }}
                  onSubmit={handleSubmit}
                  loading={loading}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: total }, (_, i) => i + 1).map((s) => (
        <div
          key={s}
          className={`w-2 h-2 rounded-full transition-colors ${
            s === current
              ? "bg-indigo-600 dark:bg-indigo-400"
              : s < current
                ? "bg-indigo-300 dark:bg-indigo-600"
                : "bg-gray-200 dark:bg-zinc-700"
          }`}
        />
      ))}
    </div>
  );
}

function StepPriority({ priority, onPriorityChange, onNext }: { priority: string; onPriorityChange: (v: string) => void; onNext: () => void }) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium text-gray-900 dark:text-zinc-100">How urgent is this?</h4>
        <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">This helps us prioritize your request</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {priorities.map(({ value, label, description, color }) => (
          <button
            key={value}
            onClick={() => onPriorityChange(value)}
            className={`p-3 rounded-lg border-2 text-left transition-all ${
              priority === value
                ? `${color} ring-2 ring-indigo-500/20`
                : "border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600"
            }`}
          >
            <p className="text-sm font-medium text-gray-900 dark:text-zinc-100">{label}</p>
            <p className="text-xs text-gray-500 dark:text-zinc-400">{description}</p>
          </button>
        ))}
      </div>

      <div className="flex justify-end pt-2">
        <button onClick={onNext} className="btn-primary flex items-center gap-2">
          Next <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}

function StepCustomFields({ fields, values, onChange, onBack, onNext }: {
  fields: CustomFieldResponse[];
  values: Record<number, string>;
  onChange: (fieldId: number, value: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium text-gray-900 dark:text-zinc-100">Additional details</h4>
        <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">Fill in the fields below</p>
      </div>

      <div className="space-y-3">
        {fields.map((field) => (
          <CustomFieldInput
            key={field.id}
            field={field}
            value={values[field.id] ?? ""}
            onChange={(value) => onChange(field.id, value)}
          />
        ))}
      </div>

      <div className="flex justify-between pt-2">
        <button onClick={onBack} className="btn-secondary flex items-center gap-2">
          <ArrowLeft size={14} /> Back
        </button>
        <button onClick={onNext} className="btn-primary flex items-center gap-2">
          Next <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}

function CustomFieldInput({ field, value, onChange }: {
  field: CustomFieldResponse;
  value: string;
  onChange: (value: string) => void;
}) {
  const labelElement = (
    <label className="label">
      {field.label}
      {field.required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );

  if (field.fieldType === "SELECT" && field.options) {
    let parsedOptions: string[] = [];
    try {
      parsedOptions = JSON.parse(field.options);
    } catch {
      parsedOptions = field.options.split(",").map((o) => o.trim());
    }

    return (
      <div>
        {labelElement}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input-field"
        >
          <option value="">Select...</option>
          {parsedOptions.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>
    );
  }

  const inputType = field.fieldType === "URL" ? "url"
    : field.fieldType === "NUMBER" ? "number"
    : "text";

  return (
    <div>
      {labelElement}
      <input
        type={inputType}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder ?? ""}
        className="input-field"
      />
    </div>
  );
}

function StepDetails({ title, description, onTitleChange, onDescriptionChange, onBack, onSubmit, loading }: {
  title: string; description: string;
  onTitleChange: (v: string) => void; onDescriptionChange: (v: string) => void;
  onBack: () => void; onSubmit: () => void; loading: boolean;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium text-gray-900 dark:text-zinc-100">Describe your issue</h4>
        <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">Be as specific as possible</p>
      </div>

      <div>
        <label className="label">Subject</label>
        <input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="input-field"
          placeholder="Brief summary of the issue"
          autoFocus
        />
      </div>

      <div>
        <label className="label">Details</label>
        <textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          rows={5}
          className="input-field resize-none"
          placeholder="What happened? What did you expect? Any error messages?"
        />
      </div>

      <div className="flex justify-between pt-2">
        <button onClick={onBack} className="btn-secondary flex items-center gap-2">
          <ArrowLeft size={14} /> Back
        </button>
        <button onClick={onSubmit} disabled={loading || !title.trim()} className="btn-primary flex items-center gap-2">
          <Send size={14} />
          {loading ? "Submitting..." : "Submit Request"}
        </button>
      </div>
    </div>
  );
}
