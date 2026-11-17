import React, { forwardRef } from "react";
import { X } from "lucide-react";
import { cn } from "../../../utils/common";
import DynamicButton from "../button/button";

const sizeMap = {
  xs: { button: "h-6 w-6", icon: 13 },
  sm: { button: "h-7 w-7 sm:h-8 sm:w-8", icon: 14 },
  md: { button: "h-8 w-8 sm:h-9 sm:w-9", icon: 16 },
  lg: { button: "h-9 w-9 sm:h-10 sm:w-10", icon: 18 },
  xl: { button: "h-10 w-10 sm:h-11 sm:w-11", icon: 20 },
};

const variantMap = {
  default:
    "border border-[var(--customer-border)] bg-white text-[var(--customer-navy)] shadow-xs hover:bg-[var(--customer-gold-soft)] hover:border-[var(--customer-gold)]",
  ghost:
    "border-transparent text-muted hover:bg-cream hover:text-ink",
  subtle:
    "border border-white/70 bg-white/90 text-[var(--customer-navy)] shadow-xs backdrop-blur hover:bg-[var(--customer-gold-soft)]",
  floating:
    "border-transparent bg-white text-muted shadow-md hover:bg-cream hover:text-ink",
  gold:
    "border-transparent text-[#CE9F2D] hover:bg-[#FFF9EA]",
  light:
    "border-transparent text-gray-400 hover:text-gray-700 hover:bg-gray-100",
};

const CloseButton = forwardRef(function CloseButton(
  {
    onClick,
    size = "md",
    variant = "default",
    className = "",
    ariaLabel = "Close",
    iconSize,
    strokeWidth = 2,
    disabled = false,
    type = "button",
    ...rest
  },
  ref,
) {
  const sizeConfig = sizeMap[size] || sizeMap.md;
  const currentIconSize = iconSize ?? sizeConfig.icon;

  return (
    <DynamicButton
      ref={ref}
      type={type}
      variant="unstyled"
      size="none"
      shape="circle"
      disabled={disabled}
      aria-label={ariaLabel}
      onClick={onClick}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full transition-all duration-200 ease-in-out p-0",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-1",
        sizeConfig.button,
        variantMap[variant] || variantMap.default,
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
      {...rest}
    >
      <X
        size={currentIconSize}
        strokeWidth={strokeWidth}
        className="block shrink-0"
        aria-hidden="true"
      />
    </DynamicButton>
  );
});

export default CloseButton;

