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
        <label htmlFor={id} className="text-sm font-medium text-[#2E2E2E]">
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
          "min-h-11 w-full cursor-pointer appearance-none rounded-[8px] border border-[#cfc6b8] bg-white px-3 py-2.5 font-montserrat text-sm text-[#2E2E2E] outline-none transition",
          "focus:border-[#CE9F2D] focus:ring-2 focus:ring-[#CE9F2D]/20",
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
