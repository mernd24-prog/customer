export default function SelectField({
  id,
  label,
  options = [],
  value,
  registration,
  error,
  placeholder = "Select option",
  disabled = false,
  className = "",
  ...props
}) {
  const getOptionText = (option, fallback = "") => {
    if (option == null) return fallback;
    if (typeof option !== "object") return String(option);

    const candidate =
      option.name ??
      option.label ??
      option.value ??
      option.zipCode ??
      option.code ??
      option.id ??
      option._id;

    return candidate === option ? fallback : getOptionText(candidate, fallback);
  };

  // Normalize options dynamically
  const normalizedOptions = options
    .map((opt) => {
      if (!opt) return null;
      if (typeof opt === "object") {
        const value = getOptionText(
          opt.value ?? opt.name ?? opt.zipCode ?? opt.code ?? opt.id ?? opt._id,
        );
        const label = getOptionText(opt.label ?? opt.name ?? opt.value, value);
        return value ? { value, label } : null;
      }
      const text = String(opt);
      return { value: text, label: text };
    })
    .filter(Boolean);

  const hasOptions = normalizedOptions.length > 0;
  const hasCurrentValue =
    value && !normalizedOptions.some((opt) => opt.value === value);

  // Fallback to text input if there are no options and the select is not disabled
  const showSelect = hasOptions || disabled;

  return (
    <label
      className="grid gap-1.5 text-sm font-medium text-[var(--customer-ink)]"
      htmlFor={id}
    >
      <span>{label}</span>
      {showSelect ? (
        <select
          id={id}
          disabled={disabled}
          className={`customer-input cursor-pointer disabled:cursor-not-allowed disabled:bg-[var(--customer-cream)] ${className}`}
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
          className={`customer-input ${className}`}
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
