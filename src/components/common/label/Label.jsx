import React from "react";
 
const variants = {
  seasonSale:
    "border border-[#CE9F2D4D] bg-[#CE9F2D1A] text-[#CE9F2D] font-bold uppercase tracking-[0.6px]",
 
  outline:
    "border border-[#E8B84B] bg-white text-[#CE9F2D] font-semibold",
 
  featured:
    "bg-[#CE9F2D] text-white font-semibold",
 
  success:
    "bg-[#E8F5E8] text-[#228B22] font-semibold",
 
  bestseller:
    "bg-[#1B1D60] text-white font-semibold",

   imageLabel:
  "rounded-[25px] border border-[#FFFFFF80] bg-[#FFFFFF4D] text-white font-medium backdrop-blur-[8px]"
};
 
export default function Label({
  children,
  variant = "outline",
  leftIcon,
  className,
}) {
  return (
    <span
      className={`
        inline-flex items-center gap-1 rounded-full whitespace-nowrap
        
        px-3 py-1
        text-[10px]
 
        sm:px-4 sm:py-[5px]
        sm:text-[11px]
 
        md:px-[15px] md:py-[5px]
        md:text-[12px]
 
        lg:text-[14px]
 
        ${variants[variant]}
        ${className ?? ""}
      `}
    >
      {leftIcon && (
        <span className="flex-shrink-0">
          {leftIcon}
        </span>
      )}
 
      {children}
    </span>
  );
}