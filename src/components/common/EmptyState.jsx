import { PackageSearch } from "lucide-react";
import Button from "../ui/Button";

export default function EmptyState({
  icon: Icon = PackageSearch,
  title = "Nothing here yet",
  description = "Once data is available, it will appear here.",
  actionLabel,
  onAction,
  children,
}) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-[8px] border border-dashed border-[#D9D9E8] bg-white px-4 py-8 text-center font-montserrat">
      <Icon className="h-10 w-10 text-[#3E4094]" aria-hidden="true" />
      <h2 className="mt-4 text-[18px] font-semibold text-[#2E2E2E]">{title}</h2>
      <p className="mt-2 max-w-md text-[14px] leading-6 text-[#787878]">{description}</p>
      {actionLabel && onAction && (
        <Button className="mt-5" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
      {children}
    </div>
  );
}
