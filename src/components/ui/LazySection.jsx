import React from "react";
import { useInView } from "../../hooks/useInView";

export default function LazySection({ children, fallback, minHeight = "200px" }) {
  const { ref, isInView } = useInView({ triggerOnce: true, rootMargin: "200px" });

  return (
    <div ref={ref} style={{ minHeight: isInView ? 'auto' : minHeight }}>
      {isInView ? <React.Suspense fallback={fallback || null}>{children}</React.Suspense> : fallback || null}
    </div>
  );
}
