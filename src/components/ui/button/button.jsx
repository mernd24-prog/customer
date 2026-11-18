import React from "react";
import { Link } from "react-router-dom";
import { cn } from "../../../utils/common";
import { SpinnerIcon } from "../icons";
import { buttonSizes } from "./buttonSizes";
import { buttonVariants } from "./buttonVariants";
import { buttonShapes, resolveButtonClasses } from "./buttonConfig";

export { buttonSizes, buttonVariants, buttonShapes };

export const DynamicButton = React.forwardRef(
  (
    {
      as: Component = "button",
      variant = "unstyled",
      size = "md",
      shape = "rounded",
      rounded,
      roundedFull,
      isLoading = false,
      loading,
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
    const isSpinnerLoading = Boolean(isLoading || loading);
    const isDisabled = Boolean(disabled || isSpinnerLoading);
    const isUnstyled = !variant || variant === "unstyled";

    const resolvedShape = roundedFull
      ? "circle"
      : rounded === false
        ? "square"
        : rounded
          ? "rounded"
          : (shape ?? (isUnstyled ? "none" : "rounded"));

    const classes = resolveButtonClasses({
      variant,
      size,
      shape,
      className,
      buttonVariants,
      buttonSizes,
      resolvedShape,
    });

    const isRouterLink = Component === Link || props.to !== undefined;
    const ComponentToUse = isRouterLink ? Link : Component;

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
        {isSpinnerLoading && (
          <SpinnerIcon className="animate-spin -ml-1 mr-2 h-4 w-4 text-current shrink-0" />
        )}
        {!isSpinnerLoading && leftIcon && (
          <span
            className={cn(
              "inline-flex items-center justify-center shrink-0 self-center",
              isIconOnlyContent ? "mr-0" : "",
            )}
          >
            {leftIcon}
          </span>
        )}
        {children}
        {!isSpinnerLoading && rightIcon && (
          <span
            className={cn(
              "inline-flex items-center justify-center shrink-0 self-center transition-transform duration-300",
              isIconOnlyContent ? "ml-0" : "",
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
