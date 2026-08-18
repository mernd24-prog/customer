import React, { useEffect, useRef, useState } from "react";

export default function LazySection({ children, rootMargin = "200px" }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (isVisible) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (ref.current) observer.unobserve(ref.current);
        }
      },
      { rootMargin }
    );

    if (ref.current) observer.observe(ref.current);

    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, [isVisible, rootMargin]);

  return (
    <div ref={ref}>
      {isVisible ? children : <div style={{ minHeight: "300px" }} />}
    </div>
  );
}
