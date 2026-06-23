export function parseMultiValue(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function serializeMultiValue(values) {
  const uniqueValues = [...new Set((values || []).map(String).map((item) => item.trim()).filter(Boolean))];
  return uniqueValues.length ? uniqueValues.join(",") : undefined;
}

export function slugToBrandName(slug = "") {
  return decodeURIComponent(slug)
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function brandToSlug(name = "") {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}