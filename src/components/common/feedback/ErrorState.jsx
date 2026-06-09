import { AlertTriangle } from "lucide-react";
import { cn } from "../../../utils/classNames";
import { isNotFoundApiError } from "../../../utils/apiErrors";

const getMessage = (message) => {
  if (!message) return "";
  if (typeof message === "string") return message;
  return message.message || message.error || "Please try again later.";
};

export default function ErrorState({
  title = "Something went wrong",
  message,
  className = "",
}) {
  const displayMessage = getMessage(message);

  return (
    <div
      className={cn(
        "flex min-h-[240px] flex-col items-center justify-center rounded-[16px] border border-red-100 bg-gradient-to-br from-white via-white to-red-50 px-5 py-10 text-center shadow-sm",
        className,
      )}
      role="status"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500 ring-1 ring-red-100">
        <AlertTriangle size={24} strokeWidth={1.8} />
      </div>
      <h2 className="mt-5 text-xl font-bold text-[var(--customer-ink)]">
        {title}
      </h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-[var(--customer-muted)]">
        {displayMessage ||
          "We could not load this section right now. Please continue browsing other available sections."}
      </p>
    </div>
  );
}
