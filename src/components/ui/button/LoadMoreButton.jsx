import React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../../utils/common";
import DynamicButton from "./button.jsx";

export default function LoadMoreButton({
  onClick,
  loading = false,
  isLoading = false,
  disabled = false,
  label = "Load More",
  loadingLabel = "Loading...",
  showLess = false,
  isExpanded = false,
  showChevron = true,
  iconClassName = "",
  className = "",
  variant = "continueShopping",
  size = "md",
  shape = "rounded",
  children,
  ...props
}) {
  const isCurrentlyLoading = Boolean(loading || isLoading);
  const isExpandedState = Boolean(showLess || isExpanded);

  const displayLabel = isCurrentlyLoading
    ? loadingLabel
    : (children || label);

  return (
    <DynamicButton
      variant={variant}
      size={size}
      shape={shape}
      onClick={onClick}
      disabled={disabled || isCurrentlyLoading}
      isLoading={isCurrentlyLoading}
      rightIcon={
        !isCurrentlyLoading && showChevron ? (
          <ChevronDown
            size={14}
            strokeWidth={2.5}
            className={cn(
              "transition-transform duration-200",
              isExpandedState && "rotate-180",
              iconClassName,
            )}
          />
        ) : undefined
      }
      className={className}
      {...props}
    >
      {displayLabel}
    </DynamicButton>
  );
}

