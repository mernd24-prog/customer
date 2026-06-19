import { Link } from "react-router-dom";
import { cn } from "../../utils/classNames";
import { IoIosArrowForward } from "react-icons/io";

export default function Breadcrumbs({ items = [], className = "" }) {
  return (
    <nav
      className={cn(
        "flex flex-wrap items-center gap-2 sm:gap-3 lg:gap-[15px] font-['DM_Sans'] text-[12px] sm:text-[13px] lg:text-[14px] font-normal leading-[20px] lg:leading-[23px]",
        className
      )}
      aria-label="Breadcrumb"
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span
            key={`${item.label}-${index}`}
            className="inline-flex items-center gap-1"
          >
            {item.href && !isLast ? (
              <Link
                to={item.href}
                className="font-medium text-[14px] sm:text-[16px] lg:text-[18px] leading-[100%] text-white"
              >
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-[14px] sm:text-[16px] lg:text-[18px] leading-[100%] text-[#CE9F2D]">
                {item.label}
              </span>
            )}
            {!isLast && <span><IoIosArrowForward className="text-white" /></span>}
          </span>
        );
      })}
    </nav>
  );
}
