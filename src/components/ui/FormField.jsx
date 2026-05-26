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

  return (
    <label
      className="grid gap-1.5 font-montserrat text-sm font-medium text-[#2E2E2E]"
      htmlFor={id}
    >
      <span>{label}</span>
      <span className="relative">
        <input
          placeholder={placeholder}
          id={id}
          type={inputType}
          className={`min-h-11 w-full rounded-[8px] border border-[#cfc6b8] bg-white px-3 py-2.5 font-montserrat text-sm text-[#2E2E2E] outline-none transition placeholder:text-[#A6A6A6] focus:border-[#CE9F2D] focus:ring-2 focus:ring-[#CE9F2D]/20 ${
            isPassword ? "pr-11" : ""
          }`}
          aria-invalid={Boolean(error)}
          {...registration}
          {...props}
        />
        {isPassword ? (
          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={(event) => {
              event.preventDefault();
              setShowPassword((currentValue) => !currentValue);
            }}
            className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[#9E886A] transition hover:bg-[#FAF6EE] hover:text-[#2E2E2E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CE9F2D]/40"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        ) : null}
      </span>
      <span className="min-h-4 font-montserrat text-xs font-normal text-red-600">
        {error?.message}
      </span>
    </label>
  );
}
