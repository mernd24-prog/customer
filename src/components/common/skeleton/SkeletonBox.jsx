import React from "react";

/**
 * SkeletonBox - Base building block for skeleton UI.
 * Renders a single animated box with customizable styles.
 */
const SkeletonBox = ({
  width = "100%",
  height = "20px",
  rounded = "rounded-md",
  className = "",
  variant = "rect", // rect, circle, square
  ...props
}) => {
  // Map variants to specific styles
  const variantStyles = {
    circle: "rounded-full",
    square: "rounded-none aspect-square",
    rect: rounded,
  };

  return (
    <div
      className={`
        animate-pulse bg-gray-200 dark:bg-gray-700
        ${variantStyles[variant] || variantStyles.rect}
        ${className}
      `}
      style={{
        width: width,
        height: variant === "circle" || variant === "square" ? width : height,
      }}
      {...props}
    />
  );
};

export default SkeletonBox;
