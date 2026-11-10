
import { useState } from "react";
import { Link } from "react-router-dom";
import { IoIosArrowForward } from "react-icons/io";
import { Copy, Check } from "lucide-react";

import { cn } from "../../../utils/common";
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
  truncateLimit = 80,
  rightContent,
  homeIconSize,
  homeIconClassName = "",
  isDark = false,
  dark = false,
  copyLastItem = false,
  copyValue = "",
  lastItemOnNewLineMobile = false,
}) {
  const [copied, setCopied] = useState(false);

  const isCompact = linkClassName.includes("text-xs");
  const resolvedHomeSize = homeIconSize || (isCompact ? 13 : 16);

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
      notify.success("Order number copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      notify.error("Failed to copy Order number.");
    }
  };

  return (
    <nav
      className={cn(
        "mb-2 flex w-full min-w-0 flex-nowrap items-center gap-x-1.5 overflow-hidden whitespace-nowrap pl-0 pr-2 py-1 sm:pr-3 sm:py-1.5",
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

        const label = String(item?.label || "");

        return (
          <span
            key={`${label}-${index}`}
            className={cn(
              "inline-flex items-center gap-1.5",
              isLast
                ? "min-w-0 flex-1 overflow-hidden"
                : "min-w-0 shrink-0",
            )}
          >
            {index > 0 && (
              <IoIosArrowForward
                className={cn(
                  "h-3.5 w-3.5 shrink-0",
                  isDarkBg ? "text-white/70" : "text-[#2E2E2E]",
                  separatorClassName,
                )}
                aria-hidden="true"
              />
            )}

            {item.href && !isLast ? (
              <Link
                to={item.href}
                title={label}
                className={cn(
                  "group inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap font-medium text-xs leading-tight text-[#2E2E2E] transition-colors duration-200 hover:text-[#CE9F2D] sm:text-sm lg:text-base",
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

                <span className={isHome ? "hidden sm:inline" : "inline"}>
                  {label}
                </span>
              </Link>
            ) : (
              <span
                title={label}
                className={cn(
                  "inline-flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden font-medium text-xs leading-tight text-[#8A6500] sm:text-sm lg:text-base",
                  currentClassName,
                )}
              >
                {isHome && (
                  <HomeIcon
                    className={cn(
                      "shrink-0",
                      isDarkBg ? "text-white" : "text-[#201B78]",
                      homeIconClassName,
                    )}
                    size={resolvedHomeSize}
                  />
                )}

                {item.icon && !isHome && (
                  <span className="shrink-0">{item.icon}</span>
                )}

                <span className="min-w-0 flex-1 truncate">
                  {label}
                </span>

                {isLast && copyLastItem && copyValue && (
                  <button
                    type="button"
                    onClick={handleCopy}
                    title="Copy Order number"
                    aria-label="Copy Order number"
                    className="inline-flex shrink-0 items-center justify-center rounded p-1 text-[#2E2E2E] transition-colors hover:text-[#CE9F2D]"
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
              </span>
            )}
          </span>
        );
      })}

      {rightContent && (
        <span className="ml-auto inline-flex shrink-0 items-center">
          {rightContent}
        </span>
      )}
    </nav>
  );
}
