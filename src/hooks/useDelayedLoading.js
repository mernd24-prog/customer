import { useEffect, useState } from "react";

export function useDelayedLoading(delay = 1000) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLoading(false);
    }, delay);

    return () => window.clearTimeout(timer);
  }, [delay]);

  return loading;
}
