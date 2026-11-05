import { SkeletonLoader } from "./skeleton";
import EmptyState from "./feedback/EmptyState";
import ErrorState from "./feedback/ErrorState";
import NotFoundPage from "../../pages/NotFoundPage";
import { isNotFoundApiError } from "../../utils/apiErrors";

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
  skeletonLayout = API_STATE_SKELETON,
  skeletonContainerClass = "rounded-[16px] border border-[var(--customer-border)] bg-[var(--customer-surface-soft)] p-4 shadow-sm sm:p-5",
  emptyTitle = "Nothing here yet",
  emptyText = "Once data is available, it will appear here.",
  emptyActionLabel,
  onEmptyAction,
}) {
  let content;
  const state = loading ? "loading" : error ? "error" : empty ? "empty" : "ready";
  if (loading) {
    content = (
      <SkeletonLoader
        layout={skeletonLayout}
        containerClass={skeletonContainerClass}
      />
    );
  } else if (error) {
    if (isNotFoundApiError(error)) {
      content = <NotFoundPage />;
    } else {
      content = <ErrorState message={error} />;
    }
  } else if (empty) {
    content = (
      <EmptyState
        title={emptyTitle}
        description={emptyText}
        actionLabel={emptyActionLabel}
        onAction={onEmptyAction}
      />
    );
  } else {
    content = children;
  }
  return (
    <div aria-busy={Boolean(loading)} className="min-w-0 w-full">
      <div key={state} className="customer-content-enter">{content}</div>
    </div>
  );
}
