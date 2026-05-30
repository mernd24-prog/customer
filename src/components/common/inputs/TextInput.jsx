import { cn } from "../../../utils/classNames";

export default function TextInput({
  id,
  label,
  type = "text",
  placeholder,
  error,
  hint,
  required = false,
  disabled = false,
  className = "",
  inputClassName = "",
  registration,
  ...props
}) {
  return (
    <div className={cn("grid gap-1.5 font-montserrat", className)}>
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium text-[#2E2E2E]"
        >
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={cn(
          "min-h-11 w-full rounded-[8px] border border-[#cfc6b8] bg-white px-3 py-2.5 font-montserrat text-sm text-[#2E2E2E] outline-none transition-all duration-300 ease-in-out",
          "placeholder:text-[#A6A6A6] focus:border-[#CE9F2D] focus:ring-2 focus:ring-[#CE9F2D]/20",
          disabled && "cursor-not-allowed bg-gray-50 opacity-70",
          error && "border-red-400 focus:border-red-400 focus:ring-red-200",
          inputClassName,
        )}
        {...registration}
        {...props}
      />
      {hint && !error && (
        <span id={`${id}-hint`} className="text-xs text-[#A6A6A6]">{hint}</span>
      )}
      {error && (
        <span id={`${id}-error`} role="alert" className="min-h-4 text-xs text-red-600">
          {error?.message ?? error}
        </span>
      )}
    </div>
  );
}
