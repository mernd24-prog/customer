import React from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import DynamicButton from "../../../components/ui/button/button.jsx";

export function AccountMenuItem({
  item,
  variant = "desktop",
  onClick,
  active = false,
}) {
  const isMobile = variant === "mobile";

  return (
    <Link
      to={item.path}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`group flex w-full min-w-0 items-start gap-3.5 !rounded-none border-b border-[#04258626] transition-colors last:border-b-0 ${
        isMobile
          ? `p-3 ${active ? "bg-[#FFF9E9]" : "bg-white hover:bg-[#FFF9E9]"}`
          : `p-5 sm:p-6 ${active ? "bg-[#FFF9E9]" : "bg-white hover:bg-[#FFF9E9]"}`
      }`}
    >
      <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#FFC82E] text-[#1B1D60] sm:size-11">
        {typeof item.icon === "string" ? (
          <img
            loading="lazy"
            width="20"
            height="20"
            src={item.icon}
            alt=""
            className="size-4.5 object-contain sm:size-5"
          />
        ) : (
          (() => {
            const Icon = item.icon;
            return (
              <Icon
                className={`size-4.5 sm:size-5 ${
                  item.iconColor || "text-[#1B1D60]"
                }`}
              />
            );
          })()
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span
          className={`block text-sm sm:text-base font-semibold transition-colors ${
            active
              ? "text-[#1B1D60]"
              : "text-[#2E2E2E] group-hover:text-[#1B1D60]"
          }`}
        >
          {item.label}
        </span>

        <span
          style={{ fontWeight: 400 }}
          className="mt-0.5 block text-xs leading-5 !font-normal text-[#4E4E4E] sm:text-sm"
        >
          {item.description}
        </span>
      </span>
    </Link>
  );
}

export function AccountMobileMenu({
  items,
  activeMenuItem,
  isOpen,
  onToggle,
  onClose,
}) {
  return (
    <div className="min-w-0 lg:hidden">
      <DynamicButton
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-label="Toggle account navigation"
        className="flex w-full min-w-0 items-center justify-between rounded-lg border border-gold bg-white px-4 py-3 text-left font-semibold text-[#171A3A] shadow-2xs"
      >
        <span className="min-w-0 truncate text-sm sm:text-base font-semibold">
          {activeMenuItem?.label || "Account Menu"}
        </span>

        <ChevronDown
          className={`size-5 shrink-0 text-[#1B1D60] transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </DynamicButton>

      {isOpen && (
        <nav
          aria-label="Mobile account navigation"
          className="mt-2 flex w-full min-w-0 flex-col items-start overflow-hidden rounded-sm border border-gold bg-white shadow-sm"
        >
          {items.map((item) => (
            <AccountMenuItem
              key={item.id}
              item={item}
              variant="mobile"
              onClick={onClose}
              active={item.id === activeMenuItem?.id}
            />
          ))}
        </nav>
      )}
    </div>
  );
}

export function AccountDesktopMenu({ items, activeMenuItem }) {
  return (
    <nav
      aria-label="Account navigation"
      className="hidden w-full min-w-0 flex-col items-start gap-0 space-y-0 overflow-hidden rounded-lg border border-gold bg-white shadow-2xs lg:flex"
    >
      {items.map((item) => (
        <AccountMenuItem
          key={item.id}
          item={item}
          variant="desktop"
          active={item.id === activeMenuItem?.id}
        />
      ))}
    </nav>
  );
}

export default function AccountSidebar({
  items,
  activeMenuItem,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}) {
  return (
    <aside className="relative z-0 w-full min-w-0 lg:w-[320px] xl:w-[330px] lg:shrink-0">
      <div className="min-w-0">
        <AccountMobileMenu
          items={items}
          activeMenuItem={activeMenuItem}
          isOpen={isMobileMenuOpen}
          onToggle={() => setIsMobileMenuOpen((open) => !open)}
          onClose={() => setIsMobileMenuOpen(false)}
        />

        <AccountDesktopMenu
          items={items}
          activeMenuItem={activeMenuItem}
        />
      </div>
    </aside>
  );
}

