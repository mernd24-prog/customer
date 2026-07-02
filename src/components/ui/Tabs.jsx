import React, { useEffect, useRef, useState } from "react";

export default function Tabs({
  tabs,
  activeTab,
  onChange,
  className = "",
  sticky = false,
}) {
  const anchorRef = useRef(null);
  const tabsRef = useRef(null);
  const [fixedStyle, setFixedStyle] = useState(null);
  const [tabsHeight, setTabsHeight] = useState(0);

  useEffect(() => {
    if (!sticky) return undefined;

    const updateStickyPosition = () => {
      const anchor = anchorRef.current;
      const tabsElement = tabsRef.current;
      if (!anchor || !tabsElement) return;

      const headerHeight =
        Number.parseFloat(
          window
            .getComputedStyle(document.documentElement)
            .getPropertyValue("--customer-header-height"),
        ) || 0;
      const anchorRect = anchor.getBoundingClientRect();
      const boundaryRect = anchor.parentElement?.getBoundingClientRect();
      const height = tabsElement.offsetHeight;
      const hasBoundarySpace = boundaryRect
        ? boundaryRect.bottom > headerHeight + height
        : true;
      const shouldFix = anchorRect.top <= headerHeight && hasBoundarySpace;

      setTabsHeight(height);
      setFixedStyle(
        shouldFix
          ? {
              left: `${anchorRect.left}px`,
              top: `${headerHeight}px`,
              width: `${anchorRect.width}px`,
            }
          : null,
      );
    };

    updateStickyPosition();
    window.addEventListener("scroll", updateStickyPosition, { passive: true });
    window.addEventListener("resize", updateStickyPosition);

    return () => {
      window.removeEventListener("scroll", updateStickyPosition);
      window.removeEventListener("resize", updateStickyPosition);
    };
  }, [sticky]);

  return (
    <div
      ref={anchorRef}
      className={`mb-6 ${className}`}
      style={fixedStyle ? { height: `${tabsHeight}px` } : undefined}
    >
      <div
        ref={tabsRef}
        className={`bg-white lg:py-2 ${
          fixedStyle ? "fixed z-40 py-2 shadow-md" : ""
        }`}
        style={fixedStyle || undefined}
      >
        <div className="no-scrollbar overflow-x-auto rounded-xl border border-[#E7D9B8] bg-white shadow-sm xl:rounded-[20px]">
          <div
            className="grid h-[58px] min-w-[440px] sm:h-[72px] sm:min-w-[520px] md:h-[90px] md:min-w-0 xl:h-[115px]"
            style={{
              gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))`,
            }}
          >
            {tabs.map((tab) => {
              const active = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onChange(tab.id)}
                  className="relative flex h-full items-center justify-center gap-1.5 px-1 min-[375px]:px-2 sm:gap-2"
                >
                  <span
                    className={`truncate font-sans font-semibold ${
                      active ? "text-[#1B1D60]" : "text-[#6B7280]"
                    } text-[12px] min-[375px]:text-[13px] min-[425px]:text-[14px] sm:text-[16px] md:text-[18px] lg:text-[20px] xl:text-[24px]`}
                  >
                    {tab.label}
                  </span>

                  {typeof tab.count !== "undefined" && (
                    <span
                      className={`flex items-center justify-center rounded-full text-[9px] font-semibold min-[375px]:text-[10px] lg:text-[16px] lg:h-[25px] lg:w-[40px] ${
                        active
                          ? "bg-[#FFEFC8] text-[#1B1D60]"
                          : "bg-[#EFEFF7] text-[#7A7A9D]"
                      } h-[16px] min-w-[16px] px-[5px] sm:h-[18px] sm:min-w-[18px]`}
                    >
                      {tab.count}
                    </span>
                  )}

                  {active && (
                    <span className="absolute bottom-0 left-0 h-[3px] w-full bg-[#1B1D60]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
