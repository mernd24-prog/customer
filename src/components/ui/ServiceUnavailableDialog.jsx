import { useCallback, useEffect, useMemo, useState } from "react";
import { Clock3, RefreshCw, ServerCog, WifiOff, X } from "lucide-react";
import {
  checkBackendAvailability,
  isServiceUnavailable,
} from "../../api/client";

const COPY = {
  offline: {
    title: "You're offline",
    message: "Check your internet connection. Your shopping session is safe, and you can continue when you're back online.",
    Icon: WifiOff,
  },
  timeout: {
    title: "The server is taking longer than usual",
    message: "We're having trouble connecting right now. Please wait a moment and try again.",
    Icon: Clock3,
  },
  maintenance: {
    title: "We're under maintenance",
    message: "Sam Global is temporarily unavailable while we make improvements. Please try again shortly.",
    Icon: ServerCog,
  },
  unavailable: {
    title: "We can't reach the server",
    message: "Our services are temporarily unavailable. Your saved items remain safe—please try again in a moment.",
    Icon: ServerCog,
  },
};

export default function ServiceUnavailableDialog() {
  const [failure, setFailure] = useState(null);
  const [checking, setChecking] = useState(false);

  const retry = useCallback(async () => {
    setChecking(true);
    const available = await checkBackendAvailability();
    if (available) setFailure(null);
    setChecking(false);
  }, []);

  useEffect(() => {
    const handleAvailability = (event) => {
      if (event.detail?.available) {
        setFailure(null);
        return;
      }
      setFailure({
        kind: event.detail?.kind || "unavailable",
        retryAfter: event.detail?.retryAfter || 0,
      });
    };
    const handleOffline = () => setFailure({ kind: "offline", retryAfter: 0 });
    const handleOnline = () => void retry();

    window.addEventListener("service:availability", handleAvailability);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    if (!navigator.onLine) handleOffline();
    else if (isServiceUnavailable()) void checkBackendAvailability();

    return () => {
      window.removeEventListener("service:availability", handleAvailability);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, [retry]);

  useEffect(() => {
    if (!failure || failure.kind === "offline") return undefined;
    const timer = window.setInterval(() => void retry(), 15000);
    return () => window.clearInterval(timer);
  }, [failure, retry]);

  const content = useMemo(
    () => COPY[failure?.kind] || COPY.unavailable,
    [failure?.kind],
  );

  if (!failure) return null;
  const { Icon } = content;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-[#15115d]/45 px-4 py-8 backdrop-blur-sm">
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="service-status-title"
        aria-describedby="service-status-message"
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-[var(--customer-gold)]/30 bg-[var(--customer-cream)] shadow-2xl"
      >
        <div className="h-1.5 bg-gradient-to-r from-[var(--customer-navy)] via-[var(--customer-gold)] to-[var(--customer-navy)]" />
        <button
          type="button"
          aria-label="Dismiss service status"
          onClick={() => setFailure(null)}
          className="absolute right-4 top-5 rounded-full p-2 text-[var(--customer-muted)] transition hover:bg-white hover:text-[var(--customer-navy)]"
        >
          <X size={19} />
        </button>

        <div className="px-7 pb-7 pt-9 text-center sm:px-9">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--customer-gold-soft)] text-[var(--customer-gold-dark)] shadow-sm">
            <Icon size={31} strokeWidth={1.8} />
          </div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[var(--customer-gold-dark)]">
            Service update
          </p>
          <h2 id="service-status-title" className="text-2xl font-bold text-[var(--customer-navy)]">
            {content.title}
          </h2>
          <p id="service-status-message" className="mt-3 text-sm leading-6 text-[var(--customer-muted)]">
            {content.message}
          </p>
          {failure.retryAfter > 0 ? (
            <p className="mt-2 text-xs font-semibold text-[var(--customer-navy)]">
              Suggested retry: in {failure.retryAfter} seconds
            </p>
          ) : null}

          <button
            type="button"
            onClick={retry}
            disabled={checking || failure.kind === "offline"}
            className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--customer-navy)] px-5 py-3 text-sm font-bold text-white transition hover:bg-[var(--customer-navy-dark)] disabled:cursor-not-allowed disabled:opacity-55"
          >
            <RefreshCw size={17} className={checking ? "animate-spin" : ""} />
            {checking ? "Checking connection…" : failure.kind === "offline" ? "Waiting for internet" : "Try again"}
          </button>
          <p className="mt-4 text-xs text-[var(--customer-muted)]">
            This notice will close automatically when service is restored.
          </p>
        </div>
      </section>
    </div>
  );
}
