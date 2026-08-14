import React from "react";
import { cn } from "../../../utils/common";

const variants = {
  seasonSale:
    "border border-[#CE9F2D4D] bg-[#CE9F2D1A] text-[#CE9F2D] font-bold uppercase tracking-[0.6px]",

  outline: "border border-[#E8B84B] bg-white text-[#CE9F2D] font-semibold",

  sectionLabel:
    "min-h-[28px] min-w-[83px] justify-center rounded-[50px] border border-[#E8B84B] bg-white px-[14px] py-[5px] text-[#CE9F2D]",

  featured: "bg-[#CE9F2D] text-white font-semibold",

  success: "bg-[#E8F5E8] text-[#228B22] font-semibold",

  bestseller: "bg-[#1B1D60] text-white font-semibold",

  outofStock: "bg-red-500 text-white font-semibold",

  imageLabel:
    "min-h-[31px] min-w-[77px] justify-center rounded-[25px] border border-[#CE9F2D] bg-[#CE9F2D] px-[15px] py-[5px] text-white font-bold shadow-md",
};

export default function Label({
  children,
  variant = "outline",
  leftIcon,
  className,
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center  gap-2 rounded-full whitespace-nowrap font-dm-sans align-middle",
        "px-3 py-1 text-[11px] leading-[16px] tracking-[0.5px] leading-none",
        "sm:text-[11px] sm:leading-[16px] sm:tracking-[0.5px]",
        "md:text-[12px] md:leading-[18px] md:tracking-[0.5px]",
        "lg:text-[14px]",
        variants[variant],
        className,
      )}
    >
      {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}

      {children}
    </span>
  );
}
