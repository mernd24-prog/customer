import { cn } from "../../../lib/utils";

export default function BaseModal({
  children,
  onClose,
  maxWidth = "max-w-4xl",
  className = "",
  showCloseButton = true,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 backdrop-blur-sm">
      <div className={cn("customer-card relative w-full shadow-[var(--customer-shadow-strong)]", maxWidth, className)}>
        {children}
        {showCloseButton ? (
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-[var(--customer-border)] bg-white text-xl font-bold leading-none text-[var(--customer-navy)] transition-all duration-300 ease-in-out hover:bg-[var(--customer-gold-soft)]"
            aria-label="Close"
          >
            ×
          </button>
        ) : null}
      </div>
    </div>
  );
}
