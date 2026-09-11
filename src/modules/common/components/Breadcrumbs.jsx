import { Link } from "react-router-dom";
import { cn } from "../../../utils/common";
import { IoIosArrowForward } from "react-icons/io";
import { getShowMoreText } from "../../../utils/showMore";
import { HomeIcon } from "../../../components/ui/icons";

export default function Breadcrumbs({
  items = [],
  className = "",
  linkClassName = "",
  currentClassName = "",
  separatorClassName = "",
  heading,

  // Breadcrumb truncation options
  truncateMode = "characters",
  truncateLimit = 30,
  rightContent,
  homeIconSize,
}) {
  const isCompact =
    linkClassName.includes("text-xs") ||
    linkClassName.includes("text-[12px]") ||
    linkClassName.includes("text-[13px]");

  const defaultHomeSize = isCompact ? 16 : 19;
  const resolvedHomeSize = homeIconSize || defaultHomeSize;

  return (
    <>
      <nav
        className={cn(
          "mb-2 flex flex-wrap items-center gap-[10px] sm:gap-[12px] lg:gap-[15px]",
          className,
        )}
        aria-label="Breadcrumb"
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isHome =
            (index === 0 &&
              (String(item?.label || "").toLowerCase() === "home" ||
                item?.href === "/")) ||
            item?.isHome;

          // Truncate only the last breadcrumb
          const { preview, isTruncated } = getShowMoreText(item.label, {
            mode: truncateMode,
            limit: truncateLimit,
          });

          const displayLabel =
            isLast && isTruncated ? `${preview}...` : item.label;

          return (
            <span
              key={`${item.label}-${index}`}
              className="inline-flex min-w-0 items-center gap-1"
            >
              {item.href && !isLast ? (
                <Link
                  to={item.href}
                  title={item.label}
                  className={cn(
                    "inline-flex items-center gap-1.5 font-medium text-[14px] sm:text-[16px] lg:text-[18px] leading-[100%] text-[#2E2E2E] transition-colors duration-200 hover:text-[#CE9F2D]",
                    linkClassName,
                  )}
                >
                  {isHome && (
                    <HomeIcon
                      className="shrink-0 text-[#201B78] transition-colors"
                      size={resolvedHomeSize}
                    />
                  )}
                  {item.icon && !isHome && (
                    <span className="shrink-0">{item.icon}</span>
                  )}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <span
                  title={item.label}
                  className={cn(
                    "inline-flex items-center gap-1.5 font-medium text-[14px] sm:text-[16px] lg:text-[18px] leading-[100%] text-[#8A6500]",
                    currentClassName,
                  )}
                >
                  {isHome && (
                    <HomeIcon
                      className="shrink-0 text-[#201B78]"
                      size={resolvedHomeSize}
                    />
                  )}
                  {item.icon && !isHome && (
                    <span className="shrink-0">{item.icon}</span>
                  )}
                  <span>{displayLabel}</span>
                </span>
              )}

              {!isLast && (
                <IoIosArrowForward
                  className={cn("text-[#2E2E2E]", separatorClassName)}
                  aria-hidden="true"
                />
              )}
            </span>
          );
        })}
      </nav>

      {heading && (
        <div className="flex w-full flex-col items-start gap-4 lg:flex-row lg:items-center lg:justify-between">
          <h1 className="pb-3 pt-1 text-h2 font-black text-[#3F4095] lg:pb-6 lg:pt-2">
            {heading}
          </h1>
          {rightContent}
        </div>
      )}
    </>
  );
}
