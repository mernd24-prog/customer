import { SkeletonLoader } from "../skeleton";

export default function PageLoader({
  preset = "API_GRID_CARD",
  count = 6,
  containerClass = "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
  wrapperClass = "rounded-[8px] bg-white p-4 shadow-sm",
}) {
  return (
    <SkeletonLoader
      preset={preset}
      count={count}
      containerClass={containerClass}
      wrapperClass={wrapperClass}
    />
  );
}
