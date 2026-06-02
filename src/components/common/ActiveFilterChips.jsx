import { X } from "lucide-react";

export default function ActiveFilterChips({
  filters = [],
  onRemove,
  onClear,
  clearLabel = "Clear all",
  className = "mb-4",
}) {
  if (!filters.length) return null;

  return (
    <div className={`${className} flex flex-wrap gap-2`}>
      {filters.map((filter) => (
        <button
          key={filter.key}
          type="button"
          onClick={() => onRemove?.(filter.key, filter)}
          className="chip inline-flex items-center gap-1.5 text-xs font-medium"
        >
          {filter.label} <X size={10} />
        </button>
      ))}
      {onClear && (
        <button
          type="button"
          onClick={onClear}
          className=" text-xs text-red-500 underline-offset-2 hover:underline"
        >
          {clearLabel}
        </button>
      )}
    </div>
  );
}
