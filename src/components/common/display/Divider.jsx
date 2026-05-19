import { cn } from "../../../utils/classNames";

export default function Divider({ label, className = "" }) {
  if (label) {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <hr className="flex-1 border-[#E8E0D5]" />
        <span className="font-montserrat text-xs text-[#A6A6A6]">{label}</span>
        <hr className="flex-1 border-[#E8E0D5]" />
      </div>
    );
  }

  return <hr className={cn("border-[#E8E0D5]", className)} />;
}
