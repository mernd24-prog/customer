import { Link } from "react-router-dom";
import { cn } from "../../../utils/common";
import { IoIosArrowForward } from "react-icons/io";
import { getShowMoreText } from "../../../utils/showMore";

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
}) {
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
                    "font-medium text-[14px] sm:text-[16px] lg:text-[18px] leading-[100%] text-[#2E2E2E]",
                    linkClassName,
                  )}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  title={item.label}
                  className={cn(
                    "font-medium text-[14px] sm:text-[16px] lg:text-[18px] leading-[100%] text-[#8A6500]",
                    currentClassName,
                  )}
                >
                  {displayLabel}
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
