import React from "react";
import { ArrowRight } from "lucide-react";
import { FaRegHeart } from "react-icons/fa";
import { cn } from "../../../utils/common";
import DynamicButton from "./button";

// Visual presets only.
// Standard dimensions come from DynamicButton.
export const buttonStyles = {
  primary:
    "border border-[var(--customer-navy)] bg-[var(--customer-navy)] text-white shadow-sm hover:border-[var(--customer-navy-dark)] hover:bg-[var(--customer-navy-dark)]",

  solid:
    "border border-[var(--customer-gold)] bg-[var(--customer-gold)] font-bold tracking-[0.5px] !text-[var(--customer-navy)] shadow-sm hover:border-[var(--customer-gold-dark)] hover:bg-[var(--customer-gold-dark)] transition-colors duration-200",

  secondary:
    "border border-[var(--customer-gold)] bg-[var(--customer-gold)] text-[var(--customer-navy)] shadow-sm hover:border-[var(--customer-gold-dark)] hover:bg-[var(--customer-gold-dark)]",

  primaryOutline:
    "border border-[var(--customer-navy)] bg-white text-[var(--customer-navy)] hover:bg-[var(--customer-navy)] hover:text-white",

  outline:
    "border border-[var(--customer-gold)] bg-white font-semibold text-[var(--customer-navy)] hover:border-[var(--customer-gold-dark)] hover:bg-[var(--customer-gold-soft)]",

  secondaryOutline:
    "border border-[var(--customer-gold)] bg-white text-[var(--customer-navy)] hover:border-[var(--customer-gold-dark)] hover:bg-[var(--customer-gold-soft)]",

  outlineLight:
    "border border-white/60 bg-transparent text-white hover:border-[var(--customer-gold)] hover:bg-[var(--customer-gold)]/10 hover:text-[var(--customer-gold)] active:border-[var(--customer-gold)] active:text-[var(--customer-gold)]",

  link:
    "border border-transparent bg-transparent p-0 text-[var(--customer-gold-dark)]",

  solidSmall:
    "border border-[var(--customer-navy)] bg-[var(--customer-navy)] font-semibold tracking-[0.5px] text-white hover:border-[var(--customer-navy-dark)] hover:bg-[var(--customer-navy-dark)]",

  outlineSmall:
    "border border-[var(--customer-navy)]/20 bg-white/70 font-semibold text-[var(--customer-navy)] transition-all duration-300 hover:bg-[var(--customer-navy)] hover:!text-white hover:border-[var(--customer-navy)] hover:shadow-md cursor-pointer",

  outlineSecondary:
    "border border-[var(--customer-gold)] bg-white font-bold text-[var(--customer-navy)] backdrop-blur transition-all duration-200 hover:bg-[var(--customer-gold-soft)] hover:border-[var(--customer-gold-dark)] hover:shadow-sm",

  solidLarge:
    "border border-[var(--customer-gold)] bg-[var(--customer-gold)] font-bold tracking-[0.5px] !text-[var(--customer-navy)] hover:bg-[var(--customer-gold-dark)] hover:border-[var(--customer-gold-dark)] transition-colors duration-200",

  solidBlue:
    "bg-[#3E4093] text-white font-semibold transition-colors duration-200 hover:bg-[#303276] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3E4093]/40",

  // Specialized buttons retain their own dimensions.
  headerGold:
    "h-[36px] min-w-[120px] rounded-[5px] bg-[#CE9F2D] px-3 text-xs leading-[16px] tracking-[0.5px] font-semibold text-[#03014D] hover:brightness-95 hover:shadow-md sm:h-[41px] sm:min-w-[153px] sm:px-4 sm:text-sm sm:leading-[20px] sm:tracking-[0.5px]",

  headerIcon:
    "group relative inline-flex h-8 w-8 min-[375px]:h-9 min-[375px]:w-9 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-full bg-transparent p-0 text-[#1B1D60] shadow-none transition-[color,background-color,border-color,box-shadow] duration-200 ease-in-out hover:bg-[#CE9F2D]/15 hover:text-[#CE9F2D] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CE9F2D]/40",

  headerIconOutlined: "border border-[#1B1D60]/20 bg-[#1B1D60]/5",

  pill:
    "inline-flex min-w-[110px] sm:min-w-[130px] h-[40px] sm:h-[38px] items-center justify-center gap-1 sm:gap-[15px] md:gap-2 rounded-lg bg-[#1F2430] bg-[linear-gradient(#CE9F2D,#CE9F2D)] px-4 sm:px-[34px] font-semibold leading-none text-white whitespace-nowrap transition-all duration-300 hover:bg-[linear-gradient(#bd9025,#bd9025)]",

  ghostPill:
    "rounded-full border border-[#CE9F2D4D] bg-[#CE9F2D4D] px-4 py-2 text-xs leading-[18px] tracking-[0.5px] font-semibold text-[#D6A323] hover:bg-black/60 xl:text-base xl:leading-[20px] xl:tracking-[0.5px]",

  textGold:
    "h-auto justify-start rounded-none bg-transparent p-0 md:text-base text-sm font-semibold text-[#8A6500] [&_svg]:text-[#CE9F2D] hover:text-[#7A5A00] [&_svg]:hover:text-[#bd9025]",

  textWhite:
    "h-auto justify-start rounded-none bg-transparent p-0 text-xs leading-[18px] tracking-[0.5px] font-medium text-white hover:text-white/80",

  iconCircle:
    "h-[40px] w-[40px] rounded-full border border-[#1B1D60] bg-[#1B1D600D] p-[10px] text-[#1B1D60] hover:border-[#1B1D60] hover:text-[#CE9F2D] focus:border-[#1B1D60] focus-visible:border-[#1B1D60] active:border-[#1B1D60]",

  continueShopping:
    "whitespace-nowrap rounded-lg border border-[#18156D]/20 bg-white/70 font-semibold text-[#3E4093] shadow-xs transition-all duration-200 ease-in-out hover:bg-[#3E4093] hover:!text-white hover:border-[#3E4093] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3E4093]/40 active:bg-[#2A2B66] active:!text-white disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer",

  register:
    "bg-white rounded-full border border-primary text-primary transition-all duration-300 ease-in-out",

  paginationArrow:
    "icon-button secondary disabled:opacity-50 disabled:cursor-not-allowed",

  paginationPage:
    "h-9 min-w-[36px] rounded-[6px] border px-2.5 text-sm font-medium transition-all duration-300 ease-in-out",

  orderAction:
    "min-h-9 border border-[#CE9F2D] bg-[#FFF9EA] px-3 py-2 text-xs font-semibold leading-none text-[#1B1D60] transition-colors hover:bg-[#F8EDCF] sm:text-sm",
};

