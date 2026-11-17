import React, { forwardRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../../utils/common";
import DynamicButton from "../button/button";

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
    size = "md",
    variant = "default",
    type = "button",
    ...rest
  },
  ref,
) {
  const isPrev = direction === "prev" || direction === "left";
  const defaultAria = isPrev ? "Previous slide" : "Next slide";

  const sizeClass =
    {
      sm: "h-8 w-8",
      md: "h-10 w-10 lg:h-11 lg:w-11",
      lg: "h-11 w-11 sm:h-12 sm:w-12",
    }[size] || "h-10 w-10 lg:h-11 lg:w-11";

  const shapeClass = variant === "rounded" ? "rounded-full" : "rounded-lg";

  return (
    <DynamicButton
      ref={ref}
      type={type}
      disabled={disabled}
      aria-label={ariaLabel || defaultAria}
      onClick={onClick}
      className={cn(
        "appearance-none items-center justify-center border border-[#E8D9B7] bg-white/95 text-[#1B1D60] shadow-md backdrop-blur-sm transition-colors duration-200",
        "hover:border-[#CE9F2D] hover:bg-[#FFF8E8] active:bg-[#F7EBCF]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CE9F2D] focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-0",
        sizeClass,
        shapeClass,
        className,
      )}
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
    </DynamicButton>
  );
});

export default CarouselNavButton;

