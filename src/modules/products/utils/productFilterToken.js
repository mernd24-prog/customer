const toBase64Url = (value = "") => {
  const base64 = btoa(unescape(encodeURIComponent(value)));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
};

const fromBase64Url = (value = "") => {
  const base64 = String(value || "").replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  return decodeURIComponent(escape(atob(padded)));
};

export const encodeProductFilterToken = (filters = {}) =>
  toBase64Url(JSON.stringify(filters || {}));

export const decodeProductFilterToken = (token = "") => {
  if (!token) return {};
  try {
    const parsed = JSON.parse(fromBase64Url(token));
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
};

export const productFilterUrl = (filters = {}) =>
  `/products/pr?f=${encodeURIComponent(encodeProductFilterToken(filters))}`;
