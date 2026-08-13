import { cn } from "../../../utils/common";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

export default function BaseModal({
  children,
  onClose,
  maxWidth = "max-w-4xl",
  className = "",
  showCloseButton = true,
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Prevent background scrolling when modal is open
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const modalContent = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 px-4 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <div
        className={cn("customer-card relative w-full shadow-[var(--customer-shadow-strong)]", maxWidth, className)}
        onClick={(event) => event.stopPropagation()}
      >
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

  if (!mounted) return null;

  return createPortal(modalContent, document.body);
}
