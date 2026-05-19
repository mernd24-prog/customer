export function formatCount(value = 0) {
  return Number(value || 0).toLocaleString();
}

export function formatLabel(value = "") {
  return String(value)
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}
