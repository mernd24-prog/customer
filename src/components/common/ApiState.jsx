import { SkeletonLoader } from "./skeleton";
import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";

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
      <ErrorState message={error} onRetry={onRetry} />
    );
  }
  if (empty) {
    return (
      <EmptyState title={emptyTitle} description={emptyText} />
    );
  }
  return children;
}
