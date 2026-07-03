import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export default function NeedHelpPanel({
  title = "Need Help ?",
  items = [],
  className = "",
  sticky = false,

  // only header appearance changes
  headerStyle = "plain",
}) {
  const hasColoredHeader = headerStyle === "colored";

  return (
    <aside
      className={`h-fit overflow-hidden rounded-xl border border-[#E7D9B8] bg-white ${
        sticky ? "lg:sticky lg:top-28" : ""
      } ${className}`}
    >
      {/* Header */}
      <div
        className={
          hasColoredHeader
            ? "bg-[#F7EED8] px-5 py-4"
            : "bg-white px-6 pt-6 pb-2"
        }
      >
        <h2
          className={
            hasColoredHeader
              ? "text-lg font-bold text-[#2E2E2E]"
              : "text-2xl font-bold text-ink"
          }
        >
          {title}
        </h2>
      </div>

      {/* Items */}
      <div
        className={
          hasColoredHeader
            ? "divide-y divide-[#EFE5D2] px-5"
            : "mx-6 divide-y divide-[#EFE5D2]"
        }
      >
        {items.map((item, index) => {
          const Icon = item.icon;

          return (
            <Link
              key={`${item.title}-${index}`}
              to={item.path || "/contact"}
              className="flex min-w-0 items-center gap-3 py-5"
            >
              {/* Icon */}
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#1B1D6099] bg-[#F3F3F7] text-[#25247B]">
                {Icon && (
                  <Icon
                    size={18}
                    className="text-[#25247B]"
                  />
                )}
              </span>

              {/* Text */}
              <span className="min-w-0 flex-1">
                <span className="block break-words text-base font-semibold leading-5 text-[#1B1D60]">
                  {item.title}
                </span>

                {item.description && (
                  <span className="mt-1 block text-sm font-medium leading-5 text-[#2E2E2E]">
                    {item.description}
                  </span>
                )}
              </span>

              {/* Arrow */}
              {item.showArrow !== false && (
                <ChevronRight
                  size={17}
                  className="shrink-0 text-[#25247B]"
                />
              )}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}