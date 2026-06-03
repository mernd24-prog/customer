import React from "react";
import { FaRegHeart } from "react-icons/fa";
import DynamicButton from "./button";

const buttonStyles = {
  solidSmall:
    "h-[35px] rounded-[6px] bg-[#CE9F2D] px-[14px] py-[7px] text-[16px] font-semibold text-[#1F2430] hover:bg-[#bd9025]",
  outlineSmall:
    "inline-flex h-[40px] sm:h-[45px] items-center justify-center gap-[10px] rounded-[10px] border border-[#3E409380] bg-transparent px-4 sm:px-5 py-[10px] text-[16px] sm:text-[18px] font-semibold leading-[100%] text-[#3E4093] transition-all duration-300 hover:border-[#CE9F2D] hover:bg-[#CE9F2D1A]",
  outlineLight:
    "border border-white/50 bg-transparent text-white hover:bg-white/10",
  solidLarge:
    "h-[48px] rounded-[6px] bg-[#CE9F2D] px-[22px] py-[10px] text-[16px] font-semibold text-[#1F2430] hover:bg-[#bd9025]",
  headerGold:
    "h-[36px] min-h-[36px] min-w-[120px] rounded-[5px] bg-[#CE9F2D] px-3 text-[13px] font-semibold text-[#03014D] hover:brightness-95 hover:shadow-md sm:h-[41px] sm:min-h-[41px] sm:min-w-[153px] sm:px-4 sm:text-[16px]",
  headerIcon:
    "group relative h-10 w-10 rounded-full border border-[var(--customer-border)] bg-white p-0 hover:border-[var(--customer-gold)] hover:bg-[var(--customer-gold-soft)]",
  pill:
    "inline-flex min-w-[110px] sm:min-w-[130px] h-[36px] sm:h-[40px] items-center justify-center gap-2 sm:gap-[15px] md:gap-0 rounded-full bg-[#CE9F2D] px-4 sm:px-[25px] py-2 text-[14px] sm:text-[15px] font-semibold leading-none text-white whitespace-nowrap transition-all duration-300 hover:bg-[#bd9025]",
  ghostPill:
    "rounded-full border border-[#CE9F2D4D] bg-[#CE9F2D4D] px-4 py-2 text-sm font-semibold text-[#D6A323] hover:bg-black/60 xl:text-base",
  textGold:
    "h-auto justify-start rounded-none bg-transparent p-0 text-[16px] font-semibold text-[#CE9F2D] hover:text-[#bd9025]",
  textWhite:
    "h-auto justify-start rounded-none bg-transparent p-0 text-sm font-medium text-white hover:text-white/80",
  iconCircle:
    "h-[40px] w-[40px] rounded-full border border-[#1B1D6099] bg-[#1B1D600D] p-[10px] text-[#1B1D60] hover:border-[#CE9F2D] hover:text-[#CE9F2D]",
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
    className={`${buttonStyles.outlineLight} ${className}`}
    {...props}
  >
    {children}
  </DynamicButton>
);

export const SolidLargeButton = ({ children, className = "", ...props }) => (
  <DynamicButton
    variant="unstyled"
    className={`${buttonStyles.solidLarge} ${className}`}
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

export const PriceButton = ({
  currentPrice,
  originalPrice,
  ...props
}) => (
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
