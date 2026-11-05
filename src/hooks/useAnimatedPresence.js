import { useEffect, useState } from "react";

export const OVERLAY_EXIT_MS = 200;

// Keep overlays mounted during their exit, and cancel removal if reopened.
export function useAnimatedPresence(open) {
  const [present, setPresent] = useState(Boolean(open));

  useEffect(() => {
    if (open) {
      setPresent(true);
      return undefined;
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => setPresent(false), reduced ? 0 : OVERLAY_EXIT_MS);
    return () => window.clearTimeout(timer);
  }, [open]);

  return { present: Boolean(open) || present, exiting: !open };
}
