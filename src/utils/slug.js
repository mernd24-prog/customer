export function slugify(value = "") {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function titleFromSlug(value = "") {
  return String(value)
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
