import { RefreshCw } from "lucide-react";
import { cn } from "../../utils/classNames";

export default function ErrorState({
  title = "We could not load this.",
  message,
  onRetry,
  className = "",
}) {
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
