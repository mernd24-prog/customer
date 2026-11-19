import { cn } from "../../../utils/common";

export const sharedInputVariants = {
  default:
    "rounded-lg border border-[#1B1D60]/20 bg-[#F4F4F8] text-[#1B1D60] placeholder:text-[#8C8E9E] transition-colors duration-200 hover:border-[#1B1D60]/45 hover:bg-[#ECECF2] focus:border-[#CE9F2D] focus:outline-none focus:ring-2 focus:ring-[#CE9F2D]/20 disabled:bg-gray-50 disabled:text-[#6F7480]",
  quantity:
    "rounded-lg border border-[#1B1D60]/20 bg-[#F4F4F8] text-[#1B1D60] placeholder:text-[#8C8E9E] transition-colors duration-200 hover:border-[#1B1D60]/45 hover:bg-[#ECECF2] focus:border-[#CE9F2D] focus:outline-none focus:ring-2 focus:ring-[#CE9F2D]/20 disabled:bg-gray-50 disabled:text-[#6F7480]",
  cart:
    "rounded-lg border border-[#1B1D60]/20 bg-[#F8F5EE] text-[#1B1D60] placeholder:text-[#8C8E9E] transition-colors duration-200 hover:border-[#1B1D60]/45 hover:bg-[#F3EDE0] focus:border-[#CE9F2D] focus:outline-none focus:ring-2 focus:ring-[#CE9F2D]/20 disabled:bg-gray-50 disabled:text-[#6F7480]",
};

export const resolveInputClasses = ({ variant = "default", className = "" }) =>
  cn(
    "min-w-0 outline-none ring-0",
    sharedInputVariants[variant] ?? sharedInputVariants.default,
    className,
  );

export default sharedInputVariants;
