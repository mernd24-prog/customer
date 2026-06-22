import { cn } from "../../../lib/utils";

export default function SidebarLayout({
  sidebar,
  children,
  sidebarWidth = "w-64",
  gap = "gap-6",
  className = "",
  sidebarClassName = "",
  contentClassName = "",
}) {
  return (
    <div className={cn("flex", gap, className)}>
      <div className={cn("hidden lg:block shrink-0", sidebarWidth, sidebarClassName)}>
        {sidebar}
      </div>
      <div className={cn("min-w-0 flex-1", contentClassName)}>
        {children}
      </div>
    </div>
  );
}
