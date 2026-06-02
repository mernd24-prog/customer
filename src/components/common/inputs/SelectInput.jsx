import { cn } from "../../../utils/classNames";

export default function SelectInput({
  id,
  label,
  options = [],
  value,
  onChange,
  placeholder = "Select…",
  required = false,
  disabled = false,
  error,
  className = "",
  selectClassName = "",
  registration,
  ...props
}) {
  return (
    <div className={cn("grid gap-1.5 font-montserrat", className)}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-[var(--customer-ink)]">
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}
      <select
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        className={cn(
          "customer-input cursor-pointer appearance-none font-montserrat",
          disabled && "cursor-not-allowed bg-gray-50 opacity-70",
          error && "border-red-400",
          selectClassName,
        )}
        {...registration}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => {
          const val = opt?.value ?? opt;
          const label = opt?.label ?? opt;
          return (
            <option key={val} value={val}>{label}</option>
          );
        })}
      </select>
      {error && (
        <span role="alert" className="min-h-4 text-xs text-red-600">
          {error?.message ?? error}
        </span>
      )}
    </div>
  );
}
