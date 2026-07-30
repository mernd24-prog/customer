import { X } from "lucide-react";
import { useEffect } from "react";

function SupportStatusBadge({ status }) {
  const normalized = String(status || "pending").toLowerCase();

  const className =
    normalized === "resolved" || normalized === "closed"
      ? "bg-[#E8F8F5] text-[#117A65]"
      : normalized === "in_progress"
        ? "bg-[#EEF2FF] text-[#3E4093]"
        : "bg-[#FEF9E7] text-[#B7950B]";

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-[12px] font-semibold capitalize ${className}`}
    >
      {normalized.replace(/_/g, " ")}
    </span>
  );
}

export default function SupportTicketSidebar({ isOpen, onClose, ticket }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || !ticket) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-[9998] transition-opacity"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed top-0 right-0 h-full w-full sm:w-[400px] md:w-[450px] max-w-full bg-white z-[9999] shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 bg-white border-b border-[#E7D9B8]">
          <h2 className="text-lg sm:text-xl font-bold text-[#1B1D60] text-center w-full px-8">
            Ticket Details
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-[#FFF9EA] transition-colors"
          >
            <X size={20} className="text-[#CE9F2D]" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden p-5 sm:p-6 flex flex-col space-y-5">
          <div className="shrink-0">
            <p className="text-xs text-[#666666] font-semibold uppercase tracking-wider mb-1">
              Ticket ID
            </p>
            <p className="text-sm font-medium text-[#2E2E2E] break-all">
              {ticket.id || ticket.queryId}
            </p>
          </div>

          <div className="border-t border-[#EFE5D2] pt-4">
            <p className="text-xs text-[#666666] font-semibold uppercase tracking-wider mb-1">
              Date
            </p>
            <p className="text-sm font-medium text-[#2E2E2E]">
              {ticket.updatedAt || ticket.createdAt}
            </p>
          </div>
          <div className="border-t border-[#EFE5D2] pt-4">
            <p className="text-xs text-[#666666] font-semibold uppercase tracking-wider mb-1">
              Category
            </p>
            <p className="text-sm font-medium text-[#2E2E2E]">
              {ticket.categoryLabel || ticket.category}
            </p>
          </div>

          <div className="border-t border-[#EFE5D2] pt-4 shrink-0">
            <p className="text-xs text-[#666666] font-semibold uppercase tracking-wider mb-1">
              Subject
            </p>
            <div className="text-sm font-medium text-[#2E2E2E] break-words max-h-24 overflow-y-auto custom-scrollbar pr-2">
              {ticket.subject}
            </div>
          </div>

          <div className="border-t border-[#EFE5D2] pt-4 flex flex-col min-h-0 shrink">
            <p className="text-xs text-[#666666] font-semibold uppercase tracking-wider mb-1 shrink-0">
              Message
            </p>
            <div className="text-sm text-[#4E4E4E] leading-relaxed whitespace-pre-wrap bg-[#F7EED8] p-3 rounded-lg border border-[#E7D9B8]/50 break-words min-h-0 shrink overflow-y-auto custom-scrollbar">
              {ticket.message || "No message provided."}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
