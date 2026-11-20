import { cn } from "../../../utils/common";
import { inputVariants as defaultVariants } from "./inputVariants";
import { inputSizes as defaultSizes } from "./inputSizes";

export const inputBaseClasses = cn(
  "w-full transition-all duration-200 ease-in-out",
  "outline-none focus:outline-none focus-visible:outline-none",
  "placeholder:text-[#9298AA] placeholder:font-normal",
  "disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-[#8C8E9E] disabled:opacity-70",
  "read-only:cursor-default read-only:bg-gray-50/60",
);

export const inputShapes = {
  rounded: "rounded-lg",
  square: "rounded-[5px]",
  md: "rounded-md",
  circle: "rounded-full",
  none: "",
};

export const resolveInputClasses = ({
  variant = "default",
  size = "md",
  shape = "rounded",
  error = false,
  hasLeftIcon = false,
  hasRightIcon = false,
  className = "",
  inputVariants = defaultVariants,
  inputSizes = defaultSizes,
}) => {
  const isUnstyled = variant === "unstyled";
  const isFilterVariant =
    String(variant).startsWith("filter") ||
    String(variant).startsWith("ui");
  const hasError = Boolean(error);

  if (isFilterVariant) {
    const specializedSizes = {
      uiDropdownSearch: "dropdownSearch",
      uiOtp: "otp",
      uiPhone: "phone",
      uiGuestPhone: "guestPhone",
      uiChat: "chat",
      uiSupportReply: "supportReply",
      uiCheckbox: "checkbox",
      uiRadio: "radio",
      uiAddressRadio: "addressRadio",
      uiCancelTextarea: "cancelTextarea",
      uiQuantity: "quantityField",
      uiTextarea: "textarea",
      uiPriceRange: "priceRange",
      uiCompactSearch: "compactSearch",
      uiHeaderSearch: "headerSearch",
    };
    const noSize = String(variant).startsWith("filter") || variant === "uiHidden";
    const resolvedSize = specializedSizes[variant] || size;

    return cn(
      inputVariants[variant] ?? "",
      noSize ? "" : (inputSizes[resolvedSize] ?? inputSizes.md),
      className,
    );
  }

  const errorClasses = hasError
    ? "border-red-400 text-red-900 placeholder:text-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
    : "";

  return cn(
    !isUnstyled && inputBaseClasses,
    !isUnstyled && (inputVariants[variant] ?? inputVariants.default ?? ""),
    !isUnstyled && (inputSizes[size] ?? inputSizes.md ?? ""),
    !isUnstyled && (inputShapes[shape] ?? inputShapes.rounded),
    errorClasses,
    hasLeftIcon && "pl-10",
    hasRightIcon && "pr-10",
    className,
  );
};

