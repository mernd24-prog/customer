import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";

import { cn } from "../../../utils/classNames";

export default function HeaderDropdown({
  label,
  icon,
  path,
  children,
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="relative flex h-full items-center"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onFocus={() => setIsOpen(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsOpen(false);
        }
      }}
    >
      <Link
        to={path || "#"}
        className={cn(
          "flex items-center gap-1 text-white transition-opacity hover:opacity-80",
          className,
        )}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span>{label}</span>
        <ChevronDown
          size={16}
          aria-hidden="true"
          className={cn(
            "transition-transform duration-200",
            isOpen && "rotate-180",
          )}
        />
      </Link>

      <div
        className={cn(
          "absolute right-0 top-full z-50 mt-2 transition-all duration-200",
          isOpen
            ? "visible translate-y-0 opacity-100"
            : "invisible -translate-y-2 opacity-0",
        )}
      >
        {children}
      </div>
    </div>
  );
}
