import { Link } from "react-router-dom";
import { cn } from "../../lib/utils";
import { IoIosArrowForward } from "react-icons/io";
import { getShowMoreText } from "../../utils/showMore";

export default function Breadcrumbs({
  items = [],
  className = "",
  linkClassName = "",
  currentClassName = "text-[#CE9F2D]",
  separatorClassName = "text-white",
  heading,

  // Breadcrumb truncation options
  truncateMode = "characters",
  truncateLimit = 30,
}) {
  return (
    <>
      <nav
        className={cn(
          "flex flex-wrap items-center gap-2 pb-3 text-[12px] font-normal leading-[20px] sm:gap-3 sm:text-[13px] lg:gap-[15px] lg:text-[14px] lg:leading-[23px]",
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
                    "font-medium text-[14px] sm:text-[16px] lg:text-[18px]",
                    linkClassName,
                  )}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  title={item.label}
                  className={cn(
                    "font-medium text-[14px] sm:text-[16px] lg:text-[18px]",
                    currentClassName,
                  )}
                >
                  {displayLabel}
                </span>
              )}

              {!isLast && (
                <IoIosArrowForward
                  className={separatorClassName}
                  aria-hidden="true"
                />
              )}
            </span>
          );
        })}
      </nav>

      {heading && (
        <h1 className="pb-3 pt-2 text-h2 font-black text-[#3F4095]">
          {heading}
        </h1>
      )}
    </>
  );
}
