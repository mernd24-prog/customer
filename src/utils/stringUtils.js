
export const humanize = (value, fallback = "N/A") => {
  if (value == null) return fallback;
  return String(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
};
