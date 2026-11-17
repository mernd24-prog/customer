import React from "react";
import { Link } from "react-router-dom";
import { cn } from "../../../utils/common";
import { SpinnerIcon } from "../icons";

export const DynamicButton = React.forwardRef(
  (
    {
      as: Component = "button",
      variant = "primary",
      size = "md",
      shape = "rounded",
      isLoading = false,
      leftIcon,
      rightIcon,
      className,
      children,
      disabled,
      type = "button",
      customWidth,
      customHeight,
      customColor,
      onClick,
      style,
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      "group inline-flex items-center justify-center font-medium transition-all duration-300 ease-in-out outline-none focus:outline-none focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
      unstyled: "",
      primary:
        "bg-gradient-to-l from-gold-dark to-gold text-navy rounded-full shadow-sm hover:shadow-md",
      secondary:
        "bg-cream text-navy hover:bg-gold-soft focus-visible:ring-gold",
      outline: "border border-gold-dark text-navy",
      danger:
        "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600",
    };

    const sizes = {
      sm: "h-8 px-3 text-sm",
      md: "h-10 px-4 text-base",
      lg: "h-12 px-6 text-lg",
      xl: "h-12 px-12 text-xl",
      icon: "h-10 w-10 px-0 text-base",
    };

    const shapes = {
      square: "rounded-none",
      rounded: "rounded-[var(--customer-radius)]",
      circle: "rounded-full",
    };

    const hasExplicitSizing = /(?:^|\s)(?:h-|w-|min-h-|min-w-|p-|px-|py-|pt-|pr-|pb-|pl-)/.test(
      className ?? "",
    );
    const isIconOnlyButton = size === "icon" || (!children && Boolean(leftIcon || rightIcon));
    const shouldApplyDefaultSize = !hasExplicitSizing && (variant !== "unstyled" || isIconOnlyButton);

    const classes = cn(
      baseStyles,
      variants[variant],
      shouldApplyDefaultSize ? sizes[size] : "",
      shapes[shape],
      className,
    );

    const isRouterLink = Component === Link || props.to !== undefined;
    const ComponentToUse = isRouterLink ? Link : Component;
    const isDisabled = disabled || isLoading;

    const dynamicStyles = {
      ...(customWidth && { width: customWidth }),
      ...(customHeight && { height: customHeight }),
      ...(customColor && {
        background: customColor,
        borderColor: customColor,
      }),
      ...style,
    };

    const handleClick = (e) => {
      if (isDisabled) {
        e.preventDefault();
        return;
      }
      if (onClick) {
        onClick(e);
      }
    };

    const isIconOnlyContent = !children && Boolean(leftIcon || rightIcon);

    const content = (
      <>
        {isLoading && (
          <SpinnerIcon className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" />
        )}
        {!isLoading && leftIcon && (
          <span
            className={cn(
              "inline-flex items-center justify-center shrink-0 self-center",
              isIconOnlyContent ? "mr-0" : "mr-2",
            )}
          >
            {leftIcon}
          </span>
        )}
        {children}
        {!isLoading && rightIcon && (
          <span
            className={cn(
              "inline-flex items-center justify-center shrink-0 self-center transition-transform duration-300",
              isIconOnlyContent ? "ml-0" : "ml-2",
            )}
          >
            {rightIcon}
          </span>
        )}
      </>
    );

    if (ComponentToUse === Link) {
      return (
        <Link
          ref={ref}
          className={classes}
          aria-disabled={isDisabled}
          style={dynamicStyles}
          tabIndex={isDisabled ? -1 : undefined}
          onClick={handleClick}
          {...props}
        >
          {content}
        </Link>
      );
    }

    return (
      <ComponentToUse
        ref={ref}
        className={classes}
        style={dynamicStyles}
        disabled={ComponentToUse === "button" ? isDisabled : undefined}
        type={ComponentToUse === "button" ? type : undefined}
        onClick={handleClick}
        {...props}
      >
        {content}
      </ComponentToUse>
    );
  },
);

DynamicButton.displayName = "DynamicButton";
export default DynamicButton;
