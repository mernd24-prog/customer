import { X } from "lucide-react";
import { useEffect } from "react";

const statusLabel = (status = "") =>
  String(status || "pending")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const statusClass = (status = "") => {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "resolved" || normalized === "closed") {
    return "border-green-200 bg-green-50 text-green-700";
  }
  if (normalized === "in_progress") {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }
  return "border-[#E7D9B8] bg-[#FFF9EA] text-[#8A640D]";
};

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
      <div className="fixed top-0 right-0 h-full w-full sm:w-[400px] md:w-[450px] max-w-full bg-white z-[9999] shadow-2xl flex flex-col p-6 transform transition-transform duration-300 ease-in-out">
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
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 custom-scrollbar">
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
              Status
            </p>
            <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClass(ticket.status)}`}>
              {statusLabel(ticket.status)}
            </span>
            {ticket.resolvedAt ? (
              <p className="mt-2 text-xs text-[#666666]">
                Resolved on {ticket.resolvedAt}
              </p>
            ) : null}
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

          <div className="border-t border-[#EFE5D2] pt-4">
            <p className="text-xs text-[#666666] font-semibold uppercase tracking-wider mb-1">
              Message
            </p>
            <div className="text-sm text-[#4E4E4E] leading-relaxed whitespace-pre-wrap bg-[#F7EED8] p-3 rounded-lg border border-[#E7D9B8]/50 break-words">
              {ticket.message || "No message provided."}
            </div>
          </div>

          {ticket.adminNotes ? (
            <div className="border-t border-[#EFE5D2] pt-4 shrink-0">
              <p className="text-xs text-[#666666] font-semibold uppercase tracking-wider mb-1">
                Support Note
              </p>
              <div className="text-sm text-[#4E4E4E] leading-relaxed whitespace-pre-wrap bg-green-50 p-3 rounded-lg border border-green-100 break-words">
                {ticket.adminNotes}
              </div>
            </div>
          ) : null}

          {Array.isArray(ticket.statusHistory) && ticket.statusHistory.length ? (
            <div className="border-t border-[#EFE5D2] pt-4 shrink-0">
              <p className="text-xs text-[#666666] font-semibold uppercase tracking-wider mb-2">
                Status History
              </p>
              <div className="space-y-2">
                {ticket.statusHistory.map((item, index) => (
                  <div
                    key={`${item.status}-${item.changedAt || index}`}
                    className="rounded-lg border border-[#EFE5D2] bg-white p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${statusClass(item.status)}`}>
                        {statusLabel(item.status)}
                      </span>
                      <span className="text-xs text-[#666666]">
                        {item.changedAt || "-"}
                      </span>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-[#4E4E4E]">
                      {item.note || "No note added."}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
