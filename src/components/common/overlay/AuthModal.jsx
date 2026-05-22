import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { cn } from "../../../utils/classNames";
import { AUTH_ROUTES } from "../../../features/auth/authRoutes";

function LockIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="11"
        width="18"
        height="11"
        rx="2.5"
        stroke="#CE9F2D"
        strokeWidth="1.8"
      />
      <path
        d="M7 11V7a5 5 0 0110 0v4"
        stroke="#CE9F2D"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="16.5" r="1.4" fill="#CE9F2D" />
      <line
        x1="12"
        y1="17.9"
        x2="12"
        y2="19.5"
        stroke="#CE9F2D"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M11 3L3 11M3 3l8 8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Global auth required modal.
 * Rendered via AuthModalProvider — do not use directly.
 */
export default function AuthModal({ open, onClose }) {
  const navigate = useNavigate();
  const loginBtnRef = useRef(null);
  const firstFocusableRef = useRef(null);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Body scroll lock + auto-focus
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      // Delay slightly so animation finishes before focus
      const id = setTimeout(() => loginBtnRef.current?.focus(), 60);
      return () => clearTimeout(id);
    }
    document.body.style.overflow = "";
    return undefined;
  }, [open]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleGoToLogin = () => {
    onClose();
    navigate(AUTH_ROUTES.login);
  };

  const handleGoToRegister = () => {
    onClose();
    navigate(AUTH_ROUTES.register);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center sm:p-4 animate-overlay-in"
      style={{ backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      aria-describedby="auth-modal-desc"
    >
      {/* Card — bottom sheet on mobile, centered card on sm+ */}
      <div
        className={cn(
          "relative w-full bg-white overflow-hidden",
          "rounded-t-[28px] sm:rounded-2xl",
          "sm:max-w-[400px]",
          "shadow-2xl",
          "sm:animate-modal-in animate-sheet-in",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gold accent bar */}
        <div className="h-[3px] w-full bg-gradient-to-r from-[#CE9F2D] via-[#e8b94a] to-[#A26D27]" />

        {/* Mobile drag handle */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-[#e7dfd1]" />
        </div>

        {/* Close button */}
        <button
          ref={firstFocusableRef}
          onClick={onClose}
          className={cn(
            "absolute right-4 top-4 flex h-8 w-8 items-center justify-center",
            "rounded-full text-[#9E886A] transition-colors",
            "hover:bg-[#FAF6EE] hover:text-[#2E2E2E]",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#CE9F2D] focus-visible:ring-offset-1",
          )}
          aria-label="Close login prompt"
        >
          <CloseIcon />
        </button>

        {/* Body */}
        <div className="px-7 pb-8 pt-5 sm:pt-6">
          {/* Lock icon badge */}
          <div className="mb-5 flex justify-center">
            <div
              className="flex h-[60px] w-[60px] items-center justify-center rounded-full"
              style={{
                background: "linear-gradient(135deg, #fdf6e8 0%, #faf0d7 100%)",
                boxShadow: "0 0 0 8px #fdf3dc, 0 0 0 14px #faf0d720",
              }}
            >
              <LockIcon />
            </div>
          </div>

          {/* Title */}
          <h2
            id="auth-modal-title"
            className="text-center font-montserrat text-[1.25rem] font-semibold leading-snug text-[#2E2E2E]"
          >
            Login Required
          </h2>

          {/* Description */}
          <p
            id="auth-modal-desc"
            className="mt-2.5 text-center font-montserrat text-[0.825rem] leading-relaxed text-[#787878]"
          >
            Please login to continue. You need to be authenticated to access
            this feature and continue your shopping experience.
          </p>

          {/* Divider */}
          <div className="my-5 h-px w-full bg-[#f0e9da]" />

          {/* CTA buttons */}
          <div className="flex flex-col gap-3">
            <button
              ref={loginBtnRef}
              onClick={handleGoToLogin}
              className={cn(
                "w-full rounded-[8px] py-3 px-6",
                "font-montserrat text-[0.9rem] font-semibold tracking-wide text-white",
                "bg-gradient-to-r from-[#CE9F2D] to-[#A26D27]",
                "shadow-sm hover:shadow-md",
                "transition-all duration-200 hover:brightness-105 active:brightness-95",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#CE9F2D] focus-visible:ring-offset-2",
              )}
            >
              Go to Login
            </button>

            <button
              onClick={onClose}
              className={cn(
                "w-full rounded-[8px] py-3 px-6",
                "font-montserrat text-[0.9rem] font-semibold tracking-wide",
                "border border-[#e7dfd1] text-[#2E2E2E]",
                "hover:bg-[#FAF6EE] hover:border-[#CE9F2D] hover:text-[#CE9F2D]",
                "transition-all duration-200",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#CE9F2D] focus-visible:ring-offset-2",
              )}
            >
              Cancel
            </button>
          </div>

          {/* Register nudge */}
          <p className="mt-5 text-center font-montserrat text-[0.75rem] text-[#9E886A]">
            New here?{" "}
            <button
              onClick={handleGoToRegister}
              className={cn(
                "font-semibold text-[#CE9F2D]",
                "transition-colors hover:text-[#A26D27]",
                "focus:outline-none focus-visible:underline",
              )}
            >
              Create a free account
            </button>
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
}
