import React from "react";
import { cn } from "../../../utils/common";
import { SpinnerIcon } from "../icons";
import DynamicButton from "../button/button.jsx";

export default function Button({
  children,
  label,
  variant = "primary",
  size = "md",
  fullWidth = false,
  rounded = false,
  loading = false,
  disabled = false,
  icon,
  iconPosition = "left",
  className = "",
  type = "button",
  onClick,
  bgColor,
  textColor,
  style,
  ...rest
}) {
  const isSpinnerLoading = Boolean(loading);
  const isDisabled = Boolean(disabled || isSpinnerLoading);

  const customStyle =
    variant === "custom"
      ? {
          ...style,
          ...(bgColor ? { background: bgColor } : {}),
          ...(textColor ? { color: textColor } : {}),
        }
      : style;

  const leftIcon = icon && iconPosition === "left" ? icon : undefined;
  const rightIcon = icon && iconPosition === "right" ? icon : undefined;

  return (
    <DynamicButton
      type={type}
      variant={variant}
      size={size}
      rounded={rounded}
      onClick={onClick}
      disabled={isDisabled}
      isLoading={isSpinnerLoading}
      leftIcon={leftIcon}
      rightIcon={rightIcon}
      style={customStyle}
      className={cn(
        fullWidth && "w-full",
        className,
      )}
      {...rest}
    >
      {isSpinnerLoading ? (
        <span className="customer-content-enter flex items-center gap-2" role="status">
          Please Wait…
        </span>
      ) : (
        children ?? label
      )}
    </DynamicButton>
  );
}
