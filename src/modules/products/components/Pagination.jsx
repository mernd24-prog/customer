import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../../utils/common";
import DynamicButton from "../../../components/ui/button/button";

function getVisiblePages(currentPage, totalPages, maxPages) {
  if (totalPages <= maxPages) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const middle = Math.floor(maxPages / 2);
  const start = Math.max(
    1,
    Math.min(currentPage - middle, totalPages - maxPages + 1),
  );
  return Array.from({ length: maxPages }, (_, index) => start + index);
}

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  maxPages = 7,
  className = "",
}) {
  if (totalPages <= 1) return null;

  const pages = getVisiblePages(
    Number(currentPage),
    Number(totalPages),
    maxPages,
  );
  const firstVisiblePage = pages[0];
  const lastVisiblePage = pages[pages.length - 1];

  return (
    <div
      className={cn("mt-8 flex items-center justify-center gap-2", className)}
    >
      <DynamicButton
        aria-label="Previous page"
        disabled={currentPage <= 1}
        onClick={() => onPageChange?.(currentPage - 1)}
        className={cn("icon-button secondary", "disabled:opacity-50 disabled:cursor-not-allowed")}
      >
        <ChevronLeft size={16} />
      </DynamicButton>
      {firstVisiblePage > 1 && (
        <span className="text-[var(--customer-subtle)]">...</span>
      )}
      {pages.map((page) => (
        <DynamicButton
          key={page}
          onClick={() => onPageChange?.(page)}
          className={cn(
            "h-9 min-w-[36px] rounded-[6px] border px-2.5  text-sm font-medium transition-all duration-300 ease-in-out",
            currentPage === page
              ? "border-[var(--customer-gold)] bg-[var(--customer-gold)] text-[var(--customer-navy)]"
              : "border-[var(--customer-border-strong)] text-[var(--customer-ink)] hover:bg-[var(--customer-cream)]",
          )}
        >
          {page}
        </DynamicButton>
      ))}
      {lastVisiblePage < totalPages && (
        <span className="text-[var(--customer-subtle)]">...</span>
      )}
      <DynamicButton
        aria-label="Next page"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange?.(currentPage + 1)}
        className={cn("icon-button secondary", "disabled:opacity-50 disabled:cursor-not-allowed")}
      >
        <ChevronRight size={16} />
      </DynamicButton>
    </div>
  );
}
