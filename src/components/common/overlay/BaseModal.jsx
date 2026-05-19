import { cn } from "../../../utils/classNames";

export default function BaseModal({
  children,
  onClose,
  maxWidth = "max-w-4xl",
  className = "",
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className={cn("relative w-full rounded-2xl bg-white shadow-xl", maxWidth, className)}>
        {children}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-xl font-bold transition hover:bg-gray-100"
          aria-label="Close"
        >
          ×
        </button>
      </div>
    </div>
  );
}
