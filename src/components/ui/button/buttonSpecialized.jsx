import React from "react";
import { ArrowRight } from "lucide-react";
import { FaRegHeart } from "react-icons/fa";
import { cn } from "../../../utils/common";
import DynamicButton from "./button";

/**
 * Specialized complex button components with custom composite layouts.
 * For standard buttons, use <DynamicButton variant="..." /> directly.
 */

export const ButtonLoading = () => (
  <div className="flex items-center gap-2">
    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
    <span>Loading...</span>
  </div>
);

export const StyledButton = ({
  buttonStyle = "primary",
  size,
  className = "",
  children,
  leftIcon,
  rightIcon,
  isLoading,
  ...props
}) => (
  <DynamicButton
    variant={buttonStyle}
    size={size}
    className={className}
    leftIcon={leftIcon}
    rightIcon={rightIcon}
    isLoading={isLoading}
    {...props}
  >
    {isLoading ? <ButtonLoading /> : children}
  </DynamicButton>
);

export const RoundIconWithBg = ({ size = "icon", ...props }) => (
  <DynamicButton
    variant="primary"
    size={size}
    shape="circle"
    {...props}
  >
    <FaRegHeart />
  </DynamicButton>
);

export const ButtonWithIcon = ({
  children,
  icon,
  size = "xl",
  ...props
}) => (
  <DynamicButton
    variant="primary"
    size={size}
    leftIcon={icon}
    {...props}
  >
    {children}
  </DynamicButton>
);

export const PriceButton = ({
  currentPrice,
  originalPrice,
  size = "none",
  ...props
}) => (
  <DynamicButton
    variant="outline"
    shape="circle"
    size={size}
    className="whitespace-nowrap px-5 py-1.5 h-auto min-h-8"
    {...props}
  >
    <span className="flex items-center gap-2 font-bold text-black">
      {currentPrice}

      {originalPrice && (
        <span className="line-through decoration-gold-dark text-gold-dark text-sm font-normal">
          {originalPrice}
        </span>
      )}
    </span>
  </DynamicButton>
);

export const CategoryMoreButton = ({
  active = false,
  icon,
  label = "More",
  className = "",
  ...props
}) => (
  <div className="relative flex-1 flex items-stretch h-full min-w-[62px] sm:min-w-[88px] lg:min-w-[105px]">
    <DynamicButton
      className={cn(
        "group relative flex w-full h-full flex-col items-center justify-center px-1 sm:px-2 lg:px-3 pt-3 sm:pt-4 lg:pt-4.5 pb-2 sm:pb-2.5 lg:pb-3 transition-all duration-200 ease-in-out",
        active
          ? "bg-[linear-gradient(180deg,rgba(206,159,45,0)_0%,rgba(206,159,45,0.4)_100%)]"
          : "hover:bg-[linear-gradient(180deg,rgba(206,159,45,0)_0%,rgba(206,159,45,0.4)_100%)]",
        className,
      )}
      {...props}
    >
      <span className="flex h-[28px] w-[32px] sm:h-[42px] sm:w-[46px] lg:h-[46px] lg:w-[52px] items-center justify-center transition-transform duration-200">
        <img
          loading="lazy"
          width="400"
          height="400"
          src={icon}
          alt={label}
          className="h-full w-full object-contain"
        />
      </span>

      <span
        className={`mt-3 sm:mt-4 lg:mt-4.5 text-center text-xs sm:text-sm md:text-base lg:text-[15px] whitespace-normal 2xl:whitespace-nowrap leading-tight transition-colors duration-200 ${
          active
            ? "font-bold text-[#1E204A]"
            : "font-semibold text-[#2D2D2D] group-hover:text-[#1E204A]"
        }`}
      >
        {label}
      </span>

      {active && (
        <div className="absolute bottom-0 left-0 right-0 h-[3px] sm:h-[4px] bg-[#2D347D]" />
      )}
    </DynamicButton>
  </div>
);

/**
 * Standardized action button for Order cards, tracking, reviews, and documents
 */
export const OrderActionButton = React.forwardRef(
  (
    {
      children,
      className = "",
      size = "sm",
      shape = "rounded",
      variant = "softGold",
      loading,
      isLoading,
      ...props
    },
    ref,
  ) => (
    <DynamicButton
      ref={ref}
      variant={variant}
      size={size}
      shape={shape}
      isLoading={isLoading || loading}
      className={className}
      {...props}
    >
      {children}
    </DynamicButton>
  ),
);
OrderActionButton.displayName = "OrderActionButton";
