import { RefreshCw } from "lucide-react";
import { SkeletonLoader } from "./common/skeleton";

export default function ApiState({ loading, error, empty, onRetry, children, emptyTitle = "Nothing here yet", emptyText = "Once data is available, it will appear here." }) {
  if (loading) {
    return (
      <SkeletonLoader
        preset="API_GRID_CARD"
        count={6}
        containerClass="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        wrapperClass="rounded-[8px] bg-white p-4 shadow-sm"
      />
    );
  }

  if (error) {
    return (
      <div className="state-box error">
        <strong>We could not load this.</strong>
        <p>{error}</p>
        {onRetry && (
          <button className="button secondary" onClick={onRetry}>
            <RefreshCw size={16} /> Retry
          </button>
        )}
      </div>
    );
  }
  if (empty) {
    return (
      <div className="state-box">
        <strong>{emptyTitle}</strong>
        <p>{emptyText}</p>
      </div>
    );
  }
  return children;
}
