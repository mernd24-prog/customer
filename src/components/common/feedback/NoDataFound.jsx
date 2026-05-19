import EmptyState from "./EmptyState";

export default function NoDataFound({
  title = "No data found",
  description = "Try changing filters or check back later.",
  ...props
}) {
  return <EmptyState title={title} description={description} {...props} />;
}
