
import { AlertTriangle, RefreshCw } from "lucide-react";
import { cn } from "../../../utils/common";
import { PillButton } from "../button/buttonSpecialized";
import { PageContainer } from "../layout";

const getMessage = (message) => {
  if (!message) return "";

  if (typeof message === "string") return message;

  return message.message || message.error || "Please try again later.";
};

export default function ErrorState({
  title = "Something Went Wrong",
  message,
  actionLabel = "Try Again",
  onAction,
  className = "",
  buttonClassName = "",
  children,
}) {
  const displayMessage = getMessage(message);

  return (
    <PageContainer>
      <div
        className={cn(
          "flex min-h-[220px] w-full flex-col items-center justify-center rounded-lg border border-dashed border-[#E7D9B8] bg-[#FFFDF6] px-4 py-6 text-center sm:min-h-[250px] sm:px-5 sm:py-7 lg:min-h-[280px]",
          className,
        )}
        role="alert"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-500 ring-1 ring-red-100 sm:h-12 sm:w-12">
          <AlertTriangle
            className="h-5 w-5 sm:h-6 sm:w-6"
            strokeWidth={1.8}
            aria-hidden="true"
          />
        </div>

        <h2 className="mt-3 max-w-lg text-base font-bold text-[var(--customer-ink)] sm:text-lg">
          {title}
        </h2>

        <p className="mt-1.5 max-w-xs text-sm leading-5 text-[var(--customer-muted)] sm:max-w-md sm:leading-6">
          {displayMessage ||
            "We could not load this section right now. Please try again later."}
        </p>

        {actionLabel && onAction && (
          <div className="mt-4 flex justify-center">
            <PillButton
              size="md"
              onClick={onAction}
              className={cn("gap-2", buttonClassName)}
            >
              <span>{actionLabel}</span>
              <RefreshCw size={16} />
            </PillButton>
          </div>
        )}

        {children && <div className="mt-4 w-full">{children}</div>}
      </div>
    </PageContainer>
  );
}
