
import { useState } from "react";
import { Link } from "react-router-dom";
import { IoIosArrowForward } from "react-icons/io";
import { Copy, Check } from "lucide-react";

import { cn } from "../../../utils/common";
import { getShowMoreText } from "../../../utils/showMore";
import { notify } from "../../../utils/notify";
import { HomeIcon } from "../../../components/ui/icons";

export default function Breadcrumbs({
  items = [],
  className = "",
  linkClassName = "",
  currentClassName = "",
  separatorClassName = "",
  heading,
  truncateMode = "characters",
  truncateLimit = 40,
  rightContent,
  homeIconSize,
  homeIconClassName = "",
  isDark = false,
  dark = false,
  copyLastItem = false,
  copyValue = "",
}) {
  const [copied, setCopied] = useState(false);

  const isCompact =
    linkClassName.includes("text-xs") ||
    linkClassName.includes("text-[10px]") ||
    linkClassName.includes("text-[11px]") ||
    linkClassName.includes("text-[12px]");

  const resolvedHomeSize =
    homeIconSize || (isCompact ? 11 : 12);

  const isDarkBg =
    Boolean(isDark || dark) ||
    linkClassName.includes("text-white") ||
    linkClassName.includes("text-slate-100") ||
    linkClassName.includes("text-slate-200") ||
    linkClassName.includes("text-gray-100") ||
    linkClassName.includes("text-gray-200") ||
    linkClassName.includes("text-neutral-100") ||
    linkClassName.includes("text-zinc-100") ||
    className.includes("text-white") ||
    className.includes("dark");

  const resolvedHomeIconClass = cn(
    "shrink-0 transition-colors",
    isDarkBg
      ? "text-white group-hover:text-[#CE9F2D]"
      : "text-[#201B78] group-hover:text-[#CE9F2D]",
    homeIconClassName,
  );

  const handleCopy = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    const value = String(copyValue || "").trim();

    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);

      setCopied(true);
      notify.success("Order ID copied to clipboard!");

      setTimeout(() => setCopied(false), 2000);
    } catch {
      notify.error("Failed to copy Order ID.");
    }
  };

  return (
    <nav
      className={cn(
        "mb-2 flex flex-wrap items-center gap-x-0.5 gap-y-1 pl-0 pr-2 py-1 sm:pr-3 sm:py-1.5",
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

        const { preview, isTruncated } = getShowMoreText(
          item.label,
          {
            mode: truncateMode,
            limit: truncateLimit,
          },
        );

        const displayLabel =
          isLast && isTruncated
            ? `${preview}...`
            : item.label;

        const labelContent = (
          <>
            <span className="min-w-0">{displayLabel}</span>

            {isLast && copyLastItem && copyValue && (
              <button
                type="button"
                onClick={handleCopy}
                title="Copy Order ID"
                aria-label="Copy Order ID"
                className="inline-flex shrink-0 items-center justify-center rounded p-1 text-[#2E2E2E]"
              >
                {copied ? (
                  <Check
                    size={13}
                    className="text-emerald-600"
                  />
                ) : (
                  <Copy size={13} />
                )}
              </button>
            )}
          </>
        );

        return (
          <span
            key={`${item.label}-${index}`}
            className="inline-flex min-w-0 items-center gap-0.5"
          >
            {item.href && !isLast ? (
              <Link
                to={item.href}
                title={item.label}
                className={cn(
                  "group inline-flex items-center gap-1 font-medium text-[10px] leading-tight text-[#2E2E2E] transition-colors duration-200 hover:text-[#CE9F2D] sm:text-[11px] lg:text-[12px]",
                  linkClassName,
                )}
              >
                {isHome && (
                  <HomeIcon
                    className={resolvedHomeIconClass}
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
                  "inline-flex min-w-0 items-center gap-1 font-medium text-[10px] leading-tight text-[#8A6500] sm:text-[11px] lg:text-[12px]",
                  currentClassName,
                )}
              >
                {isHome && (
                  <HomeIcon
                    className={cn(
                      "shrink-0",
                      isDarkBg
                        ? "text-white"
                        : "text-[#201B78]",
                      homeIconClassName,
                    )}
                    size={resolvedHomeSize}
                  />
                )}

                {item.icon && !isHome && (
                  <span className="shrink-0">{item.icon}</span>
                )}

                {labelContent}
              </span>
            )}

            {!isLast && (
              <IoIosArrowForward
                className={cn(
                  "h-2.5 w-2.5 shrink-0",
                  isDarkBg
                    ? "text-white/70"
                    : "text-[#2E2E2E]",
                  separatorClassName,
                )}
                aria-hidden="true"
              />
            )}
          </span>
        );
      })}

      {rightContent}
    </nav>
  );
}

