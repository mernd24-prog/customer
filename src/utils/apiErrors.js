export const isNotFoundApiError = (error) => {
  if (!error) return false;

  const message =
    typeof error === "string"
      ? error
      : error.message || error.error || error.statusText || "";
  const status = error.status || error.statusCode || error.code;
  const normalized = String(message).toLowerCase();

  return (
    status === 404 ||
    normalized.includes("not found") ||
    normalized.includes("invalid id") ||
    normalized.includes("invalid value for field") ||
    normalized.includes("cast to objectid") ||
    normalized.includes("objectid failed")
  );
};
