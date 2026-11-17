import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Clock3, RefreshCw, ServerCog, WifiOff } from "lucide-react";

import {
  checkBackendAvailability,
  isServiceUnavailable,
} from "../../api/client";

import ConfirmModal from "../../components/ui/overlay/ConfirmModal";

const COPY = {
  offline: {
    title: "You're offline",
    message: "Check your internet connection and try again.",
    Icon: WifiOff,
  },
  timeout: {
    title: "Connection issue",
    message: "The server is taking longer than expected. Please try again.",
    Icon: Clock3,
  },
  maintenance: {
    title: "Under maintenance",
    message: "We're making improvements. Please check back shortly.",
    Icon: ServerCog,
  },
  unavailable: {
    title: "Service unavailable",
    message: "We couldn't reach the server. Please try again shortly.",
    Icon: ServerCog,
  },
};

export default function ServiceUnavailableDialog() {
  const [failure, setFailure] = useState(null);
  const [checking, setChecking] = useState(false);

  const checkingRef = useRef(false);

  const retry = useCallback(async () => {
    if (checkingRef.current) return;

    checkingRef.current = true;
    setChecking(true);

    try {
      const available = await checkBackendAvailability();

      if (available) {
        setFailure(null);
      }
    } catch (error) {
      console.error("Service availability check failed:", error);
    } finally {
      checkingRef.current = false;
      setChecking(false);
    }
  }, []);

  // Listen for service availability
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

    const handleOffline = () => {
      setFailure({
        kind: "offline",
        retryAfter: 0,
      });
    };

    const handleOnline = () => {
      void retry();
    };

    window.addEventListener("service:availability", handleAvailability);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    if (!navigator.onLine) {
      handleOffline();
    } else if (isServiceUnavailable()) {
      void checkBackendAvailability();
    }

    return () => {
      window.removeEventListener("service:availability", handleAvailability);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, [retry]);

  // Automatically retry every 15 seconds
  useEffect(() => {
    if (!failure || failure.kind === "offline") {
      return undefined;
    }

    const timer = window.setInterval(() => {
      void retry();
    }, 15000);

    return () => window.clearInterval(timer);
  }, [failure, retry]);

  const content = useMemo(
    () => COPY[failure?.kind] || COPY.unavailable,
    [failure?.kind],
  );

  if (!failure) return null;

  const { Icon } = content;

  return (
    <ConfirmModal
      open={Boolean(failure)}
      title={content.title}
      description={content.message}
      icon={Icon}
      iconBgClassName="bg-[var(--customer-gold-soft)]"
      iconClassName="text-[var(--customer-gold-dark)]"
      iconSize={26}
      confirmLabel={checking ? "Checking connection..." : "Try again"}
      confirmDisabled={checking || failure.kind === "offline"}
      onConfirm={retry}
      onCancel={() => setFailure(null)}
      cancelLabel={null}
      confirmClassName="!bg-[var(--customer-navy)] hover:!bg-[var(--customer-navy-dark)] !w-full sm:!w-full"
      maxWidth="max-w-sm"
    >
      {/* Automatic recovery information */}
      <div className="mt-1 flex items-start gap-3 rounded-lg border border-[#EEEAF0] bg-[#FAF9F7] px-3.5 py-3">
        {/* Status indicator */}
        <span className="relative mt-1 flex h-2 w-2 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#C18A26] opacity-30" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#C18A26]" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold leading-4 text-[#333653]">
            Automatic recovery
          </p>

          <p className="mt-1 text-xs leading-[18px] text-[#777B8C]">
            {failure.kind === "offline"
              ? "Reconnect to the internet to continue."
              : "We'll close this notice automatically when service returns."}
          </p>

          {failure.retryAfter > 0 && (
            <p className="mt-1.5 text-xs font-medium text-[var(--customer-navy)]">
              Suggested retry in {failure.retryAfter} seconds
            </p>
          )}
        </div>
      </div>
    </ConfirmModal>
  );
}
