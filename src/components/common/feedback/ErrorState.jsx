import { RefreshCw } from "lucide-react";
import NotFoundPage from "../../../pages/NotFoundPage";
import { cn } from "../../../utils/classNames";
import { isNotFoundApiError } from "../../../utils/apiErrors";

export default function ErrorState({
  title = "We could not load this.",
  message,
  onRetry,
  className = "",
}) {
  if (isNotFoundApiError(message) || isNotFoundApiError(title)) {
    return <NotFoundPage />;
  }

  return (
    <div className={cn("state-box error", className)}>
      <strong>{title}</strong>
      {message && <p>{message}</p>}
      {onRetry && (
        <button className="button secondary" onClick={onRetry}>
          <RefreshCw size={16} /> Retry
        </button>
      )}
    </div>
  );
}
