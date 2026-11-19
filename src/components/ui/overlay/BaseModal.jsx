import { cn } from "../../../utils/common";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { X } from "lucide-react";


import DynamicButton from "../button/button.jsx";
export default function BaseModal({
  children,
  onClose,
  maxWidth = "max-w-4xl",
  className = "",
  showCloseButton = true,
  exiting = false,
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
      className="customer-overlay fixed inset-0 z-[100] flex items-center justify-center bg-black/55 px-4 py-4 backdrop-blur-sm"
      data-exiting={exiting}
      role="dialog"
      aria-modal="true"
      inert={exiting ? "" : undefined}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <div
        className={cn(
          "customer-overlay-panel customer-card relative max-h-[calc(100dvh-2rem)] min-w-0 w-full overflow-y-auto shadow-[var(--customer-shadow-strong)]",
          maxWidth,
          className,
        )}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
        {showCloseButton ? (
          <DynamicButton
            variant="iconNeutral"
            size="iconSm"
            shape="circle"
            onClick={onClose}
            className="absolute right-4 top-4 z-10 "
            aria-label="Close"
          >
            <X />
          </DynamicButton>
        ) : null}
      </div>
    </div>
  );

  if (!mounted) return null;

  return createPortal(modalContent, document.body);
}
