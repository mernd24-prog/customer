import { cn } from "../../../utils/classNames";

const sizeMap = {
  xs: "text-[11px] min-h-[24px] px-2.5 py-1",
  sm: "text-xs min-h-[30px] px-3 py-1.5",
  md: "text-sm min-h-[38px] px-4 py-2",
  lg: "text-sm md:text-base min-h-[44px] px-5 py-2.5",
  xl: "text-base min-h-[50px] px-6 py-3",
};

const variantMap = {
  primary:
    "border border-[var(--customer-gold)] bg-[var(--customer-gold)] text-[var(--customer-navy)] shadow-sm hover:bg-[var(--customer-gold-dark)] hover:border-[var(--customer-gold-dark)] hover:shadow-md",
  secondary:
    "border border-[var(--customer-border)] bg-white text-[var(--customer-navy)] hover:border-[var(--customer-gold)] hover:bg-[var(--customer-gold-soft)]",
  navy: "border border-[var(--customer-navy)] bg-[var(--customer-navy)] text-white shadow-sm hover:bg-[var(--customer-navy-dark)] hover:border-[var(--customer-navy-dark)]",
  gradient:
    "border border-transparent bg-gradient-to-r from-[var(--customer-gold-dark)] to-[var(--customer-gold)] text-[var(--customer-navy)] shadow-sm hover:shadow-md",
  outline:
    "bg-white border border-[var(--customer-navy)] text-[var(--customer-navy)] hover:bg-[var(--customer-navy-soft)]",
  ghost:
    "bg-transparent text-[var(--customer-navy)] hover:bg-[var(--customer-navy-soft)] border border-transparent",
  link: "border border-transparent bg-transparent p-0 text-[var(--customer-navy)] underline-offset-4 hover:underline",
  danger: "bg-red-600 hover:bg-red-700 text-white border border-red-600",
  google: "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100",
  custom: "",
};

export default function Button({
  children,
  label,
  variant = "primary",
  size = "md",
  fullWidth = false,
  rounded = false,
  loading = false,
  disabled = false,
  icon,
  iconPosition = "left",
  className = "",
  type = "button",
  onClick,
  bgColor,
  textColor,
  style,
  ...rest
}) {
  const isDisabled = disabled || loading;
  const customStyle =
    variant === "custom"
      ? {
          ...style,
          ...(bgColor ? { background: bgColor } : {}),
          ...(textColor ? { color: textColor } : {}),
        }
      : style;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      style={customStyle}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-2  font-semibold tracking-normal transition-all duration-300 ease-in-out",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--customer-gold)]/60 focus-visible:ring-offset-2",
        sizeMap[size] || sizeMap.md,
        rounded ? "rounded-full" : "rounded-[var(--customer-radius-sm)]",
        fullWidth ? "w-full" : "",
        isDisabled
          ? "cursor-not-allowed opacity-60"
          : variantMap[variant] || variantMap.primary,
        className,
      )}
      {...rest}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
          Please wait…
        </span>
      ) : (
        <>
          {icon && iconPosition === "left" && (
            <span className="flex shrink-0 items-center">{icon}</span>
          )}
          {children ?? label}
          {icon && iconPosition === "right" && (
            <span className="flex shrink-0 items-center">{icon}</span>
          )}
        </>
      )}
    </button>
  );
}
