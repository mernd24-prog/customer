import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, ChevronDown } from "lucide-react";

export default function NeedHelpPanel({
  title = "Need Help ?",
  items = [],
  className = "",
  href,
  sticky = false,
  headerStyle = "plain",
  expandedIndex: controlledExpandedIndex,
  onExpandedIndexChange,
}) {
  const hasColoredHeader = headerStyle === "colored";
  const [internalExpandedIndex, setInternalExpandedIndex] = useState(null);

  const isControlled = controlledExpandedIndex !== undefined;
  const expandedIndex = isControlled
    ? controlledExpandedIndex
    : internalExpandedIndex;
  const setExpandedIndex = isControlled
    ? onExpandedIndexChange
    : setInternalExpandedIndex;

  return (
    <aside
      className={`
        h-fit w-full
        overflow-hidden
        rounded-xl
        border  border-[#E7D9B8]
        bg-white
        ${sticky ? "lg:sticky lg:top-28" : ""}
        ${className} 
      `}
    >
      {/* Header */}
      <div
        className={
          hasColoredHeader
            ? "bg-[#F7EED8] px-5 py-4"
            : "bg-white px-6 pb-2 pt-6"
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
      <a></a>
      <div
        className={
          hasColoredHeader
            ? "divide-y  divide-[#EFE5D2] px-5"
            : "mx-6 divide-y divide-[#EFE5D2] "
        }
      >
        {items.map((item, index) => {
          const Icon = item.icon;

          const content = (
            <>
              {/* Icon */}
              <span
                className="
                  flex h-11 w-11 shrink-0 
                  items-center justify-center
                  rounded-full
                  border border-[#1B1D6099]
                  bg-[#F3F3F7]
                  text-[#25247B]
                "
              >
                {Icon && <Icon size={18} className="text-[#25247B]" />}
              </span>

              {/* Text */}
              <span className="min-w-0  flex-1 text-left">
                <span
                  className="
                    block
                    break-words
                    text-base
                    font-semibold
                    leading-5
                    text-[#1B1D60]
                    
                  "
                >
                  {item.title}
                </span>

                {item.description && (
                  <span
                    className="
                      mt-1 block
                      break-words
                      text-sm
                      font-medium
                      leading-5
                      text-[#2E2E2E]
                    "
                  >
                    {item.description}
                  </span>
                )}
              </span>

              {/* Arrow */}
              {item.showArrow !== false && !item.expandableContent && (
                <ChevronRight
                  size={17}
                  className="
                    shrink-0
                    text-[#25247B]
                  "
                />
              )}
              {item.expandableContent && (
                <ChevronDown
                  size={17}
                  className={`shrink-0 text-[#25247B] transition-transform duration-300 ${
                    expandedIndex === index ? "rotate-180" : "-rotate-90"
                  }`}
                />
              )}
            </>
          );

          return (
            <div key={`${item.title}-${index}`} className="flex flex-col">
              {item.onClick ? (
                <button
                  type="button"
                  onClick={item.onClick}
                  className="flex min-w-0 items-center gap-3 py-5 focus:outline-none w-full"
                >
                  {content}
                </button>
              ) : item.expandableContent ? (
                <button
                  type="button"
                  onClick={() =>
                    setExpandedIndex(expandedIndex === index ? null : index)
                  }
                  className="flex min-w-0 items-center gap-3 py-5 focus:outline-none w-full"
                >
                  {content}
                </button>
              ) : (
                <Link
                  to={item.path || "/contact"}
                  className="flex min-w-0 items-center gap-3 py-5"
                >
                  {content}
                </Link>
              )}

              {item.expandableContent && (
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    expandedIndex === index
                      ? "max-h-[1000px] opacity-100 pb-5"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  {item.expandableContent}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
