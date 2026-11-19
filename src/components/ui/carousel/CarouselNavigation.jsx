import { ChevronLeft, ChevronRight } from "lucide-react";
import DynamicButton from "../button/button.jsx";
import { cn } from "../../../utils/common";
import "./carousel.css";

export default function CarouselNavigation({
  prevRef,
  nextRef,
  isBeginning = true,
  isEnd = false,
  prevLabel = "Previous",
  nextLabel = "Next",
  className = "",
  prevClassName = "",
  nextClassName = "",
  onPrev,
  onNext,
  hidePrev = false,
  hideNext = false,
  alwaysVisible = false,
  inline = false,
}) {
  const previousButton = !hidePrev ? (
    <DynamicButton
      ref={prevRef}
      type="button"
      aria-label={prevLabel}
      onClick={onPrev}
      className={cn(
        "carousel-nav-button carousel-nav-prev",
        !alwaysVisible && isBeginning && "carousel-nav-hidden",
        prevClassName,
      )}
    >
      <ChevronLeft aria-hidden="true" />
    </DynamicButton>
  ) : null;

  const nextButton = !hideNext ? (
    <DynamicButton
      ref={nextRef}
      type="button"
      aria-label={nextLabel}
      onClick={onNext}
      className={cn(
        "carousel-nav-button carousel-nav-next",
        !alwaysVisible && isEnd && "carousel-nav-hidden",
        nextClassName,
      )}
    >
      <ChevronRight aria-hidden="true" />
    </DynamicButton>
  ) : null;

  if (inline) {
    return (
      <div className={cn("carousel-nav-inline", className)}>
        {previousButton}
        {nextButton}
      </div>
    );
  }

  return (
    <>
      {previousButton}
      {nextButton}
    </>
  );
}
