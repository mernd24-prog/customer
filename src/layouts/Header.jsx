import { useRef, useEffect } from "react";
import { TopHeader } from "./header/TopHeader";
import { Navbar } from "./header/Navbar";

export { CategoryBar } from "./header/CategoryBar";

const HEADER_HEIGHT_VAR = "--customer-header-height";

export const Header = () => {
  const headerRef = useRef(null);

  useEffect(() => {
    const updateHeaderHeight = () => {
      const height = headerRef.current?.offsetHeight || 0;
      document.documentElement.style.setProperty(
        HEADER_HEIGHT_VAR,
        `${height}px`,
      );
    };

    updateHeaderHeight();

    if (!headerRef.current) return undefined;

    const observer = new ResizeObserver(updateHeaderHeight);
    observer.observe(headerRef.current);
    window.addEventListener("resize", updateHeaderHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateHeaderHeight);
      document.documentElement.style.removeProperty(HEADER_HEIGHT_VAR);
    };
  }, []);

  return (
    <div
      className="fixed left-0 top-0 z-50 w-full bg-white shadow-[0_2px_10px_rgba(17,24,39,0.08)]"
      ref={headerRef}
    >
      <TopHeader />
      <Navbar />
    </div>
  );
};

export default Header;