// Default sizes for each preset.
export const buttonStyleSizes = {
  primary: "md",
  solid: "md",
  secondary: "md",
  primaryOutline: "md",
  outline: "md",
  secondaryOutline: "md",
  link: "none",
  solidSmall: "sm",
  outlineSmall: "md",
  outlineSecondary: "lg",
  outlineLight: "lg",
  solidLarge: "lg",
  continueShopping: "md",
  register: "md",
  orderAction: "sm",

  // Specialized designs manage their own dimensions.
  headerGold: "none",
  headerIcon: "none",
  pill: "none",
  ghostPill: "none",
  textGold: "none",
  textWhite: "none",
  iconCircle: "none",
  paginationArrow: "none",
  paginationPage: "none",
};

/**
 * Reusable loading indicator
 */
export const ButtonLoading = ({
  label = "Loading...",
  className = "",
}) => (
  <span
    className={cn(
      "inline-flex items-center justify-center gap-2",
      className,
    )}
  >
    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
    <span>{label}</span>
  </span>
);

/**
 * Reusable styled button
 */
export const StyledButton = ({
  buttonStyle,
  size,
  className = "",
  variant = "unstyled",
  children,
  ...props
}) => (
  <DynamicButton
    variant={variant}
    size={size ?? buttonStyleSizes[buttonStyle] ?? "md"}
    className={cn(buttonStyles[buttonStyle], className)}
    {...props}
  >
    {children}
  </DynamicButton>
);

// Specialized reusable buttons

export const PrimaryGradientButton = ({ children, ...props }) => (
  <DynamicButton
    variant="primary"
    size="lg"
    shape="circle"
    {...props}
  >
    {children}
  </DynamicButton>
);

export const DefaultButton = ({
  variant = "primary",
  size = "md",
  children,
  className = "",
  ...props
}) => (
  <DynamicButton
    variant={variant}
    size={size}
    className={cn(className)}
    {...props}
  >
    {children}
  </DynamicButton>
);

export const PrimaryButton = (props) => (
  <DefaultButton variant="primary" {...props} />
);

export const SecondaryButton = (props) => (
  <DefaultButton variant="secondary" {...props} />
);

export const PrimaryOutlineButton = (props) => (
  <DefaultButton variant="primaryOutline" {...props} />
);

