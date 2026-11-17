import { cn } from "../../../utils/common";

export const buttonBaseClasses = cn(
  "group inline-flex items-center justify-center gap-2",
  "font-semibold tracking-[0.01em] transition-all duration-300 ease-in-out",
  "outline-none focus:outline-none focus-visible:outline-none",
  "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60",
  "whitespace-nowrap align-middle",
);

export const buttonInteractionClasses = cn(
  "focus-visible:ring-2 focus-visible:ring-[var(--customer-navy)]/20 focus-visible:ring-offset-2",
  "active:translate-y-px",
);

export const buttonShapes = {
  square: "rounded-[8px]",
  rounded: "rounded-lg",
  md: "rounded-md",
  circle: "rounded-full",
};

export const resolveButtonClasses = ({
  variant,
  size,
  shape,
  className,
  buttonVariants,
  buttonSizes,
  resolvedShape,
}) =>
  cn(
    buttonBaseClasses,
    buttonInteractionClasses,
    buttonVariants[variant] ?? buttonVariants.primary,
    buttonSizes[size] ?? buttonSizes.md,
    buttonShapes[resolvedShape] ?? buttonShapes.rounded,
    className,
  );
