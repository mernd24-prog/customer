import { cn } from "../../../utils/classNames";

export default function Avatar({
  src,
  alt = "",
  name,
  size = "md",
  className = "",
}) {
  const sizeMap = {
    xs: "h-6 w-6 text-[10px]",
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
    xl: "h-16 w-16 text-lg",
  };

  const initials = name
    ? name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  if (src) {
    return (
      <img
        src={src}
        alt={alt || name}
        className={cn("rounded-full object-cover", sizeMap[size] || sizeMap.md, className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-gold font-montserrat font-semibold text-white",
        sizeMap[size] || sizeMap.md,
        className
      )}
      aria-label={name}
    >
      {initials}
    </div>
  );
}
