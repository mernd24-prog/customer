import { cn } from "../../../utils/classNames";

export default function PageWrapper({
  as: Component = "main",
  className = "",
  containerClassName = "w-container",
  padding = "py-6 sm:py-8",
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
