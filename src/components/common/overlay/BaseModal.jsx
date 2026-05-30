import { cn } from "../../../utils/classNames";

export default function BaseModal({
  children,
  onClose,
  maxWidth = "max-w-4xl",
  className = "",
  showCloseButton = true,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className={cn("relative w-full rounded-2xl bg-white shadow-xl", maxWidth, className)}>
        {children}
        {showCloseButton ? (
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-[#F7F3EA] text-xl font-bold leading-none text-[#2E2E2E] transition-all duration-300 ease-in-out hover:bg-[#efe6d4]"
            aria-label="Close"
          >
            ×
          </button>
        ) : null}
      </div>
    </div>
  );
}
