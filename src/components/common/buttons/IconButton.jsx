import { cn } from "../../../utils/classNames";

const sizeMap = {
  xs: "h-6 w-6",
  sm: "h-8 w-8",
  md: "h-9 w-9",
  lg: "h-11 w-11",
};

const variantMap = {
  default: "bg-white/95 text-[#2E2E2E] shadow-sm hover:bg-[#FAF6EE] border border-[#e7dfd1]",
  primary: "bg-[#CE9F2D] text-white hover:bg-[#A26D27]",
  secondary: "bg-[#F3F4F6] text-[#CE9F2D] border border-[#BF9B53] hover:bg-[#BF9B53] hover:text-white",
  ghost: "bg-transparent text-[#2E2E2E] hover:bg-[#FAF6EE]",
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
        "inline-flex shrink-0 items-center justify-center transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-[#CE9F2D] focus:ring-offset-1",
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
