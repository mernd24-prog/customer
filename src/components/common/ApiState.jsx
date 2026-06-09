import { SkeletonLoader } from "./skeleton";
import EmptyState from "./feedback/EmptyState";
import ErrorState from "./feedback/ErrorState";

const API_STATE_SKELETON = [
  { type: "box", height: "18px", width: "42%", className: "mb-3" },
  { type: "box", height: "12px", width: "70%", className: "mb-5" },
  {
    type: "grid",
    className: "grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
    children: [
      {
        type: "col",
        className: "rounded-[12px] border border-[var(--customer-border)] bg-white p-4",
        count: 6,
        children: [
          { type: "box", height: "140px", className: "rounded-[10px]" },
          { type: "box", height: "16px", width: "78%" },
          { type: "box", height: "12px", width: "52%" },
        ],
      },
    ],
  },
];

export default function ApiState({
  loading,
  error,
  empty,
  children,
  emptyTitle = "Nothing here yet",
  emptyText = "Once data is available, it will appear here.",
}) {
  if (loading) {
    return (
      <SkeletonLoader
        layout={API_STATE_SKELETON}
        containerClass="rounded-[16px] border border-[var(--customer-border)] bg-[var(--customer-surface-soft)] p-4 shadow-sm sm:p-5"
      />
    );
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (empty) {
    return (
      <EmptyState title={emptyTitle} description={emptyText} />
    );
  }
  return children;
}
