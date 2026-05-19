import { cn } from "../../../utils/classNames";

const sizeMap = {
  xs: "text-xs min-h-[24px] px-2.5 py-1",
  sm: "text-xs min-h-[28px] px-3 py-1.5",
  md: "text-sm xl:text-base min-h-[36px] px-4 py-2",
  lg: "text-base xl:text-lg min-h-[44px] px-5 py-2.5",
  xl: "text-base xl:text-xl min-h-[50px] px-6 py-3",
};

const variantMap = {
  primary: "bg-[#CE9F2D] hover:bg-[#A26D27] text-white border border-[#CE9F2D] shadow-sm hover:shadow-md",
  secondary: "bg-[#F3F4F6] hover:bg-[#BF9B53] hover:text-white border-2 border-[#BF9B53] text-[#CE9F2D]",
  gradient: "bg-gradient-to-l from-[#A26D27] to-[#CE9F2D] text-white rounded-full shadow-sm hover:shadow-md",
  outline: "bg-transparent border border-[#CE9F2D] text-[#CE9F2D] hover:bg-[#FAF6EE]",
  ghost: "bg-transparent text-[#CE9F2D] hover:bg-[#FAF6EE] border border-transparent",
  danger: "bg-red-600 hover:bg-red-700 text-white border border-red-600",
  google: "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100",
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
  ...rest
}) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-2 font-montserrat font-semibold tracking-wide transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-[#CE9F2D] focus:ring-offset-2",
        sizeMap[size] || sizeMap.md,
        rounded ? "rounded-full" : "rounded-[6px]",
        fullWidth ? "w-full" : "",
        isDisabled ? "cursor-not-allowed opacity-60" : (variantMap[variant] || variantMap.primary),
        className,
      )}
      {...rest}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Please wait…
        </span>
      ) : (
        <>
          {icon && iconPosition === "left" && <span className="flex shrink-0 items-center">{icon}</span>}
          {children ?? label}
          {icon && iconPosition === "right" && <span className="flex shrink-0 items-center">{icon}</span>}
        </>
      )}
    </button>
  );
}
