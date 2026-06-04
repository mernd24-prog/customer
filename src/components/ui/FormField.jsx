import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function FormField({
  placeholder,
  error,
  id,
  label,
  registration,
  type = "text",
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  const isPhone =
    type === "tel" ||
    id?.toLowerCase().includes("phone") ||
    registration?.name?.toLowerCase().includes("phone");
  const isPostalCode =
    id?.toLowerCase().includes("postalcode") ||
    registration?.name?.toLowerCase().includes("postalcode");
  const isTextOnly =
    id?.toLowerCase().includes("name") ||
    registration?.name?.toLowerCase().includes("name") ||
    id?.toLowerCase().includes("city") ||
    registration?.name?.toLowerCase().includes("city");

  const handleChange = (e) => {
    if (isPhone) {
      e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10);
    } else if (isPostalCode) {
      e.target.value = e.target.value.replace(/\D/g, "");
    } else if (isTextOnly) {
      e.target.value = e.target.value.replace(/[^A-Za-z\s'.-]/g, "");
    }
    if (registration && registration.onChange) {
      registration.onChange(e);
    }
    if (props.onChange) {
      props.onChange(e);
    }
  };

  return (
    <label
      className="grid gap-1.5  text-base font-medium text-[#2E2E2E]"
      htmlFor={id}
    >
      <span>{label}</span>
      <span className="relative ">
        <input
          placeholder={placeholder}
          id={id}
          type={inputType}
          className={`customer-input   ${isPassword ? "pr-11" : ""}`}
          aria-invalid={Boolean(error)}
          {...registration}
          {...props}
          onChange={handleChange}
          maxLength={props.maxLength}
        />
        {isPassword ? (
          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={(event) => {
              event.preventDefault();
              setShowPassword((currentValue) => !currentValue);
            }}
            className="absolute  right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[var(--customer-muted)] transition-all duration-300 ease-in-out hover:bg-[var(--customer-gold-soft)] hover:text-[var(--customer-navy)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--customer-gold)]/40"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        ) : null}
      </span>
      <span className="min-h-2  text-xs font-normal text-red-600">
        {error?.message}
      </span>
    </label>
  );
}
