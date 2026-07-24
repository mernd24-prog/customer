import api from "../api/client";

export const getDocumentId = (document = {}) =>
  document?.id ||
  document?._id ||
  document?.invoiceId ||
  document?.invoice_id ||
  document?.documentId ||
  document?.document_id ||
  null;

export async function downloadAuthDocument(apiPath, filename = "document") {
  if (!apiPath || String(apiPath).includes("/undefined/") || String(apiPath).includes("/null/")) {
    throw new Error("Invoice ID is missing. Refresh the order and try again.");
  }
  try {
    const response = await api.get(apiPath, { responseType: "blob" });
    const contentType = String(response.headers?.["content-type"] || "");
    if (contentType.includes("application/json")) {
      const payload = JSON.parse(await response.data.text());
      throw new Error(payload?.message || payload?.error?.message || "Document download failed");
    }

    const blob = response.data instanceof Blob
      ? response.data
      : new Blob([response.data], { type: contentType || "application/pdf" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.style.display = "none";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    return { filename, contentType, size: blob.size };
  } catch (error) {
    const responseBlob = error?.response?.data;
    if (responseBlob instanceof Blob && String(responseBlob.type).includes("application/json")) {
      try {
        const payload = JSON.parse(await responseBlob.text());
        throw new Error(payload?.message || payload?.error?.message || "Document download failed");
      } catch (parseError) {
        if (parseError?.message && parseError.message !== "Document download failed") throw parseError;
      }
    }
    throw new Error(error?.response?.data?.message || error?.message || "Document download failed");
  }
}
