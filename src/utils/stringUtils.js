export const capitalizeFirst = (str) => {
  if (typeof str !== "string" || !str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const humanize = (value, fallback = "N/A") => {
  if (value == null) return fallback;
  return String(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
};
