import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { cn } from "../../utils/classNames";

export default function HeaderDropdown({
  label,
  icon,
  path,
  children,
  className = "",
  chevronClassName = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const hasDropdown = Boolean(children);
  const isExternal =
    path && (path.startsWith("http://") || path.startsWith("https://"));

  const timerRef = useRef(null);

  const handleMouseEnter = () => {
    timerRef.current = setTimeout(() => {
      setIsOpen(true);
    }, 120);
  };

  const handleMouseLeave = () => {
    clearTimeout(timerRef.current);
    setIsOpen(false);
  };

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      // onMouseEnter={() => setIsOpen(true)}
      // onMouseLeave={() => setIsOpen(false)}
      onFocus={() => setIsOpen(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsOpen(false);
        }
      }}
    >
      {hasDropdown ? (
        <button
          type="button"
          className={cn(
            "flex items-center gap-1.5 text-white/85 transition-all duration-300 ease-in-out hover:text-white",
            className,
          )}
          aria-expanded={isOpen}
          aria-haspopup="true"
          onClick={() => setIsOpen((open) => !open)}
        >
          {icon && <span className="flex  items-center shrink-0">{icon}</span>}
          <span>{label}</span>
          <ChevronDown
            size={16}
            aria-hidden="true"
            className={cn(
              "transition-all duration-300 ease-in-out text-[var(--customer-gold)]",
              chevronClassName,
              isOpen && "rotate-180",
            )}
          />
        </button>
      ) : path ? (
        isExternal ? (
          <a
            target="_blank"
            rel="noreferrer"
            href={path}
            className={cn(
              "flex items-center gap-1.5 text-white/85 transition-all duration-300 ease-in-out hover:text-white",
              className,
            )}
            aria-expanded={isOpen}
            aria-haspopup="true"
          >
            {icon && (
              <span className="flex  items-center shrink-0">{icon}</span>
            )}
            <span>{label}</span>
            <ChevronDown
              size={16}
              aria-hidden="true"
              className={cn(
                "transition-all duration-300 ease-in-out text-[var(--customer-gold)]",
                chevronClassName,
                isOpen && "rotate-180",
              )}
            />
          </a>
        ) : (
          <Link
            to={path}
            className={cn(
              "flex items-center gap-1.5 text-white/85 transition-all duration-300 ease-in-out hover:text-white",
              className,
            )}
            aria-expanded={isOpen}
            aria-haspopup="true"
          >
            {icon && (
              <span className="flex  items-center shrink-0">{icon}</span>
            )}
            <span>{label}</span>
            <ChevronDown
              size={16}
              aria-hidden="true"
              className={cn(
                "transition-all duration-300 ease-in-out text-[var(--customer-gold)]",
                chevronClassName,
                isOpen && "rotate-180",
              )}
            />
          </Link>
        )
      ) : (
        <button
          type="button"
          className={cn(
            "flex items-center gap-1.5 text-white/85 transition-all duration-300 ease-in-out hover:text-white",
            className,
          )}
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          {icon && <span className="flex  items-center shrink-0">{icon}</span>}
          <span>{label}</span>
          <ChevronDown
            size={16}
            aria-hidden="true"
            className={cn(
              "transition-all duration-300 ease-in-out text-[var(--customer-gold)]",
              chevronClassName,
              isOpen && "rotate-180",
            )}
          />
        </button>
      )}

      <div
        className={cn(
          "absolute right-0 top-full z-50 pt-2 transition-all duration-300 ease-in-out",
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
