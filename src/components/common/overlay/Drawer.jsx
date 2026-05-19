import { X } from "lucide-react";

export default function Drawer({
  open,
  title = "Filters",
  onClose,
  side = "right",
  width = "w-72",
  children,
}) {
  if (!open) return null;

  const sideClass = side === "left" ? "left-0" : "right-0";

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={`absolute top-0 ${sideClass} h-full ${width} overflow-y-auto bg-white p-4`}>
        <div className="mb-4 flex items-center justify-between">
          <span className="font-montserrat font-semibold text-[#2E2E2E]">{title}</span>
          <button type="button" onClick={onClose} className="icon-button" aria-label="Close">
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
