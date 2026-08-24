import { ChevronLeft, ChevronRight, X } from "lucide-react";

export default function ReviewMediaLightbox({
  images = [],
  index = 0,
  onClose,
  onIndexChange,
}) {
  if (!images.length) return null;
  const safeIndex = Math.min(Math.max(index, 0), images.length - 1);
  const showNavigation = images.length > 1;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-[#2E2E2E]/90 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative flex max-h-[78vh] w-full max-w-xl flex-col overflow-hidden rounded-xl border border-[#CE9F2D4D] bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#CE9F2D33] bg-[#FAFAFA]/60 px-4 py-2.5">
          <p className="text-sm font-bold text-black">
            Review Photos {showNavigation ? `(${safeIndex + 1}/${images.length})` : ""}
          </p>
          <button type="button" onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full bg-white text-black" aria-label="Close Image Preview">
            <X size={18} />
          </button>
        </div>

        <div className="relative flex min-h-[220px] items-center justify-center bg-[#FAFAFA] p-3 sm:min-h-[320px] sm:p-4">
          {showNavigation && (
            <button type="button" onClick={() => onIndexChange((safeIndex - 1 + images.length) % images.length)} className="absolute left-2 top-1/2 z-10 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full border border-[#CE9F2D66] bg-white text-[#1B1D60] shadow-sm transition hover:bg-[#CE9F2D] hover:text-white sm:left-3" aria-label="Previous Review Image">
              <ChevronLeft size={20} />
            </button>
          )}
          <img loading="lazy" width="400" height="400" src={images[safeIndex]} alt={`Review media ${safeIndex + 1}`} className="max-h-[44vh] max-w-[82%] rounded-lg border border-[#E8DFC9] bg-white object-contain" />
          {showNavigation && (
            <button type="button" onClick={() => onIndexChange((safeIndex + 1) % images.length)} className="absolute right-2 top-1/2 z-10 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full border border-[#CE9F2D66] bg-white text-[#1B1D60] shadow-sm transition hover:bg-[#CE9F2D] hover:text-white sm:right-3" aria-label="Next Review Image">
              <ChevronRight size={20} />
            </button>
          )}
        </div>

        {showNavigation && (
          <div className="flex justify-center gap-2 overflow-x-auto border-t border-[#CE9F2D33] bg-white p-2.5">
            {images.map((image, thumbIndex) => (
              <button type="button" key={`${image}-${thumbIndex}`} onClick={() => onIndexChange(thumbIndex)} className={`h-16 w-16 shrink-0 overflow-hidden rounded-md border bg-white p-0.5 transition ${thumbIndex === safeIndex ? "border-[#CE9F2D]" : "border-[#E8DFC9] opacity-70 hover:border-[#CE9F2D] hover:opacity-100"}`}>
                <img loading="lazy" width="400" height="400" src={image} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
