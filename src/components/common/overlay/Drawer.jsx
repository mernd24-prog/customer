import { X } from "lucide-react";
import { useEffect } from "react";

export default function Drawer({
  open,
  title = "Filters",
  onClose,
  side = "right",
  width = "w-full",
  children,
}) {
  useEffect(() => {
    if (!open) return;

    const scrollY = window.scrollY;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";

    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";

      window.scrollTo(0, scrollY);
    };
  }, [open]);

  if (!open) return null;

  const sideClass = side === "left" ? "left-0" : "right-0";

  return (
    <div className="fixed inset-0  z-50 lg:hidden">
      <div
        className="absolute inset-0 bg-black/45 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`absolute  top-0 ${sideClass} h-full ${width} overflow-y-auto border-l border-[var(--customer-border)] bg-white p-4 shadow-[var(--customer-shadow-strong)]`}
      >
        <div className=" flex items-center justify-end  pb-3">
          <button
            type="button"
            onClick={onClose}
            className="icon-button"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
