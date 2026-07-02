import { tokenStorage } from "../api/tokenStorage";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://45.195.90.183:4000";

const buildUrl = (path = "") =>
  `${API_BASE_URL.replace(/\/+$/, "")}/${String(path).replace(/^\/+/, "")}`;

export async function downloadAuthDocument(apiPath, filename = "document") {
  const token = tokenStorage.getAccessToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await fetch(buildUrl(apiPath), { headers });

  if (!response.ok) {
    throw new Error(`Download failed: ${response.status} ${response.statusText}`);
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