export const SecondaryOutlineButton = (props) => (
  <DefaultButton variant="secondaryOutline" {...props} />
);

export const LinkButton = (props) => (
  <DefaultButton variant="link" size="none" {...props} />
);

export const HeaderIconButton = ({
  children,
  className = "",
  outlined = false,
  ...props
}) => (
  <StyledButton
    buttonStyle="headerIcon"
    className={cn(
      outlined && buttonStyles.headerIconOutlined,
      className,
    )}
    {...props}
  >
    {children}
  </StyledButton>
);

export const CategoryMoreButton = ({
  active = false,
  icon,
  label = "More",
  className = "",
  ...props
}) => (
  <div className="relative flex-1 flex items-stretch h-full min-w-[62px] sm:min-w-[88px] lg:min-w-[105px]">
    <DynamicButton
      variant="unstyled"
      size="none"
      className={cn(
        "group relative flex w-full h-full flex-col items-center justify-center px-1 sm:px-2 lg:px-3 pt-3 sm:pt-4 lg:pt-4.5 pb-2 sm:pb-2.5 lg:pb-3 transition-all duration-200 ease-in-out",
        active
          ? "bg-[linear-gradient(180deg,rgba(206,159,45,0)_0%,rgba(206,159,45,0.4)_100%)]"
          : "hover:bg-[linear-gradient(180deg,rgba(206,159,45,0)_0%,rgba(206,159,45,0.4)_100%)]",
        className,
      )}
      {...props}
    >
      <span className="flex h-[28px] w-[32px] sm:h-[42px] sm:w-[46px] lg:h-[46px] lg:w-[52px] items-center justify-center transition-transform duration-200">
        <img
          loading="lazy"
          width="400"
          height="400"
          src={icon}
          alt={label}
          className="h-full w-full object-contain"
        />
      </span>

      <span
        className={`mt-3 sm:mt-4 lg:mt-4.5 text-center text-xs sm:text-sm md:text-base lg:text-[15px] whitespace-normal 2xl:whitespace-nowrap leading-tight transition-colors duration-200 ${
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

export const ContinueShoppingButton = ({
  children = "Continue Shopping",
  className = "",
  rightIcon = <ArrowRight className="h-4 w-4 shrink-0" strokeWidth={2} />,
  ...props
}) => (
  <StyledButton
    buttonStyle="continueShopping"
    className={className}
    rightIcon={rightIcon}
    {...props}
  >
    {children}
  </StyledButton>
);

export const ActionShoppingButton = ContinueShoppingButton;
export const ShoppingActionButton = ContinueShoppingButton;

export const RegisterButton = ({ children, ...props }) => (
  <StyledButton buttonStyle="register" {...props}>
    {children}
  </StyledButton>
);

export const OutlineButton = ({
  children,
  className = "",
  rightIcon,
  ...props
}) => (
  <StyledButton
    buttonStyle="outlineSmall"
    className={className}
    rightIcon={rightIcon}
    {...props}
  >
    {children}
  </StyledButton>
);

export const RoundIconWithBg = (props) => (
  <DynamicButton
    size="icon"
    customWidth="45px"
    customHeight="45px"
    className="bg-primary text-white rounded-full"
    {...props}
  >
    <FaRegHeart />
  </DynamicButton>
);

export const ButtonWithIcon = ({
  children,
  icon,
  ...props
}) => (
  <DynamicButton
    size="xl"
    customColor="var(--customer-navy)"
    {...props}
  >
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
    size="none"
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

/**
 * Standardized action button for Order cards, tracking, reviews, and documents
 */
export const OrderActionButton = React.forwardRef(
  (
    {
      children,
      className = "",
      size = "sm",
      shape = "rounded",
      variant = "unstyled",
      loading,
      isLoading,
      ...props
    },
    ref,
  ) => (
    <DynamicButton
      ref={ref}
      variant={variant}
      size={size}
      shape={shape}
      isLoading={isLoading || loading}
      className={cn(
        "min-h-9 border border-[#CE9F2D] bg-[#FFF9EA] px-3 py-2 text-xs font-semibold leading-none !text-[#1B1D60] no-underline transition-colors hover:bg-[#F8EDCF] hover:!text-[#1B1D60] hover:no-underline focus:!text-[#1B1D60] active:!text-[#1B1D60] visited:!text-[#1B1D60] sm:text-sm",
        className,
      )}
      {...props}
    >
      {children}
    </DynamicButton>
  ),
);
OrderActionButton.displayName = "OrderActionButton";

