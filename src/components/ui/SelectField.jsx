export default function SelectField({
  id,
  label,
  options = [],
  value,
  registration,
  error,
  placeholder = "Select option",
  disabled = false,
  ...props
}) {
  // Normalize options dynamically
  const normalizedOptions = options
    .map((opt) => {
      if (!opt) return null;
      if (typeof opt === "object") {
        if ("value" in opt && "label" in opt) {
          return { value: opt.value, label: opt.label };
        }
        const name = opt.name || "";
        return { value: name, label: name };
      }
      return { value: opt, label: opt };
    })
    .filter(Boolean);

  const hasOptions = normalizedOptions.length > 0;
  const hasCurrentValue =
    value && !normalizedOptions.some((opt) => opt.value === value);

  // Fallback to text input if there are no options and the select is not disabled
  const showSelect = hasOptions || disabled;

  return (
    <label className="grid gap-1.5  text-sm font-medium text-[var(--customer-ink)]" htmlFor={id}>
      <span>{label}</span>
      {showSelect ? (
        <select
          id={id}
          disabled={disabled}
          className="customer-input  disabled:cursor-not-allowed disabled:bg-[var(--customer-cream)]"
          {...registration}
          {...props}
        >
          <option value="">{placeholder}</option>
          {normalizedOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
          {hasCurrentValue && <option value={value}>{value}</option>}
        </select>
      ) : (
        <input
          id={id}
          type="text"
          placeholder={placeholder || label}
          className="customer-input "
          {...registration}
          {...props}
        />
      )}
      <span className="min-h-4  text-xs font-normal text-red-600">
        {!disabled && error?.message}
      </span>
    </label>
  );
}
