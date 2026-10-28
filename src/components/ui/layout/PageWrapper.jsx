import { cn } from "../../../utils/common";

export default function PageWrapper({
  as: Component = "main",
  className = "",
  containerClassName = "customer-container",
  padding = "py-6 sm:py-8 lg:py-10",
  children,
  ...props
}) {
  return (
    <Component {...props}>
      <div className={cn(containerClassName, padding, className)}>
        {children}
      </div>
    </Component>
  );
}
