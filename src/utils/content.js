export const asArray = (value) => (Array.isArray(value) ? value : []);

export const textOr = (value, fallback = "") =>
  typeof value === "string" && value.trim() ? value : fallback;

export const hrefOr = (value, fallback = "#") =>
  typeof value === "string" && value.trim() ? value : fallback;

export const keyOr = (value, fallback) =>
  typeof value === "string" && value.trim() ? value : fallback;
