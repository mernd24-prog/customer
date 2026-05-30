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
  const normalizedOptions = options.map((opt) => {
    if (!opt) return null;
    if (typeof opt === "object") {
      if ("value" in opt && "label" in opt) {
        return { value: opt.value, label: opt.label };
      }
      const name = opt.name || "";
      return { value: name, label: name };
    }
    return { value: opt, label: opt };
  }).filter(Boolean);

  const hasOptions = normalizedOptions.length > 0;
  const hasCurrentValue = value && !normalizedOptions.some((opt) => opt.value === value);

  // Fallback to text input if there are no options and the select is not disabled
  const showSelect = hasOptions || disabled;

  return (
    <label className="grid gap-1.5 font-montserrat text-sm font-medium text-[#2E2E2E]" htmlFor={id}>
      <span>{label}</span>
      {showSelect ? (
        <select
          id={id}
          disabled={disabled}
          className="min-h-11 w-full rounded-[8px] border border-[#cfc6b8] bg-white px-3 py-2.5 font-montserrat text-sm text-[#2E2E2E] outline-none transition-all duration-300 ease-in-out placeholder:text-[#A6A6A6] focus:border-[#CE9F2D] focus:ring-2 focus:ring-[#CE9F2D]/20 disabled:bg-[#FAF6EE] disabled:cursor-not-allowed"
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
          className="min-h-11 w-full rounded-[8px] border border-[#cfc6b8] bg-white px-3 py-2.5 font-montserrat text-sm text-[#2E2E2E] outline-none transition-all duration-300 ease-in-out placeholder:text-[#A6A6A6] focus:border-[#CE9F2D] focus:ring-2 focus:ring-[#CE9F2D]/20"
          {...registration}
          {...props}
        />
      )}
      <span className="min-h-4 font-montserrat text-xs font-normal text-red-600">
        {!disabled && error?.message}
      </span>
    </label>
  );
}
