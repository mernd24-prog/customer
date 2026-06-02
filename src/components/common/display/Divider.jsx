import { cn } from "../../../utils/classNames";

export default function Divider({ label, className = "" }) {
  if (label) {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <hr className="flex-1 border-border" />
        <span className=" text-xs text-gray">{label}</span>
        <hr className="flex-1 border-border" />
      </div>
    );
  }

  return <hr className={cn("border-border", className)} />;
}
