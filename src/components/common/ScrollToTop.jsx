import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { hash, pathname } = useLocation();
  const previousPathRef = useRef(pathname);
  const isAccountTabRoute = pathname.startsWith("/account/");
  const wasAccountTabRoute = previousPathRef.current.startsWith("/account/");

  useEffect(() => {
    if (isAccountTabRoute && wasAccountTabRoute) {
      previousPathRef.current = pathname;
      return;
    }

    if (hash) {
      window.setTimeout(() => {
        const target = document.getElementById(decodeURIComponent(hash.slice(1)));
        target?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 0);
      previousPathRef.current = pathname;
      return;
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    previousPathRef.current = pathname;
  }, [hash, isAccountTabRoute, pathname, wasAccountTabRoute]);

  return null;
}
