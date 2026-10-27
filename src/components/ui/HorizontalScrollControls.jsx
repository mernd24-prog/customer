import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../utils/common";

export default function HorizontalScrollControls({
  children,
  className = "",
  viewportClassName = "",
  leftButtonClassName = "",
  rightButtonClassName = "",
  scrollBy = 220,
  buttonClassName = "",
  hideButtonsWhenAtEdge = true,
}) {
  const scrollRef = useRef(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;

    const updateState = () => {
      const maxScrollLeft = node.scrollWidth - node.clientWidth;
      setIsBeginning(node.scrollLeft <= 1);
      setIsEnd(node.scrollLeft >= maxScrollLeft - 1);
    };

    updateState();

    node.addEventListener("scroll", updateState, { passive: true });

    let resizeObserver;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(updateState);
      resizeObserver.observe(node);
    }

    window.addEventListener("resize", updateState);

    return () => {
      node.removeEventListener("scroll", updateState);
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener("resize", updateState);
    };
  }, []);

  const scroll = (direction) => {
    const node = scrollRef.current;
    if (!node) return;

    node.scrollBy({
      left: direction * scrollBy,
      behavior: "smooth",
    });
  };

  const defaultButtonClass =
    "hidden sm:flex absolute top-1/2 z-20 -translate-y-1/2 h-8 w-8 items-center justify-center rounded-full border border-[#E8D9B7] bg-white/95 text-[#1B1D60] shadow-md transition-all hover:border-[#CE9F2D] hover:bg-[#FFF8E8]";

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        aria-label="Scroll left"
        onClick={() => scroll(-1)}
        className={cn(
          defaultButtonClass,
          "left-0",
          hideButtonsWhenAtEdge && isBeginning && "pointer-events-none opacity-0",
          leftButtonClassName,
          buttonClassName,
        )}
      >
        <ChevronLeft className="h-4 w-4 stroke-[2.5]" />
      </button>

      <div
        ref={scrollRef}
        className={cn(
          "hide-scrollbar flex max-w-full items-center gap-4 overflow-x-auto pb-1",
          viewportClassName,
        )}
      >
        {children}
      </div>

      <button
        type="button"
        aria-label="Scroll right"
        onClick={() => scroll(1)}
        className={cn(
          defaultButtonClass,
          "right-0",
          hideButtonsWhenAtEdge && isEnd && "pointer-events-none opacity-0",
          rightButtonClassName,
          buttonClassName,
        )}
      >
        <ChevronRight className="h-4 w-4 stroke-[2.5]" />
      </button>
    </div>
  );
}
