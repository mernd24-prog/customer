import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../utils/classNames";

function getVisiblePages(currentPage, totalPages, maxPages) {
  if (totalPages <= maxPages) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const middle = Math.floor(maxPages / 2);
  const start = Math.max(1, Math.min(currentPage - middle, totalPages - maxPages + 1));
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

  const pages = getVisiblePages(Number(currentPage), Number(totalPages), maxPages);
  const firstVisiblePage = pages[0];
  const lastVisiblePage = pages[pages.length - 1];

  return (
    <div className={cn("mt-8 flex items-center justify-center gap-2", className)}>
      <button type="button" disabled={currentPage <= 1} onClick={() => onPageChange?.(currentPage - 1)} className="icon-button secondary">
        <ChevronLeft size={16} />
      </button>
      {firstVisiblePage > 1 && <span className="text-[#A6A6A6]">...</span>}
      {pages.map((page) => (
        <button
          key={page}
          type="button"
          onClick={() => onPageChange?.(page)}
          className={cn(
            "h-9 min-w-[36px] rounded-[6px] border px-2.5 font-montserrat text-sm font-medium transition",
            currentPage === page
              ? "border-[#CE9F2D] bg-[#CE9F2D] text-white"
              : "border-[#cfc6b8] text-[#2E2E2E] hover:bg-[#FAF6EE]",
          )}
        >
          {page}
        </button>
      ))}
      {lastVisiblePage < totalPages && <span className="text-[#A6A6A6]">...</span>}
      <button type="button" disabled={currentPage >= totalPages} onClick={() => onPageChange?.(currentPage + 1)} className="icon-button secondary">
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
