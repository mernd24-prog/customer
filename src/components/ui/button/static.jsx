import React from "react";
import { FaRegHeart } from "react-icons/fa";
import { cn } from "../../../utils/common";
import DynamicButton from "./button";

const buttonStyles = {
  solidSmall:
    "h-[35px] rounded-[6px] bg-[#CE9F2D] px-[14px] py-[7px] text-[13px] leading-[20px] tracking-[0.5px] font-semibold text-[#1F2430] hover:bg-[#bd9025]",

  outlineSmall:
    "inline-flex h-fit py-3 items-center justify-center gap-[1px] rounded-[10px] border border-[#3E409380] bg-transparent    text-sm lg:text-base font-semibold leading-none tracking-normal align-middle text-[#3E4093] transition-all duration-300 ",

  outlineLight:
    "border border-white/50 bg-transparent text-white hover:bg-white/10",
  solidLarge:
    "h-[48px] rounded-[6px] bg-[#CE9F2D] px-[22px] py-[10px] text-[13px] leading-[20px] tracking-[0.5px] font-semibold text-[#1F2430] hover:bg-[#bd9025]",
  headerGold:
    "h-[36px] min-w-[120px] rounded-[5px] bg-[#CE9F2D] px-3 text-[11px] leading-[16px] tracking-[0.5px] font-semibold text-[#03014D] hover:brightness-95 hover:shadow-md sm:h-[41px] sm:min-w-[153px] sm:px-4 sm:text-[13px] sm:leading-[20px] sm:tracking-[0.5px]",
  headerIcon:
    "group relative h-10 w-10 rounded-full bg-transparent p-0 shadow-none",

  pill: "inline-flex min-w-[110px]  sm:min-w-[130px] h-[40px] sm:h-[38px] items-center justify-center  gap-1 sm:gap-[15px] md:gap-2 rounded-full bg-[#CE9F2D] px-4 sm:px-[34px]    font-semibold leading-none text-[#1F2430] whitespace-nowrap transition-all duration-300 hover:bg-[#bd9025]",

  ghostPill:
    "rounded-full border border-[#CE9F2D4D] bg-[#CE9F2D4D] px-4 py-2 text-[12px] leading-[18px] tracking-[0.5px] font-semibold text-[#8C6710] hover:bg-black/60 hover:text-white xl:text-[14px] xl:leading-[20px] xl:tracking-[0.5px]",
  textGold:
    "h-auto  justify-start rounded-none bg-transparent p-0  md:text-base text-sm font-semibold text-[#8C6710] hover:text-[#72540d]",
  textWhite:
    "h-auto justify-start rounded-none bg-transparent p-0 text-[12px] leading-[18px] tracking-[0.5px] font-medium text-white hover:text-white/80",
  iconCircle:
    "h-[40px] w-[40px] rounded-full border border-[#DC2626] bg-[#1B1D600D] p-[10px] text-[#1B1D60] hover:border-[#DC2626] hover:text-[#CE9F2D] text-[#CE9F2D]",
  categoryMore:
    "group flex h-auto min-h-0 min-w-[80px] flex-col items-center rounded-md bg-transparent px-0 py-0 text-inherit shadow-none outline-none transition-all duration-300 ease-in-out hover:bg-transparent focus-visible:ring-2 focus-visible:ring-[var(--customer-gold)]/40 focus-visible:ring-offset-2 sm:min-w-[100px] lg:min-w-[140px]",
  continueShopping:
    "mx-auto mt-6 h-[42px] w-full max-w-[210px] rounded-full bg-gradient-to-r from-[#B8891F] to-[#CE9F2D] px-5 text-[13px] font-bold text-[#1B1D60] shadow-sm transition-all duration-300 hover:shadow-md sm:h-[52px] sm:max-w-[240px] sm:px-8 sm:text-[15px]",
};

export const PrimaryGradientButton = ({ children, ...props }) => (
  <DynamicButton variant="primary" size="lg" shape="circle" {...props}>
    {children}
  </DynamicButton>
);

export const SolidSmallButton = ({ children, className = "", ...props }) => (
  <DynamicButton
    variant="unstyled"
    className={`${buttonStyles.solidSmall} ${className}`}
    {...props}
  >
    {children}
  </DynamicButton>
);

export const OutlineSmallButton = ({ children, className = "", ...props }) => (
  <DynamicButton
    variant="unstyled"
    className={`${buttonStyles.outlineSmall} ${className}`}
    {...props}
  >
    {children}
  </DynamicButton>
);

export const OutlineLightButton = ({ children, className = "", ...props }) => (
  <DynamicButton
    variant="unstyled"
    className={cn(buttonStyles.outlineLight, className)}
    {...props}
  >
    {children}
  </DynamicButton>
);

