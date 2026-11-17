import React from "react";

export default function AccountTabHeader({
  icon: Icon,
  title,
  description,
  action,
  className = "",
}) {
  return (
    <header
      className={`flex flex-col gap-4 border-b border-[#E7D9B8] pb-4 sm:flex-row sm:items-start sm:justify-between ${className}`}
    >
      <div className="flex min-w-0 items-start gap-3">
        {Icon && (
          typeof Icon === "function" || typeof Icon === "object" ? (
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#F5E9C9] text-[#1B1D60] sm:size-11">
              <Icon size={21} />
            </span>
          ) : (
            Icon
          )
        )}

        <div className="min-w-0">
          <h2 className="text-base font-bold leading-6 text-[#171A3A] sm:text-lg lg:text-xl">
            {title}
          </h2>

          {description && (
            <p className="mt-0.5 text-xs font-normal leading-snug text-[#64708A] sm:text-sm">
              {description}
            </p>
          )}
        </div>
      </div>

      {action && <div className="shrink-0 w-full sm:w-auto">{action}</div>}
    </header>
  );
}

