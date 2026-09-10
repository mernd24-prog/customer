import React from "react";
import { FaRegHeart } from "react-icons/fa";
import { cn } from "../../../utils/common";
import DynamicButton from "./button";

const buttonStyles = {
  solidSmall:
    "h-[35px] rounded-[6px] bg-[#1F2430] bg-[linear-gradient(#CE9F2D,#CE9F2D)] px-[14px] py-[7px] text-[13px] leading-[20px] tracking-[0.5px] font-semibold text-white hover:bg-[linear-gradient(#bd9025,#bd9025)]",

  outlineSmall:
    "inline-flex h-[42px] px-4 items-center justify-center gap-2 rounded-[10px] border border-[#3E4093] bg-transparent text-sm lg:text-base font-semibold text-[#3E4093] transition-all duration-300 hover:bg-[#3E4093] hover:text-white hover:border-[#3E4093] hover:shadow-md  cursor-pointer",

  outlineLight:
    "border border-white/50 bg-transparent text-white hover:bg-white/10",
  solidLarge:
    "h-[48px] rounded-[6px] bg-[#1F2430] bg-[linear-gradient(#CE9F2D,#CE9F2D)] px-[22px] py-[10px] text-[13px] leading-[20px] tracking-[0.5px] font-semibold text-white hover:bg-[linear-gradient(#bd9025,#bd9025)]",
  headerGold:
    "h-[36px] min-w-[120px] rounded-[5px] bg-[#CE9F2D] px-3 text-[11px] leading-[16px] tracking-[0.5px] font-semibold text-[#03014D] hover:brightness-95 hover:shadow-md sm:h-[41px] sm:min-w-[153px] sm:px-4 sm:text-[13px] sm:leading-[20px] sm:tracking-[0.5px]",
  headerIcon:
    "group relative h-10 w-10 rounded-full bg-transparent p-0 shadow-none",

  pill: "inline-flex min-w-[110px]  sm:min-w-[130px] h-[40px] sm:h-[38px] items-center justify-center  gap-1 sm:gap-[15px] md:gap-2 rounded-full bg-[#1F2430] bg-[linear-gradient(#CE9F2D,#CE9F2D)] px-4 sm:px-[34px]    font-semibold leading-none text-white whitespace-nowrap transition-all duration-300 hover:bg-[linear-gradient(#bd9025,#bd9025)]",

  ghostPill:
    "rounded-full border border-[#CE9F2D4D] bg-[#CE9F2D4D] px-4 py-2 text-[12px] leading-[18px] tracking-[0.5px] font-semibold text-[#D6A323] hover:bg-black/60 xl:text-[14px] xl:leading-[20px] xl:tracking-[0.5px]",
  textGold:
    "h-auto  justify-start rounded-none bg-transparent p-0  md:text-base text-sm font-semibold text-[#8A6500] [&_svg]:text-[#CE9F2D] hover:text-[#7A5A00] [&_svg]:hover:text-[#bd9025]",
  textWhite:
    "h-auto justify-start rounded-none bg-transparent p-0 text-[12px] leading-[18px] tracking-[0.5px] font-medium text-white hover:text-white/80",
  iconCircle:
    "h-[40px] w-[40px] rounded-full border border-[#DC2626] bg-[#1B1D600D] p-[10px] text-[#1B1D60] hover:border-[#DC2626] hover:text-[#CE9F2D] text-[#CE9F2D]",
  categoryMore:
    "group flex h-auto min-h-0 min-w-[80px] flex-col items-center rounded-md bg-transparent px-0 py-0 text-inherit shadow-none outline-none transition-all duration-300 ease-in-out hover:bg-transparent focus-visible:ring-2 focus-visible:ring-[var(--customer-gold)]/40 focus-visible:ring-offset-2 sm:min-w-[100px] lg:min-w-[140px]",
  continueShopping:
    "mx-auto mt-6 flex items-center justify-center h-[42px] w-full max-w-[210px] rounded-full bg-gradient-to-r from-[#B8891F] to-[#CE9F2D] px-5 text-[13px] font-bold text-[#1B1D60] shadow-sm transition-all duration-300 hover:from-[#3E4093] hover:to-[#1B1D60] hover:text-white hover:shadow-lg hover:-translate-y-0.5 active:scale-95 cursor-pointer sm:h-[52px] sm:max-w-[240px] sm:px-8 sm:text-[15px]",
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
    <div className="relative flex-1 flex items-stretch h-full min-w-[62px] sm:min-w-[88px] lg:min-w-[105px]">
      <DynamicButton
        variant="unstyled"
        className={cn(
          "group relative flex w-full h-full flex-col items-center justify-center px-1 sm:px-2 lg:px-3 pt-3 sm:pt-4 lg:pt-4.5 pb-2 sm:pb-2.5 lg:pb-3 transition-all duration-200 ease-in-out",
          active
            ? "bg-[linear-gradient(180deg,rgba(206,159,45,0)_0%,rgba(206,159,45,0.4)_100%)]"
            : "hover:bg-[linear-gradient(180deg,rgba(206,159,45,0)_0%,rgba(206,159,45,0.4)_100%)]",
          className
        )}
        {...props}
      >
        {/* ICON */}
        <span className="flex h-[28px] w-[32px] sm:h-[42px] sm:w-[46px] lg:h-[46px] lg:w-[52px] items-center justify-center transition-transform duration-200 group-hover:scale-105">
          <img
            loading="lazy"
            width="400"
            height="400"
            src={icon}
            alt={label}
            className="h-full w-full object-contain"
          />
        </span>

        {/* LABEL */}
        <span
          className={`mt-3 sm:mt-4 lg:mt-4.5 text-center text-[11px] sm:text-[13px] md:text-[14px] lg:text-[15px] whitespace-normal 2xl:whitespace-nowrap leading-tight transition-colors duration-200 ${
            active
              ? "font-bold text-[#1E204A]"
              : "font-semibold text-[#2D2D2D] group-hover:text-[#1E204A]"
          }`}
        >
          {label}
        </span>

        {active && (
          <div className="absolute bottom-0 left-0 right-0 h-[3px] sm:h-[4px] bg-[#2D347D]" />
        )}
      </DynamicButton>
    </div>
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
