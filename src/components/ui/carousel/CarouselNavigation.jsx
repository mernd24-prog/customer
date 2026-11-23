
import CarouselNavButton from "../buttons/CarouselNavButton";
import { cn } from "../../../utils/common";

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
    <CarouselNavButton
      ref={prevRef}
      direction="prev"
      ariaLabel={prevLabel}
      onClick={onPrev}
      disabled={isBeginning && !alwaysVisible}
      className={cn(
        "carousel-nav-position carousel-nav-prev",
        !alwaysVisible && isBeginning && "opacity-0 pointer-events-none",
        prevClassName,
      )}
    />
  ) : null;

  const nextButton = !hideNext ? (
    <CarouselNavButton
      ref={nextRef}
      direction="next"
      ariaLabel={nextLabel}
      onClick={onNext}
      disabled={isEnd && !alwaysVisible}
      className={cn(
        "carousel-nav-position carousel-nav-next",
        !alwaysVisible && isEnd && "opacity-0 pointer-events-none",
        nextClassName,
      )}
    />
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
    <div className={cn("contents", className)}>
      {previousButton}
      {nextButton}
    </div>
  );
}
