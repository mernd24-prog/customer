import { RefreshCw } from "lucide-react";

export function SkeletonGrid({ count = 6 }) {
  return (
    <div className="grid">
      {Array.from({ length: count }).map((_, index) => (
        <div className="skeleton-card" key={index} />
      ))}
    </div>
  );
}

export default function ApiState({ loading, error, empty, onRetry, children, emptyTitle = "Nothing here yet", emptyText = "Once data is available, it will appear here." }) {
  if (loading) return <SkeletonGrid />;
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
