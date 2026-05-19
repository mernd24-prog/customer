import { cn } from "../../../utils/classNames";

export default function ComponentLoader({ className = "", size = "md" }) {
  const sizeMap = {
    sm: "h-4 w-4 border-2",
    md: "h-6 w-6 border-2",
    lg: "h-9 w-9 border-[3px]",
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div
        className={cn(
          "animate-spin rounded-full border-[#CE9F2D] border-t-transparent",
          sizeMap[size] || sizeMap.md
        )}
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}
