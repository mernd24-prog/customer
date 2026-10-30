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
  showButtons = true,
  wheelToScroll = false,
  dragToScroll = false,
  resetOnMount = false,
  scrollSelectedToStart = false,
  resetKey,
}) {
  const scrollRef = useRef(null);
  const dragState = useRef(null);
  const suppressClickRef = useRef(false);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;

    const scrollToSelected = () => {
      if (!scrollSelectedToStart) return false;
      const selected = node.querySelector('[data-scroll-selected="true"]');
      if (!selected) return false;
      node.scrollLeft +=
        selected.getBoundingClientRect().left - node.getBoundingClientRect().left;
      return true;
    };

    if (!scrollToSelected() && resetOnMount) node.scrollLeft = 0;

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
  }, [resetKey, resetOnMount, scrollSelectedToStart]);

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
      {showButtons && (
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
      )}

      <div
        ref={scrollRef}
        onPointerDown={
          dragToScroll
            ? (event) => {
                const node = scrollRef.current;
                if (
                  event.pointerType !== "mouse" ||
                  event.button !== 0 ||
                  !node ||
                  node.scrollWidth <= node.clientWidth
                ) {
                  return;
                }
                dragState.current = {
                  pointerId: event.pointerId,
                  startX: event.clientX,
                  startScrollLeft: node.scrollLeft,
                  moved: false,
                };
                event.target.setPointerCapture?.(event.pointerId);
                setIsDragging(true);
              }
            : undefined
        }
        onPointerMove={
          dragToScroll
            ? (event) => {
                const node = scrollRef.current;
                const drag = dragState.current;
                if (!node || !drag || drag.pointerId !== event.pointerId) return;
                const deltaX = event.clientX - drag.startX;
                if (Math.abs(deltaX) > 4) drag.moved = true;
                if (drag.moved) {
                  event.preventDefault();
                  node.scrollLeft = drag.startScrollLeft - deltaX;
                }
              }
            : undefined
        }
        onPointerUp={
          dragToScroll
            ? (event) => {
                const drag = dragState.current;
                if (!drag || drag.pointerId !== event.pointerId) return;
                if (drag.moved) {
                  suppressClickRef.current = true;
                  window.setTimeout(() => {
                    suppressClickRef.current = false;
                  }, 0);
                }
                dragState.current = null;
                setIsDragging(false);
              }
            : undefined
        }
        onPointerCancel={
          dragToScroll
            ? () => {
                dragState.current = null;
                setIsDragging(false);
              }
            : undefined
        }
        onClickCapture={
          dragToScroll
            ? (event) => {
                if (!suppressClickRef.current) return;
                event.preventDefault();
                event.stopPropagation();
                suppressClickRef.current = false;
              }
            : undefined
        }
        onWheel={
          wheelToScroll
            ? (event) => {
                const node = scrollRef.current;
                if (!node || node.scrollWidth <= node.clientWidth) return;
                if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
                  event.preventDefault();
                  node.scrollLeft += event.deltaY;
                }
              }
            : undefined
        }
        className={cn(
          "hide-scrollbar flex max-w-full items-center gap-4 overflow-x-auto pb-1",
          dragToScroll && (isDragging ? "cursor-grabbing select-none" : "cursor-grab"),
          viewportClassName,
        )}
      >
        {children}
      </div>

      {showButtons && (
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
      )}
    </div>
  );
}
