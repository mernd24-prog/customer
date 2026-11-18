import { cn } from "../../../utils/common";

export const buttonBaseClasses = cn(
  "group inline-flex items-center justify-center",
  "font-medium transition-all duration-300 ease-in-out",
  "outline-none focus:outline-none focus-visible:outline-none",
  "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
  "whitespace-nowrap align-middle",
);

export const buttonInteractionClasses = cn(
  "focus-visible:ring-2 focus-visible:ring-[var(--customer-navy)]/20 focus-visible:ring-offset-2",
  "active:translate-y-px",
);

export const buttonShapes = {
  square: "rounded-[5px]",
  rounded: "rounded-lg",
  md: "rounded-md",
  circle: "rounded-full",
  none: "",
};

export const resolveButtonClasses = ({
  variant = "unstyled",
  size,
  shape,
  className = "",
  buttonVariants = {},
  buttonSizes = {},
  resolvedShape,
}) => {
  const isUnstyled = !variant || variant === "unstyled";
  const isTextVariant = variant === "textGold" || variant === "textWhite";
  const effectiveSize = isTextVariant ? "none" : (size ?? "md");
  const effectiveShape = isTextVariant
    ? "none"
    : (resolvedShape ?? shape ?? (isUnstyled ? "none" : "rounded"));
  const shouldApplySize = effectiveSize !== "none" && !isUnstyled;

  return cn(
    !isUnstyled && buttonBaseClasses,
    !isUnstyled && buttonInteractionClasses,
    isUnstyled ? "" : (buttonVariants[variant] ?? ""),
    shouldApplySize ? (buttonSizes[effectiveSize] ?? "") : "",
    effectiveShape !== "none" ? (buttonShapes[effectiveShape] ?? "") : "",
    className,
  );
};
