import React from "react";
import { useEffect, useRef, useState } from "react";

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
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mq.matches);
    const handler = (e) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const sidebarStyle =
    isDesktop && !stickyMain
      ? {
          position: "sticky",
          top: stickyOffset,
          alignSelf: "flex-start",
          height: "max-content",
          zIndex: 10,
        }
      : { alignSelf: "flex-start" };

  const mainStyle =
    isDesktop && stickyMain
      ? {
          position: "sticky",
          top: stickyOffset,
          alignSelf: "flex-start",
          height: "max-content",
          zIndex: 10,
        }
      : {};

  const sidebar = (
    <div className={sidebarClass} style={sidebarStyle}>
      {sidebarContent}
    </div>
  );

  const main = (
    <div className={mainClass} style={mainStyle}>
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
