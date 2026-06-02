import React from "react";
import DynamicButton from "./button";
import { FaRegHeart } from "react-icons/fa";

export const PrimaryGradientButton = ({ children, ...props }) => (
  <DynamicButton variant="primary" size="lg" shape="circle" {...props}>
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
