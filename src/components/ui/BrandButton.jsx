const Button = ({
  children,
  label,
  onClick,
  type = "button",
  variant = "primary",
  fullWidth = false,
  rounded = false,
  disabled = false,
  className = "",
  bgColor,
  size = "md",
  borderColor,
  textColor,
  hoverBgColor,
  hoverTextColor,
  icon,
  ...rest
}) => {
  const sizeStyles = {
    sm: "text-xs min-h-[28px]",
    md: "text-sm xl:text-base min-h-[36px]",
    lg: "text-base xl:text-xl min-h-[50px]",
  };

  const baseStyles = `${sizeStyles[size]} transition-all duration-200 flex items-center justify-center gap-2 font-montserrat cursor-pointer font-medium`;

  const width = fullWidth ? "w-full" : "";
  const borderRadius = rounded ? "rounded-full" : "rounded-sm";
  const focus = "focus:outline-none focus:ring-2 focus:ring-[#BF9B53]";

  const variantStyles = {
    primary:
      "bg-[#BF9B53] hover:bg-[#a6813f] text-white border-none font-montserrat",
    gradient:
      "bg-gradient-to-l from-accent to-primary text-white rounded-full",
    secondary:
      "bg-[#F3F4F6] hover:bg-[#BF9B53] text-gray-700 border-2 border-[#BF9B53]",
    google: "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100",
  };

  const customStyles =
    variant === "custom"
      ? {
          backgroundColor: bgColor || "transparent",
          border: borderColor ? `1px solid ${borderColor}` : "none",
          color: textColor || "#000",
        }
      : {};

  const handleMouseEnter = (e) => {
    if (variant === "custom" && hoverBgColor) {
      e.currentTarget.style.backgroundColor = hoverBgColor;
    }
    if (variant === "custom" && hoverTextColor) {
      e.currentTarget.style.color = hoverTextColor;
    }
  };

  const handleMouseLeave = (e) => {
    if (variant === "custom") {
      e.currentTarget.style.backgroundColor = bgColor || "transparent";
      e.currentTarget.style.color = textColor || "#000";
    }
  };

  const finalStyles = `${baseStyles} ${width} ${borderRadius} ${focus} ${
    disabled
      ? "bg-gray-300 cursor-not-allowed text-gray-500 border-none"
      : variantStyles[variant]
  } ${className}`;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={finalStyles}
      style={customStyles}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...rest}
    >
      {icon && <span className="flex items-center">{icon}</span>}
      {children || label}
    </button>
  );
};

export default Button;
