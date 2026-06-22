import { cn } from "../../../lib/utils";

export default function Container({
  as: Component = "div",
  size = "default",
  className = "",
  children,
  ...props
}) {
  const sizeMap = {
    sm: "mx-auto max-w-3xl px-4 sm:px-6",
    default: "mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8",
    lg: "mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10",
    full: "w-full px-4 sm:px-6",
  };

  return (
    <Component className={cn(sizeMap[size] || sizeMap.default, className)} {...props}>
      {children}
    </Component>
  );
}
