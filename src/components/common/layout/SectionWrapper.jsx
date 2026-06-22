import { cn } from "../../../lib/utils";

export default function SectionWrapper({
  as: Component = "section",
  containerClassName = "w-container",
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
