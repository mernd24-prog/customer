import React from "react";

export default function StickySidebarLayout({
  mainContent,
  sidebarContent,
  sidebarPosition = "right",
  containerClass = "w-full flex flex-col lg:flex-row lg:items-stretch gap-4 lg:gap-8",
  sidebarClass = "w-full lg:w-[420px]",
  mainClass = "w-full flex min-w-0 flex-1 flex-col",
  stickyOffset = "calc(var(--customer-header-height, 95px) + 80px)",
  stickyMain = false,
}) {
  const sidebar = (
    <div
      className={sidebarClass}
      style={
        stickyMain
          ? { alignSelf: "flex-start" }
          : {
              position: "sticky",
              top: stickyOffset,
              alignSelf: "flex-start",
              height: "max-content",
              zIndex: 10,
            }
      }
    >
      {sidebarContent}
    </div>
  );

  const main = (
    <div
      className={mainClass}
      style={
        stickyMain
          ? {
              position: "sticky",
              top: stickyOffset,
              alignSelf: "flex-start",
              height: "max-content",
              zIndex: 10,
            }
          : {}
      }
    >
      {mainContent}
    </div>
  );

  return (
    <div className={`w-full ${containerClass} items-start`}>
      {sidebarPosition === "left" ? sidebar : main}
      {sidebarPosition === "left" ? main : sidebar}
    </div>
  );
}
