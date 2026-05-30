import React from "react";
import { Link } from "react-router-dom";
import { cn } from "../../../lib/utils";

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
      "inline-flex items-center justify-center font-medium transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
      primary:
        "bg-gradient-to-l from-[#A26D27] to-[#CE9F2D] text-white rounded-full shadow-sm hover:shadow-md",
      secondary:
        "bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-500",
      outline: "border-2 border-[#A26D27] text-black",
      danger:
        "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600",
    };

    const sizes = {
      sm: "h-8 px-3 text-sm",
      md: "h-10 px-4 text-base",
      lg: "h-12 px-6 text-lg",
      xl: "h-12 px-12 text-xl",
      icon: "h-10 w-10",
    };

    const shapes = {
      square: "rounded-none",
      rounded: "rounded-2xl",
      circle: "rounded-full",
    };

    const classes = cn(
      baseStyles,
      variants[variant],
      sizes[size],
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

    const content = (
      <>
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {!isLoading && leftIcon && (
          <span className="mr-2 inline-flex shrink-0">{leftIcon}</span>
        )}
        {children}
        {!isLoading && rightIcon && (
          <span className="ml-2 inline-flex shrink-0">{rightIcon}</span>
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
        disabled={isDisabled}
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
