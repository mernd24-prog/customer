import { cn } from "../../../utils/classNames";

const sizeMap = {
  xs: "h-6 w-6",
  sm: "h-8 w-8",
  md: "h-9 w-9",
  lg: "h-11 w-11",
};

const variantMap = {
  default: "bg-white/95 text-ink shadow-sm hover:bg-cream border border-border",
  primary: "bg-gold text-navy hover:bg-gold-dark border border-gold",
  secondary: "bg-navy-soft text-navy border border-border hover:border-gold hover:bg-gold-soft",
  ghost: "bg-transparent text-ink hover:bg-cream",
  danger: "bg-white text-red-500 hover:bg-red-50 border border-red-200",
};

export default function IconButton({
  children,
  variant = "default",
  size = "md",
  rounded = true,
  disabled = false,
  title,
  "aria-label": ariaLabel,
  className = "",
  type = "button",
  onClick,
  ...rest
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel ?? title}
      className={cn(
        "inline-flex shrink-0 items-center justify-center transition-all duration-300 ease-in-out",
        "focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-1",
        sizeMap[size] || sizeMap.md,
        rounded ? "rounded-full" : "rounded-[6px]",
        disabled ? "cursor-not-allowed opacity-60" : (variantMap[variant] || variantMap.default),
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