export const SolidLargeButton = ({ children, className = "", ...props }) => (
  <DynamicButton
    variant="unstyled"
    className={cn(buttonStyles.solidLarge, className)}
    {...props}
  >
    {children}
  </DynamicButton>
);

export const HeaderGoldButton = ({ children, className = "", ...props }) => (
  <DynamicButton
    variant="unstyled"
    className={`${buttonStyles.headerGold} ${className}`}
    {...props}
  >
    {children}
  </DynamicButton>
);

export const HeaderIconButton = ({ children, className = "", ...props }) => (
  <DynamicButton
    variant="unstyled"
    className={`${buttonStyles.headerIcon} ${className}`}
    {...props}
  >
    {children}
  </DynamicButton>
);

export const PillButton = ({ children, className = "", ...props }) => (
  <DynamicButton
    variant="unstyled"
    className={`${buttonStyles.pill} ${className}`}
    {...props}
  >
    {children}
  </DynamicButton>
);

export const GhostPillButton = ({ children, className = "", ...props }) => (
  <DynamicButton
    variant="unstyled"
    className={`${buttonStyles.ghostPill} ${className}`}
    {...props}
  >
    {children}
  </DynamicButton>
);

export const TextGoldButton = ({ children, className = "", ...props }) => (
  <DynamicButton
    variant="unstyled"
    className={`${buttonStyles.textGold} ${className}`}
    {...props}
  >
    {children}
  </DynamicButton>
);

export const TextWhiteButton = ({ children, className = "", ...props }) => (
  <DynamicButton
    variant="unstyled"
    className={`${buttonStyles.textWhite} ${className}`}
    {...props}
  >
    {children}
  </DynamicButton>
);

export const IconCircleButton = ({ children, className = "", ...props }) => (
  <DynamicButton
    variant="unstyled"
    className={`${buttonStyles.iconCircle} ${className}`}
    {...props}
  >
    {children}
  </DynamicButton>
);

export const CategoryMoreButton = ({
  active = false,
  icon,
  label = "More",
  className = "",
  ...props
}) => {
  return (
    <DynamicButton
      variant="unstyled"
      className={`${buttonStyles.categoryMore} ${className}`}
      {...props}
    >
      {/* ICON */}
      <span className="mx-auto flex h-[50px] w-[50px] items-center justify-center overflow-hidden rounded-full bg-[#FBCC39] p-1.5 shadow-sm transition-transform duration-300 ease-in-out group-hover:-translate-y-0.5 will-change-transform sm:h-[65px] sm:w-[65px] sm:p-2 lg:h-[75px] lg:w-[75px]">
        <img
          src={icon}
          alt={label}
          className="h-7 w-7 object-contain sm:h-9 sm:w-7 lg:h-9 lg:w-9"
        />
      </span>

      {/* LABEL */}
      <span
        className={`mt-1 line-clamp-1 w-full max-w-[80px] text-center text-[12px] leading-[18px] tracking-[0.5px] leading-none tracking-wide text-[#2E2E2E] sm:max-w-[100px] sm:text-[11px] sm:leading-[16px] sm:tracking-[0.5px] lg:mt-2 lg:max-w-[140px] lg:text-[18px] lg:leading-[26px] ${
          active ? "font-bold" : "font-medium"
        }`}
      >
        {label}
      </span>
    </DynamicButton>
  );
};

export const ContinueShoppingButton = ({
  children = "Continue Shopping",
  className = "",
  ...props
}) => (
  <DynamicButton
    variant="unstyled"
    className={cn(buttonStyles.continueShopping, className)}
    {...props}
  >
    {children}
  </DynamicButton>
);

export const RegisterButton = ({ children, ...props }) => (
  <DynamicButton
    className="bg-white rounded-full border border-primary text-primary transition-all duration-300 ease-in-out"
    {...props}
  >
    {children}
  </DynamicButton>
);

export const RoundIconWithBg = (props) => (
  <DynamicButton
    customWidth="45px"
    customHeight="45px"
    className="bg-primary text-white rounded-full"
    {...props}
  >
    <FaRegHeart />
  </DynamicButton>
);

export const ButtonWithIcon = ({ children, icon, ...props }) => (
  <DynamicButton size="xl" customColor="var(--customer-navy)" {...props}>
    {icon ? (
      <span className="flex gap-2 items-center">
        {icon}
        {children}
      </span>
    ) : (
      children
    )}
  </DynamicButton>
);

export const PriceButton = ({ currentPrice, originalPrice, ...props }) => (
  <DynamicButton
    variant="outline"
    shape="circle"
    className="whitespace-nowrap px-5 py-1.5 h-auto min-h-8"
    {...props}
  >
    <span className="flex items-center gap-2 font-bold text-black">
      {currentPrice}
      {originalPrice && (
        <span className="line-through decoration-gold-dark text-gold-dark text-sm font-normal">
          {originalPrice}
        </span>
      )}
    </span>
  </DynamicButton>
);
