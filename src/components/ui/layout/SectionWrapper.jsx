import { cn } from "../../../utils/common";

export default function SectionWrapper({
  as: Component = "section",
  containerClassName = "customer-container",
  className = "",
  children,
  ...props
}) {
  return (
    <Component className={cn(containerClassName, className)} {...props}>
      {children}
    </Component>
  );
}
