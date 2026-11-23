
import React, { forwardRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { GoldOutlineButton } from "../button/buttonSpecialized";

const CarouselNavButton = forwardRef(function CarouselNavButton(
  {
    direction = "prev",
    onClick,
    disabled = false,
    className = "",
    ariaLabel,
    iconSize = 20,
    strokeWidth = 2,
    children,
    type = "button",
    ...rest
  },
  ref,
) {
  const isPrev = direction === "prev" || direction === "left";

  return (
    <GoldOutlineButton
      ref={ref}
      type={type}
      size="icon"
      shape="circle"
      disabled={disabled}
      aria-label={
        ariaLabel || (isPrev ? "Previous slide" : "Next slide")
      }
      onClick={onClick}
      className={className}
      {...rest}
    >
      {children ||
        (isPrev ? (
          <ChevronLeft
            size={iconSize}
            strokeWidth={strokeWidth}
            className="shrink-0"
          />
        ) : (
          <ChevronRight
            size={iconSize}
            strokeWidth={strokeWidth}
            className="shrink-0"
          />
        ))}
    </GoldOutlineButton>
  );
});

export default CarouselNavButton;
